export const basicAuth = () => {
  return `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;
};

export const superUser = {
  login: 'admin',
  password: 'qwerty',
};
