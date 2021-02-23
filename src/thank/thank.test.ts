import {_askForReview, _validateThankYou} from './thank';
import {thankYouSchema} from '../validation';
import * as slack from '../slack';
import {getIdByUsername} from '../slack';
import * as service from '../service';
import {Block, KnownBlock} from '@slack/types';
import {Status} from '../types';

describe('thank', () => {

  it('should throw error if thank is not well formatted', () => {
    // GIVEN
    try {
      // WHEN
      _validateThankYou(thankYouSchema, {});
    } catch (e) {
      // THEN
      expect(e).toEqual({
        code: 400,
        error: [{
          context: {key: 'text', label: 'text'},
          message: '"text" is required',
          path: ['text'],
          type: 'any.required'
        }]
      });
    }
  });

  it('should get user', async () => {
    // GIVEN
    const getProfile = jest.spyOn(slack, 'getProfile');
    getProfile.mockImplementation((email: string) => Promise.resolve({ok: true, user: {id: email, name: email}}));
    // WHEN
    const user = await getIdByUsername('john');
    // THEN
    expect(user).toEqual('john@publicissapient.fr');
    // AFTER
    getProfile.mockRestore();
  });

  it('should ask for review', async () => {
    // GIVEN
    const getProfile = jest.spyOn(slack, 'getProfile');
    getProfile.mockImplementation((email: string) => Promise.resolve({ok: true, user: {id: email, name: email}}));

    const postMessage = jest.spyOn(slack, 'postMessage');
    postMessage.mockImplementation((username: string, text: string, blocks?: (KnownBlock | Block)[]) => Promise.resolve({ok: true}));

    const getReviewers = jest.spyOn(service, 'getReviewers');
    getReviewers.mockImplementation(() => Promise.resolve(['orange']));
    // WHEN
    await _askForReview({
      id: '0',
      text: 'hello, world!',
      author: {
        name: 'tomate',
        username: 'tomate'
      },
      recipient: {
        name: 'orange',
        username: 'orange'
      },
      status: Status.DRAFT
    });
    // THEN
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith(
      'orange@publicissapient.fr',
      '🚨 _<@tomate@publicissapient.fr> a écrit un merci à <@orange@publicissapient.fr> :_',
      [
        {
          text: {
            text: '🚨 _<@tomate@publicissapient.fr> a écrit un merci à <@orange@publicissapient.fr> :_',
            type: 'mrkdwn'
          },
          type: 'section'
        },
        {
          text: {
            text: '>hello, world!',
            type: 'mrkdwn'
          },
          type: 'section'
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Rejeter'
              },
              action_id: 'reviewReject',
              style: 'danger',
              value: '0'
            }
          ]
        }
      ]
    );
    // AFTER
    jest.clearAllMocks();
  });
});
