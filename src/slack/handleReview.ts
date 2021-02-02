import {getIdByUsername, handleInteraction} from '../slack';
import {getMessage, isUsernameInReviewerCollection, updateMessage} from '../service';
import {Status, ThankYou} from '../types';

export const handleReview = async (action: any, user: any, response_url: any, message: any) => {
  console.log('Review required.');
  if (await isUsernameInReviewerCollection(user.username)) {
    console.log(`User ${user.username} is allowed to review.`);
    const result = await _checkBeforeApproveOrReject(user.username, action.value);
    let responseSection;
    if (result.code === 200) {
      if (action.action_id === 'reviewReject') {
        responseSection = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '_❌ Rejeté._'
          }
        };
        await _reject(user.username, action.value);
      }
    } else {
      responseSection = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: result.error
        }
      };
    }
    await handleInteraction(
      response_url,
      message.text,
      message.blocks,
      responseSection);
  } else {
    throw {
      code: 401,
      error: `👮 ${user.username} n'est pas autorisé à accéder à cette ressource.`
    };
  }
};

const _checkBeforeApproveOrReject = async (username: string, id: string) => {
  try {
    const message = await getMessage(id) as ThankYou;
    switch (message.status) {
      case Status.REJECTED:
        return {
          code: 400,
          error: `⚠️ Déjà *refusé* ❌ par <@${await getIdByUsername(message.reviewedBy!!)}>`,
        };
      default:
        return {
          code: 200,
        };
    }
  } catch (e) {
    return {
      code: 400,
      error: `⚠️ Message ${id} introuvable.`,
    };
  }
};

const _approve = async (username: string, id: string) => {
  const th = await getMessage(id) as ThankYou;
  th.status = Status.APPROVED;
  th.reviewedBy = username;
  await updateMessage(id, th);
  console.log(`Thank you ${id} approved by ${username}.`);
};

const _reject = async (username: string, id: string) => {
  const message = await getMessage(id) as ThankYou;
  message.status = Status.REJECTED;
  message.reviewedBy = username;
  await updateMessage(id, message);
  console.log(`Thank you ${id} rejected by ${username}.`);
};
