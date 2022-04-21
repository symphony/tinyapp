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
  const cleanUrl = longURL.trim();
  return cleanUrl.includes('://') ? cleanUrl : 'https://' + cleanUrl;
};

const sendAlert = (res, message = '', style = 'info') => {
  res.cookie('alertMsg', message);
  res.cookie('alertStyle', style);
};

const clearAlert = (res) => {
  res.clearCookie('alertMsg');
  res.clearCookie('alertStyle');
};

const registerNewUser = (database, email, password) => {
  const id = generateUniqueId(database);
  database[id] = {
    id,
    email,
    password
  };
};

const getUserByEmail = (database, email) => Object.values(database).find(user => user.email === email);

// prevents use of form submission using cache
const isForbidden = (req, database) => !database[req.cookies.user_id];

module.exports = { generateUniqueId, autofillHttpPrefix, sendAlert, clearAlert, registerNewUser, isForbidden, getUserByEmail };