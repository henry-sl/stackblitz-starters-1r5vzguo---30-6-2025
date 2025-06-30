/**
 * lib/algorandUtils.js
 * 
 * Utility functions for working with Algorand blockchain
 * Provides helper methods for common operations like creating and submitting transactions
 */

const algosdk = require('algosdk');
const { algodClient, indexerClient, isAlgorandAvailable } = require('./algorand');

/**
 * Waits for a transaction to be confirmed on the Algorand blockchain
 * @param {string} txId - The transaction ID to wait for
 * @returns {Promise<Object>} The confirmed transaction
 */
async function waitForConfirmation(txId) {
  if (!isAlgorandAvailable()) {
    throw new Error('Algorand client is not available');
  }

  const status = await algodClient.status().do();
  let lastRound = status['last-round'];
  
  // Wait up to 10 rounds for confirmation
  for (let i = 0; i < 10; i++) {
    const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
    
    if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
      return pendingInfo;
    }
    
    lastRound++;
    await algodClient.statusAfterBlock(lastRound).do();
  }
  
  throw new Error(`Transaction ${txId} not confirmed after 10 rounds`);
}

/**
 * Creates and submits an attestation transaction to the Algorand blockchain
 * @param {string} senderMnemonic - The mnemonic for the sender's account
 * @param {Object} attestationData - The data to include in the transaction note
 * @returns {Promise<Object>} Object containing the transaction ID and other details
 */
async function createAttestationTransaction(senderMnemonic, attestationData) {
  if (!isAlgorandAvailable()) {
    throw new Error('Algorand client is not available');
  }

  if (!senderMnemonic) {
    throw new Error('Sender mnemonic is required');
  }

  try {
    // Convert the sender's mnemonic to a secret key
    const senderAccount = algosdk.mnemonicToSecretKey(senderMnemonic);
    
    // Get suggested parameters for the transaction
    const params = await algodClient.getTransactionParams().do();
    
    // Convert attestation data to a note (must be a Uint8Array)
    const encodedNote = new TextEncoder().encode(JSON.stringify(attestationData));
    
    // Create a payment transaction with a 0 amount (just to record the note)
    // The receiver is the same as the sender (self-transaction)
    const txn = algosdk.makePaymentTxnWithSuggestedParams(
      senderAccount.addr,  // sender
      senderAccount.addr,  // receiver (self)
      0,                   // amount (0 Algos)
      undefined,           // close remainder to
      encodedNote,         // note
      params               // suggested params
    );
    
    // Sign the transaction
    const signedTxn = txn.signTxn(senderAccount.sk);
    
    // Submit the transaction to the network
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    const confirmedTxn = await waitForConfirmation(txId);
    
    return {
      txId,
      confirmedRound: confirmedTxn['confirmed-round'],
      sender: senderAccount.addr,
      note: attestationData
    };
  } catch (error) {
    console.error('Error creating attestation transaction:', error);
    throw new Error(`Failed to create attestation: ${error.message}`);
  }
}

/**
 * Retrieves transaction details from the Algorand blockchain
 * @param {string} txId - The transaction ID to retrieve
 * @returns {Promise<Object>} The transaction details
 */
async function getTransactionDetails(txId) {
  if (!isAlgorandAvailable()) {
    throw new Error('Algorand client is not available');
  }

  try {
    const transaction = await indexerClient.lookupTransactionByID(txId).do();
    return transaction;
  } catch (error) {
    console.error('Error retrieving transaction details:', error);
    throw new Error(`Failed to retrieve transaction: ${error.message}`);
  }
}

/**
 * Gets the account balance in Algos
 * @param {string} address - The Algorand address to check
 * @returns {Promise<number>} The account balance in Algos
 */
async function getAccountBalance(address) {
  if (!isAlgorandAvailable()) {
    throw new Error('Algorand client is not available');
  }

  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    // Convert microAlgos to Algos (1 Algo = 1,000,000 microAlgos)
    return accountInfo.amount / 1000000;
  } catch (error) {
    console.error('Error retrieving account balance:', error);
    throw new Error(`Failed to get account balance: ${error.message}`);
  }
}

/**
 * Verifies if an attestation exists on the blockchain
 * @param {string} txId - The transaction ID to verify
 * @param {Object} expectedData - The expected data in the transaction note
 * @returns {Promise<boolean>} True if the attestation exists and matches the expected data
 */
async function verifyAttestation(txId, expectedData) {
  if (!isAlgorandAvailable()) {
    throw new Error('Algorand client is not available');
  }

  try {
    const transaction = await getTransactionDetails(txId);
    
    if (!transaction || !transaction.transaction) {
      return false;
    }
    
    // Get the note from the transaction
    const note = transaction.transaction.note;
    if (!note) {
      return false;
    }
    
    // Decode the note from base64
    const decodedNote = Buffer.from(note, 'base64').toString();
    
    try {
      // Parse the note as JSON
      const noteData = JSON.parse(decodedNote);
      
      // Compare the note data with the expected data
      // This is a simple comparison - you might want to implement a more sophisticated comparison
      return JSON.stringify(noteData) === JSON.stringify(expectedData);
    } catch (error) {
      console.error('Error parsing note data:', error);
      return false;
    }
  } catch (error) {
    console.error('Error verifying attestation:', error);
    return false;
  }
}

module.exports = {
  waitForConfirmation,
  createAttestationTransaction,
  getTransactionDetails,
  getAccountBalance,
  verifyAttestation
};