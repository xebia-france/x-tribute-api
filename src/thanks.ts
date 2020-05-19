import {Status} from "./types";
import {getMessages, setMessage, updateMessage} from "./service";
import {thankYouSchema, thankYouWithIdSchema} from "./validation";

export const thank = async (body: string) => {
  const thankYou = JSON.parse(body);
  const error = validateThankYou(thankYouSchema, thankYou);
  if (error) {
    return error;
  }
  const doc = await setMessage({
    ...thankYou,
    status: Status.DRAFT,
  });
  return {
    statusCode: 201,
    body: JSON.stringify({
      id: doc.id,
    }),
  };
};

export const getThanks = async () => {
  const messages = await getMessages();
  return {
    statusCode: 200,
    body: JSON.stringify(messages),
  };
};

export const updateThank = async (body: string) => {
  const thankYou = JSON.parse(body);
  const error = validateThankYou(thankYouWithIdSchema, thankYou);
  if (error) {
    return error;
  }
  const {id, ...thankYouWithoutId} = thankYou;
  await updateMessage(id, thankYouWithoutId);
  return {
    statusCode: 200,
    body: JSON.stringify({id}),
  };
}

const validateThankYou = (schema, thankYou) => {
  const {error} = schema.validate(thankYou);
  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error.details,
      }),
    };
  }
  return;
}