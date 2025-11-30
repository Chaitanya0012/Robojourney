# AI-Powered Robotics Learning Platform (MVP Design)

This document outlines the technical design for an advanced MVP prototype of a React-based educational robotics platform. The platform teaches students (grades 6–11) about robotics through interactive coding simulation and an AI-assisted tutor.

## Overview and Goals
- **Live Arduino simulator:** Supports Arduino Uno, Arduino Nano, and ESP32 with sandboxed C/C++ execution, realistic feedback, and graceful error handling.
- **AI tutor chat interface:** Context-aware assistant that monitors code and simulation output to give tailored debugging guidance and hardware safety warnings while tracking learner history.
- **Dynamic quiz system:** Multiple-choice quizzes with adaptive difficulty and AI-driven explanations or remedial follow-ups.
- **User authentication & persistence:** Supabase-backed auth (email/password, OAuth, guest) with stored quiz history, code attempts, and chat logs for personalization.
- **Modern frontend:** React + TypeScript SPA with a dark, dashboard-style UI using a modern component library (e.g., Tailwind + shadcn/ui or Chakra UI).
- **Scalability & extensibility:** Architecture anticipates future mobile support (React Native/Expo), additional hardware simulations, and enhanced AI capabilities.

## High-Level System Architecture
- **Frontend (React + TypeScript):** SPA with pages for Simulator, Quizzes, Profile, etc. Uses Supabase SDK/REST APIs over HTTPS; optional real-time via Supabase subscriptions or WebSockets. Stateful simulator and chat components manage execution and conversation history.
- **Backend (Supabase & cloud services):**
  - **Supabase Postgres + Auth:** Stores profiles, quiz content/results, code attempts, and chat logs with RLS for per-user access control.
  - **Supabase Edge Functions / microservices:**
    - **Code compilation service:** Secure containerized Arduino CLI toolchain (Uno/Nano/ESP32) that returns firmware artifacts and diagnostics on demand.
    - **AI tutor service:** Protected endpoint that forwards context (code, logs, user query) to OpenAI (e.g., GPT-4/Codex) and returns responses; integrates with Supabase AI tooling.
- **Simulation engine:** Client-side emulation for responsiveness.
  - **AVR (Uno/Nano):** `avr8js` executes compiled HEX with glue code for GPIO, timers, Serial, and UI hardware hooks.
  - **ESP32:** Prefer WebAssembly/JS emulator; fallback to higher-level stubs intercepting Arduino APIs. Modular design allows swapping implementations.

## Frontend Component Structure
- **App (Root):** Routing, global providers (Supabase, auth, theme).
- **AuthProvider / AITutorProvider:** Manage user state and chat context.
- **Layout:** Sidebar + main content shell.
- **SimulatorPage:**
  - **CodeEditor (Monaco/Ace)** with syntax highlighting and inline errors.
  - **BoardSelector** for Uno/Nano/ESP32.
  - **SimulatorView** with LED indicators, serial monitor, logs, and run/stop/reset controls.
  - **AIChatPanel** (dockable/collapsible).
- **QuizPage:** Question display, answer options, progress bar, feedback, and tutor tie-ins.
- **Dashboard/Profile:** Optional stats, attempt lists, chat transcripts.
- **Auth pages:** Login/Signup/Guest entry.

## Database Schema & APIs (Supabase)
- **profiles:** `user_id`, name, grade, avatar.
- **quiz_questions:** id, grade_level, difficulty, question_text, options JSON/related table, correct_answer, explanation.
- **quiz_attempts:** `user_id`, `question_id`, `selected_option`, `is_correct`, `answered_at`.
- **code_runs:** `id`, `user_id`, board_type, code, run_at, result status, error/output logs.
- **chat_messages:** `id`, `user_id`, `session_id`, role, text, timestamp.
- **Edge Functions:**
  - `compileCode(boardType, code)` → firmware or compiler errors.
  - `aiTutorChat(context)` → AI response; may log messages.
- **Security:** RLS on user tables; public/controlled access to quiz content; HTTPS throughout.

