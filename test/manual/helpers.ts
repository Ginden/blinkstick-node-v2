import prompts from 'prompts';
import { questionsAsked } from './questions-asked';
import { assert } from 'tsafe';
import { br } from './print';

export const reportIssueUrl = `https://github.com/Ginden/blinkstick-node-v2/issues/new`;

export async function yesOrThrow(
  question: string,
  errorMsg: string = 'User did not confirm',
  initial: boolean = Math.random() > 0.5,
): Promise<void> {
  const { q } = await prompts({
    type: 'toggle',
    name: 'q',
    message: question,
    initial,
    active: 'yes',
    inactive: 'no',
  } as const);

  questionsAsked.push({ question, result: q });

  assert(q, `${errorMsg}. Please report a bug at ${reportIssueUrl}.`);

  br();
}

export function settle<Base, Output = Base>(
  v: Promise<Base> | Base,
  transform: (v: Base) => Output | Promise<Output> = (x) => x as any as Output,
): Promise<PromiseSettledResult<Output>> {
  return Promise.resolve(v)
    .then(transform)
    .then(
      (v) =>
        ({
          status: 'fulfilled',
          value: v,
        }) as const,
    )
    .catch((e) => ({ status: 'rejected', reason: e }) as const);
}
