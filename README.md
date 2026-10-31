# VeriFlow 🔐

### Trustless Payments for AI Agents

**VeriFlow is a blockchain-backed escrow system designed to make payments to AI agents conditional on independent task verification.**

Instead of trusting an AI agent's claim that it has completed a task, VeriFlow aims to verify the result before releasing payment. Successful tasks can trigger payment release, while failed tasks can trigger a refund to the buyer.

Built with **Next.js, TypeScript, Gemini AI, Stellar, and Soroban**, VeriFlow explores a safer and more transparent way to pay for AI-generated work.

---

## 🚀 The Problem

AI agents can automate coding, data analysis, and other digital tasks. However, paying for their work introduces a trust problem.

- How can a buyer know whether an agent completed a task correctly?
- What prevents an agent from claiming success without meeting the requirements?
- How can a system prevent duplicate payments?
- What happens when an agent fails to complete a task?

Traditional applications often rely on centralized systems to evaluate results and manage payments.

**VeriFlow explores a different approach: combine AI task execution, independent verification, and blockchain escrow.**

## 💡 Our Solution

VeriFlow separates task execution, verification, and payment into distinct responsibilities.

1. **Create a task:** The buyer defines the task and its requirements.
2. **Execute:** An AI agent attempts to complete the task.
3. **Verify:** A verification process evaluates the result.
4. **Settle:** The intended escrow workflow releases payment for passing results or refunds the buyer for failing results.
5. **Inspect:** The interface displays execution steps and the available result and transaction information.

The goal is to ensure that an agent's own claim of success is not sufficient to authorize payment.

---

## ✨ Features

- **AI Agent Execution** — Run tasks through the application's agent workflow.
- **Agent Selection** — Choose between the Good Agent and Lazy Agent demonstration options.
- **Independent Verification** — Evaluate task results against applicable checks.
- **Blockchain Escrow** — Explore conditional payment settlement using Stellar and Soroban.
- **Demo and Live Modes** — Experience the demonstration interface or use the live backend integration.
- **Execution Timeline** — Follow the task's execution and verification steps.
- **Attack Simulations** — Explore scenarios involving dishonest agents and attempts to manipulate verification or payment.
- **Transaction Visibility** — Display transaction information returned by the backend when available.

> **Implementation note:** These features describe the project's intended capabilities. Live blockchain settlement, refund behavior, and security guarantees should be verified against the deployed contract before being presented as production-ready.

---

## 🔄 How It Works

```text
             ┌─────────────────────┐
             │        Buyer        │
             │ Defines task & pays │
             └──────────┬──────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │    VeriFlow UI      │
             │  Next.js + React     │
             └──────────┬──────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │     AI Agent        │
             │  Attempts the task  │
             └──────────┬──────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │     Verifier        │
             │ Evaluates the result│
             └──────────┬──────────┘
                        │
                 ┌──────┴──────┐
                 │             │
                 ▼             ▼
             ┌────────┐    ┌────────┐
             │  PASS  │    │  FAIL  │
             └────┬───┘    └───┬────┘
                  │            │
                  ▼            ▼
             ┌────────┐    ┌────────┐
             │ Release│    │ Refund │
             │ Payment│    │ Buyer  │
             └────────┘    └────────┘
                  │            │
                  └──────┬─────┘
                         ▼
                Stellar / Soroban
```

The diagram illustrates the intended workflow. Actual payment outcomes depend on the deployed contract, its configuration, and successful transaction execution.

---

## 🛡️ Security Demonstrations

VeriFlow includes attack scenarios designed to explore common trust and settlement failures.

| Attack identifier | Scenario |
|---|---|
| `agent_grades_self` | An agent attempts to grade its own work. |
| `fake_verdict` | An attempt is made to manipulate the verification verdict. |
| `double_payout` | An attempt is made to trigger a payment more than once. |
| `tamper` | An attempt is made to tamper with task code or results. |

These scenarios are intended to help demonstrate why verification and settlement rules matter.

**Security warning:** Simulating an attack does not establish that the system successfully prevents it. Each scenario must be tested against the actual backend and smart contract. Do not use real funds or production credentials for unverified demonstrations.

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Frontend application and backend API routes |
| React | Interactive user interface |
| TypeScript | Type-safe application development |
| Tailwind CSS | Styling and responsive layouts |
| shadcn/ui | Reusable interface components |
| Gemini API | AI-related task execution |
| Stellar | Blockchain network |
| Soroban | Smart contracts on Stellar |
| Node.js | JavaScript runtime and development tooling |

---

## 🏗️ Architecture

VeriFlow combines a web application, an AI-powered workflow, verification logic, and a blockchain escrow component.

```text
VeriFlow
│
├── Frontend
│   ├── Agent selection
│   ├── Task execution interface
│   ├── Verification timeline
│   ├── Result display
│   └── Attack demonstration panel
│
├── Backend
│   ├── Task execution API
│   ├── AI agent integration
│   ├── Verification workflow
│   └── Attack simulation API
│
└── Blockchain
    └── Soroban escrow contract
        └── Stellar testnet
```

This is a conceptual overview; refer to the repository's source code for the exact file structure and implementation details.

### API Overview

#### `POST /api/run`

Starts a task execution workflow.

The current integration accepts an agent selection and task specification and returns a task ID with execution steps.

Example request shape:

```json
{
  "agent": "good",
  "spec": "Complete the task according to the specified requirements."
}
```

The supported agent values are `good` and `lazy`.

The exact response structure is defined by the backend and includes a `taskId` and a `steps` array.

