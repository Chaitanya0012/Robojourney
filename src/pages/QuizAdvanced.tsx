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
    description: "Start here to understand voltage, current, resistance, and basic signal types.",
    topics: ["Voltage & Current", "Ohm's Law", "Analog vs Digital"],
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
      content: "Current (I) is the rate of charge flow measured in amperes (A).",
    },
  },
];

const defaultStats = () => ({ xp: 0, level: 0, correct: 0, incorrect: 0 });

export default function QuizAdvanced() {
  const [stats, setStats] = useState(defaultStats);
  const [showTheory, setShowTheory] = useState(true);

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
              <button onClick={() => setShowTheory(false)} className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400">
                Start Practice
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
