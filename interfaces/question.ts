type JeopardyValue = 100 | 200 | 400 | 800 | 1000;
type DoubleJeopardyValue = 400 | 800 | 1200 | 1600 | 2000;

export interface Question {
  id: number;
  game_id: number;
  value: number;
  daily_double: boolean;
  round: string;
  category: string;
  clue: string;
  response: string;
}

export interface Questions {
  data: Question[];
}

export interface Category {
  categoryName: string;
  clues: Question[];
}

export interface FullGame {
  jeopardyRound: Category[];
  doubleJeopardyRound: Category[];
  finalJeopardy: FinalJeopardy;
}

export interface FinalJeopardy {
  id: number;
  answer: string;
  question: string;
  airdate: string;
  category: {
    title: string;
  };
}
