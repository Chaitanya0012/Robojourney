export interface QuizArticle {
  id: string;
  title: string;
  content: string;
  category?: string;
  difficulty?: string;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
}

const rotateOptions = (options: string[], shift: number) => {
  return options.map((_, idx) => options[(idx + shift) % options.length]);
};

const getLeadSentence = (content: string) => {
  const sentence = content.split(/\.\s/)[0];
  return sentence.length > 140 ? `${sentence.slice(0, 140)}...` : sentence;
};

export const generateConceptQuestions = (
  article: QuizArticle,
  count = 5
): GeneratedQuestion[] => {
  const focus = article.category || "robotics";
  const difficulty = article.difficulty || "Beginner";
  const summary = article.content ? getLeadSentence(article.content) : "the key idea";

  const templates = [
    {
      question: `What is the main idea you should remember from "${article.title}"?`,
      correct: `Being able to explain ${focus} using the core idea: ${summary}.`,
      distractors: [
        "Memorizing random facts that are not connected.",
        "Focusing only on how the robot looks, not how it works.",
        "Ignoring the safety or testing steps mentioned.",
      ],
      difficulty,
    },
    {
      question: `How can you show you understood the article's concept?`,
      correct: `Describe ${focus} to a friend and point out one way to apply it.`,
      distractors: [
        "Copy the title without explaining anything.",
        "Guess what it might mean without reading.",
        "List unrelated facts about space or sports.",
      ],
      difficulty: "Easy",
    },
    {
      question: `Which beginner-friendly action matches the idea from "${article.title}"?`,
      correct: `Try a small experiment that uses the article's tip about ${focus}.`,
      distractors: [
        "Attempt an unrelated advanced college project immediately.",
        "Skip testing because it seems slow.",
        "Change topics and build a random gadget with no plan.",
      ],
      difficulty: "Medium",
    },
    {
      question: `What common mistake should you avoid when practicing this topic?`,
      correct: `Rushing ahead without checking the basics the article highlighted.`,
      distractors: [
        "Reviewing the main steps before starting.",
        "Asking for feedback from a mentor.",
        "Following the safety tip given in the article.",
      ],
      difficulty,
    },
    {
      question: `If you had to teach this idea, what would be the first step?`,
      correct: `Share a simple definition from the article and one real-world example.`,
      distractors: [
        "Start with complex math proofs only.",
        "Skip definitions and jump to unrelated trivia.",
        "Tell people to guess until they get it right.",
      ],
      difficulty: "Medium",
    },
  ];

  return Array.from({ length: count }).map((_, idx) => {
    const base = templates[idx % templates.length];
    const rotated = rotateOptions([base.correct, ...base.distractors], idx % 4);
    const correctIndex = rotated.indexOf(base.correct);

    return {
      id: `${article.id}-gen-${idx + 1}`,
      question: base.question,
      options: rotated,
      correctIndex,
      explanation: `The best choice connects directly to the article's takeaway about ${focus} and avoids unrelated distractions.`,
      difficulty: base.difficulty,
    };
  });
};
