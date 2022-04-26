const { format } = require('date-fns');

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
  const newURL = longURL.trim();
  if (!newURL) return null;
  return newURL.includes('://') ? newURL : 'https://' + newURL;
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

/**
 * Prevents use of improper form submission via cache or curl/postman.
 * @param {object} [shortURL] optional parameter needed for PUT/DELETE requests
 */
const isForbidden = (userID, userDatabase, shortURL) => !userDatabase[userID] || (shortURL ? userID !== shortURL.ownerID : false);

/** @returns {object?} User object if found otherwise null */
const getUserByEmail = (email, userDatabase) => Object.values(userDatabase).find(user => user.email === email) || null;

/** @returns {object} New object with matching URLs or empty object if none found */
const getUserURLs = (userID, urlDatabase) => {
  const userURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].ownerID === userID) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
};

/** Checks if user already has a public ID via cookies and sets one if not. Stores new visit in ShortURL. Doesn't return a value. */
const trackVisit = (req, res, shortURL, publicIDs) => {
  let visitorID = req.cookies.visitorID;
  if (!visitorID) {
    visitorID = generateUniqueId(publicIDs);
    res.cookie('visitorID', visitorID);
  }
  const timestamp = format(new Date(), 'MM/dd/yyyy HH:mm:ss');
  shortURL.addVisit(visitorID, timestamp);
};

module.exports = {
  generateUniqueId,
  autofillHttpPrefix,
  sendAlert,
  clearAlert,
  isForbidden,
  getUserByEmail,
  getUserURLs,
  trackVisit,
};