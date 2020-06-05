import {Status, ThankYou} from './types';
import {getMessage, getMessages, getReviewers, isUsernameKnown, setMessage, updateMessage} from './service';
import {thankYouSchema} from './validation';
import {getProfile, postMessage} from './slack';
import * as HmacSHA256 from 'crypto-js/hmac-sha256';
import * as Hex from 'crypto-js/enc-hex';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

export const thank = async (thankYou: ThankYou) => {
  const error = validateThankYou(thankYouSchema, thankYou);

  if (error) {
    return error;
  }

  const th = await setMessage({
    ...thankYou,
    status: Status.DRAFT,
  });

  await askForReview(th);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      id: th.id,
    }),
  };
};

export const getThanks = async (username: string) => {
  if (await isReviewerAuthorized(username)) {
    const messages = await getMessages();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(messages),
    };
  }
  return {
    statusCode: 401,
    headers,
    body: JSON.stringify({
      error: `${username} isn't allowed to access this resource.`
    }),
  };
};

export const checkBeforeApproveOrReject = async (username: string, id: string) => {
  if (await isReviewerAuthorized(username)) {
    try {
      const message = await getMessage(id) as ThankYou;
      switch (message.status) {
        case Status.APPROVED:
          return {
            code: 400,
            error: `⚠️ Already *approved* ✅ by <@${await getUser(message.reviewedBy!!)}>`,
          };
        case Status.REJECTED:
          return {
            code: 400,
            error: `⚠️ Already *rejected* ❌ by <@${await getUser(message.reviewedBy!!)}>`,
          };
        default:
          return {
            code: 200,
          };
      }
    } catch (e) {
      return {
        code: 400,
        error: `⚠️ Cannot find thank you ${id} 🤷‍♂️`,
      };
    }
  }
  return {
    code: 401,
    error: `👮‍♀️ <@${await getUser(username)}> isn't allowed to access this resource.`
  };
};

export const approve = async (username: string, id: string) => {
  if (await isReviewerAuthorized(username)) {
    try {
      const th = await getMessage(id) as ThankYou;
      th.status = Status.APPROVED;
      th.reviewedBy = username;
      await updateMessage(id, th);
      await deliverThank(th);
    } catch (e) {
      return {
        code: 400,
        error: `Cannot find thank you ${id}`,
      };
    }
  }
  return {
    code: 401,
    error: `👮‍♀️ <@${await getUser(username)}> isn't allowed to access this resource.`
  };
};

export const reject = async (username: string, id: string) => {
  if (await isReviewerAuthorized(username)) {
    try {
      const message = await getMessage(id) as ThankYou;
      message.status = Status.REJECTED;
      message.reviewedBy = username;
      await updateMessage(id, message);
    } catch (e) {
      return {
        code: 400,
        error: `Cannot find thank you ${id}`,
      };
    }
  }
  return {
    code: 401,
    error: `👮‍♀️ <@${await getUser(username)}> isn't allowed to access this resource.`
  };
};

export const isSlackRequestAuthorized = (
  timestamp: string,
  body: string,
  signature: string,
  secret: string,
) => {
  const signBaseStr = `v0:${timestamp}:${body}`;
  const hash = HmacSHA256(signBaseStr, secret);
  const hex = Hex.stringify(hash);
  const mySign = `v0=${hex}`;
  return mySign === signature;
};

const deliverThank = async (thankYou: ThankYou) => {
  const author = await getUser(thankYou.author.username);
  const text = `_📣 <@${author}> has a thank to say to you:_`;
  await postMessage(
    (await getProfile(`${thankYou.recipient.username}@xebia.fr`)).user.name,
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
      }
    ]
  );
};

const askForReview = async (thankYou: ThankYou) => {
  const author = await getUser(thankYou.author.username);
  const recipient = await getUser(thankYou.recipient.username);
  const reviewers = await getReviewers();
  const text = `🚨 _<@${author}> wrote a thank you to <@${recipient}>. Could you review it?_`;
  for (const reviewer of reviewers) {
    await postMessage(
      reviewer,
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
                text: 'Approve'
              },
              action_id: 'approve',
              style: 'primary',
              value: thankYou.id
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Reject'
              },
              action_id: 'reject',
              style: 'danger',
              value: thankYou.id
            }
          ]
        }
      ]);
  }
};

const getUser = async (username: string) =>
  (await getProfile(`${username}@xebia.fr`)).user.name;

const isReviewerAuthorized = async (username) =>
  await isUsernameKnown(username);

const validateThankYou = (schema, thankYou) => {
  const {error} = schema.validate(thankYou);
  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error.details,
      }),
    };
  }
  return;
};