import {getReviewers} from './service';

const username = process.env.USERNAME || '';

describe('Service', () => {
  it.skip('should get reviewers', async () => {
    const reviewers = await getReviewers();
    expect(reviewers).toEqual([username]);
  });
});