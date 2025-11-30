# AI-Powered Robotics Learning Platform (MVP Design)

## Overview and Goals
This document outlines the technical design for an advanced MVP prototype of a React-based educational robotics platform. The platform teaches students (grades 6–11) about robotics through interactive coding simulation and an AI-assisted tutor. Key features include:

- **Live Arduino Simulator:** Supports multiple board types (Arduino Uno, Arduino Nano, ESP32). Students can input C/C++-based Arduino code, run it in a sandboxed simulation, and see real-time feedback (LED states, sensor readings, serial output, etc.). The simulator handles errors gracefully (syntax mistakes, runtime issues) with realistic responses, rather than using static outputs.
- **AI Tutor Chat Interface:** An integrated chatbot assistant that continuously monitors the user’s code and simulation output. It provides context-aware help by giving coding tips, debugging assistance, and hardware design warnings (e.g., cautioning about electrical limits or incorrect pin usage). The AI tutor tracks the student’s progress and past mistakes to give tailored guidance and retry suggestions.
- **Dynamic Quiz System:** An interactive quiz module with multiple-choice questions of increasing difficulty to reinforce concepts. It tracks each student’s progress and performance. The AI tutor ties in with the quiz system, offering explanations or remedial questions when a student struggles.
- **User Authentication & Data Persistence:** Uses Supabase as the backend for authentication (email/password, third-party OAuth, plus a guest mode) and data storage. User profiles store quiz history, code simulation attempts, and chat logs, enabling personalized learning and progress tracking.
- **Modern Frontend (React + TypeScript):** A responsive, modular single-page application. It employs a dark-themed, dashboard-style UI for ease of use during long coding sessions. The design leverages a modern component library (e.g., Tailwind CSS with shadcn/ui or Chakra UI) for a polished look and consistent UX across the simulator, chat, and quiz sections.
- **Scalability & Extensibility:** The design anticipates future growth – e.g., the possibility to convert to a mobile app via React Native/Expo, add more hardware simulations, and incorporate more advanced AI capabilities.

## High-Level System Architecture

### Frontend (React + TypeScript)
- Single Page Application (SPA) with routing for Simulator, Quizzes, Profile, and Dashboard pages.
- State managed via providers (Auth, AI tutor, theme) with Supabase client SDK for data access.
- Real-time updates handled with Supabase real-time subscriptions or WebSockets as needed.

### Backend (Supabase & Cloud Services)
- Supabase Postgres with Row Level Security for user-isolated data.
- Supabase Auth for email/password, OAuth, and guest sessions.
- Supabase Edge Functions (Deno) for AI tutor calls and optional compilation proxy.
- External services:
  - **Code Compilation Service:** Cloud function/container running Arduino CLI to compile C/C++ sketches into board-specific binaries (HEX/BIN). Returns binaries or compile errors to the client.
  - **AI Tutor Service:** Serverless function proxying OpenAI Codex/GPT requests with context (code, logs, user question). Stores chat logs and optional analytics.

