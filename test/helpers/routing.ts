const globalPrefix = '/api';
const videoController = `${globalPrefix}/videos`;
const blogController = `${globalPrefix}/blogs`;
const bloggerController = `${globalPrefix}/blogger/blogs`;
const postController = `${globalPrefix}/posts`;
const commentController = `${globalPrefix}/comments`;
const authController = `${globalPrefix}/auth`;
const usersController = `${globalPrefix}/sa`;
const securityController = `${globalPrefix}/security/devices`;
const quizGameController = `${globalPrefix}/pair-game-quiz`;
const testingController = `${globalPrefix}/testing`;

export const endpoints = {
  videoController,
  blogController,
  bloggerController,
  postController,
  commentController,
  authController: {
    registration: `${authController}/registration`,
    registrationEmailResending: `${authController}/registration-email-resending`,
    registrationConfirmation: `${authController}/registration-confirmation`,
    login: `${authController}/login`,
    refreshToken: `${authController}/refresh-token`,
  },
  usersController: {
    users: `${usersController}/users`,
    quiz: {
      questions: `${usersController}/quiz/questions`,
    },
  },
  securityController,
  quizGameController: { connection: `${quizGameController}/pairs/connection` },
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
