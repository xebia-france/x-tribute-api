import {Status, ThankYou} from '../types';
import {getUsernameByEmailPrefix, postMessage} from '../slack';
import {getApprovedMessages, updateMessage} from '../service';

export const deliverPastThanks = async () => {
  const messages = await getApprovedMessages();
  for (let message of messages) {
    if (message.id) {
      await _deliverThank(message);
      await updateMessage(message.id, {
        ...message,
        status: Status.DELIVERED
      });
    }
  }
  return messages.length;
};

const _deliverThank = async (thankYou: ThankYou) => {
  const author = await getUsernameByEmailPrefix(thankYou.author.username);
  const text = `_📣 <@${author}> souhaite te dire merci :_`;
  return await postMessage(
    await getUsernameByEmailPrefix(thankYou.recipient.username),
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
