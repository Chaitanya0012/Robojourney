-- Create robotics_articles table for diagnostic tutor
CREATE TABLE IF NOT EXISTS robotics_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  difficulty_level text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE robotics_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view articles
CREATE POLICY "Anyone can view robotics articles"
  ON robotics_articles
  FOR SELECT
  USING (true);

-- Moderators can manage articles
CREATE POLICY "Moderators can insert robotics articles"
  ON robotics_articles
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can update robotics articles"
  ON robotics_articles
  FOR UPDATE
  USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can delete robotics articles"
  ON robotics_articles
  FOR DELETE
  USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_robotics_articles_updated_at
  BEFORE UPDATE ON robotics_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert 10 comprehensive robotics articles with hands-on content
INSERT INTO robotics_articles (title, content, category, difficulty_level, order_index) VALUES
('What Exactly Is a Robot? (Sense → Think → Act)', 
'**Short explanation (big idea)**
A robot is a machine that senses the world, thinks about what the sensors tell it, and acts on that information. The senses + brain + muscles must work together repeatedly to make the robot useful.

## 1) Breakdown — the three parts

* **Sense** — Sensors gather information, like distance, light, touch, temperature, or motion.
* **Think** — A microcontroller (tiny computer) reads the sensors and decides what to do using code.
* **Act** — Actuators (motors, servos, speakers, lights) do the physical job.

Robots run the three steps in a loop many times per second:

```
Read sensors → Decide → Act → Read sensors → Decide → Act → ...
```

## 2) Why it matters — simple examples

* **Vacuum robot:** senses dirt & walls → decides where to go → motors move wheels and vacuuming arm.
* **Line follower:** senses dark line → decides to turn left or right → motors change wheel speeds.
* **Automatic door:** senses person (motion sensor) → decides to open → actuator pushes door.

If any one part breaks, the robot stops doing the whole job.

## 3) Mental picture (diagram-in-words)

Imagine a loop of arrows:

```
[SENSORS] → [BRAIN / CODE] → [MOTORS/ACTUATORS] → (back to) [SENSORS]
```

Sensors feed the brain, brain sends signals, actuators move — sensors notice new situation and feed it back.

## 4) Mini experiment (2–10 min)

**Build a "reactive light"**
Materials: LED, resistor, LDR (light sensor), Arduino or simple microcontroller (or simulate).

1. Wire the LDR to an analog input (voltage divider).
2. Read value and if it''s dark, turn LED on; if light, turn LED off.
3. Cover LDR with your hand and see LED respond.

**What you learn:** sensing → thinking → acting in a tiny loop.

## 5) Common problems + how to check

* Robot moves but doesn''t sense: check sensor wiring and power.
* Robot senses but doesn''t act: check motor wiring & drivers.
* Robot acts randomly: check code timing (blocking delays) and sensor noise.

**Quick checklist**

* Is the sensor powered?
* Is the microcontroller running code (check built-in LED blink)?
* Is actuator powered by an appropriate supply?
* Are grounds connected?

## 6) Vocabulary

* **Sensor:** device that measures the world.
* **Microcontroller:** tiny computer on a board that runs the robot program.
* **Actuator:** device that makes motion (motor, servo).
* **Feedback loop:** repeating sense → think → act cycle.

## Quiz teaser

1. A robot that only follows the same path no matter what someone places on the floor lacks what?
2. Draw the sense → think → act loop with one example device in each box.',
'fundamentals', 'beginner', 1),

