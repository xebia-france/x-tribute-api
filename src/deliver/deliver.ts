import {Status, ThankYou} from '../types';
import {getIdByUsername, postMessage} from '../slack';
import {getApprovedMessages, updateMessage} from '../service';
import {trackNewThankDelivered} from '../statistics/statistics';

export const deliverPastThanks = async () => {
  const messages = await getApprovedMessages();
  for (let message of messages) {
    if (message.id) {
      try {
        await _deliverThank(message);
        await updateMessage(message.id, {
          ...message,
          status: Status.DELIVERED
        });
        await trackNewThankDelivered(message.recipient.username);
        console.log(`Message delivered to ${message.recipient.username}`);
      } catch (e) {
        await updateMessage(message.id, {
          ...message,
          status: Status.DELIVERY_ERROR
        });
        console.error(`Cannot deliver message to ${message.recipient.username}`);
      }
    }
  }
  return messages.length;
};

const _deliverThank = async (thankYou: ThankYou) => {
  const author = await getIdByUsername(thankYou.author.username);
  const text = `_📣 <@${author}> souhaite te dire merci :_`;
  return await postMessage(
    await getIdByUsername(thankYou.recipient.username),
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
