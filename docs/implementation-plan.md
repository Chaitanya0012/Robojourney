# Implementation Plan: Simulator, AI Navigation, and Quiz Redesign

This document outlines a roadmap for turning the simulator into a true execution environment, introducing a context-aware AI navigation/tutor layer, and redesigning quizzes for scaffolded robotics learning.

## 1. Simulator Debugging Redesign

### Goals
- Compile and execute user code (Arduino Uno/Nano/ESP32) on demand and surface compile/runtime errors immediately.
- Drive DOM visuals from simulated hardware state instead of prerecorded animations.
- Provide transparent feedback when code produces no observable output.

### Architecture
- **Compilation service:** Backend endpoint (Node/TypeScript) invokes Arduino CLI/`avr-gcc` (and later ESP32 toolchains) inside a sandbox or container. It returns compiled firmware (`.hex`/binary) or structured error payloads.
- **Simulation engine:** Use AVR8js for AVR boards; encapsulate simulation in a web worker and expose pin state, timers, and UART streams via a typed message protocol.
- **UI bridge:** Map simulated pins to visual components (e.g., LEDs, servos, serial monitor) and refresh UI at a fixed tick rate (e.g., `requestAnimationFrame`).
- **Error channel:** Display compiler diagnostics inline in the Monaco editor and in a dedicated error console.

### Delivery Steps
1. **Backend compile pipeline**
   - Add a compile endpoint that accepts board type + source and shells out to Arduino CLI (with caching by code hash).
   - Normalize compiler stderr/stdout into a structured response with line numbers for editor annotations.
2. **AVR simulation loop**
   - Initialize AVR8js CPU with firmware bytes; attach timers for `millis()/delay()` and a UART buffer for serial output.
   - Run stepping loop in a worker, throttled to real time; support pause/reset.
3. **I/O bindings and DOM updates**
   - Observe MCU register writes (e.g., PORTB) to emit pin-change messages.
   - Update visual components (e.g., toggle LED classes, animate servo angle) on each tick; expose serial monitor stream.
4. **Error surfacing and debugging aids**
   - Pipe compile errors to Monaco markers and an error pane.
   - Add simulation warnings for likely logic issues (e.g., tight loops without delay) and an optional step-through mode.
5. **ESP32 strategy**
   - Start with limited MicroPython/JS or server-side emulation; plan WebAssembly-based emulator for parity once feasible.

## 2. AI Navigation Tool and Context-Aware Tutor

### Objectives
- Generate tailored learning journeys from user goals and platform content.
- Provide proactive, context-aware tutoring tied to the IDE, simulator, and quizzes.

### Navigation/Planner
- Parse user intents via OpenAI SDK (GPT-4/Codex) and map to board/components/topics.
- Retrieve tagged resources/quizzes from the knowledge base; compose Markdown plans with steps, resources, pitfalls, and best practices.
- Present plans in the UI with links to start suggested quizzes or open reference articles.

### Tutor Integration
- Subscribe to IDE/simulator/quizzes via an event bus (e.g., React context/RxJS) to capture edits, compiles, runs, and quiz outcomes.
- Build prompts from live context: code snippets, board selection, recent errors, and mistake history.
- Combine rule-based detectors (e.g., missing `pinMode`, absent `Serial.begin`) with AI responses for fast, precise hints.
- Maintain a per-user mistake log (local + backend) to avoid repeating tips and to power a “Mistakes Dashboard.”
- Respect privacy: ask for consent, scope access to the user workspace, and scrub PII before API calls.

### Interaction Patterns
- Inline explanations for compiler errors, with code highlights.
- Proactive nudges after repeated failures or long idle times with a failing build.
- Tutor outputs can carry UI action tokens (e.g., highlight a line, open resource) parsed by the frontend.
- Rate-limit AI calls and cache repeat explanations to control latency and cost.

## 3. Quiz Section Redesign

### Principles
- Scaffold difficulty (basic → applied → challenge) for grades 6–11.
- Keep quizzes aligned with robotics tasks (sensors, circuits, debugging, code authoring).
- Integrate quizzes with navigation plans and tutor recommendations.

### Content Model
- Store questions in structured data (id, text, options, correct answer, explanation, difficulty, topics/tags).
- Tag questions by topic and difficulty to support dynamic selection by the AI navigator/tutor.
- Provide explanations after answers and link back to relevant resources.

### UX and Flow
- Show progress indicators and visual aids (circuit images, code snippets) where helpful.
- Offer immediate feedback, streak/badge gamification, and a summary by difficulty band.
- Allow quizzes to open inline (side panel/modal) without losing workspace context.

### Adaptivity
- Escalate to harder items when basics are mastered; inject remedial items and hints when users struggle.
- Let the tutor evaluate open-ended/code answers using rubric-guided AI scoring and surface actionable feedback.

## 4. Milestones
- **M1:** Backend compile API + AVR8js runner with LED/serial visualization.
- **M2:** Editor error surfacing, simulation pause/reset, and logic warnings.
- **M3:** AI navigation journeys wired to content/quizzes; tutor event bus + rule-based hints.
- **M4:** Mistake dashboard + adaptive quiz recommendations and scoring.
- **M5:** ESP32 emulation path exploration and rollout.
