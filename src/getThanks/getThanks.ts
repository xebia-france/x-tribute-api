import {getMessages, getMessagesByAuthor, getMessagesByRecipient, isUsernameInReviewerCollection} from '../service';
import {AppError} from '../error/AppError';

export const getThanks = async (
  qs: { [k: string]: string } | null,
  authorizer: { [k: string]: any } | undefined | null
) => {
  if (authorizer && authorizer.userEmail) {
    let splitKey = '@publicissapient.fr';
    if (authorizer.userEmail.endsWith('@publicissapient.com')) {
      splitKey = '@publicissapient.com';
    }
    const emailParts = authorizer.userEmail.split(splitKey);
    if (emailParts.length > 0) {
      const username = emailParts[0];
      if (qs && (qs.recipient || qs.author)) {
        if (qs.recipient === authorizer.userEmail) {
          return await getThanksByRecipient(username);
        }
        if (qs.author === authorizer.userEmail) {
          return await getThanksByAuthor(username);
        }
      } else if (await isUsernameInReviewerCollection(username)) {
        return await getMessages();
      }
    }
  }
  throw new AppError(401, 'Unauthorized');
};

export const getThanksByAuthor = async (username: string) =>
  await getMessagesByAuthor(username);

export const getThanksByRecipient = async (username: string) =>
  await getMessagesByRecipient(username);
