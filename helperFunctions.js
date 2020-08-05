

const checkValidEmail = function (database, registerEmail) {
  for (let record in database) {
    if (database[record].email === registerEmail) {
      return false;
    }
  }
  return true;
};

module.exports = {
  checkValidEmail,
};