const { assert } = require('chai');
const { findUserIDByEmail } = require('../helperFunctions');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserIDByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserIDByEmail(testUsers, "user@example.com");
    const expected = "userRandomID";
    assert.strictEqual(user, expected);
  });
  it('should return false if no user found with given email', () => {
    const user = findUserIDByEmail(testUsers, "noeachuser@example.com");
    assert.isFalse(user);
  });
});
