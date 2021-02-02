import {WebClient} from '@slack/web-api';
import {Block, KnownBlock} from '@slack/types';
import axios from 'axios';
import {SlackProfile} from './types';

const client = new WebClient(process.env.SLACK_TOKEN);

export const postMessage = (
  channel: string,
  text: string,
  blocks?: (KnownBlock | Block)[]
) => {
  if (process.env.IS_PROD === 'true') {
    return client.chat.postMessage({
      channel,
      text,
      blocks,
      as_user: true,
    });
  } else {
    console.info(`postMessage ${channel} ${text} ${blocks ? JSON.stringify(blocks) : ''}`);
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

export const fetchUsers = async () =>
  await client.paginate(
    'users.list',
    {}, (_ => {
    }),
    ((accumulator, page) => {
      if (!accumulator) {
        accumulator = [];
      }

      const isUser = u =>
        u.deleted === false &&
        u.is_bot === false &&
        u.is_app_user === false;

      // @ts-ignore
      accumulator.push(...page.members.filter(isUser));

      return accumulator;
    }));

export const getIdByUsername = async (username: string) => {
  let profile;
  try {
    profile = await getProfile(`${username}@publicissapient.fr`);
  } catch (ignoreUnknownPsf) {
    try {
      profile = await getProfile(`${username}@publicissapient.com`);
    } catch (ignoreUnknownPs) {
      if (username.includes('.')) {
        try {
          profile = await getProfile(getPsfUsername(username));
        } catch (e) {
          await warnSavAboutUnknownAuthor(username);
        }
      } else {
        await warnSavAboutUnknownAuthor(username);
      }
    }
  }
  return profile.user.id;
};

export const getPsfUsername = (username: string) => {
  const firstnameLastname = username.split('.');
  return `${firstnameLastname[0].substring(0, 1)}${firstnameLastname[1]}@publicissapient.fr`;
};

export const warnSavAboutUnknownAuthor = async (username: string) =>
  await postMessage('#cicero-error', '', [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:warning: Unknown user: ${username}`
      }
    }
  ]);
