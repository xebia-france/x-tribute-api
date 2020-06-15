import {APIGatewayProxyHandler} from 'aws-lambda';
import 'source-map-support/register';
import {thank} from './thank/thank';
import {getThanks} from './getThanks/getThanks';
import {handleSlackRequest} from './slack/handler';
import {deliverPastThanks} from './deliver/deliver';
import {remindEveryone} from './reminder/remind';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

export const handlerThank: APIGatewayProxyHandler = async (event, _context) => {
  if (event.body) {
    try {
      const id = await thank(JSON.parse(event.body));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Thank created.'
        })
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(error)
      };
    }
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
    try {
      const messages = await getThanks(authorizer.userEmail.split('@xebia.fr')[0]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(messages),
      };
    } catch (error) {
      return {
        statusCode: error.code,
        headers,
        body: JSON.stringify(error),
      };
    }
  }
  return {
    statusCode: 401,
    body: JSON.stringify(
      {error: 'Cannot read required authorizer from event.'}
    )
  };
};

export const handlerSlack: APIGatewayProxyHandler = async (event, _context) => {
  if (event.body) {
    try {
      await handleSlackRequest(event);
      return {
        statusCode: 200,
        body: ''
      };
    } catch (e) {
      return {
        statusCode: e.code,
        body: JSON.stringify(e)
      };
    }
  }
  return {
    statusCode: 200,
    body: '',
  };
};

export const handlerDeliverPastThankYou: APIGatewayProxyHandler = async (event, _context) => {
  const count = await deliverPastThanks();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `${count} thank(s) delivered.`
    })
  };
};

export const handlerReminder: APIGatewayProxyHandler = async (event, _context) => {
  const count = await remindEveryone();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `${count} reminder(s) sent.`
    })
  };
};