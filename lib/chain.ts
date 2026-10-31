import {
  Contract,
  Keypair,
  Networks,
  rpc as SorobanRpc,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  xdr,
} from "@stellar/stellar-sdk";
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";

const RPC_URL = "https://soroban-testnet.stellar.org";
const CONTRACT_ID = process.env.CONTRACT_ID!;
const NETWORK_PASSPHRASE = Networks.TESTNET;

const server = new SorobanRpc.Server(RPC_URL);

async function invoke(
  secretKey: string,
  method: string,
  args: xdr.ScVal[]
): Promise<string> {
  const keypair = Keypair.fromSecret(secretKey);
  const signer = basicNodeSigner(keypair, NETWORK_PASSPHRASE);
  const publicKey = keypair.publicKey();

  const account = await server.getAccount(publicKey);
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  const { signedTxXdr } = await signer.signTransaction(prepared.toXDR());
  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);

  const response = await server.sendTransaction(signedTx);

  if (response.status === "ERROR") {
    throw new Error(`Contract error: ${JSON.stringify(response.errorResult)}`);
  }

  // Poll until confirmed
  let get = await server.getTransaction(response.hash);
  while (get.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 1000));
    get = await server.getTransaction(response.hash);
  }

  if (get.status === "FAILED") {
    throw new Error(`Transaction failed: ${response.hash}`);
  }

  return response.hash;
}

export async function createTask(
  buyerSecret: string,
  spec: string
): Promise<{ taskId: number; txHash: string }> {
  const taskId = Date.now(); // unique enough for testnet demo
  const args = [
    nativeToScVal(taskId, { type: "u64" }),
    nativeToScVal(spec, { type: "string" }),
    nativeToScVal(10_000_000n, { type: "i128" }), // 10 XLM in stroops
  ];
  const txHash = await invoke(buyerSecret, "create_task", args);
  return { taskId, txHash };
}

export async function submitReceipt(
  agentSecret: string,
  taskId: number,
  receiptHash: string
): Promise<string> {
  const args = [
    nativeToScVal(taskId, { type: "u64" }),
    nativeToScVal(receiptHash, { type: "string" }),
  ];
  return invoke(agentSecret, "submit_receipt", args);
}

export async function settle(
  verifierSecret: string,
  taskId: number,
  pass: boolean
): Promise<string> {
  const args = [
    nativeToScVal(taskId, { type: "u64" }),
    nativeToScVal(pass, { type: "bool" }),
  ];
  return invoke(verifierSecret, "settle", args);
}
