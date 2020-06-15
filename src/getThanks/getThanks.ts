import {getMessages, isUsernameInReviewerCollection} from '../service';

export const getThanks = async (username: string) => {
  if (await isUsernameInReviewerCollection(username)) {
    return await getMessages();
  }
  throw {
    code: 401,
    error: `👮 ${username} n'est pas autorisé à accéder à cette ressource.`
  };
};