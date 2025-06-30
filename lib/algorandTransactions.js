/**
 * lib/algorandTransactions.js
 *
 * This module provides utility functions for creating, signing, and submitting
 * Algorand transactions, specifically for proposal attestations.
 */

import * as algosdk from 'algosdk';
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
  console.log('[Algorand Transactions] Starting createAttestationTransaction...');
  // Check if Algorand clients are initialized
  if (!isInitialized()) {
    console.error('[Algorand Transactions] Algorand clients are not properly initialized.');
    throw new Error('Algorand clients are not properly initialized');
  }

  // Check if admin wallet mnemonic is configured
  if (!process.env.ADMIN_WALLET_MNEMONIC) {
    console.error('[Algorand Transactions] Admin wallet mnemonic is not configured.');
    throw new Error('Admin wallet mnemonic is not configured');
  }

  try {
    // Get account from mnemonic
    const account = algosdk.mnemonicToSecretKey(process.env.ADMIN_WALLET_MNEMONIC);
    console.log(`[Algorand Transactions] Admin wallet address: ${account.addr}`);

    // Get suggested transaction parameters
    console.log('[Algorand Transactions] Fetching suggested transaction parameters...');
    const suggestedParams = await algodClient.getTransactionParams().do();
    console.log('[Algorand Transactions] Suggested parameters fetched:', suggestedParams);

    // Prepare attestation data as a JSON string
    const attestationNote = JSON.stringify({
      type: 'proposal_attestation',
      proposalId: attestationData.proposalId,
      tenderTitle: attestationData.tenderTitle,
      userId: attestationData.userId,
      timestamp: new Date().toISOString()
    });
    console.log('[Algorand Transactions] Attestation note (JSON):', attestationNote);

    // Convert note to Uint8Array for the transaction
    const encodedNote = new TextEncoder().encode(attestationNote);

    // Create a payment transaction with 0 amount (just to record the note)
    // Sending to self (the admin wallet)
    console.log('[Algorand Transactions] Creating payment transaction...');
    const txn = algosdk.makePaymentTxnWithSuggestedParams(
      account.addr,       // sender
      account.addr,       // receiver (self)
      0,                  // amount (0 Algos)
      undefined,          // close remainder to
      encodedNote,        // note
      suggestedParams     // suggested params
    );
    console.log('[Algorand Transactions] Transaction created:', txn);

    // Sign the transaction
    console.log('[Algorand Transactions] Signing transaction...');
    const signedTxn = txn.signTxn(account.sk);
    console.log('[Algorand Transactions] Transaction signed.');

    // Submit the transaction
    console.log('[Algorand Transactions] Sending raw transaction to Algorand network...');
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    console.log(`[Algorand Transactions] Transaction sent. TxID: ${txId}`);

    // Wait for confirmation
    console.log(`[Algorand Transactions] Waiting for confirmation for TxID: ${txId}...`);
    await algosdk.waitForConfirmation(algodClient, txId, 5); // wait up to 5 rounds
    console.log(`[Algorand Transactions] Transaction ${txId} confirmed.`);

    // Get the transaction information
    console.log(`[Algorand Transactions] Fetching pending transaction information for TxID: ${txId}...`);
    const transactionInfo = await algodClient.pendingTransactionInformation(txId).do();
    console.log('[Algorand Transactions] Transaction info:', transactionInfo);

    return {
      txId,
      confirmed: true,
      roundConfirmed: transactionInfo['confirmed-round'],
      note: attestationNote
    };
  } catch (error) {
    console.error('[Algorand Transactions] Error in createAttestationTransaction:', error);
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
  console.log(`[Algorand Transactions] Starting getUserAttestations for user: ${userId}...`);
  // Check if Algorand clients are initialized
  if (!isInitialized()) {
    console.error('[Algorand Transactions] Algorand clients are not properly initialized.');
    throw new Error('Algorand clients are not properly initialized');
  }

  // Check if admin wallet mnemonic is configured
  if (!process.env.ADMIN_WALLET_MNEMONIC) {
    console.error('[Algorand Transactions] Admin wallet mnemonic is not configured.');
    throw new Error('Admin wallet mnemonic is not configured');
  }

  try {
    // Get account from mnemonic
    const account = algosdk.mnemonicToSecretKey(process.env.ADMIN_WALLET_MNEMONIC);
    console.log(`[Algorand Transactions] Searching transactions from admin address: ${account.addr}`);

    // Search for transactions from the admin account
    const transactions = await indexerClient
      .searchForTransactions()
      .address(account.addr)
      .do();
    console.log(`[Algorand Transactions] Found ${transactions.transactions ? transactions.transactions.length : 0} transactions from admin address.`);

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
        console.warn(`[Algorand Transactions] Could not parse note for transaction ${tx.id}:`, error);
        continue;
      }
    }
    console.log(`[Algorand Transactions] Found ${attestations.length} attestations for user ${userId}.`);
    return attestations;
  } catch (error) {
    console.error('[Algorand Transactions] Error retrieving user attestations:', error);
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
  console.log(`[Algorand Transactions] Starting verifyAttestationTransaction for TxID: ${txId}...`);
  // Check if Algorand clients are initialized
  if (!isInitialized()) {
    console.error('[Algorand Transactions] Algorand clients are not properly initialized.');
    throw new Error('Algorand clients are not properly initialized');
  }

  try {
    // Get transaction information from the indexer
    console.log(`[Algorand Transactions] Looking up transaction ${txId} in Indexer...`);
    const txInfo = await indexerClient.lookupTransactionByID(txId).do();
    console.log('[Algorand Transactions] Indexer lookup result:', txInfo);

    // Check if transaction exists
    if (!txInfo.transaction) {
      console.log(`[Algorand Transactions] Transaction ${txId} not found.`);
      return false;
    }

    // Verify it's an attestation transaction by checking the note
    if (!txInfo.transaction.note) {
      console.log(`[Algorand Transactions] Transaction ${txId} has no note.`);
      return false;
    }

    try {
      // Decode the note
      const noteBytes = Buffer.from(txInfo.transaction.note, 'base64');
      const noteString = new TextDecoder().decode(noteBytes);
      const note = JSON.parse(noteString);
      console.log(`[Algorand Transactions] Decoded note for ${txId}:`, note);

      // Check if this is an attestation note
      const isValidAttestation = note.type === 'proposal_attestation';
      console.log(`[Algorand Transactions] Transaction ${txId} is a valid attestation: ${isValidAttestation}`);
      return isValidAttestation;
    } catch (error) {
      console.error(`[Algorand Transactions] Error parsing note for transaction ${txId}:`, error);
      return false;
    }
  } catch (error) {
    console.error(`[Algorand Transactions] Error verifying attestation transaction ${txId}:`, error);
    return false;
  }
}

export { createAttestationTransaction, getUserAttestations, verifyAttestationTransaction };