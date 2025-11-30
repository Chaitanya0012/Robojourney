# Implementation Plan: Simulator, AI Navigation, and Quiz Redesign

## 1. Simulator Debugging Redesign
### Goals
- Execute user Arduino Uno/Nano/ESP32 code in real time and surface compile/runtime errors instead of pre-rendered animations.
- Reflect true hardware state in the DOM (LEDs, sensors, servos, serial output) based on program behavior.
- Provide immediate, meaningful feedback for compilation and runtime issues.

### Approach
1. **Microcontroller emulation**
   - Integrate **AVR8js** in the frontend to emulate ATmega328p for Arduino Uno/Nano.
   - For ESP32, start with a limited mode (e.g., MicroPython or logic sandbox) while evaluating a WebAssembly-based emulator similar to Wokwi’s approach.

2. **On-the-fly compilation service**
   - Build a TypeScript/Node API that accepts Arduino sketches and compiles them via Arduino CLI or `avr-gcc` in a sandbox/Docker container.
   - Cache identical submissions to speed up iteration and return `.hex`/binary plus parsed compiler diagnostics on failure.

3. **Simulation loop and timing**
   - Load compiled binaries into AVR8js CPU instances, initialize timers (millis/delay), and tick the CPU on `requestAnimationFrame`/`setInterval` to keep UI responsive.
   - Run simulations in a Web Worker when possible; expose pause/resume/step controls.

4. **Hardware/DOM bridging**
   - Map MCU registers (e.g., `PORTB`) to visual components and update DOM elements or Wokwi web components in sync with pin state changes.
   - Translate PWM/serial events to servo angles, LED brightness, or console output refreshed at 30–60 FPS.

5. **Error handling and debugging UX**
   - Surface compile errors directly beneath the editor; add Monaco markers/squiggles on offending lines.
   - Detect likely infinite loops or stalled simulations and warn/throttle; offer step-through or breakpoints for debugging.
   - Capture simulator logs (pin toggles, serial writes) for an in-app console and AI tutor context.

## 2. AI Navigation Tool and Context-Aware Tutor
### Goals
- Generate structured learning journeys from user goals and platform content.
- Deliver context-aware, proactive guidance tied to the user’s code, board selection, and simulator events.

### Approach
1. **Tailored learning journeys**
   - Use OpenAI (via Node/TypeScript SDK) with retrieval over tagged content to draft Markdown plans: overview, ordered steps, resources, pitfalls, best practices, and quiz checkpoints.
   - Provide clear formatting (headings, numbered steps, resource links, quiz recommendations) for direct rendering.

2. **Workspace-aware tutor**
   - Subscribe to IDE/simulator/quiz events through an event bus or state store (e.g., Redux/RxJS) to trigger help on compile errors, simulation runs, or user prompts.
   - Gather context (code snippets, board/config, recent errors, interaction history) and feed concise prompts to GPT-4; mix rule-based detectors for common mistakes (missing `pinMode`, `Serial.begin`, etc.).
   - Maintain a “mistakes log” per user for personalized reminders and review dashboards; respect privacy/consent and per-user scoping.

3. **UI hooks and rate limits**
   - Enable the tutor to highlight code lines, open references, or insert snippets via structured responses (tokens/JSON) interpreted by the frontend.
   - Throttle AI calls, cache repeated explanations, and allow opt-in/out of proactive tips.

## 3. Quiz Section Redesign
### Goals
- Deliver scaffolded quizzes (basic → applied → challenge) aligned to robotics projects for grades 6–11.
- Integrate quizzes with AI navigation and tutor for recommendations and adaptive feedback.

### Approach
1. **Question bank and tagging**
   - Store questions in structured data with fields for options, correct answers, explanations, difficulty, grade level, and topic tags (e.g., sensors, debugging, ESP32).
   - Use tags for retrieval by the navigation tool and tutor suggestions.

2. **Scaffolded delivery and adaptivity**
   - Sequence questions by rising difficulty within quizzes; adjust flow based on performance (accelerate on success, provide hints/review on struggles).
   - Offer mixed formats: multiple choice and short code/open-ended responses, with auto-grading where possible and AI-evaluated feedback for free-form answers.

3. **UX and feedback**
   - Show progress indicators and visual aids (circuits/code snippets) where relevant.
   - Provide immediate explanations after each question and summary breakdowns (basic/applied/challenge scores) with links to remedial resources.
   - Gamify with badges/streaks and allow quizzes to appear inline with project milestones suggested by the navigation tool or tutor.

## 4. Security and Operational Considerations
- Secure compilation/emulation sandboxes; scrub PII from prompts and use HTTPS for API calls.
- Respect per-user isolation for tutor context and data; allow opting out of mistake history.
- Monitor performance and costs: cache compile results, throttle AI usage, and log simulator/tutor events for observability.
