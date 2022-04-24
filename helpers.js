const generateUniqueId = (database, length = 6, attempts = 30) => {
  const pool = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
  let newId = '';
  for (let i = 0; i < length; i++) {
    const ranIndex = Math.floor(Math.random() * pool.length);
    newId += Math.random() > 0.5 ? pool[ranIndex].toUpperCase() : pool[ranIndex];
  }

  // uses recursion to find unique id
  if (attempts <= 0) throw TypeError("All unique IDs exhausted. Try longer ID length.");
  return Object.keys(database).includes(newId) ? generateUniqueId(database, length, attempts - 1) : newId;
};

// not a catch all, but helps with some improper url submissions
const autofillHttpPrefix = (longURL) => {
  const trimmedUrl = longURL.trim();
  if (!trimmedUrl) return null;
  return trimmedUrl.includes('://') ? trimmedUrl : 'https://' + trimmedUrl;
};

// uses cookies to trigger alerts. will replace with non cookie version eventually
const sendAlert = (res, message = '', style = 'info') => {
  res.cookie('alertMsg', message);
  res.cookie('alertStyle', style);
};

const clearAlert = (res) => {
  res.clearCookie('alertMsg');
  res.clearCookie('alertStyle');
};

const registerNewUser = (userDatabase, email, password) => {
  const id = generateUniqueId(userDatabase);
  userDatabase[id] = {
    id,
    email,
    password
  };
};

// prevents use of form submission via cache or command line
const isForbidden = (userID, userDatabase, shortURL) => !userDatabase[userID] || (shortURL ? userID !== shortURL.userID : false);

const getUserByEmail = (email, userDatabase) => Object.values(userDatabase).find(user => user.email === email);

const getUserUrls = (userID, urlDatabase) => {
  const userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
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