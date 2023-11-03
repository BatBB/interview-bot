import { GrammyError, HttpError, InlineKeyboard, Keyboard } from 'grammy';
import 'dotenv/config';
import { CallbackData, Topic } from './types';
import { createBot, getCorrectAnswer, getRandomQuestion, getRandomTopic } from './utils';

const botApiToken = process.env.BOT_API_TOKEN;

const topicTextToCode: Record<string, Topic> = {
  HTML: 'html',
  CSS: 'css',
  JavaScript: 'js',
  TypeScript: 'ts',
  Angular: 'angular',
} as const;

const bot = createBot(botApiToken);

bot.start();

bot.command('start', async (ctx) => {
  const startKeyboard = new Keyboard()
    .text('HTML')
    .text('CSS')
    .row()
    .text('JavaScript')
    .text('TypeScript')
    .row()
    .text('Angular')
    .text('Случайный вопрос')
    .resized();
  await ctx.reply(
    'Привет! Я - Frontend Interview Prep Bot 🤖 \nЯ помогу тебе подготовиться к интервью по фронтенду'
  );
  await ctx.reply('С чего начнем? Выбери тему вопроса в меню 👇', {
    reply_markup: startKeyboard,
  });
});

bot.hears([...Object.keys(topicTextToCode), 'Случайный вопрос'], async (ctx) => {
  const topicTextValue = ctx.message!.text!;

  let topic: Topic;

  if (topicTextValue === 'Случайный вопрос') {
    topic = getRandomTopic();
  } else {
    topic = topicTextToCode[topicTextValue] as Topic;
  }

  const question = getRandomQuestion(topic);

  let keyboard: InlineKeyboard;
  if (question.hasOptions && question.options) {
    const buttonRows = question.options.map((option) => [
      InlineKeyboard.text(
        option.text,
        JSON.stringify({
          type: topic,
          questionId: question.id,
          isCorrect: option.isCorrect,
        })
      ),
    ]);
    keyboard = InlineKeyboard.from(buttonRows);
  } else {
    keyboard = new InlineKeyboard().text(
      'Узнать ответ',
      JSON.stringify({
        type: topic,
        questionId: question.id,
      })
    );
  }

  await ctx.reply(question.text, {
    reply_markup: keyboard,
  });
});

bot.on('callback_query:data', async (ctx) => {
  const callbackData = JSON.parse(ctx.callbackQuery.data) as CallbackData;

  if (callbackData.isCorrect === undefined) {
    await ctx.reply(getCorrectAnswer(callbackData.type, callbackData.questionId));
    await ctx.answerCallbackQuery();
    return;
  }

  if (callbackData.isCorrect) {
    await ctx.reply('Верно ✅');
    await ctx.answerCallbackQuery();
    return;
  }

  await ctx.reply(
    `Неверно ❌ Правильный ответ: ${getCorrectAnswer(callbackData.type, callbackData.questionId)}`
  );
  await ctx.answerCallbackQuery();
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});