('Power Systems: Batteries, Voltage, Current & Practical Checks',
'**Short explanation (big idea)**
Power is the invisible "food" for robots. Voltage pushes electricity; current is how much flows. If power is weak or miswired, everything behaves badly.

## 1) Voltage vs Current (kid-friendly)

* **Voltage (V)** — like pressure that pushes water through a pipe.
* **Current (A)** — like the amount of water flowing through the pipe.
* **Capacity (mAh)** — how much water the tank holds (how long battery lasts).

A motor needs a certain voltage and a lot of current. If either is wrong, the motor slows or the robot resets.

## 2) Real-world examples

* **Low voltage:** robot starts slow, then dies.
* **Low current:** motor stalls under load.
* **Loose connector:** power cuts out when robot vibrates.

## 3) Diagram-in-words

Picture a battery with two outputs: + and −. Wires carry + to motor and microcontroller; the return goes to −. Everything needs a common ground to reference signals.

## 4) Mini experiment (safely)

**Measure battery under load**
Materials: battery pack, motor, multimeter.

1. Measure battery voltage with nothing connected.
2. Connect motor and run it; measure voltage while motor runs.
3. If the voltage drops a lot under load, the battery cannot supply current (internal resistance high).

**What you learn:** voltage sag and why batteries need the right current rating.

## 5) Common power problems & fixes

* **Battery dies quickly →** check mAh/spec and replace or charge.
* **Robot resets when motor runs →** add decoupling capacitors and separate power for motors.
* **Arduino works on USB but not battery →** wiring/polarity issue or dead battery.

**Checklist**

* Use right voltage for microcontroller.
* Use motor driver and separate supply for motors.
* Connect all grounds.
* Add small electrolytic and ceramic capacitors near power pins to smooth spikes.

## 6) Vocabulary

* **mAh:** milliamp hour, capacity of battery.
* **Voltage sag:** drop in voltage when a heavy load is applied.
* **Decoupling capacitor:** small device that smooths quick changes in voltage.

## Quiz teaser

1. What happens if the battery voltage drops while a motor runs?
2. How would you check if a battery is the cause of slow motors?',
'electronics', 'beginner', 2),

('Microcontrollers: Tiny Brains, Big Responsibility',
'**Short explanation (big idea)**
Microcontrollers are small computers designed to talk to sensors and actuators. They run a program (sketch) in a loop and have strict limits — memory, pins, and safe current.

## 1) What microcontrollers do (simple list)

* Read sensors (analog & digital).
* Run code (decision making).
* Send signals to actuators (PWM, digital writes).
* Communicate (serial, I2C, SPI).

## 2) Why they''re special (vs a laptop)

* Very small, cheap, low power.
* Built for hardware control (directly talk to sensors).
* But cannot supply large currents — need drivers.

## 3) Mental diagram

Think of the MCU as a kitchen: inputs (sensors) are ingredients, code is the recipe, outputs (motors) are the cooked meal. If the recipe blocks (delay()), the kitchen stops other tasks.

## 4) Mini experiment

**Blink + read**

1. Load a simple LED blink program.
2. Add a sensor read and print its value to serial while blinking.
3. Try adding `delay(1000)` and notice the serial becomes slow — learn how blocking works.

**What you learn:** the main loop should do many things quickly; long delays make responses slow.

## 5) Common mistakes & fixes

* **Wrong pin mode:** `pinMode(pin, OUTPUT)` missing → output pins don''t work.
* **Blocking code:** `delay()` inside main loop leads to unresponsive robot → use `millis()` for timing.
* **Overcurrent:** powering motors from MCU pins → use motor driver.
* **Floating inputs:** unconnected inputs read random values → use pull-ups/down.

**Checklist**

* Verify code uploaded (check onboard LED).
* Use correct types (`unsigned long` for time).
* Employ serial prints to debug values.

## 6) Vocabulary

* **PWM:** Pulse-width modulation, a way to simulate analog output.
* **Pull-up resistor:** internal/external resistor to keep input stable.
* **ISR:** interrupt service routine, short code run when a hardware event happens.

## Quiz teaser

1. Why does `delay(5000)` cause problems for robots?
2. How can you safely drive a motor if the microcontroller pin cannot supply current?',
'electronics', 'beginner', 3),

