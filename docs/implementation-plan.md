# Implementation Plan: Simulator, AI Navigation, and Quiz Redesign

## 1. Simulator Debugging Redesign

### Objectives
- Run learner code on Arduino Uno/Nano and ESP32 in real time instead of replaying static animations.
- Reflect actual hardware state in the UI (LEDs, servos, serial output) based on executed code.
- Surface compilation/runtime errors immediately with clear, line-specific feedback.

### Architecture
- **Compilation pipeline**: Provide an API that accepts Arduino sketches, compiles them with Arduino CLI/`avr-gcc` (Uno/Nano) and the Espressif toolchain (ESP32), and returns firmware artifacts (`.hex`/binary) plus compiler diagnostics.
- **Simulation engine**: Use an MCU emulator to execute compiled binaries. For Uno/Nano, integrate `avr8js` to emulate the ATmega328p CPU, timers, and memory. For ESP32, start with a limited simulation surface (e.g., MicroPython/JS interpretation or server-side emulation via QEMU/WebAssembly) and expand to full firmware execution later.
- **Execution loop**: Step the CPU in a cooperative loop (e.g., `requestAnimationFrame`/`setInterval`) or offload to a Web Worker so the UI stays responsive while code runs.

### Hardware and UI Wiring
- **I/O hooks**: Map MCU port/register writes to virtual hardware. Attach hooks to GPIO registers (e.g., `PORTB` for Uno/Nano) to drive DOM updates for LEDs, servos, and other components.
- **Visual components**: Render hardware with interactive web components/SVG (e.g., Wokwi elements). Update attributes/state each simulation tick to reflect pin values, PWM duty cycles, or UART output.
- **Serial/console**: Capture UART writes and stream them to an on-screen serial monitor for live feedback.

### Error Handling and Debuggability
- **Compile errors**: Parse compiler output and display annotated diagnostics in the code editor (e.g., Monaco markers with squiggles and tooltips). Do not run outdated binaries when compilation fails.
- **Runtime safeguards**: Provide pause/resume and step-through modes. Detect tight loops (e.g., missing `delay`) and throttle or warn the user when the simulation stalls.
- **State inspection**: Expose optional logging of pin transitions, timer ticks, and serial events to help learners understand board behavior.

## 2. AI Navigation Tool and Context-Aware Tutor

### Tailored Learning Journeys
- Accept a user goal (e.g., "build an ESP32 robot arm") and generate a structured Markdown plan with steps, references, pitfalls, and best practices.
- Use the OpenAI Node/TypeScript SDK (optionally with LangChain retrieval) to combine user intent with tagged learning resources from the content database.
- Attach quiz recommendations to relevant steps to reinforce concepts at milestones.

### Workspace-Aware Tutor
- **Event ingestion**: Subscribe to IDE, compiler, simulator, and quiz events via a shared event bus/state manager to keep the tutor synchronized with user actions.
- **Context assembly**: Package current code snippets, board selection, recent errors, and interaction history into AI prompts so responses directly reference the learner’s situation.
- **Help delivery**: Mix rule-based detectors for common mistakes (e.g., missing `pinMode`, absent `Serial.begin`) with AI-generated explanations. Allow proactive nudges after repeated errors or long stalls.
- **Memory and personalization**: Maintain a mistake log per user (local or persisted) to avoid redundant advice and to surface trends. Offer a “mistakes dashboard” for review.
- **Privacy and rate limits**: Request consent for code analysis, scope tutor access to the active workspace, scrub sensitive data before API calls, and throttle/cache AI requests to control cost.

### UI Integration
- Provide a chat-style tutor panel that can highlight code lines, open referenced articles, or trigger template inserts based on AI outputs (e.g., structured JSON/tool calls from the model).

## 3. Quiz Section Redesign

### Pedagogical Structure
- Target grades 6–11 with scaffolded difficulty: **Basic** (recall), **Applied** (scenario-based), **Challenge** (open-ended/debugging).
- Cover robotics-focused topics (Arduino, sensors, circuits, debugging) with graded difficulty labels for adaptive delivery.

### Content Management
- Store quizzes in a structured, tagged format (id, text, options, correct answer, explanation, difficulty, topics). Support multiple-choice, fill-in-the-blank, and short code answers.
- Link questions to project topics so the navigation tool and tutor can recommend contextual quizzes.

### Adaptive Experience
- Adjust progression based on performance: accelerate for high scores, insert remediation or hints for struggles. Use the simulator/AI to validate open-ended or code answers when feasible.
- Provide immediate feedback and explanations after each question, plus end-of-quiz summaries with suggested resources.

### UI/UX
- Present quizzes with clear progress indicators, optional visuals (circuit/code snippets), and lightweight gamification (streaks, badges). Integrate launch points from the project workspace so quizzes feel like part of the learning flow.
