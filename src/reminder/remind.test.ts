import {remindEveryone} from './remind';
import * as slack from '../slack';
import * as service from '../service';

describe('Reminder', () => {

  it('should remind everyone', async () => {
    // GIVEN
    const postMessage = jest.spyOn(slack, 'postMessage');
    postMessage.mockImplementation();

    const fetchUsers = jest.spyOn(slack, 'fetchUsers');
    fetchUsers.mockImplementation(() => Promise.resolve([
      {id: 'to', name: 'tomate'},
      {id: 'ap', name: 'apple'}
    ]));

    const getUnwantedReminderUsers = jest.spyOn(service, 'getUnwantedReminderUsers');
    getUnwantedReminderUsers.mockImplementation(() => Promise.resolve(['ap']));

    // WHEN
    await remindEveryone();

    // THEN
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith('to', 'Bonjour <@to> ! Si tu souhaites prendre quelques minutes pour remercier les Sapients qui t\'ont aidé(e)s ces dernières semaines, <https://home.publicissapient.fr/cicero|home.publicissapient.fr> est à ta disposition.', [{
      'text': {
        'text': 'Bonjour <@to> ! Si tu souhaites prendre quelques minutes pour remercier les Sapients qui t\'ont aidé(e)s ces dernières semaines, <https://home.publicissapient.fr/cicero|home.publicissapient.fr> est à ta disposition.',
        'type': 'mrkdwn'
      }, 'type': 'section'
    }, {
      'elements': [{
        'action_id': 'remindGo',
        'style': 'primary',
        'text': {'text': 'Remercier', 'type': 'plain_text'},
        'type': 'button',
        'url': 'https://home.publicissapient.fr/cicero'
      }, {
        'action_id': 'remindStop',
        'confirm': {
          'confirm': {'text': 'Je suis sûr(e)', 'type': 'plain_text'},
          'deny': {'text': 'Je ne suis pas sûr(e)', 'type': 'plain_text'},
          'text': {
            'text': 'Si tu souhaites être invité(e) à remercier des Sapients à nouveau tu peux en parler à ton manager.',
            'type': 'mrkdwn'
          },
          'title': {'text': 'Es-tu sûr(e) ?', 'type': 'plain_text'}
        },
        'style': 'danger',
        'text': {'text': 'Ne plus y être invité(e)', 'type': 'plain_text'},
        'type': 'button',
      }], 'type': 'actions'
    }]);

    // AFTER
    fetchUsers.mockRestore();
    getUnwantedReminderUsers.mockRestore();
  });
});