('Sensors: How Robots See, Hear, and Feel',
'**Short explanation (big idea)**
Sensors turn physical things into electrical signals. Each sensor type has strengths and limits; choosing and placing them carefully is key.

## 1) Common beginner sensors & how they work

* **Ultrasonic:** sends sound pulse → measures echo time → distance. Best for 2–400 cm approximate.
* **IR reflectance:** shines IR light and measures reflection; used for line following.
* **LDR (photoresistor):** resistance changes with light.
* **Push button / bumper:** simple on/off contact.
* **Temperature or accelerometer:** special sensors for more complex tasks.

## 2) Why sensor placement and environment matter

* Ultrasonic near soft cloth returns weak echo.
* IR sensors fail in bright sunlight because of ambient IR.
* LDR in a shadowed enclosure reads low values.

## 3) Diagram-in-words

Imagine an ultrasonic in front of a robot: a cone-shaped zone where it can sense; anything outside cone or too close might not be detected properly.

## 4) Mini experiment

**Test an ultrasonic**

1. Mount ultrasonic at front of a toy car.
2. Place a box 30 cm in front and record readings.
3. Replace with a cloth object — readings may be weak.
4. Try moving outdoors — noise may increase.

**What you learn:** sensors depend on environment.

## 5) Problems & diagnosis

* **Stuck value (0 or maxi):** wrong pins, wiring, or out-of-range.
* **Noisy values:** take multiple readings and average or use median filtering.
* **False triggers:** use thresholds, set minimum spacing, and add debounce.

**Checklist**

* Calibrate sensors at start-up.
* Shield IR sensors from sunlight if needed.
* Use pull-ups for switches.

## 6) Vocabulary

* **Echo time:** round-trip time sound takes to reflect back.
* **Calibration:** setting thresholds for your environment.
* **Debounce:** ignoring rapid repeated changes in switch state.

## Quiz teaser

1. Why does an IR line sensor behave differently in sunlight?
2. What simple method smooths noisy sensor data?',
'sensors', 'beginner', 4),

('Actuators: Motors, Servos, Steppers — The Robot''s Muscles',
'**Short explanation (big idea)**
Actuators take electrical signals and produce motion. Choosing the right actuator and powering it correctly is essential.

## 1) Actuator types for beginners

* **DC motor:** simple rotation — good for wheels. Needs motor driver.
* **Servo motor:** rotate to a specific angle (0–180° typically) — good for grippers. Controlled by PWM pulse width.
* **Stepper motor:** rotates in fixed steps — good for precise angle control (no feedback needed for some tasks).

## 2) Real examples

* **Line follower:** DC motors for wheels.
* **Robotic arm:** servos for joints.
* **3D printer/robotic turntable:** steppers for accuracy.

## 3) Diagram-in-words

Picture a wheel driven by a DC motor through a small gear. If the robot needs more force, a larger gear ratio lowers speed but increases torque.

## 4) Mini experiment

**Compare torque**

1. Use same DC motor with two gearboxes: 1:1 and 5:1.
2. Try to push the robot up a small ramp; the high-reduction gearbox climbs easier but is slower.

**What you learn:** trade-off between torque and speed.

## 5) Problems & fixes

* **Jittering servo:** usually low power or bad PWM signal. Use stable supply.
* **Motor stalls under load:** too little torque or gearing issue. Increase torque or reduce load.
* **Stepper misses steps:** accelerate too fast; lower step rate or increase current.

**Checklist**

* Use appropriate driver for motor type.
* Provide stable, sufficient power.
* Use encoders (optional) for closed-loop feedback if precision needed.

## 6) Vocabulary

* **Torque:** rotational force — how hard the motor pushes.
* **Gear reduction:** using gears to increase torque while reducing speed.
* **Stall current:** current drawn when motor cannot rotate.

## Quiz teaser

1. Why might a servo jitter when it is trying to hold position under load?
2. If you need accurate angular movement, which motor is a better first choice: DC, servo, or stepper?',
'actuators', 'intermediate', 5),

