
const findUserIDByEmail = function (database, registerEmail) {
  for (let record in database) {
    if (database[record].email === registerEmail) {
      return record;
    }
  }
  return false;
};

const urlsForUser = function (database, userID) {
  let userURLs = {};
  for (let record in database) {
    if (database[record].userID === userID) {
      userURLs[record] = database[record];
    }
  }
  return userURLs;
};

module.exports = {
  findUserIDByEmail,
  urlsForUser
};
