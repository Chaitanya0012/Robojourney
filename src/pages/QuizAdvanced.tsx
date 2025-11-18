import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";

const TOKENS = {
  bg: "bg-gradient-to-br from-[#0f1724] via-[#0f1728] to-[#071126]",
  card: "bg-white/5 backdrop-blur-md",
};

const THEORY_SECTIONS = [
  {
    id: "fundamentals",
    title: "Fundamentals: Signals, Units, and Basic Electronics",
    description: "Start here to understand voltage, current, resistance, and basic signal types (analog vs digital).",
    topics: ["Voltage & Current", "Ohm's Law", "Analog vs Digital","Basic Passive Components"],
  },
  {
    id: "sensors",
    title: "Sensors: How Robots Perceive the World",
    description: "Covers common sensors used in robotics — ultrasonic, IR, LDR, temperature sensors.",
    topics: ["Ultrasonic", "IR", "LDR", "Temperature"],
  },
];

const QUESTIONS = [
  {
    id: "q_f_1",
    stage: 0,
    category: "Fundamentals",
    question: "Which quantity describes the flow of electric charge through a wire?",
    options: ["Voltage", "Resistance", "Current", "Power"],
    correctIndex: 2,
    difficulty: "Easy",
    article: {
      title: "Current — the flow of charge",
      content: "Current (I) is the rate of charge flow measured in amperes (A). In simple circuits, Ohm's law V = IR links voltage (V), current (I), and resistance (R).\n\nOther options: Voltage is potential difference (V), Resistance is opposition to current (Ω), Power is energy per time (W).",
    },
  },
  {
    id: "q_s_1",
    stage: 1,
    category: "Sensors",
    question: "An ultrasonic sensor measures distance by:",
    options: ["Measuring light reflection", "Timing echo of sound pulses", "Measuring resistance change", "Detecting magnetic fields"],
    correctIndex: 1,
    difficulty: "Easy",
    article: {
      title: "How ultrasonic sensors measure distance",
      content: "Ultrasonic sensors send high-frequency (typically 40 kHz) pulses and listen for echoes. Distance = (time_of_flight × speed_of_sound) / 2.",
    },
  },
];

const difficultyScore = (d: string) => (d === "Easy" ? 1 : d === "Medium" ? 2 : 3);
const defaultStats = () => ({ xp: 0, level: 0, correct: 0, incorrect: 0, streak: 0, perCategory: {} });

export default function QuizAdvanced() {
  const [stats, setStats] = useState(defaultStats);
  const [showTheory, setShowTheory] = useState(true);
  const [currentQ, setCurrentQ] = useState<typeof QUESTIONS[0] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAnswer = (idx: number) => {
    if (!currentQ || feedback) return;
    const correct = idx === currentQ.correctIndex;
    setSelected(idx);
    setFeedback(correct ? "correct" : "incorrect");
    setStats(st => ({ ...st, xp: st.xp + (correct ? 10 : 0), correct: st.correct + (correct ? 1 : 0), incorrect: st.incorrect + (correct ? 0 : 1) }));
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className={`${TOKENS.bg} min-h-screen p-6 text-white`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Robotics Quiz</h1>
          {showTheory && (
            <motion.div className="p-6 rounded-2xl bg-white/5">
              <h2 className="text-lg font-semibold">{THEORY_SECTIONS[0].title}</h2>
              <p className="text-sm text-slate-300 mt-2">{THEORY_SECTIONS[0].description}</p>
              <button onClick={() => { setShowTheory(false); setCurrentQ(QUESTIONS[0]); }} className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400">
                Start Practice
              </button>
            </motion.div>
          )}
          {!showTheory && currentQ && (
            <motion.div className="p-6 rounded-2xl bg-white/5">
              <h3 className="text-xl">{currentQ.question}</h3>
              <div className="mt-4 grid gap-3">
                {currentQ.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} className={`px-4 py-3 rounded-xl ${selected === i ? 'bg-primary' : 'bg-white/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
              {feedback && <div className="mt-4 p-4 bg-white/10 rounded-xl">{currentQ.article.content}</div>}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
