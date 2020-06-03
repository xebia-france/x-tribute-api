import {getProfile, postMessage} from './slack';

const username = process.env.USERNAME || '';

describe('Slack', () => {

  it.skip('should notify user', async () => {
    await postMessage(
      username,
      `📣 _<@${username}> as a message for you:_
> Well done 👏
> This is awesome!`);
  });

  it.skip('should ask for validation', async () => {
    await postMessage(
      username,
      `🚨 _John Doe write a thank you to Doe John. Validation is pending_`,
      [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🚨 _John Doe write a thank you to Doe John, do you approve?_'
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '>Well done bro\n>This is awesome!\n>Keep going 🚀'
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
              value: 'my-id'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Reject'
              },
              action_id: 'reject',
              style: 'danger',
              value: 'my-id'
            }
          ]
        }
      ]);
  });

  it.skip('should get profile', async () => {
    const {user: {name}} = await getProfile(`${username}@xebia.fr`) as { ok: boolean; user: { name: string } };
    expect(name).toEqual(username);
  });
})
;