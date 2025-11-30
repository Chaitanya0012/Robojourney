export type QuizQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string; correct: boolean; explanation: string }[];
};

export type Quiz = {
  id: string;
  article_id: string;
  title: string;
  difficulty: number;
  questions: QuizQuestion[];
};

export const quizzes: Quiz[] = [
  {
    id: "intro_robotics_quiz",
    article_id: "intro_robotics",
    title: "Intro Robotics Check",
    difficulty: 1,
    questions: [
      {
        id: "intro_q1",
        prompt: "What makes a machine a robot?",
        options: [
          { id: "a", text: "It has wheels", correct: false, explanation: "Robots can have wheels, legs, or arms." },
          {
            id: "b",
            text: "It can sense, think, and act",
            correct: true,
            explanation: "Robots take input from sensors, decide, and then act with actuators.",
          },
          { id: "c", text: "It is very small", correct: false, explanation: "Size does not define a robot." },
        ],
      },
    ],
  },
  {
    id: "motors_basics_quiz",
    article_id: "motors_basics",
    title: "Motors Basics Quiz",
    difficulty: 2,
    questions: [
      {
        id: "motor_q1",
        prompt: "What controls a motor's speed?",
        options: [
          { id: "a", text: "Battery color", correct: false, explanation: "Voltage or PWM affects speed, not color." },
          { id: "b", text: "PWM duty cycle", correct: true, explanation: "Higher duty cycles mean more power over time." },
          { id: "c", text: "Wire length", correct: false, explanation: "Wire length is rarely a direct control method." },
        ],
      },
    ],
  },
];
