import {isSlackRequestAuthorized} from './thanks';

describe('Thanks', () => {
  it('should verify signature and validate it', () => {
    const authorized = isSlackRequestAuthorized(
      '1590253817',
      'hello, world!',
      'v0=be81dff716fe0e1d65558f82a5152430fc03e1c1876e60097c7fd337ff7b22ea',
      'the-secret'
    );
    expect(authorized).toBeTruthy();
  });
});