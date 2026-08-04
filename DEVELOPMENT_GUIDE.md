# TaskPro Comprehensive Development Guide

This guide provides a deep-dive into the architecture, flow, and structural decisions behind the TaskPro Learning Management System (LMS) and its integrated AI Training module. It explains *how* the application works, *what* the data flow is, and *why* specific libraries were chosen.

---

## 1. High-Level System Architecture

TaskPro is built using a modern, highly scalable micro-architecture consisting of three main parts:
1. **Frontend (Client)**: A dynamic Single Page Application (SPA) built with React.
2. **Backend (Server)**: A RESTful API built with Node.js, Express, and Prisma ORM.
3. **AI Trainer (Machine Learning)**: A standalone Python application built with PyTorch to train custom Large Language Models (LLMs).

### The General Data Flow:
1. **User Interaction**: The user clicks a button on the React Frontend (e.g., "Run Code").
2. **API Request**: Axios intercepts this action and sends an HTTP POST request to the Node.js Backend.
3. **Routing & Controllers**: Express.js catches the request in `routes`, passes it to a `controller` to validate inputs, and then hands the heavy lifting to a `service`.
4. **Business Logic & DB**: The `service` either interacts with the Database (via Prisma ORM) or runs a system-level process (like spawning the Java compiler or hitting an AI API).
5. **Response**: The result is packaged into a standard JSON format and sent back to the Frontend to update the UI.

---

## 2. The Backend (Node.js & Express)

The backend is structured using a strict **Controller-Service-Route** pattern to ensure it remains scalable for large-level implementations (similar to architectures used by Zoho or Facebook).

### Directory Structure:
- `/routes`: Defines the URL endpoints (e.g., `/api/courses`). It routes incoming HTTP requests to the appropriate Controller.
- `/controllers`: Handles HTTP specifics. It extracts data from `req.body` or `req.params`, passes it to the Service, and formats the `res.status()` response.
- `/services`: Contains pure business logic. This is where database queries, code compilation, and AI integrations happen. *Why? By keeping HTTP logic (Controllers) separate from Business Logic (Services), you can reuse Services anywhere in the app.*
- `/config`: Configuration files (e.g., Prisma setup).
- `/middlewares`: Functions that run *before* the controller (e.g., `authMiddleware` to check if a user is logged in).

### Key Libraries & Why They Are Used:
- **`express`**: The core web framework. It simplifies handling HTTP requests, routing, and middlewares.
- **`@prisma/client`**: A modern Database ORM. *Why?* Instead of writing raw SQL queries which are prone to injection attacks and hard to maintain, Prisma provides a strongly-typed JavaScript API to interact with the database.
- **`bcryptjs`**: A cryptographic library. *Why?* Never store plain-text passwords. Bcrypt hashes passwords with a "salt" so that even if the database is compromised, passwords remain safe.
- **`jsonwebtoken` (JWT)**: Used for stateless authentication. *Why?* Instead of keeping track of sessions in server memory, the server signs a token and gives it to the client. The client sends this token with every request, proving their identity securely and scaling infinitely.
- **`axios`**: Used on the backend to make outgoing HTTP requests (e.g., talking to a local Ollama AI server).
- **`@google/genai`**: The official Google SDK to communicate with the Gemini Cloud AI models.
- **`child_process` (Node Native)**: Used in the Coding Arena. *Why?* To execute user-submitted Java code, the backend needs to literally spawn terminal commands (`javac` and `java`) on the host machine.

---

## 3. The Frontend (React)

The frontend is a robust Single Page Application designed with a premium, dynamic aesthetic.

### Directory Structure:
- `/src/components`: Reusable UI elements (Buttons, Modals, Gantt Charts).
- `/src/pages`: Top-level views (Dashboard, CodingArena, Profile).
- `/src/api/services`: Axios wrapper files (e.g., `courseApi.js`) that correspond 1:1 with backend routes.
- `/src/store` & `/src/context`: Global state management.

