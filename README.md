# 🧠 DevState
**Operationalize your context. The local-first "save state" for your AI coding sessions.**

[![npm version](https://badge.fury.io/js/devstate-cli.svg)](https://badge.fury.io/js/devstate-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Let's circle back to a core engineering pain point: we’ve all experienced the friction of logging off, only to return the next morning and burn 15 minutes trying to reconstruct our mental architecture. *What branch was I on? What files were modified? What was I about to fix?* 

DevState is a lightweight, zero-dependency CLI utility designed to eliminate that cognitive overhead. It acts as an automated telemetry locker, capturing your active Git branch, uncommitted file tree, and personal developer notes locally. 

Because honestly, manually typing `git status` to feed your LLM context in 2026 is a crime against productivity.

---

### 🎥 Workflow Demonstration
*(Add your 15-second terminal GIF here)*

---

### 🚀 Installation

Deploy the asset globally via npm to leverage the utility across any local project directory:

```bash
npm install -g devstate-cli
```

*Note: DevState is highly empathetic to your repository hygiene. It automatically appends its local database (`.devstate.db`) to your project's `.gitignore` to ensure a frictionless commit cycle.*

---

### 🛠️ Operational Matrix (Usage)

#### 1. Capture State
Execute this at the end of your development sprint, or immediately prior to context-switching to a different initiative.

```bash
devstate save "Refactored Next.js auth middleware, need to implement RLS policies next"
```

#### 2. Retrieve State
Execute this upon returning to the project folder to output your structured AI prompt block.

```bash
devstate resume
```

---

### 🔒 Absolute Privacy (Zero Cloud Footprint)

We take a forward-thinking view on data sovereignty. DevState is architected for engineers who require strict source code confidentiality. 

* **Zero Cloud Infrastructure.** 
* **Zero API Keys.** 
* **Zero Telemetry.** 

Everything is securely housed in a hidden `.devstate.db` SQLite file locally on your machine. Your proprietary logic never leaves your hardware.
