-- Replace robotics articles with 10 foundations-friendly lessons
DELETE FROM robotics_articles;

INSERT INTO robotics_articles (title, content, category, difficulty_level, order_index) VALUES
('What Is a Robot?', $$# What Is a Robot?

**Big idea:** A robot is a machine that keeps repeating a simple loop: **Sense → Think → Act**. Sensors feed data, the microcontroller decides, and motors/actuators move.

## Key points (6th grader friendly)
- Robots are built to help with dangerous, boring, repetitive, or super-precise tasks.
- Robots do **not** understand meaning yet—they follow rules.
- If any part of the loop breaks, the robot behaves strangely.

## Quick checklist
- Does the robot have a way to sense (distance, light, touch)?
- Is there a brain (microcontroller) running code?
- Are there muscles (motors/servos) to act?

## Mini scenario
An automatic door senses motion, thinks “person detected,” then acts by opening.

## Quiz sparks
1) Which part of a robot reads the outside world?
2) What are the three steps every robot repeats?$$, 'Foundations', 'Easy', 1),
('How Robots Read the World: Sensors', $$# How Robots Read the World: Sensors

**Big idea:** Sensors turn the real world into numbers a robot can understand.

## Core sensor types
- **Ultrasonic:** measures distance using sound echoes.
- **Infrared (IR) reflectance:** detects lines or nearby objects.
- **Light sensors (LDR):** changes value with brightness.
- **Touch/bumper:** simple on/off.

## How sensors behave
- They only give **numbers**, not feelings.
- Placement matters: sunlight can confuse IR; soft cloth absorbs ultrasound.

## Troubleshooting
- Stuck values: check wiring and power.
- Noisy readings: take several samples and average.
- False triggers: add thresholds or debounce buttons.

## Quiz sparks
1) Why can sunlight confuse an IR line sensor?
2) What quick trick smooths noisy sensor data?$$, 'Foundations', 'Easy', 2),
('Motors & Movement: How Robots Move Their Bodies', $$# Motors & Movement: How Robots Move Their Bodies

**Big idea:** Motors are robot muscles that turn electrical energy into movement.

## Motor types
- **DC motor:** fast and simple for wheels; angle control is rough.
- **Servo motor:** turns to exact angles—great for arms and grippers.
- **Stepper motor:** moves in tiny steps—great for precise turns.

## Torque vs speed
- **Torque = strength** (pushing power)
- **Speed = how fast it spins**
- High torque lifts; high speed races. You rarely get both at once.

## Why motors fail
- Low battery or wrong voltage
- Overload or jam
- Miswired driver

## Quick fix routine
1) Check battery and wiring.
2) Reduce load or adjust gear ratio.
3) Test with simple code.

## Quiz sparks
1) Which motor should you pick for a precise arm joint?
2) What happens if you gear a motor for more torque?$$, 'Hardware', 'Easy', 3),
('Microcontrollers: The Robot Brain', $$# Microcontrollers: The Robot Brain

**Big idea:** A microcontroller follows logic like “if distance < 10 cm → stop; else → move.” It understands numbers, not English.

## Popular beginner boards
- **Arduino Uno / Nano:** friendly starters
- **ESP32:** adds Wi-Fi + Bluetooth

## Common crash causes
- Wrong pins or wiring
- Wrong variable types
- Infinite loops or blocking delays
- Low power

## Debugging habit
Test one small part at a time, use serial prints, and keep wires stable.

## Quiz sparks
1) Why does `delay(5000)` make a robot feel sleepy?
2) Name two reasons a microcontroller might reset.$$, 'Computing', 'Easy', 4),
('Powering Robots: Batteries & Power Systems', $$# Powering Robots: Batteries & Power Systems

**Big idea:** Power is the robot's fuel. The right voltage and current keep everything steady.

## Battery basics
- **AA batteries:** cheap but weak.
- **Li-ion:** strong and rechargeable.
- **LiPo:** very strong for drones—handle carefully.

## Voltage vs current
- **Voltage = pressure**
- **Current = flow**
Too high voltage burns parts; too low stalls motors.

## Safety rules
- Never short or puncture batteries.
- Match voltage to components.
- Connect all grounds together.

## Quick checks
1) Measure voltage with and without load.
2) Feel for hot wires or connectors (bad sign!).

