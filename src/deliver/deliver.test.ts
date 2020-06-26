import {deliverPastThanks} from './deliver';
import * as service from '../service';
import {getApprovedMessages} from '../service';
import * as statistics from '../statistics/statistics';
import {Status} from '../types';

describe('Deliver', () => {
  it('should deliver message', async () => {
    // GIVEN
    const getApprovedMessages = jest.spyOn(service, 'getApprovedMessages');
    const message = {
      id: 'id',
      recipient: {
        username: 'blacroix',
        name: 'john'
      },
      author: {
        username: 'tsimonnet',
        name: 'bob'
      },
      status: Status.APPROVED,
      text: 'hello, world!'
    };
    getApprovedMessages.mockResolvedValue([message]);
    const updateMessage = jest.spyOn(service, 'updateMessage');
    updateMessage.mockResolvedValue({} as any);
    const trackNewThankDelivered = jest.spyOn(statistics, 'trackNewThankDelivered');
    trackNewThankDelivered.mockResolvedValue();
    // WHEN
    const count = await deliverPastThanks();
    // THEN
    expect(updateMessage).toHaveBeenCalledWith(message.id, {...message, status: Status.DELIVERED});
    expect(trackNewThankDelivered).toHaveBeenCalledWith(message.recipient.username);
    // AFTER
    getApprovedMessages.mockRestore();
    updateMessage.mockRestore();
    trackNewThankDelivered.mockRestore();
  });
});