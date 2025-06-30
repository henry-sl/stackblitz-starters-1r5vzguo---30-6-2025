/**
 * lib/algorandTransactions.js
 * 
 * This module provides utility functions for creating, signing, and submitting
 * Algorand transactions, specifically for proposal attestations.
 */

import algosdk from 'algosdk';
import { algodClient, indexerClient, isInitialized } from './algorand.js';

/**
 * Creates and sends an attestation transaction to the Algorand blockchain
 * 
 * @param {Object} attestationData - Data to be recorded on the blockchain
 * @param {string} attestationData.proposalId - The ID of the proposal
 * @param {string} attestationData.tenderTitle - The title of the tender
 * @param {string} attestationData.userId - The ID of the user submitting the proposal
 * @returns {Promise<Object>} Object containing transaction ID and other details
 */
async function createAttestationTransaction(attestationData) {
  // Check if Algorand clients are initialized
  if (!isInitialized()) {
    throw new Error('Algorand clients are not properly initialized');
  }
  
  // Check if admin wallet mnemonic is configured
  if (!process.env.ADMIN_WALLET_MNEMONIC) {
    throw new Error('Admin wallet mnemonic is not configured');
  }
  
  try {
    // Validate mnemonic format before attempting to use it
    const mnemonic = process.env.ADMIN_WALLET_MNEMONIC.trim();
    const words = mnemonic.split(' ').filter(word => word.length > 0);
    
    if (words.length !== 25) {
      throw new Error(`Invalid mnemonic format: expected 25 words, got ${words.length}`);
    }
    
    // Get account from mnemonic
    let account;
    try {
      account = algosdk.mnemonicToSecretKey(mnemonic);
    } catch (error) {
      throw new Error(`Failed to derive account from mnemonic: ${error.message}`);
    }
    
    // Validate that we have a valid address
    if (!account.addr || typeof account.addr !== 'string' || account.addr.length === 0) {
      throw new Error('Failed to derive valid address from mnemonic');
    }
    
    // Log the account address for debugging
    console.log("Algorand account address:", account.addr);
    console.log("Algorand account type:", typeof account.addr);
    console.log("Algorand account address length:", account.addr.length);
    
    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    console.log("Suggested params:", suggestedParams);
    
    // Prepare attestation data as a JSON string
    const attestationNote = JSON.stringify({
      type: 'proposal_attestation',
      proposalId: attestationData.proposalId,
      tenderTitle: attestationData.tenderTitle,
      userId: attestationData.userId,
      timestamp: new Date().toISOString()
    });
    
    // Convert note to Uint8Array for the transaction
    const encodedNote = new TextEncoder().encode(attestationNote);
    
    // Create a payment transaction with 0 amount (just to record the note)
    // Using the new makePaymentTxnWithSuggestedParamsFromObject syntax
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: account.addr,       // sender
      to: account.addr,         // receiver (self)
      amount: 0,                // amount (0 Algos)
      note: encodedNote,        // note
      suggestedParams: suggestedParams  // suggested params
    });
    
    // Sign the transaction
    const signedTxn = txn.signTxn(account.sk);
    
    // Submit the transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, txId, 5); // wait up to 5 rounds
    
    // Get the transaction information
    const transactionInfo = await algodClient.pendingTransactionInformation(txId).do();
    
    return {
      txId,
      confirmed: true,
      roundConfirmed: transactionInfo['confirmed-round'],
      note: attestationNote
    };
  } catch (error) {
    console.error('Error creating attestation transaction:', error);
    throw new Error(`Failed to create attestation transaction: ${error.message}`);
  }
}

/**
 * Retrieves attestation transactions for a specific user from the blockchain
 * 
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of attestation transactions
 */
async function getUserAttestations(userId) {
  // Check if Algorand clients are initialized
  if (!isInitialized()) {
    throw new Error('Algorand clients are not properly initialized');
  }
  
  // Check if admin wallet mnemonic is configured
  if (!process.env.ADMIN_WALLET_MNEMONIC) {
    throw new Error('Admin wallet mnemonic is not configured');
  }
  
  try {
    // Validate and get account from mnemonic
    const mnemonic = process.env.ADMIN_WALLET_MNEMONIC.trim();
    const words = mnemonic.split(' ').filter(word => word.length > 0);
    
    if (words.length !== 25) {
      throw new Error(`Invalid mnemonic format: expected 25 words, got ${words.length}`);
    }
    
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    
    if (!account.addr || typeof account.addr !== 'string' || account.addr.length === 0) {
      throw new Error('Failed to derive valid address from mnemonic');
    }
    
    // Search for transactions from the admin account
    const transactions = await indexerClient
      .searchForTransactions()
      .address(account.addr)
      .do();
    
    // Filter and parse transactions that contain attestation notes for this user
    const attestations = [];
    
    for (const tx of transactions.transactions || []) {
      // Skip transactions without notes
      if (!tx.note) continue;
      
      try {
        // Decode the note
        const noteBytes = Buffer.from(tx.note, 'base64');
        const noteString = new TextDecoder().decode(noteBytes);
        const note = JSON.parse(noteString);
        
        // Check if this is an attestation note for the requested user
        if (note.type === 'proposal_attestation' && note.userId === userId) {
          attestations.push({
            txId: tx.id,
            proposalId: note.proposalId,
            tenderTitle: note.tenderTitle,
            timestamp: note.timestamp,
            roundTime: tx['round-time'],
            confirmedRound: tx['confirmed-round']
          });
        }
      } catch (error) {
        // Skip notes that can't be parsed as JSON
        continue;
      }
    }
    
    return attestations;
  } catch (error) {
    console.error('Error retrieving user attestations:', error);
    throw new Error(`Failed to retrieve user attestations: ${error.message}`);
  }
}

/**
 * Verifies if a specific attestation transaction exists on the blockchain
 * 
 * @param {string} txId - The transaction ID to verify
 * @returns {Promise<boolean>} True if the transaction exists and is valid
 */
async function verifyAttestationTransaction(txId) {
  // Check if Algorand clients are initialized
  if (!isInitialized()) {
    throw new Error('Algorand clients are not properly initialized');
  }
  
  // Validate transaction ID format before attempting to look it up
  if (!txId || typeof txId !== 'string' || txId.length < 10 || txId === 'pending') {
    console.warn(`Invalid transaction ID format: ${txId}`);
    return false;
  }
  
  try {
    console.log("Verifying transaction ID:", txId);
    
    // Get transaction information from the indexer
    const txInfo = await indexerClient.lookupTransactionByID(txId).do();
    
    // Check if transaction exists
    if (!txInfo.transaction) {
      console.log("Transaction not found in blockchain");
      return false;
    }
    
    // Verify it's an attestation transaction by checking the note
    if (!txInfo.transaction.note) {
      console.log("Transaction has no note field");
      return false;
    }
    
    try {
      // Decode the note
      const noteBytes = Buffer.from(txInfo.transaction.note, 'base64');
      const noteString = new TextDecoder().decode(noteBytes);
      const note = JSON.parse(noteString);
      
      // Check if this is an attestation note
      const isAttestation = note.type === 'proposal_attestation';
      console.log("Is attestation transaction:", isAttestation);
      return isAttestation;
    } catch (error) {
      console.error("Error parsing transaction note:", error);
      return false;
    }
  } catch (error) {
    console.error('Error verifying attestation transaction:', error);
    return false;
  }
}

export { createAttestationTransaction, getUserAttestations, verifyAttestationTransaction };