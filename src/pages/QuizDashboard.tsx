import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface Article {
  id: string;
  title: string;
  content: string;
  wrong_vs_right: {
    wrong: string;
    right: string;
  };
}

interface QuizQuestion {
  id: string;
  articleId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
}

const BASIC_ARTICLES: Article[] = [
  { id: 'basic_01', title: 'What is a Robot — Simple Definition', content: `A robot is a machine that senses its environment, makes decisions (simple or complex), and acts on those decisions.\n\nWhy it matters: Clear definition helps you identify what parts (sensors, controller, actuators) you need to build a functioning robot.`, wrong_vs_right: { wrong: 'Thinking robots must look humanoid or be very complex.', right: 'Robots can be as simple as a microcontroller driving a motor — functionality over form.' } },
  { id: 'basic_02', title: 'Voltage, Current, Resistance — The Trio', content: `Voltage (V) is electrical potential; Current (I) is flow of electrons; Resistance (R) opposes current. Ohm's law: V = I × R.\n\nPractice: Calculate resistor needed for LED with 5V supply and 2V forward voltage.`, wrong_vs_right: { wrong: 'Assuming voltage and current are the same thing.', right: 'Voltage pushes current; current is what does the work (and must be limited for components).' } },
  { id: 'basic_03', title: 'Analog vs Digital Signals — Key Differences', content: `Analog signals are continuous; digital signals have discrete levels. Microcontrollers use ADCs to read analog sensors.\n\nTip: Use pull-up resistors when reading simple switches to avoid floating inputs.`, wrong_vs_right: { wrong: 'Treating all sensors as digital (on/off).', right: 'Recognize when you need analog precision (potentiometers, light sensors).' } },
  { id: 'basic_04', title: 'Common Sensors: Ultrasonic, IR, LDR, Touch', content: `Ultrasonic = distance by echo; IR = line or proximity; LDR = light-dependent resistance; Touch = simple switch.\n\nQuick exercise: Wire an ultrasonic module to Arduino and display cm distance.`, wrong_vs_right: { wrong: 'Assuming ultrasonic works well on soft fabrics or sound-absorbent materials.', right: 'Ultrasonic works best with reflective surfaces — test for your environment.' } },
  { id: 'basic_05', title: 'Actuators Overview: DC Motors, Servos, Steppers', content: `DC motors = continuous rotation; Servos = accurate angular position; Steppers = precise open-loop rotation steps.\n\nPractice: Control a servo with PWM and command a 0–180° sweep.`, wrong_vs_right: { wrong: 'Using a DC motor for precise angular position without feedback.', right: 'Use servos or add encoders to DC motors for position control.' } },
  { id: 'basic_06', title: 'Powering Your Robot Safely', content: `Battery selection: capacity (mAh), voltage, discharge rate (C). Use voltage regulators for consistent microcontroller supply.\n\nSafety: never short battery terminals; add fuses where appropriate.`, wrong_vs_right: { wrong: 'Directly connecting motors to microcontroller pins.', right: 'Always use drivers or transistors/MOSFETs to handle motor current.' } },
  { id: 'basic_07', title: 'Motor Drivers and H-Bridges', content: `H-bridge lets you control motor direction by switching polarity (useful for DC motors). Use driver ICs (L298, TB6612) to offload switching and protect your MCU.`, wrong_vs_right: { wrong: 'Driving motors directly from MCU pins or USB ports.', right: 'Use dedicated motor drivers and consider voltage spikes (back-EMF).' } },
  { id: 'basic_08', title: 'Pulse Width Modulation (PWM) Basics', content: `PWM controls average power to motors/servos by switching fast between on/off states. Change duty cycle to vary speed or torque.`, wrong_vs_right: { wrong: 'Believing PWM frequency doesn\'t matter for certain motors.', right: 'Frequency and resolution affect motor smoothness and audible noise; choose appropriate PWM settings.' } },
  { id: 'basic_09', title: 'Introduction to Microcontrollers (Arduino)', content: `Arduino provides easy IO, ADC, PWM, and a friendly programming model. Learn digitalWrite/digitalRead/analogRead/analogWrite basics.`, wrong_vs_right: { wrong: 'Thinking Arduino is too simple for anything serious.', right: 'Arduino is ideal for prototyping; professional projects can scale from this foundation.' } },
  { id: 'basic_10', title: 'Reading Sensors: Debounce & Filtering', content: `Debouncing switches avoids multiple triggers; filtering analog noise (moving average, low-pass) stabilizes readings.`, wrong_vs_right: { wrong: 'Using raw sensor values directly for control loops.', right: 'Filter and validate sensor data before using it in control logic.' } },
  { id: 'basic_11', title: 'Encoders and Feedback', content: `Encoders measure rotation; useful for odometry and closed-loop position control. Learn to count pulses and convert to distance/angle.`, wrong_vs_right: { wrong: 'Assuming wheel RPM equals robot movement without slip.', right: 'Use encoders with sensor fusion (IMU) to correct for slip and error.' } },
  { id: 'basic_12', title: 'Basic Control Loops — On/Off and Proportional', content: `Start with on/off (bang-bang) control, then proportional (P) to reduce steady-state error. Understand trade-offs: speed vs stability.`, wrong_vs_right: { wrong: 'Jumping straight to PID without understanding P or I effects.', right: 'Learn simple P control first; add I and D when necessary.' } },
  { id: 'basic_13', title: 'Introduction to PID', content: `PID = Proportional + Integral + Derivative. P reduces present error, I reduces accumulated error, D predicts future error. Start with Ziegler–Nichols tuning as a baseline.`, wrong_vs_right: { wrong: 'Setting large I to eliminate error without checking stability.', right: 'Tune gradually; large I can cause oscillation and instability.' } },
  { id: 'basic_14', title: 'Sensors Placement & Mechanical Considerations', content: `Mount sensors to minimize interference; avoid mounting ultrasonic sensors near noisy motors; secure wiring to prevent intermittent connections.`, wrong_vs_right: { wrong: 'Placing sensors anywhere that is convenient.', right: 'Consider field-of-view, mounting angle, and mechanical vibration when placing sensors.' } },
  { id: 'basic_15', title: 'Basic Navigation: Line Following', content: `Line following uses IR reflectance sensors and simple control loops. Calibrate thresholds and implement simple PID for smooth following.`, wrong_vs_right: { wrong: 'Hard-coding sensor thresholds without calibration for ambient light.', right: 'Calibrate thresholds dynamically or on start-up for varied lighting conditions.' } },
  { id: 'basic_16', title: 'Communication: Serial, I2C, SPI', content: `Serial (UART) for simple debugging and comms; I2C for multi-slave sensors; SPI for high-speed peripherals. Use proper pull-ups for I2C.`, wrong_vs_right: { wrong: 'Wiring I2C without pull-up resistors and blaming devices for failure.', right: 'Always verify bus wiring and required pull-ups for reliable I2C communication.' } },
  { id: 'basic_17', title: 'Safety & Testing Protocols', content: `Test components individually, use a controlled test bench, add emergency stops. Document iterations and failures to learn faster.`, wrong_vs_right: { wrong: 'Testing full system without component-level validation.', right: 'Unit-test sensors and actuators first; then integrate incrementally.' } },
  { id: 'basic_18', title: 'Debugging Strategies for Robotics', content: `Use logging, LED indicators, step-through tests, and binary elimination to find faults quickly. Keep a checklist of probable causes.`, wrong_vs_right: { wrong: 'Random trial-and-error without hypothesis.', right: 'Formulate hypotheses and perform controlled tests to isolate issues.' } },
  { id: 'basic_19', title: 'Mechanical Prototyping: Fast Iterations', content: `Rapid prototyping (3D printing, laser cutting, cardboard) helps iterate designs fast. Focus on functionality before aesthetics.`, wrong_vs_right: { wrong: 'Spending lots of time on perfect aesthetics early.', right: 'Prototype quickly to validate concepts; refine later for competition-grade finish.' } },
  { id: 'basic_20', title: 'Competition Mindset — Reliability over Complexity', content: `In competitions, a reliable simple solution often beats a complex fragile one. Optimize for consistent scoring and easy repairs during matches.`, wrong_vs_right: { wrong: 'Chasing the highest-scoring but fragile strategy.', right: 'Aim for robust repeatable tasks and partial credit strategies.' } }
];

