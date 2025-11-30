export type MicroQuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer_index: number;
  xp_reward: number;
  mistake_tags: string[];
  explanation_correct: string;
  explanation_incorrect: string;
};

export type MicroConcept = {
  concept_title: string;
  explanation_text: string;
  interactive_example_text: string;
  micro_quiz: {
    questions: MicroQuizQuestion[];
  };
  insight_summary: string;
  glossary_terms: string[];
};

export type Article = {
  id: string;
  title: string;
  summary: string;
  micro_concepts: MicroConcept[];
  difficulty: number;
  estimated_minutes: number;
  tags: string[];
  prerequisites: string[];
};

export const curriculumNodes = [
  "what_is_electricity",
  "digital_vs_analog",
  "what_is_a_sensor",
  "light_sensors",
  "motors_basics",
  "logic_basics",
  "intro_to_arduino",
  "arduino_gpio",
  "arduino_pwm",
  "build_a_line_follower",
  "esp32_intro",
  "esp32_wifi_basics",
  "esp32_pwm_basics",
];

export const articles: Article[] = [
  {
    id: "what_is_electricity",
    title: "What Is Electricity?",
    summary: "Explore how tiny charges move and power our robots in everyday life.",
    micro_concepts: [
      {
        concept_title: "Electricity as Flow",
        explanation_text:
          "Electricity is like a river of tiny charges. When they move through wires, lights and motors wake up.",
        interactive_example_text: "Imagine you're holding a water hose. More squeeze means faster flow, like more voltage.",
        micro_quiz: {
          questions: [
            {
              id: "electricity_flow",
              question: "What happens when electric charge starts moving through a wire?",
              options: [
                "Nothing changes; wires stay silent.",
                "Energy moves and can make bulbs glow or motors spin.",
                "The wire disappears.",
              ],
              answer_index: 1,
              xp_reward: 10,
              mistake_tags: ["conceptual_gap"],
              explanation_correct: "Yes! Moving charge carries energy that devices can use.",
              explanation_incorrect: "Not quite. When charge moves, it carries energy that powers parts of the circuit.",
            },
          ],
        },
        insight_summary: "Charge flow carries usable energy to your robot's parts.",
        glossary_terms: ["electricity", "current"],
      },
      {
        concept_title: "Voltage as Push",
        explanation_text: "Voltage is the push that makes charges move, like pressure pushing water in a pipe.",
        interactive_example_text: "Imagine two water tanks: higher tank pushes water harder. Higher voltage pushes charge harder too.",
        micro_quiz: {
          questions: [
            {
              id: "voltage_push",
              question: "Why is voltage compared to water pressure?",
              options: [
                "Both describe how strong the push is to move something.",
                "Both measure temperature.",
                "Because wires are always full of water.",
              ],
              answer_index: 0,
              xp_reward: 10,
              mistake_tags: ["misread_question"],
              explanation_correct: "Exactly. Voltage describes how strongly charges are encouraged to move.",
              explanation_incorrect: "Try again. Voltage is like a push, not related to temperature or literal water.",
            },
          ],
        },
        insight_summary: "Higher voltage means a stronger push on electric charges.",
        glossary_terms: ["voltage"],
      },
      {
        concept_title: "Circuits as Paths",
        explanation_text:
          "A circuit is a loop that lets charges leave a battery and return. Break the loop and the flow stops.",
        interactive_example_text:
          "Picture a train track loop. If a piece is missing, the train stops. A circuit needs a full track too.",
        micro_quiz: {
          questions: [
            {
              id: "circuit_loop",
              question: "What happens if a circuit loop is broken?",
              options: [
                "Current stops flowing.",
                "Voltage doubles automatically.",
                "The battery charges itself.",
              ],
              answer_index: 0,
              xp_reward: 10,
              mistake_tags: ["conceptual_gap"],
              explanation_correct: "Right. Without a full loop, charges cannot travel.",
              explanation_incorrect: "Check again. A missing connection stops the flow of current.",
            },
          ],
        },
        insight_summary: "Closed loops let electricity travel; breaks stop the journey.",
        glossary_terms: ["electricity"],
      },
    ],
    difficulty: 1,
    estimated_minutes: 6,
    tags: ["beginner", "middle_school"],
    prerequisites: [],
  },
  {
    id: "digital_vs_analog",
    title: "Digital vs Analog Signals",
    summary: "Learn how robots tell the difference between smooth signals and on/off signals.",
    micro_concepts: [
      {
        concept_title: "Smooth vs Stepped",
        explanation_text: "Analog signals change smoothly, while digital signals jump between set levels like 0 or 1.",
        interactive_example_text: "Imagine a dimmer knob (analog) versus a light switch (digital).",
        micro_quiz: {
          questions: [
            {
              id: "analog_digital",
              question: "Which control is most like a digital signal?",
              options: ["A dimmer knob", "An on/off switch", "A volume slider"],
              answer_index: 1,
              xp_reward: 10,
              mistake_tags: ["misread_question"],
              explanation_correct: "Yes! Digital is like a clear on/off switch.",
              explanation_incorrect: "Remember, digital signals have fixed steps, not smooth changes.",
            },
          ],
        },
        insight_summary: "Digital signals are clear steps; analog signals are smooth curves.",
        glossary_terms: ["digital", "analog"],
      },
      {
        concept_title: "Why Robots Use Both",
        explanation_text: "Robots read analog sensors for shades of data and use digital pins for clear commands.",
        interactive_example_text:
          "Imagine tasting soup: you notice the exact warmth (analog) but give a thumbs-up or down to your friend (digital).",
        micro_quiz: {
          questions: [
            {
              id: "use_both",
              question: "Why might a robot read an analog value?",
              options: ["To know precise shades like brightness", "To save memory", "To make sounds louder"],
              answer_index: 0,
              xp_reward: 10,
              mistake_tags: ["conceptual_gap"],
              explanation_correct: "Correct. Analog readings show how strong a signal is.",
              explanation_incorrect: "Think about brightness levels; analog tells you how bright, not just bright or dark.",
            },
          ],
        },
        insight_summary: "Analog pins feel the shades; digital pins deliver crisp commands.",
        glossary_terms: ["analog", "digital"],
      },
      {
        concept_title: "Converting Signals",
        explanation_text: "Microcontrollers turn analog readings into numbers using ADCs so code can understand.",
        interactive_example_text: "Think of a translator turning smooth music into note numbers the computer can read.",
        micro_quiz: {
          questions: [
            {
              id: "adc_role",
              question: "What does an ADC inside a board do?",
              options: ["Turns analog signals into numbers", "Speeds up the motor", "Saves programs to flash"],
              answer_index: 0,
              xp_reward: 10,
              mistake_tags: ["procedural_error"],
              explanation_correct: "Exactly. An ADC converts the smooth signal to a digital number.",
              explanation_incorrect: "Check again. ADC stands for analog-to-digital converter—it translates signals to numbers.",
            },
          ],
        },
        insight_summary: "ADCs translate smooth signals into numbers your code can use.",
        glossary_terms: ["microcontroller"],
      },
    ],
    difficulty: 1,
    estimated_minutes: 7,
    tags: ["beginner", "middle_school"],
    prerequisites: ["what_is_electricity"],
  },
  {
    id: "what_is_a_sensor",
    title: "What Is a Sensor?",
    summary: "Meet the eyes and skin of a robot and learn why they matter.",
    micro_concepts: [
      {
        concept_title: "Sensors Notice the World",
        explanation_text: "Sensors turn light, sound, or motion into signals the robot can read.",
        interactive_example_text:
          "Imagine your hand feeling a warm mug. The feeling becomes a message to your brain, just like sensors send data.",
        micro_quiz: {
          questions: [
            {
              id: "sensor_role",
              question: "Why does a robot need sensors?",
              options: ["To see or feel what is around it", "To store more code", "To make the battery heavier"],
              answer_index: 0,
              xp_reward: 10,
              mistake_tags: ["conceptual_gap"],
              explanation_correct: "Yes! Sensors help the robot notice the environment.",
              explanation_incorrect: "Try again. Sensors give the robot awareness of light, sound, or distance.",
            },
          ],
        },
        insight_summary: "Sensors convert real-world signals into robot-friendly information.",
        glossary_terms: ["sensor"],
      },
      {
        concept_title: "Different Sensor Types",
        explanation_text: "There are light sensors, buttons, distance sensors, and more—each senses a different clue.",
        interactive_example_text: "Think of a detective toolkit: a flashlight, magnifier, and notepad all reveal different hints.",
        micro_quiz: {
          questions: [
            {
              id: "sensor_types",
              question: "Which is an example of a light sensor?",
              options: ["Photoresistor", "Speaker", "Battery"],
              answer_index: 0,
              xp_reward: 10,
              mistake_tags: ["hardware_misinterpretation"],
              explanation_correct: "Right. A photoresistor changes its value based on light.",
              explanation_incorrect: "Check the choices again. Only the photoresistor changes with light levels.",
            },
          ],
        },
        insight_summary: "Different sensors capture different clues about the environment.",
        glossary_terms: ["sensor", "infrared"],
      },
      {
        concept_title: "Sensors Need Clean Signals",
        explanation_text: "Signals can be noisy. Reading multiple times or adding thresholds helps the robot trust the data.",
        interactive_example_text:
          "Imagine listening for a whisper in a busy room. You might lean closer or ask twice to be sure, just like averaging readings.",
        micro_quiz: {
          questions: [
            {
              id: "noise_management",
              question: "How can you make sensor readings more reliable?",
              options: ["Average several readings", "Shake the sensor", "Ignore odd numbers"],
              answer_index: 0,
              xp_reward: 10,
              mistake_tags: ["procedural_error"],
              explanation_correct: "Yes. Averaging or filtering reduces noise and gives steadier data.",
              explanation_incorrect: "Consider using simple tricks like averaging to smooth noisy readings.",
            },
          ],
        },
        insight_summary: "Filtering and thresholds make sensor data easier to trust.",
        glossary_terms: ["sensor"],
      },
    ],
    difficulty: 1,
    estimated_minutes: 7,
    tags: ["beginner", "middle_school"],
    prerequisites: ["digital_vs_analog"],
  },
];
