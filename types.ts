export type Topic = 'html' | 'css' | 'js' | 'ts' | 'angular';

export type Questions = Record<Topic, Question[]>;

export type Question = {
  id: number;
  text: string;
  hasOptions: boolean;
  options?: Option[];
  answer?: string;
};

type Option = {
  id: number;
  text: string;
  isCorrect: boolean;
};

export type CallbackData = {
  type: Topic;
  questionId: number;
  isCorrect?: boolean;
};
