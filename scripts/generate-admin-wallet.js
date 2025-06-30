/**
 * scripts/generate-admin-wallet.js
 * 
 * This script generates a new Algorand wallet for administrative purposes.
 * It outputs the wallet address and mnemonic, which should be saved securely.
 * 
 * Usage: node scripts/generate-admin-wallet.js
 */

const algosdk = require('algosdk');

function generateAdminWallet() {
  try {
    // Generate a new account
    const account = algosdk.generateAccount();
    const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

    console.log('\n✅ Admin Wallet Created:');
    console.log('--------------------------------------------------');
    console.log('Address:', account.addr);
    console.log('--------------------------------------------------');
    console.log('Mnemonic:', mnemonic);
    console.log('--------------------------------------------------');
    console.log('\n⚠️  IMPORTANT: Save this mnemonic securely!');
    console.log('Add it to your .env.local as ADMIN_WALLET_MNEMONIC');
    console.log('\n🔍 For TestNet: Visit https://bank.testnet.algorand.network/');
    console.log('to fund this account with test Algos');
    
    return {
      address: account.addr,
      mnemonic: mnemonic
    };
  } catch (error) {
    console.error('Error generating admin wallet:', error);
    process.exit(1);
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  generateAdminWallet();
}

module.exports = generateAdminWallet;