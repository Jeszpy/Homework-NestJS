const globalPrefix = '/api';
const videoController = `${globalPrefix}/videos`;
const blogController = `${globalPrefix}/blogs`;
const authController = `${globalPrefix}/auth`;
const testingController = `${globalPrefix}/testing`;

export const endpoints = {
  videoController,
  blogController,
  authController: {
    registration: `${authController}/registration`,
    registrationEmailResending: `${authController}/registration-email-resending`,
    registrationConfirmation: `${authController}/registration-confirmation`,
    login: `${authController}/login`,
  },
  testingController: {
    allData: `${testingController}/all-data`,
  },
  swaggerEndpoint: `/swagger`,
};

export const methods = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE',
};
