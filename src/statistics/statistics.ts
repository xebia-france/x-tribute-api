import {aggregateStatistic, getStatistics, incrementStatistic} from '../service';
import {postMessage} from '../slack';
import {SectionBlock} from '@slack/web-api';

const PEOPLE_GIVING_THANKS_KEY = 'people-giving-thanks';
const PEOPLE_RECEIVING_THANKS_KEY = 'people-receiving-thanks';
const GIVEN_THANKS_KEY = 'given-thanks';

export const shareStatistics = async () => {
  const fromBeginning = await getStatistics('0');
  const today = new Date();
  const previousPeriod = _getPreviousPeriod(today);
  const previousPeriodStats = await getStatistics(`${previousPeriod.getFullYear()}${previousPeriod.getMonth()}`);
  const lastPeriodStats = await getStatistics(`${today.getFullYear()}${today.getMonth()}`);

  const noStatisticsSection = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '⚠️ Pas encore de statistiques sur la période.'
    }
  } as SectionBlock;

  await postMessage('#general', '', [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Bonjour à tous :wave:'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Voici les statistiques des *mercis* depuis mai 2020 :`
      }
    },
    ...fromBeginning ? [_buildStatisticSection(fromBeginning, fromBeginning)] : [noStatisticsSection],
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Ainsi que les statistiques du mois dernier :'
      }
    },
    ...previousPeriodStats ? [_buildStatisticSection(previousPeriodStats, lastPeriodStats)] : [noStatisticsSection],
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Si vous souhaitez déposer un merci, rendez-vous sur <https://my.xebia.fr/thankyou|my.xebia.fr> 🚀`
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Remercier'
          },
          style: 'primary',
          url: 'https://my.xebia.fr/thankyou',
          action_id: 'remindGeneral'
        },
      ]
    }
  ]);
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

export const _getPreviousPeriod = (today: Date) => {
  const date = new Date(today.getTime());
  date.setMonth(date.getMonth() - 1);
  return date;
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

const _buildStatisticSection = (previousPeriodStats, lastPeriodStats) => ({
  type: 'section',
  fields: [
    {
      type: 'mrkdwn',
      text: `*${previousPeriodStats[GIVEN_THANKS_KEY]}* mercis ont été envoyées ;`
    },
    {
      type: 'mrkdwn',
      text: `*${previousPeriodStats[PEOPLE_GIVING_THANKS_KEY].length}* Sapients ont remercié d'autres Sapients ;`,
    },
    ...lastPeriodStats[PEOPLE_RECEIVING_THANKS_KEY] ? [{
      type: 'mrkdwn',
      text: `*${lastPeriodStats[PEOPLE_RECEIVING_THANKS_KEY].length}* Sapients ont reçu des mercis.`,
    }] : [{
      type: 'mrkdwn',
      text: 'Aucun Sapient n\'a reçu de mercis sur la période.'
    }],
  ]
}) as SectionBlock;
