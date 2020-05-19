import {Status} from "./types";
import {getMessages, isUsernameKnown, setMessage, updateMessage} from "./service";
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

export const getThanks = async (username: string) => {
  if (await isReviewerAuthorized(username)) {
    const messages = await getMessages();
    return {
      statusCode: 200,
      body: JSON.stringify(messages),
    };
  }
  return {
    statusCode: 401,
    body: JSON.stringify({
      error: `${username} isn't allowed to access this resource.`
    }),
  }
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

export const deliverThank = async (body: string) => {
  const {id} = JSON.parse(body);
  // TODO: get thank by id on firestore, get recipient slack username by email, send notification, update status
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Thank you ${id} has been delivered.`
    })
  }
}

const isReviewerAuthorized = async (username) =>
  await isUsernameKnown(username)

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