const generateUniqueId = (database, length = 4, accumulator = 5) => {
  const pool = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
  let newId = '';
  for (let i = 0; i < length; i++) {
    const ranIndex = Math.floor(Math.random() * pool.length);
    newId += Math.random() > 0.5 ? pool[ranIndex].toUpperCase() : pool[ranIndex];
  }

  // use recursion to gaurantee unique id
  if (accumulator <= 0) throw TypeError("All unique IDs exhausted. Try longer ID length.");
  return Object.keys(database).includes(newId) ? generateUniqueId(database, length, accumulator - 1) : newId;
};

const autofillHttpPrefix = (longURL) => {
  const trimmedUrl = longURL.trim();
  if (!trimmedUrl) return null;
  return trimmedUrl.includes('://') ? trimmedUrl : 'https://' + trimmedUrl;
};

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

// prevents use of form submission using cache
const isForbidden = (userID, userDatabase, shortURL) => !userDatabase[userID] || (shortURL ? userID !== shortURL.userID : false);

const getUserByEmail = (userDatabase, email) => Object.values(userDatabase).find(user => user.email === email);

const getUsersOwnedUrls = (urlDatabase, userID) => {
  return Object.keys(urlDatabase).filter(urlID => {
    return urlDatabase[urlID].userID === userID;
  }).reduce((newObj, key) => {
    return {...newObj, [key]: urlDatabase[key]};
  }, {});
};

module.exports = {
  generateUniqueId,
  autofillHttpPrefix,
  sendAlert,
  clearAlert,
  registerNewUser,
  isForbidden,
  getUserByEmail,
  getUsersOwnedUrls,
};