
const findUserIDByEmail = function (database, registerEmail) {
  for (let record in database) {
    if (database[record].email === registerEmail) {
      return database[record];
    }
  }
  return false;
};

const findObjByURL = (database, shortURL) => (database[shortURL]) ? database[shortURL] : false;

const urlsForUser = function (database, userID) {
  let userURLs = {};
  for (let record in database) {
    if (database[record].userID === userID) {
      userURLs[record] = database[record];
    }
  }
  return userURLs;
};

const generateRandomString = function () {
  return Math.random().toString(20).slice(2, 8);
};

const loggedUser = req => req.session.userId;

module.exports = {
  findUserIDByEmail,
  findObjByURL,
  urlsForUser,
  generateRandomString,
  loggedUser
};
