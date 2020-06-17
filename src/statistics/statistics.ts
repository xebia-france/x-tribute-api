import {aggregateStatistic, incrementStatistic} from '../service';

const PEOPLE_GIVING_THANKS_KEY = 'people-giving-thanks';
const PEOPLE_RECEIVING_THANKS_KEY = 'people-receiving-thanks';
const GIVEN_THANKS_KEY = 'given-thanks';

export const shareStatistics = async () => {
};

export const trackNewThankPosted = async (author: string) => {
  const d = new Date();
  await _incrementGivenThank(d.getFullYear(), d.getMonth());
  await _aggregatePeopleGivingThank(d.getFullYear(), d.getMonth(), author);
};

export const trackNewThankDelivered = async (recipient: string) => {
  const d = new Date();
  await _aggregatePeopleReceivingThank(d.getFullYear(), d.getMonth(), recipient);
};

const _aggregatePeopleGivingThank = async (year: number, month: number, username: string) => {
  await aggregateStatistic('0', PEOPLE_GIVING_THANKS_KEY, username);
  await aggregateStatistic(`${year}`, PEOPLE_GIVING_THANKS_KEY, username);
  await aggregateStatistic(`${year}${month}`, PEOPLE_GIVING_THANKS_KEY, username);
};

const _aggregatePeopleReceivingThank = async (year: number, month: number, username: string) => {
  await aggregateStatistic('0', PEOPLE_RECEIVING_THANKS_KEY, username);
  await aggregateStatistic(`${year}`, PEOPLE_RECEIVING_THANKS_KEY, username);
  await aggregateStatistic(`${year}${month}`, PEOPLE_RECEIVING_THANKS_KEY, username);
};

const _incrementGivenThank = async (year: number, month: number) => {
  await incrementStatistic('0', GIVEN_THANKS_KEY);
  await incrementStatistic(`${year}`, GIVEN_THANKS_KEY);
  await incrementStatistic(`${year}${month}`, GIVEN_THANKS_KEY);
};
