import {getThanks} from './getThanks';
import * as service from '../service';
import {getMessagesByAuthor} from '../service';
import {Status} from '../types';
import {AppError} from '../error/AppError';

describe('Get thanks', () => {

  const message1 = {
    text: '',
    author: {
      username: '',
      name: ''
    },
    recipient: {
      username: '',
      name: ''
    },
    status: Status.APPROVED
  };
  const message2 = {
    text: '',
    author: {
      username: '',
      name: ''
    },
    recipient: {
      username: '',
      name: ''
    },
    status: Status.APPROVED
  };

  it('should get thanks if reviewer', async () => {
    // GIVEN
    const isUsernameInReviewerCollection = jest.spyOn(service, 'isUsernameInReviewerCollection');
    isUsernameInReviewerCollection.mockResolvedValue(true);
    const getMessages = jest.spyOn(service, 'getMessages');
    getMessages.mockResolvedValue([message1, message2]);

    // WHEN
    const thanks = await getThanks(null, {userEmail: 'jd@xebia.fr'});

    // THEN
    expect(thanks).toEqual([message1, message2]);

    isUsernameInReviewerCollection.mockRestore();
    getMessages.mockRestore();
  });

  it('should not get thanks if not reviewer', async () => {
    // GIVEN
    const isUsernameInReviewerCollection = jest.spyOn(service, 'isUsernameInReviewerCollection');
    isUsernameInReviewerCollection.mockResolvedValue(false);

    // WHEN
    const error = new AppError(401, 'Unauthorized');
    await expect(
      getThanks(null, {userEmail: 'jd@xebia.fr'})
    ).rejects.toThrow(error);

    // THEN
    isUsernameInReviewerCollection.mockRestore();
  });

  it('should get unauthorized if author and user mismatch', async () => {
    // GIVEN
    const isUsernameInReviewerCollection = jest.spyOn(service, 'isUsernameInReviewerCollection');
    isUsernameInReviewerCollection.mockResolvedValue(true);

    // WHEN
    const error = new AppError(401, 'Unauthorized');
    await expect(
      getThanks({author: 'dj'}, {userEmail: 'jd@xebia.fr'})
    ).rejects.toThrow(error);

    // THEN
    isUsernameInReviewerCollection.mockRestore();
  });

  it('should get messages from author', async () => {
    // GIVEN
    const isUsernameInReviewerCollection = jest.spyOn(service, 'isUsernameInReviewerCollection');
    isUsernameInReviewerCollection.mockResolvedValue(true);
    const getMessagesByAuthor = jest.spyOn(service, 'getMessagesByAuthor');
    getMessagesByAuthor.mockResolvedValue([message1, message2]);

    // WHEN
    const thanks = await getThanks({author: 'jd'}, {userEmail: 'jd@xebia.fr'});

    // THEN
    expect(thanks).toEqual([message1, message2]);

    isUsernameInReviewerCollection.mockRestore();
    getMessagesByAuthor.mockRestore();
  });

  it('should get messages from author with publicissapient.fr', async () => {
    // GIVEN
    const isUsernameInReviewerCollection = jest.spyOn(service, 'isUsernameInReviewerCollection');
    isUsernameInReviewerCollection.mockResolvedValue(true);
    const getMessagesByAuthor = jest.spyOn(service, 'getMessagesByAuthor');
    getMessagesByAuthor.mockResolvedValue([message1, message2]);

    // WHEN
    const thanks = await getThanks({author: 'jd'}, {userEmail: 'jd@publicissapient.fr'});

    // THEN
    expect(thanks).toEqual([message1, message2]);

    isUsernameInReviewerCollection.mockRestore();
    getMessagesByAuthor.mockRestore();
  });

  it('should get messages from recipient', async () => {
    // GIVEN
    const isUsernameInReviewerCollection = jest.spyOn(service, 'isUsernameInReviewerCollection');
    isUsernameInReviewerCollection.mockResolvedValue(true);
    const getMessagesByRecipient = jest.spyOn(service, 'getMessagesByRecipient');
    getMessagesByRecipient.mockResolvedValue([message1, message2]);

    // WHEN
    const thanks = await getThanks({recipient: 'jd'}, {userEmail: 'jd@xebia.fr'});

    // THEN
    expect(thanks).toEqual([message1, message2]);

    isUsernameInReviewerCollection.mockRestore();
    getMessagesByRecipient.mockRestore();
  });

  it('should get unauthorized if recipient and user mismatch', async () => {
    // GIVEN
    const isUsernameInReviewerCollection = jest.spyOn(service, 'isUsernameInReviewerCollection');
    isUsernameInReviewerCollection.mockResolvedValue(true);

    // WHEN
    const error = new AppError(401, 'Unauthorized');
    await expect(
      getThanks({author: 'dj'}, {userEmail: 'jd@xebia.fr'})
    ).rejects.toThrow(error);

    // THEN
    isUsernameInReviewerCollection.mockRestore();
  });

  it('should get messages if query string unknown user is reviewer', async () => {
    // GIVEN
    const isUsernameInReviewerCollection = jest.spyOn(service, 'isUsernameInReviewerCollection');
    isUsernameInReviewerCollection.mockResolvedValue(true);
    const getMessages = jest.spyOn(service, 'getMessages');
    getMessages.mockResolvedValue([message1, message2]);

    // WHEN
    const thanks = await getThanks({someQueryParam: 'someQueryParamValue'}, {userEmail: 'jd@xebia.fr'});

    // THEN
    expect(thanks).toEqual([message1, message2]);

    isUsernameInReviewerCollection.mockRestore();
    getMessages.mockRestore();
  });
});