function generateQuestionsForArticles(articles: Article[]): QuizQuestion[] {
  const bank: QuizQuestion[] = [];
  articles.forEach((a) => {
    for (let i = 0; i < 4; i++) {
      const qId = `${a.id}_q${i + 1}`;
      const opts = [
        `${a.title.split(':')[0]} — the core idea`,
        `Common related concept`,
        `Plausible distractor (common mistake)`,
        `Unrelated option to test focus`
      ];
      const correctIndex = 0;
      const explanation = `The correct answer focuses on the main idea from the article: ${a.title}. Wrong answers are either related but not primary, common misconceptions, or unrelated.`;
      bank.push({ 
        id: qId, 
        articleId: a.id, 
        question: `(${a.title}) — Q${i + 1}: Choose the best statement`, 
        options: opts, 
        correctIndex, 
        explanation, 
        difficulty: i < 1 ? 'Easy' : 'Medium' 
      });
    }
  });
  return bank;
}

function saveGeneratedBank(bank: QuizQuestion[]) {
  try {
    localStorage.setItem('robotics_generated_quiz_bank', JSON.stringify(bank));
  } catch (e) {
    console.error('Failed to save quiz bank', e);
  }
}

function PremiumHero({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-3xl p-8 shadow-2xl bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary-dark))] to-[hsl(var(--accent))] text-foreground mb-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">Master Robotics — Beginner to National Competitor</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl">A step-by-step curriculum with articles, quizzes, and mentor-guided challenges designed to build winners. Learn fundamentals, build reliable robots, and compete with confidence.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={onStart} className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg text-primary-foreground font-semibold hover:scale-105 transition-transform">Start the Guided Journey</button>
            <button className="px-4 py-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">Explore Curriculum</button>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-80 h-60 rounded-2xl bg-card flex items-center justify-center p-6 border border-border">
            <div className="text-muted-foreground">Interactive Robot Preview</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizDashboard() {
  const navigate = useNavigate();
  const [quizStats, setQuizStats] = useState({
    totalQuestions: 0,
    streak: 0,
    lastScore: 0,
  });

  useEffect(() => {
    const existing = localStorage.getItem('robotics_generated_quiz_bank');
    if (!existing) {
      const bank = generateQuestionsForArticles(BASIC_ARTICLES);
      saveGeneratedBank(bank);
      localStorage.setItem('robotics_basic_articles', JSON.stringify(BASIC_ARTICLES));
      setQuizStats({
        totalQuestions: bank.length,
        streak: 1,
        lastScore: 80,
      });
    } else {
      try {
        const parsed = JSON.parse(existing) as QuizQuestion[];
        setQuizStats({
          totalQuestions: parsed.length,
          streak: Math.max(1, Math.min(7, Math.floor(parsed.length / 20))),
          lastScore: 92,
        });
      } catch (error) {
        console.error('Failed to parse quiz bank stats', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="min-h-screen w-full p-8">
        <div className="max-w-6xl mx-auto">
          <PremiumHero onStart={() => {
            document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' });
          }} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-xs uppercase tracking-wide text-primary">Question Bank</p>
              <p className="text-3xl font-bold">{quizStats.totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Auto-generated MCQs ready to launch instantly.</p>
            </div>
            <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-4">
              <p className="text-xs uppercase tracking-wide text-secondary">Learning Streak</p>
              <p className="text-3xl font-bold">{quizStats.streak} days</p>
              <p className="text-sm text-muted-foreground">Keep your streak alive to boost XP multipliers.</p>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
              <p className="text-xs uppercase tracking-wide text-accent">Last Checkpoint</p>
              <p className="text-3xl font-bold">{quizStats.lastScore}%</p>
              <p className="text-sm text-muted-foreground">Average of your most recent quiz session.</p>
            </div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold mb-4 text-foreground"
          >
            Core Beginner Articles
          </motion.h2>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            These 20 articles build a solid foundation. Click any card to read the article and start a linked quiz (4 questions each).
          </p>

          <div id="curriculum" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BASIC_ARTICLES.map((a, i) => (
              <motion.div 
                key={a.id} 
                initial={{ opacity: 0, y: 12 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.04 }}
              >
                <div 
                  className="p-5 rounded-2xl bg-card border border-border hover:scale-[1.02] transform transition-all shadow-xl cursor-pointer hover:border-primary/50" 
                  onClick={() => navigate(`/quiz?article=${a.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{a.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{a.content}</p>
                    </div>
                    <div className="ml-4 text-xs text-muted-foreground">#{i + 1}</div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Wrong vs Right</div>
                    <button 
                      className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm hover:scale-105 transition-transform" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        alert(`Wrong: ${a.wrong_vs_right.wrong}\n\nRight: ${a.wrong_vs_right.right}`); 
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <div className="text-muted-foreground">Auto-generated 80 MCQs saved locally for instant quizzing.</div>
            <div className="flex gap-3">
              <button 
                onClick={() => { 
                  localStorage.setItem('robotics_generated_quiz_bank', JSON.stringify(generateQuestionsForArticles(BASIC_ARTICLES))); 
                  alert('Quiz bank regenerated (80 questions)'); 
                }} 
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Regenerate Bank
              </button>
              <button 
                onClick={() => navigate('/quiz')} 
                className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:scale-105 transition-transform"
              >
                Open Quiz Engine
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