('Motor Drivers: How to Drive Motors Safely',
'**Short explanation (big idea)**
Motor drivers take low-power control signals and switch higher currents to motors. They''re essential because microcontrollers cannot safely drive motors directly.

## 1) What a driver does

* Receives logic signals from MCU (direction and speed).
* Supplies motor with higher current from battery.
* Can reverse polarity to change direction.
* Protects MCU from back-EMF (electrical spikes).

## 2) Small diagram-in-words

```
[MCU pin] → [Driver input ENA / IN1 / IN2] → [Driver power MOSFETs] → [Motor]
         ↘ common ground ↗
```

ENA often enables the motor channel; if not enabled the motor will not run.

## 3) Mini experiment

**Enable pin check**

1. Wire driver with motor but leave ENA unconnected (or LOW).
2. Confirm motor doesn''t spin.
3. Tie ENA HIGH (or PWM) and motor runs.

**What you learn:** enable pins must be correctly wired and PWM applied to them for speed control.

## 4) Common failure cases

* **No common ground:** signals aren''t referenced → driver behaves unpredictably.
* **Overheating driver:** motors draw more current than driver can handle → thermal shutdown.
* **Wrong wiring:** swapped IN1/IN2 cause wrong direction.

**Checklist**

* Connect driver ground to MCU ground.
* Ensure driver supply rated for motor current.
* Use flyback diodes or driver with built-in suppression.

## 5) Vocabulary

* **H-bridge:** circuit that allows reversing motor polarity.
* **Flyback diode:** protects against voltage spikes produced when motor switches off.
* **ENA / Enable pin:** turns channel on or off.

## Quiz teaser

1. Why will a motor not run if the driver''s enable pin is LOW?
2. What is the most important wiring you must check between MCU and driver?',
'electronics', 'intermediate', 6),

('Gears, Torque, Wheels & Mechanical Design',
'**Short explanation (big idea)**
Mechanical elements decide whether your robot will be fast, strong, stable, or clumsy. Good mechanical design balances these needs.

## 1) Speed vs torque (simple)

* **Speed**: how fast wheels spin.
* **Torque**: how much pushing force at the wheel.

Gearing trades speed for torque and vice versa.

## 2) Wheel size and traction

* Big wheels roll faster but need more torque.
* Small wheels give more torque at the ground.
* Traction depends on wheel material and surface; rubber gives grip, smooth plastic slips.

## 3) Chassis & center of gravity

* Low center of gravity = more stable.
* Wide wheelbase resists tipping.
* Stiff chassis prevents sensor misalignment and drivetrain stress.

## 4) Mini experiment

**Traction test**

1. Build two small test platforms: one with smooth wheels, one with rubbery wheels.
2. Push a small weight uphill and measure which travels farther before slipping.

**What you learn:** wheel choice matters for real terrains.

## 5) Common mechanical failures & fixes

* **Slipping wheels:** use grippier wheels or increase torque.
* **Broken gears:** inspect gear teeth and replace with stronger material.
* **Chassis flexing:** add cross-bracing or mount sensors on rigid plates.

**Checklist**

* Ensure wheels are secured; check set screws.
* Balance the robot (no heavy top-mounted cargo).
* Test on the real surface (carpet vs tile differ).

## 6) Vocabulary

* **Gear ratio:** ratio of teeth numbers between gears.
* **Center of gravity (CG):** point where weight is balanced.
* **Skid/slip:** wheel turns but robot does not move.

## Quiz teaser

1. Which will help a robot climb a ramp more easily: larger wheels or a lower gear ratio?
2. Name two mechanical changes to reduce tipping.',
'mechanics', 'intermediate', 7),

('Control Systems: From On/Off to PID (Simple & Intuitive)',
'**Short explanation (big idea)**
Control systems tell robots how to move smoothly. Simple on/off works for some tasks, but for smooth behavior we use proportional and PID controllers.

## 1) Control types (intuitive)

* **On/Off (bang-bang):** like a thermostat — heater either ON or OFF. Fast but can oscillate.
* **Proportional (P):** output changes in proportion to error (difference from target). Smoother.
* **PID (P + I + D):** P: proportional; I: removes steady offset; D: predicts and damps oscillations.

## 2) Example — line follower

* Bang-bang → robot zig-zags across line.
* P control → robot corrects amount based on how far from line.
* PID (advanced) → less wobble and accurate following.

## 3) Mini experiment (simulated)

**Tuning P**

1. Simulate (or code) a simple model: a robot tries to reach center of a line.
2. Start with small P gain; robot is slow to correct.
3. Increase P; robot corrects faster but may overshoot.
4. Add small D to reduce overshoot.

**What you learn:** tuning must balance reactivity and stability.

## 4) Common control mistakes & tips

* Too high P → oscillation.
* Too high I → accumulation → overshoot.
* No D → possible oscillation without damping.
* Sampling too slow → control acting on old data.

**Checklist**

* Sample sensors at an adequate rate.
* Test with low gains first.
* Log errors and responses to tune.

## 5) Vocabulary

* **Controller:** algorithm deciding output from sensor error.
* **Gain:** a multiplier for how strongly controller reacts.
* **Sampling rate:** how often you read sensors and compute control.

## Quiz teaser

1. Why might a robot using bang-bang control wobble?
2. What does the derivative (D) term help with in PID?',
'programming', 'advanced', 8),

