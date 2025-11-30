export type GlossaryEntry = {
  term: string;
  definition: string;
  category: "electronics" | "robotics" | "programming";
};

export const glossary: GlossaryEntry[] = [
  {
    term: "electricity",
    definition: "A flow of tiny charges that powers lights, motors, and computers.",
    category: "electronics",
  },
  {
    term: "voltage",
    definition: "How strongly electricity is pushed through a circuit, like water pressure.",
    category: "electronics",
  },
  {
    term: "current",
    definition: "The amount of electrical flow, similar to how much water is moving.",
    category: "electronics",
  },
  {
    term: "sensor",
    definition: "A device that helps a robot notice light, distance, or movement.",
    category: "robotics",
  },
  {
    term: "analog",
    definition: "A smooth, continuously changing signal, like a dimmer knob.",
    category: "electronics",
  },
  {
    term: "digital",
    definition: "Information that only has clear steps like ON or OFF.",
    category: "electronics",
  },
  {
    term: "microcontroller",
    definition: "A tiny computer inside your robot that reads sensors and runs code.",
    category: "programming",
  },
  {
    term: "GPIO",
    definition: "Pins on a board that you can set to read inputs or send outputs.",
    category: "electronics",
  },
  {
    term: "PWM",
    definition: "A method to control speed by switching power on and off quickly.",
    category: "electronics",
  },
  {
    term: "infrared",
    definition: "Light we cannot see but sensors use to notice lines or obstacles.",
    category: "electronics",
  },
  {
    term: "line follower",
    definition: "A robot that uses sensors to stay on a painted path.",
    category: "robotics",
  },
];

export function findGlossaryMatches(text: string) {
  const lower = text.toLowerCase();
  return glossary.filter((entry) => lower.includes(entry.term.toLowerCase()));
}
