const { assert, expect } = require('chai');
const { getUserByEmail, getUserUrls } = require('../helpers.js');

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

const testDatabase = {
  "b2xVn2": {
    id: 'b2xVn2',
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'user2RandomID'
  },
  "9sm5xK": {
    id: '9sm5xK',
    longURL: 'http://www.google.com',
    userID: 'user2RandomID'
  }
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert(user, expectedUserID);
  }),
  it('should return undefined if not found', function() {
    const user = getUserByEmail("not@realemail", testUsers);
    assert.isUndefined(user);
  });
});

describe('getUserUrls', () => {
  it('should return urls with matching userid', () => {
    const usersUrls = getUserUrls("user2RandomID", testDatabase);
    const expected =   {"b2xVn2": { id: 'b2xVn2', longURL: 'http://www.lighthouselabs.ca', userID: 'user2RandomID' },
      "9sm5xK": { id: '9sm5xK', longURL: 'http://www.google.com', userID: 'user2RandomID' }};
    expect(usersUrls).to.eql(expected);
    expect(getUserUrls("userRandomID", testDatabase)).to.eql({});
  });
});