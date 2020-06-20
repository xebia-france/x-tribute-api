import {Status, ThankYou} from '../types';
import {thankYouSchema} from '../validation';
import {getReviewers, setMessage} from '../service';
import {getProfile, postMessage} from '../slack';
import {trackNewThankPosted} from '../statistics/statistics';

export const thank = async (thankYou: ThankYou) => {
  _validateThankYou(thankYouSchema, thankYou);

  const th = await setMessage({
    ...thankYou,
    status: Status.DRAFT,
  });

  await trackNewThankPosted(
    thankYou.author.username
  );

  await _askForReview(th);

  return th.id;
};

export const _askForReview = async (thankYou: ThankYou) => {
  const author = await _getUserId(thankYou.author.username);
  const recipient = await _getUserId(thankYou.recipient.username);
  const reviewers = await getReviewers();
  const text = `🚨 _<@${author}> a écrit un merci à <@${recipient}>. Peux-tu le relire ? 🙏_`;
  for (const reviewer of reviewers) {
    await postMessage(
      await _getUserId(reviewer),
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
                text: 'Approuver'
              },
              action_id: 'reviewApprove',
              style: 'primary',
              value: thankYou.id
            },
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

export const _getUserId = async (username: string) =>
  (await getProfile(`${username}@xebia.fr`)).user.id;

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