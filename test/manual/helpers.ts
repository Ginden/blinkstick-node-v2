import prompts from 'prompts';
import { questionsAsked } from './questions-asked';
import { assert } from 'tsafe';
import { br } from './print';

export const reportIssueUrl = `https://github.com/Ginden/blinkstick-node-v2/issues/new`;

export async function yesOrThrow(question: string, errorMsg: string = 'User did not confirm') {
  const { q } = await prompts({
    type: 'toggle',
    name: 'q',
    message: question,
    initial: Math.random() > 0.5,
    active: 'yes',
    inactive: 'no',
  } as const);

  questionsAsked.push({ question, result: q });

  assert(q, `${errorMsg}. Please report a bug at ${reportIssueUrl}.`);

  br();
}
