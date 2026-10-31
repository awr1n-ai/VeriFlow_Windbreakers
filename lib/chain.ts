import {
  Address,
  authorizeEntry,
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

function addrVal(publicKey: string): xdr.ScVal {
  return Address.fromString(publicKey).toScVal();
}

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

  // Sign any inner auth entries (e.g. token sub-call require_auth)
  const { sequence } = await server.getLatestLedger();
  const op = prepared.operations[0] as unknown as {
    auth?: xdr.SorobanAuthorizationEntry[];
  };
  if (op.auth && op.auth.length > 0) {
    op.auth = await Promise.all(
      op.auth.map((entry) =>
        authorizeEntry(entry, keypair, sequence + 100, NETWORK_PASSPHRASE)
      )
    );
  }

  const { signedTxXdr } = await signer.signTransaction(prepared.toXDR());
  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);

  const response = await server.sendTransaction(signedTx);

  if (response.status === "ERROR") {
    throw new Error(`Contract error: ${JSON.stringify(response.errorResult)}`);
  }

  // Poll using raw JSON-RPC — the SDK's getTransaction() mis-parses Soroban result XDR
  let status = "NOT_FOUND";
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: { hash: response.hash },
      }),
    });
    const data = (await res.json()) as { result?: { status: string } };
    status = data.result?.status ?? "NOT_FOUND";
    if (status !== "NOT_FOUND") break;
  }

  if (status === "FAILED") {
    throw new Error(`Transaction failed: ${response.hash}`);
  }

  return response.hash;
}

export async function createTask(
  buyerSecret: string,
  agentSecret: string,
  spec: string
): Promise<{ taskId: number; txHash: string }> {
  const taskId = Date.now();
  const buyerKey = Keypair.fromSecret(buyerSecret).publicKey();
  const agentKey = Keypair.fromSecret(agentSecret).publicKey();
  const args = [
    addrVal(buyerKey),
    addrVal(agentKey),
    nativeToScVal(BigInt(taskId), { type: "u64" }),
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
  const agentKey = Keypair.fromSecret(agentSecret).publicKey();
  const args = [
    addrVal(agentKey),
    nativeToScVal(BigInt(taskId), { type: "u64" }),
    nativeToScVal(receiptHash, { type: "string" }),
  ];
  return invoke(agentSecret, "submit_receipt", args);
}

export async function settle(
  verifierSecret: string,
  taskId: number,
  pass: boolean
): Promise<string> {
  const verifierKey = Keypair.fromSecret(verifierSecret).publicKey();
  const args = [
    addrVal(verifierKey),
    nativeToScVal(BigInt(taskId), { type: "u64" }),
    nativeToScVal(pass, { type: "bool" }),
  ];
  return invoke(verifierSecret, "settle", args);
}
