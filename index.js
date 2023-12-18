// cli with following functionality:
// interact with deployed membership contract (submit public key along with sender address)
// interact with deployed event contract (submit public key)
// generate public private key pair for new member
const program = require('commander');
const zkSnark = require("snarkjs")
const {
  genPrivateKey,
  genPublicKey,
  formatBabyJubJubPrivateKey,
  SNARK_FIELD_SIZE
} = require("./utils/crypto");
const { buildBn128 } = require("websnark");
const MembershipDef = require("zk-contracts/build/Membership.json");
const { ethers } = require("ethers");
const compiler = require("circom");

// Provider to interact with ganache
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const wallet = new ethers.Wallet(
  "0x989d5b4da447ba1c7f5d48e3b4310d0eec08d4abd0f126b58249598abd8f4c37",
  provider
);
const MembershipContract = new ethers.Contract(
  MembershipAddress,
  MembershipDef.abi,
  wallet
);

const rewriteCircuit = () => {
    // Get circuit size from Membership contract.
    circuitSize = MembershipContract.getMembershipCount()

    // Read the original Circom code
    const circomCode = fs.readFileSync('zk-circuits/circuit.circom', 'utf-8');

    // Replace the placeholder with the dynamic circuitSize
    const modifiedCircomCode = circomCode.replace(/ZkIdentity\(3\)/g, `ZkIdentity(${circuitSize})`);

    // Write the modified code back to a new file
    fs.writeFileSync('zk-circuits/circuit.circom', modifiedCircomCode, 'utf-8');
}

const recompileCircuit = async () => {
  // Load circuit.
  const circuitDef = await compiler(require.resolve("zk-circuits/circuit.circom"))
  fs.writeFileSync("build/circuit.cir", JSON.stringify(circuit), "utf-8")
  const circuit = new zkSnark.Circuit(circuitDef)

  // Trusted setup.
  const setup = zkSnark.setup(circuit)
  fs.writeFileSync("build/circuit.vk_proof", JSON.stringify(setup.vk_proof), "utf-8")
  fs.writeFileSync("build/circuit.vk_verifier", JSON.stringify(setup.vk_verifier), "utf-8")
}

const generateProof = async (privKey, pubKeys) => {
  const circuitInputs = {
    privateKey: formatBabyJubJubPrivateKey(privKey),
    publicKeys: pubKeys
  };

  const circuitDef = JSON.parse(fs.readFileSync("build/circuit.cir", "utf8"));
  const circuit = new zkSnark.Circuit(circuitDef);

  console.log("Calculating witness");
  const witness = circuit.calculateWitness(stringifyBigInts(circuitInputs));
  const publicSignals = witness.slice(
    1,
    circuit.nPubInputs + circuit.nOutputs + 1
  );

  // Websnark to generate proof
  const wasmBn128 = await buildBn128();
  const zkSnark = groth;

  console.log("Generating proof....");
  const witnessBin = binarifyWitness(witness);
  const provingKeyBin = binarifyProvingKey(provingKey);
  const proof = await wasmBn128.groth16GenProof(witnessBin, provingKeyBin);

  return {proof, verifyingSignals}
}

const verifyProof = async (verifyingKey, proof, publicSignals) => {
  const isValid = zkSnark.isValid(
      unstringifyBigInts(verifyingKey),
      unstringifyBigInts(proof),
      unstringifyBigInts(publicSignals)
    );
  return isValid
}

const verifyProofOnSmartContract = aync (proof) => {
  // Need to massage inputs to fit solidity format
  const solidityProof = {
    a: stringifyBigInts(proof.pi_a).slice(0, 2),
    b: stringifyBigInts(proof.pi_b)
      .map(x => x.reverse())
      .slice(0, 2),
    c: stringifyBigInts(proof.pi_c).slice(0, 2),
    inputs: publicSignals.map(x => x.mod(SNARK_FIELD_SIZE).toString())
  };
  console.log(`Passed local zk-snark verification: ${isValid}`);

  // Submit to smart contract
  const solidityIsValid = await EventContract.isInGroup(
    solidityProof.a,
    solidityProof.b,
    solidityProof.c,
    solidityProof.inputs
  );
  console.log(`Verified user is in group (via solidity): ${solidityIsValid}`);
}

// generate public & private key pair for new member, also address?
program
  .version('1.0.0')
  .description('A simple JavaScript CLI template');

program
  .command('gen-keypair')
  .description('Generates a public-private keypair for the user.')
  .action(() => {
    privKey = genPrivateKey()
    pubKey = genPublicKey(privKey)

    console.log(`Private Key: ${privKey}\n Public Key: ${pubKey}`)
  });

program
  .command('add-member <pub_key>')
  .description('Interacts with the deployed Membership.sol contract to add a member.')
  .action((pub_key) => {
    console.log(`Interacting with Membership.sol to add public key ${pub_key}`)
  });

program
  .command('buy-event')
  .description('Interacts with the deployed Event.sol contract to buy an event to a ticket.')
  .action((pub_key) => {
    rewriteCircuit()
    recompileCircuit()

    // recompile circuits
    // redeploy circuit
    console.log(`Checking membership for ${pub_key}`);
  });

program.parse(process.argv);

// If no command is provided, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

