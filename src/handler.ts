import {APIGatewayProxyHandler} from 'aws-lambda';
import 'source-map-support/register';
import {thank} from './thank/thank';
import {getThanks} from './getThanks/getThanks';
import {handleSlackRequest} from './slack/handler';
import {deliverPastThanks} from './deliver/deliver';
import {remindEveryone} from './reminder/remind';
import {shareStatistics} from './statistics/statistics';
import {fetchUsers} from './users/users';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

export const handlerThank: APIGatewayProxyHandler = async (event, _context) => {
  if (event.body) {
    try {
      await thank(JSON.parse(event.body));
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
  {queryStringParameters, requestContext: {authorizer}},
  _context
) => {
  if (authorizer && authorizer.userEmail) {
    try {
      const messages = await getThanks(queryStringParameters, authorizer);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(messages),
      };
    } catch (error) {
      return {
        statusCode: error.code,
        headers,
        body: error,
      };
    }
  }
  return {
    statusCode: 401,
    body: JSON.stringify(
      {error: 'Unauthorized'}
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

export const handlerStatistics: APIGatewayProxyHandler = async (event, _context) => {
  const statistics = await shareStatistics();
  return {
    statusCode: 200,
    body: JSON.stringify(statistics)
  };
};

export const handlerUsers: APIGatewayProxyHandler = async ({
                                                             requestContext: {authorizer}
                                                           }, _context) => {
  if (authorizer && authorizer.userEmail) {
    const users = await fetchUsers();
    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  }
  return {
    statusCode: 401,
    body: JSON.stringify(
      {error: 'Unauthorized'}
    )
  };
};
