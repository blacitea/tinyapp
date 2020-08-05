

const findUserIDByEmail = function (database, registerEmail) {
  for (let record in database) {
    if (database[record].email === registerEmail) {
      return record;
    }
  }
  return false;
};

module.exports = {
  findUserIDByEmail,
};