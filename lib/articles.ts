export type Article = {
  id: string;
  title: string;
  summary: string;
  body: string;
  difficulty: number;
  tags: string[];
  estimated_minutes: number;
  prerequisites: string[];
};

export const articles: Article[] = [
  {
    id: "intro_robotics",
    title: "Intro to Robotics",
    summary: "Discover what makes a robot a robot and where we see them.",
    body: "Basics of robotics and simple components.",
    difficulty: 1,
    tags: ["foundations"],
    estimated_minutes: 8,
    prerequisites: [],
  },
  {
    id: "motors_basics",
    title: "Motors Basics",
    summary: "How robots move using DC motors.",
    body: "Motor control essentials.",
    difficulty: 2,
    tags: ["motors"],
    estimated_minutes: 10,
    prerequisites: ["intro_robotics"],
  },
  {
    id: "sensors_basics",
    title: "Sensors Basics",
    summary: "Teach robots to sense lines and obstacles.",
    body: "Sensor fundamentals.",
    difficulty: 2,
    tags: ["sensors"],
    estimated_minutes: 10,
    prerequisites: ["intro_robotics"],
  },
  {
    id: "line_follower_concept",
    title: "Line Follower Concept",
    summary: "Plan how to follow a line with two sensors.",
    body: "Line following logic.",
    difficulty: 3,
    tags: ["project"],
    estimated_minutes: 12,
    prerequisites: ["motors_basics", "sensors_basics"],
  },
];
