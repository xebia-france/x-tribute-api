import {APIGatewayProxyHandler} from 'aws-lambda';
import 'source-map-support/register';
import {getThanks, thank, updateThank} from './thanks';

export const handlerThank: APIGatewayProxyHandler = async (
  event,
  _context
) => thank(event.body ? event.body : "{}");

export const handlerGetThanks: APIGatewayProxyHandler = async (
  {requestContext: {authorizer}},
  _context
) => {
  if (authorizer) {
    return getThanks(authorizer.userEmail);
  }
  return {
    statusCode: 401,
    body: 'Cannot read required authorizer from event.'
  }
};

export const handlerUpdateThank: APIGatewayProxyHandler = async (
  event,
  _context
) => updateThank(event.body ? event.body : "{}");
