#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String};

#[contracttype]
pub enum DataKey {
    Verifier,
    Token,
    Task(u64),
}

#[contracttype]
#[derive(Clone)]
pub struct Task {
    pub buyer: Address,
    pub agent: Address,
    pub amount: i128,
    pub has_receipt: bool,
    pub settled: bool,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Deploy-time setup: store the verifier address and the XLM token contract address.
    pub fn initialize(env: Env, verifier: Address, token: Address) {
        assert!(
            !env.storage().instance().has(&DataKey::Verifier),
            "already initialized"
        );
        env.storage().instance().set(&DataKey::Verifier, &verifier);
        env.storage().instance().set(&DataKey::Token, &token);
    }

    /// Buyer locks XLM in escrow.
    pub fn create_task(
        env: Env,
        buyer: Address,
        agent: Address,
        task_id: u64,
        _spec: String,
        amount: i128,
    ) {
        buyer.require_auth();
        assert!(
            !env.storage().instance().has(&DataKey::Task(task_id)),
            "task exists"
        );

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token).transfer(
            &buyer,
            &env.current_contract_address(),
            &amount,
        );

        env.storage().instance().set(
            &DataKey::Task(task_id),
            &Task {
                buyer,
                agent,
                amount,
                has_receipt: false,
                settled: false,
            },
        );
    }

    /// Agent submits SHA-256 receipt hash on-chain. Replay-guarded: can only submit once.
    pub fn submit_receipt(env: Env, agent: Address, task_id: u64, _receipt_hash: String) {
        agent.require_auth();

        let mut task: Task = env
            .storage()
            .instance()
            .get(&DataKey::Task(task_id))
            .expect("task not found");

        assert!(task.agent == agent, "wrong agent");
        assert!(!task.has_receipt, "receipt already submitted");
        assert!(!task.settled, "already settled");

        task.has_receipt = true;
        env.storage().instance().set(&DataKey::Task(task_id), &task);
    }

    /// Verifier settles: PASS pays agent, FAIL refunds buyer. Replay-guarded.
    pub fn settle(env: Env, verifier: Address, task_id: u64, pass: bool) {
        verifier.require_auth();

        let stored_verifier: Address = env
            .storage()
            .instance()
            .get(&DataKey::Verifier)
            .expect("not initialized");
        assert!(verifier == stored_verifier, "not the verifier");

        let mut task: Task = env
            .storage()
            .instance()
            .get(&DataKey::Task(task_id))
            .expect("task not found");

        assert!(!task.settled, "already settled");

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let tc = token::Client::new(&env, &token);

        if pass {
            tc.transfer(&env.current_contract_address(), &task.agent, &task.amount);
        } else {
            tc.transfer(&env.current_contract_address(), &task.buyer, &task.amount);
        }

        task.settled = true;
        env.storage().instance().set(&DataKey::Task(task_id), &task);
    }
}
