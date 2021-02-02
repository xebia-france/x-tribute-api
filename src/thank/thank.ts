import {Status, ThankYou} from '../types';
import {thankYouSchema} from '../validation';
import {getReviewers, setMessage} from '../service';
import {getIdByUsername, postMessage} from '../slack';
import {trackNewThankPosted} from '../statistics/statistics';

export const thank = async (thankYou: ThankYou) => {
  _validateThankYou(thankYouSchema, thankYou);

  const th = await setMessage({
    ...thankYou,
    status: Status.APPROVED,
  });

  await trackNewThankPosted(
    thankYou.author.username
  );

  await _askForReview(th);

  return th.id;
};

export const _askForReview = async (thankYou: ThankYou) => {
  const author = await getIdByUsername(thankYou.author.username);
  const recipient = await getIdByUsername(thankYou.recipient.username);
  const reviewers = await getReviewers();
  const text = `🚨 _<@${author}> a écrit un merci à <@${recipient}> :_`;
  for (const reviewer of reviewers) {
    await postMessage(
      await getIdByUsername(reviewer),
      text,
      [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `>${thankYou.text.replace(/\n/g, '\n>')}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Rejeter'
              },
              action_id: 'reviewReject',
              style: 'danger',
              value: thankYou.id
            }
          ]
        }
      ]);
  }
};

export const _validateThankYou = (schema, thankYou) => {
  const {error} = schema.validate(thankYou);
  if (error) {
    throw {
      code: 400,
      error: error.details
    };
  }
  return;
};
