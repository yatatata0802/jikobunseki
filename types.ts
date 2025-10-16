export type AnswerValue = "A" | "B" | "C" | "D" | "E";
export type QuizVersion = "trial" | "full";

export interface AnswerChoice {
  value: AnswerValue;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  choices: AnswerChoice[];
}

export interface Result {
  type: string;
  title: string;
  description: string;
  risk: string;
  prescription: string;
}

export type ResultsData = {
  [key in AnswerValue]: Result;
};

export type AppState = "choice" | "quiz" | "result";

export type Scores = { [key in AnswerValue]: number };
