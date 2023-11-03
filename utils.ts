import { Bot } from 'grammy';
import { Random } from 'random-js';
import * as questionsData from './questions.json';
import { Questions, Topic } from './types';

export function createBot(token: string | undefined) {
  if (token) {
    return new Bot(token);
  } else {
    throw 'BOT_API_TOKEN is not defined. Please set it in your environment variables.';
  }
}

export const getRandomTopic = (): Topic => {
  const topics: Topic[] = ['html', 'css', 'js', 'ts', 'angular'];
  const random = new Random();
  return topics[random.integer(0, topics.length - 1)];
};

const questions: Questions = questionsData;

export const getRandomQuestion = (topic: Topic) => {
  const random = new Random();

  const randomQuestionIndex = random.integer(0, questions[topic].length - 1);
  return questions[topic][randomQuestionIndex];
};

export const getCorrectAnswer = (topic: Topic, id: number): string => {
  const question = questions[topic].find((question) => question.id === id)!;
  if (!question.hasOptions) {
    return question.answer!;
  }

  return question.options!.find((option) => option.isCorrect)!.text;
};
