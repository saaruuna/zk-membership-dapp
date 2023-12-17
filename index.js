// cli with following functionality:
// interact with deployed membership contract (submit public key along with sender address)
// interact with deployed event contract (submit public key)
// generate public private key pair for new member
const program = require('commander');

const {
  genPrivateKey,
  genPublicKey,
  formatBabyJubJubPrivateKey,
  SNARK_FIELD_SIZE
} = require("./utils/crypto");

// generate public & private key pair for new member, also address?
program
  .version('1.0.0')
  .description('A simple JavaScript CLI template');

// Define your commands and options here

program
  .command('gen-keypair')
  .description('Generates a public-private keypair for the user.')
  .action(() => {
    privKey = genPrivateKey()
    pubKey = genPublicKey(privaKey)

    console.log(`Private Key: ${privKey}\n Public Key: ${pubKey}`)
  });

program
  .command('add-member <pub_key>')
  .description('Interacts with the deployed Membership.sol contract to add a member.')
  .action((pub_key) => {
    console.log(`Interacting with Membership.sol to add public key ${pub_key}`)
  });

program
  .command('remove-member')
  .description('Interacts with the deployed Membership.sol contract to remove a member.')
  .action((pub_key) => {
    console.log(`Interacting with Membership.sol to remove public key ${pub_key}`)
  })``

program
  .command('buy-event')
  .description('Interacts with the deployed Event.sol contract to buy an event to a ticket.')
  .action((pub_key) => {
    // edit circom.circuit
    // recompile circuits
    // redeploy circuit
    console.log(`Checking membership for ${pub_key}`);
  });

program.parse(process.argv);

// If no command is provided, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

