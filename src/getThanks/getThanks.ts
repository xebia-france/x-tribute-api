import {getMessages, getMessagesByAuthor, getMessagesByRecipient, isUsernameInReviewerCollection} from '../service';
import {AppError} from '../error/AppError';

export const getThanks = async (
  qs: { [k: string]: string } | null,
  authorizer: { [k: string]: any } | undefined | null
) => {
  if (authorizer && authorizer.userEmail) {
    const emailParts = authorizer.userEmail.split('@xebia.fr');
    if (emailParts.length > 0) {
      const username = emailParts[0];
      if (qs && (qs.recipient || qs.author)) {
        if (qs.recipient === username) {
          return await getThanksByRecipient(qs.recipient);
        }
        if (qs.author === username) {
          return await getThanksByAuthor(qs.author);
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
