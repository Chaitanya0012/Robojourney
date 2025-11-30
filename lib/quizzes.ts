export type MistakeTag =
  | "conceptual_gap"
  | "careless_mistake"
  | "misread_question"
  | "skill_flow_problem"
  | "procedural_error"
  | "hardware_misinterpretation";

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer_index: number;
  xp_reward: number;
  mistake_tag: MistakeTag;
  explanation_correct: string;
  explanation_incorrect: string;
};

export type Quiz = {
  id: string;
  node_id: string;
  title: string;
  difficulty: number;
  tags: string[];
  questions: QuizQuestion[];
};

export const quizzes: Quiz[] = [
  {
    id: "quiz_what_is_electricity",
    node_id: "what_is_electricity",
    title: "Electricity Basics Check",
    difficulty: 1,
    tags: ["beginner", "middle_school"],
    questions: [
      {
        id: "q1_flow",
        question: "What is electricity most like?",
        options: ["A flowing river", "A pile of sand", "A solid rock"],
        answer_index: 0,
        xp_reward: 10,
        mistake_tag: "conceptual_gap",
        explanation_correct: "Yes! Electricity involves charges moving like water flow.",
        explanation_incorrect: "Think of movement. Electricity flows rather than sitting still like sand or rocks.",
      },
      {
        id: "q2_voltage",
        question: "Voltage is similar to what everyday idea?",
        options: ["Water pressure", "Battery weight", "Button color"],
        answer_index: 0,
        xp_reward: 10,
        mistake_tag: "misread_question",
        explanation_correct: "Correct. Voltage pushes charges like pressure pushes water.",
        explanation_incorrect: "Look for what creates a push. Voltage is not about weight or color.",
      },
      {
        id: "q3_loop",
        question: "Why does a circuit need a closed loop?",
        options: ["To let current return", "To cool the wires", "To make the battery bigger"],
        answer_index: 0,
        xp_reward: 10,
        mistake_tag: "conceptual_gap",
        explanation_correct: "Right. A full loop lets charges travel and return.",
        explanation_incorrect: "Remember, without a loop, current cannot move at all.",
      },
    ],
  },
  {
    id: "quiz_digital_vs_analog",
    node_id: "digital_vs_analog",
    title: "Digital or Analog?",
    difficulty: 1,
    tags: ["beginner", "middle_school"],
    questions: [
      {
        id: "q1_signal",
        question: "A digital signal is best described as…",
        options: ["Smoothly changing", "Only on or off", "Always random"],
        answer_index: 1,
        xp_reward: 10,
        mistake_tag: "conceptual_gap",
        explanation_correct: "Yes! Digital signals switch between set levels.",
        explanation_incorrect: "Try picturing a switch. Digital signals jump between clear states.",
      },
      {
        id: "q2_adc",
        question: "What does an ADC help with?",
        options: ["Turning analog readings into numbers", "Making motors heavier", "Cooling the board"],
        answer_index: 0,
        xp_reward: 10,
        mistake_tag: "procedural_error",
        explanation_correct: "Exactly. ADCs translate analog signals so code can use them.",
        explanation_incorrect: "Check again. The ADC converts signals, not motor weight or cooling.",
      },
      {
        id: "q3_robot_use",
        question: "Why would a robot prefer an analog reading?",
        options: ["To sense brightness levels", "To save code space", "To change LED colors"],
        answer_index: 0,
        xp_reward: 10,
        mistake_tag: "skill_flow_problem",
        explanation_correct: "Correct. Analog readings show how strong a signal is.",
        explanation_incorrect: "Analog gives shades, like brightness, not memory savings.",
      },
      {
        id: "q4_digital",
        question: "Which pin type is best for checking if a button is pressed?",
        options: ["Analog", "Digital", "PWM"],
        answer_index: 1,
        xp_reward: 10,
        mistake_tag: "careless_mistake",
        explanation_correct: "Right. A button is either pressed or not, matching digital pins.",
        explanation_incorrect: "Buttons are on/off. Digital pins read that simple change.",
      },
    ],
  },
  {
    id: "quiz_what_is_a_sensor",
    node_id: "what_is_a_sensor",
    title: "Sensor Starter Quiz",
    difficulty: 1,
    tags: ["beginner", "middle_school"],
    questions: [
      {
        id: "q1_need",
        question: "What is the main job of a sensor?",
        options: ["Notice the environment", "Store programs", "Charge batteries"],
        answer_index: 0,
        xp_reward: 10,
        mistake_tag: "conceptual_gap",
        explanation_correct: "Yes! Sensors collect clues about surroundings.",
        explanation_incorrect: "Think about how robots notice light or distance—sensors do that.",
      },
      {
        id: "q2_light",
        question: "Which part could help a robot detect brightness?",
        options: ["Photoresistor", "Buzzer", "Servo horn"],
        answer_index: 0,
        xp_reward: 10,
        mistake_tag: "hardware_misinterpretation",
        explanation_correct: "Correct. A photoresistor changes value with light.",
        explanation_incorrect: "Look for the option that changes with light levels.",
      },
      {
        id: "q3_noise",
        question: "How can you reduce noisy sensor readings?",
        options: ["Average several samples", "Move the robot faster", "Ignore all zeros"],
        answer_index: 0,
        xp_reward: 10,
        mistake_tag: "procedural_error",
        explanation_correct: "Right. Averaging smooths out random bumps in data.",
        explanation_incorrect: "Try techniques like averaging or filtering instead of ignoring data.",
      },
    ],
  },
];
