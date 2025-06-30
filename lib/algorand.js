/**
 * lib/algorand.js
 * 
 * This module provides Algorand blockchain clients for the application.
 * It initializes and exports both algodClient (for transaction submission)
 * and indexerClient (for blockchain querying) using environment variables.
 */

const algosdk = require('algosdk');

// Environment variable names
const ENV_VARS = {
  API_TOKEN: 'ALGOLAND_API_TOKEN',
  ALGOD_URL: 'ALGOLAND_ALGOD_URL',
  INDEXER_URL: 'ALGOLAND_INDEXER_URL'
};

/**
 * Validates that all required environment variables are present
 * @returns {Object} Object containing the environment variables or throws an error
 */
function validateEnvironmentVars() {
  const missingVars = [];
  const config = {};

  // Check each required environment variable
  Object.entries(ENV_VARS).forEach(([key, envName]) => {
    const value = process.env[envName];
    if (!value) {
      missingVars.push(envName);
    } else {
      config[key] = value;
    }
  });

  // If any variables are missing, throw an error
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Algorand environment variables: ${missingVars.join(', ')}. ` +
      'Please add these to your .env.local file.'
    );
  }

  return config;
}

/**
 * Creates an Algorand client instance
 * @returns {Object} Object containing algodClient and indexerClient
 * @throws {Error} If environment variables are missing or clients cannot be initialized
 */
function createAlgorandClients() {
  try {
    // Validate environment variables
    const config = validateEnvironmentVars();
    
    // Parse the URLs to extract server, port, and path components
    const parseUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return {
          server: `${urlObj.protocol}//${urlObj.hostname}`,
          port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
          path: urlObj.pathname.endsWith('/') ? urlObj.pathname : `${urlObj.pathname}/`
        };
      } catch (error) {
        throw new Error(`Invalid URL format: ${url}. Error: ${error.message}`);
      }
    };

    // Parse Algod and Indexer URLs
    const algodConfig = parseUrl(config.ALGOD_URL);
    const indexerConfig = parseUrl(config.INDEXER_URL);

    // Create Algod client for submitting transactions
    const algodClient = new algosdk.Algodv2(
      config.API_TOKEN, 
      algodConfig.server, 
      algodConfig.port
    );

    // Create Indexer client for querying the blockchain
    const indexerClient = new algosdk.Indexer(
      config.API_TOKEN,
      indexerConfig.server,
      indexerConfig.port
    );

    // Determine if we're using mainnet or testnet based on the URL
    const isMainnet = config.ALGOD_URL.includes('mainnet');
    const networkType = isMainnet ? 'mainnet' : 'testnet';

    console.log(`Algorand clients initialized for ${networkType}`);
    
    return {
      algodClient,
      indexerClient,
      networkType
    };
  } catch (error) {
    console.error('Failed to initialize Algorand clients:', error);
    
    // Re-throw the error to be handled by the caller
    throw new Error(`Algorand client initialization failed: ${error.message}`);
  }
}

// Initialize clients or set to null if initialization fails
let algodClient = null;
let indexerClient = null;
let networkType = null;

try {
  const clients = createAlgorandClients();
  algodClient = clients.algodClient;
  indexerClient = clients.indexerClient;
  networkType = clients.networkType;
} catch (error) {
  console.warn(`Warning: ${error.message}`);
  console.warn('Algorand functionality will be disabled.');
}

/**
 * Utility function to check if Algorand integration is available
 * @returns {boolean} True if Algorand clients are initialized
 */
function isAlgorandAvailable() {
  return algodClient !== null && indexerClient !== null;
}

/**
 * Gets the explorer URL for a transaction based on the current network
 * @param {string} txId - The transaction ID
 * @returns {string} The explorer URL for the transaction
 */
function getExplorerURL(txId) {
  const baseUrl = networkType === 'mainnet' 
    ? 'https://algoexplorer.io' 
    : 'https://testnet.algoexplorer.io';
  
  return `${baseUrl}/tx/${txId}`;
}

module.exports = {
  algodClient,
  indexerClient,
  networkType,
  isAlgorandAvailable,
  getExplorerURL
};