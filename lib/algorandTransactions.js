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
    // Get account from mnemonic
    const account = algosdk.mnemonicToSecretKey(process.env.ADMIN_WALLET_MNEMONIC);
    
    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
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
    // Sending to self (the admin wallet)
    const txn = algosdk.makePaymentTxnWithSuggestedParams(
      account.addr,       // sender
      account.addr,       // receiver (self)
      0,                  // amount (0 Algos)
      undefined,          // close remainder to
      encodedNote,        // note
      suggestedParams     // suggested params
    );
    
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
    // Get account from mnemonic
    const account = algosdk.mnemonicToSecretKey(process.env.ADMIN_WALLET_MNEMONIC);
    
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
    // Get transaction information from the indexer
    const txInfo = await indexerClient.lookupTransactionByID(txId).do();
    
    // Check if transaction exists
    if (!txInfo.transaction) {
      return false;
    }
    
    // Verify it's an attestation transaction by checking the note
    if (!txInfo.transaction.note) {
      return false;
    }
    
    try {
      // Decode the note
      const noteBytes = Buffer.from(txInfo.transaction.note, 'base64');
      const noteString = new TextDecoder().decode(noteBytes);
      const note = JSON.parse(noteString);
      
      // Check if this is an attestation note
      return note.type === 'proposal_attestation';
    } catch (error) {
      return false;
    }
  } catch (error) {
    console.error('Error verifying attestation transaction:', error);
    return false;
  }
}

export { createAttestationTransaction, getUserAttestations, verifyAttestationTransaction };