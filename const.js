const PORT = 8080;

const unloggedUser = {
  email: null,
};

// Error template
const unauthUser = `Unauthorized request, please re-login. --> <a href="/login">LOGIN HERE</a>`;
const loginRequired = `Login required. --> <a href="/login">LOGIN HERE</a>`;


module.exports = {
  PORT,
  unloggedUser,
  unauthUser,
  loginRequired
};