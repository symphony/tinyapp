/**
* Uses recursion to generate unique ID consisting of any lower or upper case characters, and numbers 0-9.
* Default length is 6 characters.
* Throws error if not possible.
*/
const generateUniqueId = (database, length = 6, attempts = 100) => {
  const pool = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
  let newId = '';
  for (let i = 0; i < length; i++) {
    const ranIndex = Math.floor(Math.random() * pool.length);
    newId += Math.random() > 0.5 ? pool[ranIndex].toUpperCase() : pool[ranIndex];
  }

  if (attempts <= 0) throw TypeError("All unique IDs exhausted. Try longer ID length."); // failsafe
  return Object.keys(database).includes(newId) ? generateUniqueId(database, length, attempts - 1) : newId;
};

/** Checks if submission includes http(s):// prefix and adds it if it doesn't */
// Not a catch all, but helps with some improper url submissions
const autofillHttpPrefix = (longURL) => {
  const newUrl = longURL.trim();
  if (!newUrl) return null;
  return newUrl.includes('://') ? newUrl : 'https://' + newUrl;
};

/** Uses cookies to trigger alerts. Will replace with middleware alternative eventually. */
const sendAlert = (res, message, style = 'info') => {
  res.cookie('alertMsg', message);
  res.cookie('alertStyle', style);
};

/** Clears cookies used to send alert. */
const clearAlert = (res) => {
  res.clearCookie('alertMsg');
  res.clearCookie('alertStyle');
};

/** Adds a new user to the database. Doesn't return a value. */
const registerNewUser = (userDatabase, email, password) => {
  const id = generateUniqueId(userDatabase);
  userDatabase[id] = {
    id,
    email,
    password
  };
};

/**
 * Prevents use of improper form submission via cache or curl/postman.
 * @param {object} [shortURL] optional parameter needed for PUT/DELETE requests
 */
const isForbidden = (userID, userDatabase, shortURL) => !userDatabase[userID] || (shortURL ? userID !== shortURL.ownerID : false);

/** @returns {object?} User object if found otherwise null */
const getUserByEmail = (email, userDatabase) => Object.values(userDatabase).find(user => user.email === email) || null;

/** @returns {object} New object with matching URLs or empty object if none found */
const getUserUrls = (userID, urlDatabase) => {
  const userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].ownerID === userID) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

module.exports = {
  generateUniqueId,
  autofillHttpPrefix,
  sendAlert,
  clearAlert,
  registerNewUser,
  isForbidden,
  getUserByEmail,
  getUserUrls,
};