### Key Libraries & Why They Are Used:
- **`react` & `react-dom`**: The core UI libraries for building component-based, reactive user interfaces.
- **`react-router-dom`**: Handles client-side routing. *Why?* It allows the user to navigate between pages instantly without the browser refreshing.
- **`@reduxjs/toolkit` / `react-redux`**: Used for complex global state management (like tracking the user's overarching session or deep nested states).
- **`axios`**: The HTTP client. *Why?* It automatically transforms JSON data and easily handles interceptors (e.g., automatically attaching the JWT token to every request header).
- **`tailwindcss`**: A utility-first CSS framework. *Why?* It allows for rapid, consistent styling directly inside React components without writing messy, global CSS files. It ensures the premium, cohesive design system.
- **`lucide-react`**: The icon library. *Why?* It provides clean, modern SVG icons that scale perfectly.
- **`react-simple-code-editor` & `prismjs`**: Used in the Coding Arena. *Why?* Standard `<textarea>` elements cannot highlight syntax. This combination provides a lightweight, real-time syntax-highlighted code editor for Java, Python, etc.

---

## 4. The AI Model Trainer (PyTorch)

The `AITrainer` directory is a standalone Python project that builds a miniature version of a Large Language Model (like GPT) entirely from scratch.

### Architecture & Flow:
1. **Data Loading (`data_loader.py`)**: The raw text from `dataset/sample_data.jsonl` is read. The `GPT2Tokenizer` converts words into numbers (tokens). The PyTorch `DataLoader` chops these numbers into batches of sequence chunks.
2. **The Model (`model.py`)**: A pure PyTorch implementation of the Transformer architecture.
   - **Embeddings**: Converts token numbers into dense vectors of meaning.
   - **Positional Encoding**: Tells the AI the order of the words.
   - **Self-Attention**: The core magic. It allows the model to look at all words in a sentence simultaneously and figure out which words relate to each other (e.g., understanding that "it" refers to "the dog").
   - **FeedForward Network**: Processes the attention data.
3. **Training (`train.py`)**: The model guesses the next word. It compares its guess to the actual next word in the dataset, calculates the error (`CrossEntropyLoss`), and mathematically updates its own "brain cells" (weights) using Backpropagation and the `AdamW` optimizer.

### Key Libraries & Why They Are Used:
- **`torch` (PyTorch)**: The premier deep learning framework. *Why?* It handles complex matrix multiplications and, crucially, performs Automatic Differentiation (calculating the gradients needed for backpropagation automatically). It also pushes calculations to the GPU (CUDA) for massive speedups.
- **`transformers`**: Made by HuggingFace. We only use this for the `GPT2Tokenizer`. *Why?* Tokenizing text (handling spaces, punctuation, sub-words) is incredibly complex; this library provides an industry-standard way to convert strings to arrays of integers.
- **`tqdm`**: A simple library that adds a beautiful progress bar to the terminal output during training loops.
- **`numpy`**: The fundamental package for scientific computing in Python, used for fast mathematical arrays.

---

## Summary of the "Coding Arena" Flow

To put it all together, here is exactly what happens when a user submits code:

1. **Frontend**: User types Java code into the `react-simple-code-editor`. They click "Submit".
2. **Frontend API**: `codingApi.submitCode(code)` wraps the code into a JSON payload and `axios` POSTs it to `/api/coding-submissions/submit`.
3. **Backend Route**: `codingRoutes.js` catches the POST request and passes it to `codingSubmissionController.js`.
4. **Backend Controller**: Validates the user is enrolled, fetches the test cases from Prisma DB, and calls `codingSubmissionService.js`.
5. **Backend Service**: `compilerService.executeJava()` creates a temporary folder on the OS, writes `Solution.java`, uses `child_process.spawn('javac')` to compile it. If successful, it spawns `java Solution` and pumps the test case inputs via `stdin`.
6. **Backend Returns**: The execution time, memory, and pass/fail status are returned up the chain.
7. **Frontend Updates**: React state updates, and the UI re-renders to show green checkmarks for passing test cases.
