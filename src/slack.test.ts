import {getProfile, postMessage} from "./slack";

const username = process.env.USERNAME || '';

describe('Slack', () => {
  it.skip('should notify user', async () => {
    await postMessage(
      username,
      `@${username} as a message for you:
> Well done 👏
> This is awesome!`
    );
  });
  it.skip('should get profile', async () => {
    const {user: {name}} = await getProfile(`${username}@xebia.fr`) as { ok: boolean; user: { name: string } };
    expect(name).toEqual(username);
  });
});