### Simulation Engine
- **AVR (Uno/Nano):** Uses [avr8js](https://github.com/wokwi/avr8js) to emulate CPU/peripherals. Client loads compiled HEX and runs instruction loop, forwarding pin/serial events to UI.
- **ESP32:** Either WebAssembly/QEMU-based emulator or stubbed high-level simulation (hooks for digitalWrite/analogRead/Serial). Modular interface allows upgrading to full emulator later.
- Simulation runs in a Web Worker to keep UI responsive; watchdog/stop controls prevent hangs.

### Data Flow
1. Student edits code in the editor and clicks **Run**.
2. Client sends code + board choice to compile service; receives binary or errors.
3. On success, simulator loads binary and emits pin/serial events to UI; on error, UI surfaces compile logs.
4. AI tutor can be auto-invoked on errors or user requests, receiving code, logs, and chat history to generate guidance.
5. Quiz submissions insert attempts into Supabase; tutor can respond with explanations or remediation.

## Component Architecture (Frontend)
- **App:** Root with routing and providers (AuthProvider, AITutorProvider, Theme).
- **Layout:** Sidebar navigation plus main content outlet; dark-mode default.
- **SimulatorPage:** CodeEditor (Monaco/Ace), BoardSelector, SimulatorView (LED indicators, pin states), SerialMonitor, OutputLogs, SimulatorControls (Run/Stop/Reset), optional AIChatPanel.
- **QuizPage:** QuizQuestion with AnswerOption cards, QuizProgressBar, QuizFeedback, tutor assistance hooks.
- **Dashboard/Profile:** Stats for quiz performance, saved runs, chat transcripts; guest conversion prompts.
- **Auth Pages:** Login/Signup with Supabase; guest mode supported.

## Database Schema (Supabase)
- **profiles**: user_id (PK), display_name, grade_level, avatar_url.
- **quiz_questions**: id, grade_level, difficulty, question_text, options (JSON), correct_answer, explanation.
- **quiz_attempts**: id, user_id (FK), question_id (FK), selected_option, is_correct, answered_at.
- **code_runs**: id, user_id, board_type, code, run_at, result_status, error_message, output_log.
- **chat_messages**: id, user_id, session_id, role (user/assistant), message_text, created_at.
- All user-linked tables protected by RLS to enforce per-user access.

## AI Tutor Integration
- System prompt sets tutor persona (supportive, safety-aware, Socratic guidance, Arduino/electronics expertise).
- Requests include structured context blocks (Code, Simulation Output/Errors, Question) and recent chat history.
- Automatic triggers: compile errors, quiz mistakes, or heuristics (e.g., no output for long run) can prompt proactive help.
- API calls via Supabase Edge Function; stream responses when possible with typing indicators; graceful fallbacks and rate limiting.

## Live Arduino Simulator Design
- **Compilation:** Arduino CLI cloud service per board; returns binary or parsed errors for inline editor markers.
- **Execution:** avr8js CPU loop in worker; hooks for GPIO/serial to update LEDIndicator and SerialMonitor components. ESP32 uses emulator or JS/WASM stubs for core APIs.
- **Controls & UX:** Run/Stop/Reset, speed control (optional), runtime logs, serial input box, interactive inputs (virtual buttons/sensors) feeding simulator state.
- **Feedback Loop:** AI tutor auto-explains compile/runtime issues and suggests fixes or safety reminders (e.g., missing resistor, pinMode warnings).

## Dynamic Quiz System
- Difficulty progression: start easy; increase after streaks, decrease on repeated misses.
- Immediate feedback with explanations; tutor offers remediation or encouragement.
- Progress indicators (scores, streaks) and topic tagging for adaptive selection.
- Optional AI-generated follow-up questions (validated before use) for extra practice.

## Authentication & Profile
- Supabase Auth for email/password, OAuth; guest sessions with optional upgrade path.
- Protected routes in SPA; profile fetch on login with grade/prefs for personalization.
- Local caching for guest progress with migration on sign-up.

## Security & Sandbox
- Client-side execution in Web Workers; no access to DOM/network; simulated MCU memory limits.
- Server compilation in isolated container; no outbound network from user code; rate limiting.
- XSS-safe rendering (serial/ logs as text), HTTPS, JWT-based API calls, CSRF mitigation via single-origin SPA.
- Prompt-injection defenses by delimiting code/outputs and instructing AI to ignore user-supplied instructions within code/comments; optional moderation of AI replies.

## Scalability & Future Work
- Scale Supabase and compile service horizontally; consider in-browser compilation (WASM toolchain) to reduce server load.
- Mobile/Expo path focusing on chat/quizzes with simplified simulation; shared TypeScript logic.
- Extend simulator to more boards/components; add classroom/collaboration features and curriculum-guided lessons.
- Optimize AI costs with model tiering, caching, and batched/offline hint generation.

## Sources
- Uri Shaked, "AVR8js: Simulate Arduino in JavaScript" – Wokwi Blog.
- Supabase Docs – Postgres with Row Level Security and AI integration guidance.
- Wasmino project – compiling Arduino code to WebAssembly for browser execution.
