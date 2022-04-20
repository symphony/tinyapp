const generateRandomString = (database) => {
  const pool = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const length = 6;
  let newString = '';
  for (let i = 0; i < length; i++) {
    const ranIndex = Math.floor(Math.random() * pool.length);
    newString += Math.random() > 0.5 ? pool[ranIndex].toUpperCase() : pool[ranIndex];
  }

  // check if string already exists
  return Object.keys(database).includes(newString) ? generateRandomString() : newString;
};

const autofillHttpPrefix = (longURL) => {
  const cleanUrl = longURL.trim();
  return cleanUrl.includes('://') ? cleanUrl : 'https://' + cleanUrl;
};

module.exports = { generateRandomString, autofillHttpPrefix };