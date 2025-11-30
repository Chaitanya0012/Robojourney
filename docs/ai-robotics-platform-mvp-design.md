# AI-Powered Robotics Learning Platform (MVP Design)

## Overview and Goals
- Deliver a React-based learning experience for grades 6–11 focused on Arduino/ESP32 robotics.
- Provide a live Arduino simulator, context-aware AI tutor, adaptive quizzes, and Supabase-backed persistence.
- Favor a dark, dashboard-style UI with modular components and extensible architecture for future hardware and mobile support.

## High-Level System Architecture
- **Frontend (React + TypeScript)**: Single-page app with panels for code editing, simulation, chat, and quizzes. Uses HTTPS APIs to Supabase and optional WebSockets/real-time subscriptions for live updates.
- **Backend (Supabase)**: Postgres with RLS for auth-protected data, Supabase Auth for email/OAuth/guest modes, and Edge Functions for secure operations.
- **Auxiliary Services**:
  - **Code Compilation Service**: Compiles Arduino C/C++ to firmware (`.hex`/binary) per board using Arduino CLI/ESP32 toolchains.
  - **AI Tutor Service**: Supabase Function (or microservice) that proxies OpenAI requests with user code, outputs, and chat history.
- **Simulation Engine**: In-browser emulation via WebAssembly/JS (avr8js for Uno/Nano; extensible to ESP32 emulation or stubbed high-level simulation).

## Frontend Component Structure
- **App**: Routing and providers (Supabase, auth, theme).
- **AuthProvider / AITutorProvider**: Manage auth state and chat context/history.
- **Layout**: Sidebar navigation plus main content outlet.
- **SimulatorPage**:
  - `CodeEditor` (Monaco/Ace) with Arduino syntax highlighting and inline diagnostics.
  - `BoardSelector` for Uno/Nano/ESP32 profiles.
  - `SimulatorView` showing hardware state (pin/LED indicators, optional breadboard graphic).
  - `SerialMonitor` and `OutputLogs` for serial text and compilation/runtime feedback.
  - `SimulatorControls` for run/stop/reset and optional speed control.
  - Optional `AIChatPanel` docked to page.
- **QuizPage**: `QuizQuestion`, `AnswerOption`, `QuizProgressBar`, `QuizFeedback` with AI hints.
- **Dashboard/Profile**: Optional stats, past runs, chat transcripts.
- **Auth Pages**: Login/Signup/Guest entry.

## Database Schema (Supabase)
- **profiles**: user_id, display name, grade, avatar.
- **quiz_questions**: id, grade_level, difficulty, question_text, options JSON, correct_answer, explanation, topics/tags.
- **quiz_attempts**: user_id, question_id, selected_option, is_correct, answered_at.
- **code_runs**: user_id, board_type, code, run_at, status, error_message/output_log.
- **chat_messages** (optional MVP): session_id, user_id, role, message_text, timestamp.
- RLS policies restrict user-owned rows; quiz content may be public-read.

## Live Arduino Simulator Flow
1. **User Code & Run**: Editor posts code to compile endpoint; editor disables during run.
2. **Compile**: Arduino CLI/ESP32 toolchain returns firmware or diagnostics.
   - On errors: surface logs in `OutputLogs`, mark editor lines, and auto-invoke AI tutor for explanations.
3. **Load & Execute**:
   - Uno/Nano: load `.hex` into avr8js CPU; wire timers, GPIO listeners, and UART hooks.
   - ESP32: load into emulator or high-level stub (JS/WASM) for common APIs.
   - Execute in a worker/cooperative loop to keep UI responsive; offer pause/stop/reset.
4. **Runtime Feedback**: Update LED/pin indicators, stream Serial output, allow virtual inputs (buttons/sensor sliders).
5. **Fault Handling**: Detect stalls/heavy loops, allow watchdog stop, and report crashes gracefully.

## AI Tutor Integration
- **Prompting**: System prompt defines robotics tutor persona; user payload bundles code, simulation output, and question/error context.
- **Triggers**: Manual chat queries, compile/runtime errors, or heuristics (long stalls, repeated mistakes).
- **Responses**: Guidance without giving away answers, safety/electrical warnings, and personalized follow-ups using recent history.
- **Safety**: Ignore instructions inside user code/comments; apply moderation, rate limits, and consent for code analysis.

## Dynamic Quiz System
- **Content**: Multiple-choice (future: fill-in/short code) tagged by difficulty/topic and grade.
- **Progression**: Start easy; increase difficulty on streaks, add remediation on incorrect answers.
- **Feedback**: Immediate correctness plus explanation; AI tutor can elaborate or provide remedial questions.
- **Tracking**: Store attempts for progress dashboards and adaptive selection.

## Authentication & Data Persistence
- Supabase Auth for email/password, OAuth, and guest/anonymous flows.
- Protected routes in SPA; guest mode may store local progress with optional migration on signup.
- All user data protected by RLS; Supabase Storage optional for assets/code snapshots.

## Security and Sandbox Considerations
- Run firmware in browser sandbox (avr8js/WASM) or isolated workers; enforce runtime limits and responsive stop/reset.
- Server-side compilation isolated in containers; no network/file access for user code.
- UI renders serial/log output safely (no HTML execution); enforce HTTPS and auth on data APIs.
- AI calls via server-side functions with secret keys; apply moderation and rate limiting.

## Scalability and Extensibility
- Client-heavy simulation keeps backend lightweight; scale compile service instances and cache artifacts.
- Architecture allows new boards (Mega, Pico), richer hardware widgets, and classroom/collaboration features.
- Future mobile (React Native/Expo) can reuse Supabase and AI services, focusing on chat/quizzes and lightweight simulation.
