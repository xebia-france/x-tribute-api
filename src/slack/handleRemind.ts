import {handleInteraction} from '../slack';
import {setUnwantedReminderUser} from '../service';

export const handleRemind = async (action: any, user: any, response_url: any, message: any) => {
  console.log('Remind actions.');
  let responseSection;
  if (action.action_id === 'remindGo') {
    console.log(`User ${user.username} wants to thank people.`);
    responseSection = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_Merci 🌻_'
      }
    };
  } else if (action.action_id === 'remindStop') {
    responseSection = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_À bientôt_'
      }
    };
    await _stopReminder(user);
  }
  if (responseSection) {
    await handleInteraction(
      response_url,
      message.text,
      message.blocks,
      responseSection);
  }
};

async function _stopReminder(user: any) {
  await setUnwantedReminderUser(user.id, user.username);
  console.log(`User ${user.username} does not want to be reminded anymore.`);
}