## Quiz sparks
1) Why does a motor slow when the battery sags?
2) What safety rule protects you when using LiPo packs?$$, 'Hardware', 'Easy', 5),
('Robot Chassis, Wheels & Gears', $$# Robot Chassis, Wheels & Gears

**Big idea:** The chassis is the robot body; wheels and gears decide how it moves.

## Wheels & traction
- **Standard wheels:** simple forward/back.
- **Omni wheels:** slide sideways.
- **Tracks:** tank-style grip on rough ground.

## Gears trade speed and strength
- Bigger gear ratio → more torque, less speed.
- Smaller gear ratio → more speed, less torque.

## Why robots drift
- Motors spin at slightly different speeds.
- Uneven weight or wheel alignment.
- Floor friction changes.

## Mini fix ideas
- Balance weight; tighten wheels.
- Use better traction tires.
- Add simple code to nudge speeds (later, PID helps!).

## Quiz sparks
1) Why do tank tracks grip better on dirt?
2) What does a higher gear ratio usually give you?$$, 'Mechanics', 'Easy', 6),
('Basic Coding for Robotics', $$# Basic Coding for Robotics

**Big idea:** Hardware needs code to decide what to do.

## Building blocks
- **Variables:** boxes that store numbers.
- **If statements:** decisions.
- **Loops:** repeat actions.
- **Functions:** reusable mini-programs.

## Simple example
```
If light < 200 → turn LED ON
Else → turn LED OFF
```

## Good habits
- Test tiny pieces first.
- Comment important lines.
- Use clear names for sensors and motors.
- Secure wires before running code.

## Quiz sparks
1) Why are loops important in robot code?
2) How can comments help future you?$$, 'Programming', 'Easy', 7),
('Robot Thinking: Decision Making & Logic', $$# Robot Thinking: Decision Making & Logic

**Big idea:** Robots compare numbers and follow strict rules (TRUE/FALSE) to choose actions.

## Logic examples
- If obstacle detected → stop.
- If sound loud **and** light bright → turn toward it.

## Combining conditions
Use AND/OR to make smarter choices:
```
If distance < 10 and speed > 50 → slow down
```

## Tips
- Keep thresholds simple first.
- Log sensor values to set better limits.

## Quiz sparks
1) What does TRUE/FALSE mean to a robot?
2) Why combine conditions instead of one big “if distance < 10”?$$, 'Programming', 'Easy', 8),
('The Sense–Think–Act Loop', $$# The Sense–Think–Act Loop

**Big idea:** Every robot repeats: **Sense → Think → Act** many times per second.

## Example: Line-following robot
- **Sense:** IR sensors read line position.
- **Think:** decide to nudge left or right.
- **Act:** motors speed up or slow down to stay centered.

## Why robots act weird
- Sensor misreads
- Code bugs
- Motor jams or low battery

## Debug routine
1) Check sensors first.
2) Print values to see decisions.
3) Test motors with simple commands.

## Quiz sparks
1) What are the three steps in the loop?
2) Name two reasons the loop might break.$$, 'Foundations', 'Easy', 9),
('Real-World Robots: What They Can (and Cannot) Do Yet', $$# Real-World Robots: What They Can (and Cannot) Do Yet

**Big idea:** Robots are everywhere but still limited.

## Robots today
- Factory arms
- Delivery robots
- Hospital assistants
- Mars rovers
- Warehouse bots
- Drones

## What they still struggle with
- Understanding emotions or meaning
- Creative decisions
- Playing real sports with humans
- Working in chaotic spaces
- Folding clothes perfectly

## Why “yet” matters
AI + robotics are moving fast. You could help solve these limits.

## Future trends to watch
- Autonomous driving
- Medical and disaster robots
- Swarm robots
- AI-powered home helpers

## Quiz sparks
1) Name two jobs robots already handle.
2) Why is the word “yet” exciting in robotics?$$, 'Applications', 'Easy', 10);
