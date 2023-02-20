import * as os from 'os';

const getEnvironmentVariable = () => {
  const { env } = process;

  return (
    env.SUDO_USER ||
    env.C9_USER || // Cloud9
    env.LOGNAME ||
    env.USER ||
    env.LNAME ||
    env.USERNAME
  );
};

const getUsernameFromOsUserInfo = () => {
  try {
    return os.userInfo().username;
  } catch {}
};

// eslint-disable-next-line no-unused-vars
const cleanWindowsCommand = (string) => string.replace(/^.*\\/, '');

// eslint-disable-next-line no-unused-vars
const makeUsernameFromId = (userId) => `no-username-${userId}`;

function getUsername() {
  const test1 = getEnvironmentVariable();
  const test2 = getUsernameFromOsUserInfo();
  if (test1) return test2;
  if (test2) return test2;
  return null;
}

// noinspection JSUnusedGlobalSymbols
export default getUsername;
module.exports = getUsername;
