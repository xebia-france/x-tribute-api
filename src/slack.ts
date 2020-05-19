import {WebClient} from '@slack/web-api';

const client = new WebClient(process.env.SLACK_TOKEN);

export const postMessage = (username: string, text: string) =>
  client.chat.postMessage({
    channel: `@${username}`,
    text,
    as_user: true,
    link_names: true,
  });

export const getProfile = (email: string) =>
  client.users.lookupByEmail({
    email,
  });