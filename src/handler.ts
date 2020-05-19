import {APIGatewayProxyHandler} from 'aws-lambda';
import 'source-map-support/register';
import {getThanks, thank, updateThank} from "./thanks";

export const handlerThank: APIGatewayProxyHandler = async (
  event,
  _context
) => thank(event.body);

export const handlerGetThanks: APIGatewayProxyHandler = async (
  _,
  _context
) => getThanks();

export const handlerUpdateThank: APIGatewayProxyHandler = async (
  event,
  _context
) => updateThank(event.body);