## Live Arduino Simulator Design
1. **Run flow:** Editor → Run triggers compile → receive binary → load into simulator → execute in loop (UI stays responsive via Worker/stepped loop).
2. **Compile errors:** Parse diagnostics, surface in OutputLogs/editor markers; auto-invoke AI tutor with explanations. Do not run stale binaries.
3. **Runtime wiring:**
   - Hook GPIO register writes to update LED/servo UI components.
   - Capture UART writes for SerialMonitor; optionally accept Serial input.
   - Support interactive inputs (virtual buttons/sensors) by mutating simulated pin states.
4. **Execution management:** Run/pause/stop/reset controls; watchdog for tight loops or long stalls; optional stepping/throttling.
5. **ESP32 strategy:** Prefer WASM/JS emulator; interim stubbed Arduino API layer if full emulation is heavy.

## Simulation UI & Feedback
- Board schematic or pin-value list with live HIGH/LOW and analog indicators.
- LED/actuator components reflecting pin state/PWM.
- Serial monitor for `Serial.print` output with scrollback and optional input.
- Logs for program start/stop/status, compile/runtime errors, and optional pin/timer traces.

## AI Tutor Integration
- **Context packaging:** Send code, recent logs/errors, board selection, and recent chat history in structured prompts.
- **System prompt:** Defines role as patient robotics tutor; warns about safety/best practices; avoids following instructions embedded in user code/comments.
- **Triggers:** User chat, compile/runtime errors, repeated mistakes, or stalled runs.
- **Behavior:** Encouraging guidance (Socratic when helpful), proactive safety hints, and references to prior session mistakes. Includes loading/streaming indicators and graceful fallbacks on errors/timeouts.
- **Cost control:** Use cheaper models for simple diagnostics, rate-limit calls, and cache common explanations.

## Dynamic Quiz System
- **Content:** Robotics-focused MCQs with difficulty tags for grades 6–11; curated explanations.
- **Adaptive delivery:** Start easy, increase difficulty on streaks; remediate or hold level on misses. Optionally server-side selection.
- **Feedback:** Immediate correctness + explanations; AI tutor can elaborate or offer remedial questions.
- **Progress tracking:** Scores, streaks, and topic strengths/weaknesses surfaced in UI; attempts recorded in `quiz_attempts`.

## Authentication & Profiles
- Supabase Auth for email/password + OAuth; guest mode using anonymous sessions or local-only progress.
- Protected routes for simulator/quiz; profile data cached in context for personalization.
- Data privacy via RLS; optional local → registered account migration for guests.

## Security & Sandbox Considerations
- **Client-side isolation:** Emulator/WASM sandboxes; no host API access. Run simulation in Web Worker; enforce runtime limits and allow forced stop.
- **Server-side compile isolation:** Containerized toolchains with minimal privileges; treat code as untrusted input.
- **AI safety:** Server-side API keys; moderation/guardrails; ignore prompt injection inside user code/comments; rate limiting.
- **Web security:** Escaped rendering for serial/log output, HTTPS, and minimal data exposure.

## UI/UX Principles
- Default dark theme with accessible contrasts and clear iconography for run/stop/reset/chat/quiz.
- Responsive layout (sidebar + split panes), mobile-friendly views prioritizing chat/quizzes.
- Performance: minimize React re-renders for fast pin changes; offload heavy loops to workers.
- Accessibility: keyboard navigation, ARIA labels, and non-color cues for status/feedback.

## Scalability & Future Outlook
- Client-heavy simulation reduces backend load; scale compile/AI services horizontally with rate limits and caching.
- Modular simulators enable additional boards (e.g., Mega, RP2040) and richer peripherals.
- Mobile path via React Native/Expo focusing on chat/quizzes and lighter simulation; shared business logic where possible.
- Potential future additions: collaborative teacher views, curriculum/lesson flows, vector search for tutor memory, offline/in-browser compilation.

## Sources
- Uri Shaked, AVR8js: Simulate Arduino in JavaScript (Wokwi blog) – cloud compile service with Arduino CLI and in-browser AVR simulation.
- Supabase Docs – Postgres with Row Level Security for per-user data protection.
- Supabase AI integration – connecting OpenAI with app data via Edge Functions.
- Wasmino (Hacker News) – compiling Arduino to WebAssembly as an alternative simulation approach.