('Breadboards, Wiring & Safe Circuits (Practical)',
'**Short explanation (big idea)**
Most beginner hardware problems come from simple wiring mistakes. Understanding breadboard layout and power rails prevents frustration.

## 1) Breadboard basics (simple map)

* **Top & bottom rails:** usually + and − (power).
* **Rows:** groups of connected holes for components.
* **Center gap:** separates two sides — insert ICs bridging the center.

## 2) Wiring safety & common mistakes

* **Reversed polarity:** power and ground swapped → components may get damaged.
* **Floating inputs:** unconnected pins read random values → use pull-ups or pull-downs.
* **Loose jumpers:** intermittent connections when robot vibrates.

## 3) Mini experiment

**Breadboard mapping**

1. Place an LED + resistor on a row; connect + to battery and − to ground; it lights.
2. Move LED to another row but forget to move resistor — it won''t light.
3. This shows how rows share connections.

**What you learn:** how continuity works on a breadboard.

## 4) Checklist for wiring

* Always connect ground first.
* Use color-coded wires (red = V+, black = GND).
* Secure power rails to full length with jumpers.
* Use multimeter to check continuity and voltage.

## 5) Vocabulary

* **Ground (GND):** reference point for all signals.
* **Continuity:** unbroken path for electricity.
* **Polarity:** direction of current (positive/negative).

## Quiz teaser

1. Why might a sensor read nothing even though it looked fine on the bench?
2. Why is connecting all grounds important?',
'electronics', 'beginner', 9),

('Debugging Robotics: Think Like a Scientist',
'**Short explanation (big idea)**
Robotics is mostly debugging. The right approach reduces time and frustration: check power, then wiring, then code, then mechanics.

## 1) The debugging sequence (repeatable)

1. **Power** — voltage and connections.
2. **Wiring** — pins, breadboard rows, polarity.
3. **Pins & Settings** — pinMode, PWM pins, enable lines.
4. **Code** — logic order, blocking calls, variable types.
5. **Mechanics** — friction, mountings, loose screws.

## 2) Tools & when to use them

* **Multimeter:** check voltage and continuity (first tool).
* **Oscilloscope (advanced):** see quick spikes/noise.
* **Serial monitor:** print values to see what code reads.
* **LED as test:** connect LED to a pin to ensure the pin works.

## 3) Mini experiment (debug flow)

**Reproduce + isolate**

1. If integrated system fails, disconnect actuators and test sensors alone (bench test).
2. Reconnect one subsystem at a time until failure reappears — that shows the culprit.

**What you learn:** isolate subsystems to find the root cause.

## 4) Common debugging pitfalls

* Randomly changing many things at once (don''t do this).
* Assuming code is wrong before checking hardware.
* Not logging or saving test observations.

**Checklist**

* Reproduce the bug reliably.
* Change one thing at a time.
* Keep a lab notebook (short notes help everyone).

## 5) Vocabulary

* **Reproduce:** cause the same bug on demand.
* **Isolate:** separate parts to find where the problem is.
* **Lab notebook:** short record of tests and results.

## Quiz teaser

1. What is the first thing you should check if the robot won''t power on?
2. Why do we test subsystems individually?',
'troubleshooting', 'intermediate', 10);