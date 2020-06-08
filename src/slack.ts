import {WebClient} from '@slack/web-api';
import {Block, KnownBlock} from '@slack/types';
import axios from 'axios';
import {SlackProfile} from './types';

const client = new WebClient(process.env.SLACK_TOKEN);

export const postMessage = (
  username: string,
  text: string,
  blocks?: (KnownBlock | Block)[]
) => {
  if (process.env.IS_PROD) {
    return client.chat.postMessage({
      channel: `@${username}`,
      text,
      blocks,
      as_user: true,
    });
  } else {
    console.info(`postMessage ${username} ${text} ${blocks ? JSON.stringify(blocks) : ''}`);
  }
};

export const getProfile = async (email: string): Promise<SlackProfile> =>
  (await client.users.lookupByEmail({
    email,
  })) as SlackProfile;

export const handleInteraction = async (
  responseUrl: string,
  text: string,
  blocks?: (KnownBlock | Block)[],
  section?: KnownBlock | Block) => {
  await axios.post(responseUrl, {
    replace_original: true,
    text: text,
    blocks: [
      ...(blocks ? blocks.filter(b => b.type !== 'actions') : []),
      ...(section ? [section] : []),
    ],
  });
};