#### `POST /api/cheat`

Runs an attack demonstration against a previously created task.

The backend recognizes the following attack identifiers:

- `agent_grades_self`
- `fake_verdict`
- `double_payout`
- `tamper`

The request requires the relevant task ID. Additional fields may be required for particular scenarios.

> **Note:** The backend currently uses a predefined test workflow. The frontend's task specification should not be assumed to dynamically generate arbitrary verification tests.

---

## ⚙️ Getting Started

### Prerequisites

Before running VeriFlow locally, install:

- Node.js and npm
- Git
- A Gemini API key
- Access to the configured Stellar testnet
- A deployed and correctly initialized Soroban contract for live blockchain operations

You can use Demo Mode to explore the interface without assuming that live blockchain functionality is configured.

### 1. Clone the Repository

```bash
git clone https://github.com/awr1n-ai/VeriFlow_Windbreakers.git
```

Move into the project directory:

```bash
cd VeriFlow_Windbreakers
```

Switch to the integrated frontend branch if necessary:

```bash
git checkout FRONTEND
```

### 2. Install Dependencies

```bash
npm install
```

On Windows PowerShell, if the `npm` command is affected by PowerShell execution-policy restrictions, try:

```powershell
npm.cmd install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root and add the environment variables required by the backend.

The current backend configuration expects these names:

```env
GEMINI_API_KEY=your_gemini_api_key
CONTRACT_ID=your_soroban_contract_id

BUYER_SECRET=your_buyer_secret
AGENT_SECRET=your_agent_secret
VERIFIER_SECRET=your_verifier_secret
HACKER_SECRET=your_hacker_secret
```

Replace the placeholder values with the correct credentials and contract configuration for your environment.

**Important security practices:**

- Never commit `.env.local` to GitHub.
- Never publish wallet secret keys or API keys.
- Use dedicated testnet accounts and test funds for development.
- Confirm that the contract is initialized correctly before testing live settlement.
- Never use production wallet credentials in a hackathon demo.

The required variables and their exact use should be confirmed against the current backend source code before deployment.

### 4. Start the Development Server

On Windows PowerShell:

```powershell
npm.cmd run dev
```

On other supported terminals:

```bash
npm run dev
```

Open the local application at:

```text
http://localhost:3000
```

### 5. Test the Application

1. Open VeriFlow in your browser.
2. Select Demo Mode to explore the interface.
3. Switch to Live Mode when the required backend configuration is available.
4. Run a task.
5. Inspect the execution and verification timeline.
6. Review the result and any returned transaction information.
7. Test attack scenarios using testnet resources.

A successful page load does not confirm that the backend, AI service, or blockchain transaction flow is working. Verify each component separately.

---

## 🧪 Testing and Validation

Before demonstrating the project, validate the following:

- [ ] The frontend starts successfully.
- [ ] The application builds without errors.
- [ ] Demo Mode behaves as expected.
- [ ] Live Mode successfully calls `/api/run`.
- [ ] The AI workflow returns the expected output.
- [ ] Verification results match the applicable checks.
- [ ] Passing tasks trigger the intended settlement behavior.
- [ ] Failing tasks trigger the intended refund behavior.
- [ ] Duplicate payouts are prevented.
- [ ] Tampered results are detected or rejected.
- [ ] Relevant blockchain transactions can be independently inspected.

Passing frontend tests is not equivalent to proving smart-contract security. Contract behavior should be tested independently.

---

## 🌐 Network

VeriFlow has been developed with the Stellar testnet in mind.

| Setting | Value |
|---|---|
| Network | Stellar Testnet |
| Smart-contract platform | Soroban |
| Example escrow amount | 10 XLM |
| Contract ID | Configure using `CONTRACT_ID` |

The example amount is illustrative, not a guarantee that the current deployment uses that amount.

Before running live transactions, confirm the deployed contract ID, initialization state, supported assets, account funding, and transaction behavior.

---

## 🗺️ Roadmap

Potential future improvements include:

- [ ] Support user-defined verification tests.
- [ ] Add stronger, independent verification for generated code.
- [ ] Persist task history beyond the server process lifecycle.
- [ ] Improve transaction-status tracking and error reporting.
- [ ] Add more comprehensive smart-contract security tests.
- [ ] Verify and enforce escrow release and refund invariants.
- [ ] Improve tamper detection with verifiable result commitments.
- [ ] Add an auditable task history and settlement dashboard.
- [ ] Prepare for production deployment only after security review.

These are proposed improvements, not claims about existing functionality.

---

## 🎯 Use Cases

VeriFlow's design could be adapted to:

- AI-powered coding tasks.
- Automated data-processing jobs.
- Agent-based software testing.
- Digital freelance task marketplaces.
- Multi-agent workflows with independent validation.
- Blockchain-based payment systems for automated services.

These are potential applications rather than validated production use cases.

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Submit a pull request with a clear description.

Please do not include API keys, wallet secrets, or other sensitive credentials in commits or issue reports.

---

## 📄 License

Add the project's chosen open-source license before distributing or reusing the code. Until a license is specified, do not assume that the repository grants unrestricted reuse rights.

---

## 👥 Project

**VeriFlow — Trustless Payments for AI Agents**

Repository: [VeriFlow_Windbreakers](https://github.com/awr1n-ai/VeriFlow_Windbreakers)

Built to explore the intersection of AI agents, independent verification, and blockchain-based escrow.

**Our vision:** AI agents should earn trust through verifiable work, not merely through claims of success.
