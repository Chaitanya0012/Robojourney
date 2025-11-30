# Implementation Plan: Simulator, AI Navigation, and Quiz Redesign

## Goals
- Replace the placeholder simulator with a real code execution pipeline that mirrors Arduino Uno/Nano and ESP32 behavior.
- Deliver an AI navigation tool that generates personalized learning journeys grounded in platform content.
- Embed a context-aware AI tutor that reacts to user actions and past mistakes.
- Redesign quizzes with scaffolded difficulty, adaptive feedback, and tight integration with the tutor.

## 1. Simulator Debugging Redesign
### Current Gap
The simulator presents canned output instead of executing user code, so errors and logic issues never surface.

### Target Experience
- **Real-time compilation & execution** of Arduino C/C++ sketches for Uno/Nano (AVR) and phased support for ESP32.
- **Accurate hardware emulation** for GPIO, timers, serial, and common peripherals.
- **Live DOM updates** that mirror pin states, peripheral data, and serial output.
- **Immediate error feedback** for compile-time and runtime issues.

### Architecture
- **Frontend**: React + TypeScript UI with Monaco editor, run/pause/reset controls, serial monitor, and visual hardware widgets.
- **Simulation engine**: AVR8js in a Web Worker for Uno/Nano; placeholder high-level ESP32 mode with roadmap to WebAssembly emulator.
- **Compilation service**: Node/Express endpoint wrapping Arduino CLI (avr-gcc/xtensa-esp32) in a sandbox or container; returns HEX/ELF or structured errors.
- **State bridge**: PostMessage channel between UI and worker to stream execution state, pin writes, serial bytes, and errors.

### Incremental Delivery
1. **Groundwork (Week 1)**
   - Add worker wrapper for AVR8js with CPU, flash loading, timers, and interrupt loop stepping via `requestAnimationFrame`.
   - Define message protocol: `compile-request`, `compile-result`, `run`, `pause`, `pin-update`, `serial-data`, `error`.
2. **Compilation pipeline (Week 1-2)**
   - Implement backend compile route using Arduino CLI; cache by code hash and board target; return HEX or diagnostics.
   - Parse errors to Monaco markers and error panel.
3. **Hardware hooks (Week 2)**
   - Map PORT/DDR registers to virtual pins; emit pin-state diffs to UI; update LED/servo widgets every frame.
   - Capture UART writes for serial monitor; throttle updates for performance.
4. **Runtime controls (Week 2-3)**
   - Run/pause/reset commands; execution budget per frame to avoid UI jank; watchdog for infinite loops with user warning.
   - Export sketch button uses latest source; log compilation + run events for analytics.
5. **ESP32 path (Week 3+)**
   - Start with high-level interpreted mock (e.g., constrained JS/TypeScript templates) to reflect logic in UI.
   - Plan WebAssembly-based ESP32 emulator (e.g., QEMU build) behind feature flag; reuse compile service with xtensa toolchain.

### UI Enhancements
- Live LED, PWM/servo, and sensor widgets driven by pin updates.
- Serial monitor with timestamped entries and clear button.
- Error drawer highlighting lines and suggested fixes.

## 2. AI Navigation Tool (Learning Journey Builder)
### Objectives
- Turn user intents (e.g., "ESP32 robot arm") into structured project roadmaps with steps, resources, and checkpoints.
- Ground responses in platform content and quizzes.

### Workflow
1. **Intent parsing**: Send user prompt plus platform taxonomy to OpenAI (GPT-4o) via server SDK; extract board, components, skills.
2. **Content retrieval**: Query tagged content/quiz index (simple search now; embeddings later) for articles, schematics, and quizzes.
3. **Plan synthesis**: Prompt model with retrieved snippets to generate Markdown journey: overview, numbered steps with links, best practices, pitfalls, and quiz recommendations.
4. **Delivery**: Render Markdown in UI; allow saving to user profile; expose "start step" actions that open relevant articles or templates.

### Engineering Tasks
- Define content/quiz metadata schema (topics, grade level, format).
- Create journey generation endpoint with caching and rate limiting.
- UI component for "Navigation" panel with prompt input, generated plan display, and save/share actions.

## 3. Context-Aware AI Tutor
### Objectives
- Provide proactive, specific help based on code, compile output, simulator state, and quiz history.
- Maintain a mistake log to personalize guidance and avoid repetition.

### Event & Context Model
- Event bus (e.g., Zustand/RxJS) publishes: code edits, compile results, simulator run events, quiz attempts.
- Context builder assembles recent code, active board, last errors, and mistake history for tutor prompts.

### Response Strategy
- **Rule-based hints** for common issues (missing `pinMode`, no `Serial.begin`, tight loops without delay).
- **AI explanations** via GPT-4o when rule coverage is insufficient; prompts include code snippets and recent events.
- **UI actions** embedded in responses (e.g., highlight line, open article, suggest quiz) via structured metadata.

### Data & Privacy
- Per-user mistake log (local storage + backend sync) with timestamp, issue, hint, and resolution status.
- Consent dialog for code analysis; scoped data access per user session; HTTPS for API calls; throttling and caching to control costs.

## 4. Quiz Section Redesign
### Principles
- Scaffolded difficulty (basic → applied → challenge) aimed at grades 6–11.
- Robotics-focused scenarios tied to current projects.
- Immediate feedback with explanations and tutor follow-up.

### Content Model
- Question bank schema: `id`, `text`, `options`, `answer`, `explanation`, `difficulty`, `topics[]`, `gradeRange`, `type` (MCQ, short, code).
- Tags align with navigation/tutor topics to enable recommendations.

### Experience Flow
1. Display level and progress ("Q2 of 5 – Applied").
2. Auto-grade MCQ; for code/open responses, use lightweight checks or AI rubric scoring with human-review fallbacks.
3. Show explanations after each question; offer "ask tutor" for deeper help.
4. Adaptation: accelerate to challenge if basics are strong; inject remediation if errors repeat.

### Engineering Tasks
- Build quiz player UI (panel/modal) with keyboard navigation and progress bar.
- Implement scoring + feedback pipeline; log results to mistake history.
- Tutor hooks to recommend quizzes when gaps are detected and to explain misses.

## 5. Milestones & Deliverables
- **M1 (Week 1-2)**: AVR worker scaffold, compile API (Uno/Nano), Monaco error surfacing, basic LED/serial UI wiring.
- **M2 (Week 2-3)**: Full AVR simulation loop, run/pause/reset, pin-driven DOM updates, watchdog, improved serial monitor.
- **M3 (Week 3-4)**: AI navigation endpoint + UI, content metadata schema, saved journeys.
- **M4 (Week 4-5)**: Tutor event bus, rule-based hints, AI-backed explanations with consent + mistake log.
- **M5 (Week 5-6)**: Quiz player revamp, scaffolded bank schema, tutor-linked feedback, initial adaptive logic.
- **M6 (6+)**: ESP32 WebAssembly emulator proof-of-concept and integration behind feature flag.
