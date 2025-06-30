const algosdk = require('algosdk');
require('dotenv').config({ path: '.env.local' }); // Load environment variables from .env.local

function getAdminWalletAddress() {
  const mnemonic = process.env.ADMIN_WALLET_MNEMONIC;

  if (!mnemonic) {
    console.error('Error: ADMIN_WALLET_MNEMONIC is not set in your .env.local file.');
    console.error('Please ensure it is configured correctly.');
    return;
  }

  try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    
    // Ensure the address is a string. It should already be, but this handles unexpected types.
    const address = String(account.addr);

    console.log('Your Admin Wallet Address:');
    console.log(address);
  } catch (error) {
    console.error('Error deriving address from mnemonic. Please check if your ADMIN_WALLET_MNEMONIC is valid and correctly formatted (25 words, space-separated).');
    console.error('Details:', error.message);
  }
}

getAdminWalletAddress();

