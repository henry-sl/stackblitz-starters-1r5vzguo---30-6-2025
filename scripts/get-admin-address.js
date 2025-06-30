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
    console.log('Your Admin Wallet Address:');
    console.log(account.addr);
  } catch (error) {
    console.error('Error deriving address from mnemonic. Please check if your ADMIN_WALLET_MNEMONIC is valid.');
    console.error(error.message);
  }
}

getAdminWalletAddress();
console.log(account.addr);
