import {fetchUsers, postMessage} from '../slack';
import {getUnwantedReminderUsers} from '../service';
import {reminder} from '../wording';

export const remindEveryone = async () => {
  const users = await fetchUsers();
  const noReminderUsers = await getUnwantedReminderUsers();
  console.log(`Ignore reminder for ${noReminderUsers}`);
  const toRemindUsers = users.filter(u => noReminderUsers.indexOf(u.id) === -1);
  const link = 'https://my.xebia.fr/thankyou';
  for (let user of toRemindUsers) {
    console.log(`Remind ${user.id}`);
    const message = reminder(user.id, link);
    try {
      await postMessage(
        user.id,
        message,
        [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Remercier'
                },
                style: 'primary',
                url: link,
                action_id: 'remindGo'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Ne plus y être invité(e)'
                },
                style: 'danger',
                action_id: 'remindStop',
                confirm: {
                  text: {
                    text: 'Si tu souhaites être invité(e) à remercier des Sapients à nouveau tu peux en parler à ton manager.',
                    type: 'mrkdwn'
                  },
                  title: {
                    text: 'Es-tu sûr(e) ?',
                    type: 'plain_text'
                  },
                  confirm: {
                    text: 'Je suis sûr(e)',
                    type: 'plain_text'
                  },
                  deny: {
                    text: 'Je ne suis pas sûr(e)',
                    type: 'plain_text'
                  }
                }
              }
            ]
          }
        ]);
    } catch (e) {
      console.error(`Cannot remind ${user.id} ${e}`);
    }
  }
  return toRemindUsers.length;
};