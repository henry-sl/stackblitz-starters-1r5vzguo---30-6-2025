/**
 * lib/algorand.js
 * 
 * This module provides Algorand blockchain clients for interacting with the Algorand network.
 * It sets up both algod client (for submitting transactions) and indexer client (for querying blockchain data).
 * 
 * The module uses environment variables for configuration:
 * - ALGOLAND_API_TOKEN: API token for authentication
 * - ALGOLAND_ALGOD_URL: URL for the Algorand node
 * - ALGOLAND_INDEXER_URL: URL for the Algorand indexer
 */

const algosdk = require('algosdk');

/**
 * Validates that all required environment variables are present
 * @returns {Object} Object containing validation result and any error message
 */
function validateEnvironmentVariables() {
  const requiredVars = [
    'ALGOLAND_API_TOKEN',
    'ALGOLAND_ALGOD_URL',
    'ALGOLAND_INDEXER_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    return {
      valid: false,
      error: `Missing required environment variables: ${missingVars.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Creates an Algorand algod client for submitting transactions
 * @returns {Object} Configured algod client or null if configuration failed
 */
function createAlgodClient() {
  try {
    const token = process.env.ALGOLAND_API_TOKEN;
    const server = process.env.ALGOLAND_ALGOD_URL;
    
    // Extract port from URL if present, otherwise use default (443 for HTTPS)
    const url = new URL(server);
    const port = url.port || (url.protocol === 'https:' ? '443' : '80');
    
    // Create and return the algod client
    return new algosdk.Algodv2(token, server, port);
  } catch (error) {
    console.error('Failed to create Algorand algod client:', error);
    return null;
  }
}

/**
 * Creates an Algorand indexer client for querying blockchain data
 * @returns {Object} Configured indexer client or null if configuration failed
 */
function createIndexerClient() {
  try {
    const token = process.env.ALGOLAND_API_TOKEN;
    const server = process.env.ALGOLAND_INDEXER_URL;
    
    // Extract port from URL if present, otherwise use default (443 for HTTPS)
    const url = new URL(server);
    const port = url.port || (url.protocol === 'https:' ? '443' : '80');
    
    // Create and return the indexer client
    return new algosdk.Indexer(token, server, port);
  } catch (error) {
    console.error('Failed to create Algorand indexer client:', error);
    return null;
  }
}

// Validate environment variables before creating clients
const validation = validateEnvironmentVariables();
if (!validation.valid) {
  console.error(`Algorand client initialization error: ${validation.error}`);
  console.error('Please check your .env.local file and ensure all required variables are set.');
}

// Initialize clients
const algodClient = validation.valid ? createAlgodClient() : null;
const indexerClient = validation.valid ? createIndexerClient() : null;

/**
 * Utility function to check if the Algorand clients are properly initialized
 * @returns {boolean} True if both clients are initialized, false otherwise
 */
function isInitialized() {
  return algodClient !== null && indexerClient !== null;
}

/**
 * Gets the network type (mainnet or testnet) based on the configured URLs
 * @returns {string} 'mainnet', 'testnet', or 'unknown'
 */
function getNetworkType() {
  if (!process.env.ALGOLAND_ALGOD_URL) return 'unknown';
  
  const url = process.env.ALGOLAND_ALGOD_URL.toLowerCase();
  
  if (url.includes('mainnet')) return 'mainnet';
  if (url.includes('testnet')) return 'testnet';
  
  // Try to infer from common provider domains
  if (url.includes('algonode.io') && !url.includes('testnet')) return 'mainnet';
  if (url.includes('algoexplorer.io') && !url.includes('testnet')) return 'mainnet';
  
  return 'unknown';
}

/**
 * Gets the appropriate explorer URL for a transaction based on the network type
 * @param {string} txId - The transaction ID
 * @returns {string} The explorer URL for the transaction
 */
function getExplorerURL(txId) {
  const network = getNetworkType();
  
  if (network === 'mainnet') {
    return `https://algoexplorer.io/tx/${txId}`;
  } else if (network === 'testnet') {
    return `https://testnet.algoexplorer.io/tx/${txId}`;
  } else {
    // Default to testnet if unknown
    return `https://testnet.algoexplorer.io/tx/${txId}`;
  }
}

// Export the clients and utility functions
module.exports = {
  algodClient,
  indexerClient,
  isInitialized,
  getNetworkType,
  getExplorerURL
};