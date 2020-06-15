import * as HmacSHA256 from 'crypto-js/hmac-sha256';
import * as Hex from 'crypto-js/enc-hex';
import * as querystring from 'querystring';
import {handleReview} from './handleReview';
import {handleRemind} from './handleRemind';

export const handleSlackRequest = async (event) => {
  if (_isSlackRequestAuthorized(
    event.headers['X-Slack-Request-Timestamp'],
    event.body,
    event.headers['X-Slack-Signature'],
    process.env.SIGNING_SECRET || ''
  )) {
    console.log('Request is valid.');
    const {
      actions,
      user,
      response_url,
      message
    } = JSON.parse(querystring.parse(event.body).payload as string);
    const action = actions[0].action_id;
    if (action.startsWith('review')) {
      await handleReview(actions[0], user, response_url, message);
    } else if (action.startsWith('remind')) {
      await handleRemind(actions[0], user, response_url, message);
    }
  } else {
    throw {
      code: 401,
      error: '👮‍♀️ Impossible de vérifier la signature de la requête.',
    };
  }
};

export const _isSlackRequestAuthorized = (
  timestamp: string,
  body: string,
  signature: string,
  secret: string,
) => {
  const signBaseStr = `v0:${timestamp}:${body}`;
  const hash = HmacSHA256(signBaseStr, secret);
  const hex = Hex.stringify(hash);
  const mySign = `v0=${hex}`;
  return mySign === signature;
};