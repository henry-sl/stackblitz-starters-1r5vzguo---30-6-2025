const algosdk = require('algosdk');

function generateAdminWallet() {
  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

  console.log('✅ Admin Wallet Created:');
  console.log('Address:', account.addr);
  console.log('Mnemonic:', mnemonic);
  console.log('\n⚠️ Save this mnemonic securely! Add it to your .env.local as ADMIN_WALLET_MNEMONIC');
}

generateAdminWallet();

