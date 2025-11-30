export type SM2State = {
  easiness_factor: number;
  repetitions: number;
  interval: number;
  next_review_date: string;
};

export type ReviewUpdate = {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  now?: Date;
};

const MIN_EF = 1.3;

export function updateSM2(previous: SM2State, update: ReviewUpdate): SM2State {
  const now = update.now ?? new Date();
  const quality = update.quality;
  let easiness_factor =
    previous.easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easiness_factor < MIN_EF) easiness_factor = MIN_EF;

  let repetitions = previous.repetitions;
  let interval = previous.interval;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(previous.interval * easiness_factor);
  }

  const next_review_date = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();

  return { easiness_factor, repetitions, interval, next_review_date };
}

export function seedSM2State(): SM2State {
  return {
    easiness_factor: 2.5,
    repetitions: 0,
    interval: 1,
    next_review_date: new Date().toISOString(),
  };
}
