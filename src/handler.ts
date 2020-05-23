import {APIGatewayProxyHandler} from 'aws-lambda';
import 'source-map-support/register';
import {approve, checkBeforeApproveOrReject, getThanks, isSlackRequestAuthorized, reject, thank} from './thanks';
import * as querystring from 'querystring';
import {handleInteraction} from './slack';

export const handlerThank: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  if (event.body) {
    return thank(JSON.parse(event.body));
  }
  return {
    statusCode: 400,
    body: JSON.stringify({error: 'Body is required, cannot be empty.'})
  };
};

export const handlerGetThanks: APIGatewayProxyHandler = async (
  {requestContext: {authorizer}},
  _context
) => {
  if (authorizer) {
    return getThanks(authorizer.userEmail.split('@xebia.fr')[0]);
  }
  return {
    statusCode: 401,
    body: JSON.stringify({error: 'Cannot read required authorizer from event.'})
  };
};

export const handlerSlack: APIGatewayProxyHandler = async (event, _context) => {
  if (event.body) {
    if (isSlackRequestAuthorized(
      event.headers['X-Slack-Request-Timestamp'],
      event.body,
      event.headers['X-Slack-Signature'],
      process.env.SIGNING_SECRET || ''
    )) {
      const {
        actions,
        user,
        response_url,
        message
      } = JSON.parse(querystring.parse(event.body).payload as string);
      const result = await checkBeforeApproveOrReject(user.username, actions[0].value);
      let responseSection;
      if (result.code === 200) {
        if (actions[0].action_id === 'approve') {
          responseSection = {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '_✅ You approved it._'
            }
          };
          await approve(user.username, actions[0].value);
        } else if (actions[0].action_id === 'reject') {
          responseSection = {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '_❌ You rejected it._'
            }
          };
          await reject(user.username, actions[0].value);
        }
      } else {
        responseSection = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: result.error
          }
        };
      }
      await handleInteraction(
        response_url,
        message.text,
        message.blocks,
        responseSection);
    } else {
      return {
        statusCode: 401,
        body: 'Cannot verify request.',
      };
    }
  }
  return {
    statusCode: 200,
    body: '',
  };
};
