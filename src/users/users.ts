import {fetchUsers as fetchSlackUsers} from '../slack';

export const fetchUsers = async () => {
  const slackUsers = await fetchSlackUsers();
  return slackUsers
    .filter(user => user.profile && user.profile.email)
    .map(user => ({
      name: user.profile.real_name,
      username: user.profile.email.split('@')[0],
      image: user.profile.image_192,
    }));
};
