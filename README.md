# TinyApp
<sub>*version 1.1.0*</sub>

URL Shortener API built using Express Node.js  

<sub>*Disclaimer - This app was built for educational purposes only. It currently only runs locally and stores all data in temporary memory. Any submitted user information will be lost upon stopping the server.*</sub>

## Features

* `Short URL` - Convert any long URL into a Short URL
* `User Account` - Save your Short URLs to an account
* `Edit URLs` - Delete or update your Short URLs
* `Share URLs` - Short URLs are usuable by anyone with the link
* `Secure Registration` - Passwords are securely stored via [one-way hashing](https://en.wikipedia.org/wiki/Cryptographic_hash_function)
* `Encrypted Sessions` - Cookie IDs are unique and unidentifiable - personal information is never shared
* `Dark App Design` - Easier on the eyes
* `Analytics` - (new in v1.1.0) Tracks and shows analytics of ShortURLs - includes total hits and unique visitors count 

## Usage

**Clone or Download the Project**

`git clone git@github.com:symphony/tinyapp.git && cd tinyapp`

**Install Dependencies:**

`npm install` (inside the project folder)

**Run the Server:**

`npm start`

**Visit the API in Your Browser:**

`http://localhost:3000` (default port is 3000)

**Stop the Server**

Use hotkey `CTRL + C` in the terminal (see below for more options)

**Uninstall**

To uninstall, simply delete the project folder `/tinyapp/` from your computer.

---

![Screenshot of TinyApp Homepage](docs/tiny1.png?raw=true "Homepage")

![Screenshot of New URL](docs/tiny2.png?raw=true "New Short URL")

![Screenshot of Dashboard](docs/tiny3.png?raw=true "User Dashboard")

![Screenshot of ShortURL Info Page](docs/tiny4.png?raw=true "ShortURL Info Page")

![Screenshot of Analytics](docs/tiny5.png?raw=true "Analytics")

---

### Dependencies
* [`express 4.17`](https://www.npmjs.com/package/express)
* [`ejs 3.1.6`](https://www.npmjs.com/package/ejs)
* [`bcryptjs 2.4.3`](https://www.npmjs.com/package/bcryptjs)
* [`cookie-parser 1.4.6`](https://www.npmjs.com/package/cookie-parser)
* [`cookie-session 2.0.0`](https://www.npmjs.com/package/cookie-session)
* [`method-override 3.0.0`](https://www.npmjs.com/package/method-override)
* [`date-fns 2.28.0`](https://www.npmjs.com/package/date-fns)
* [`@forevolve/bootstrap-dark 2.1.0`](https://www.npmjs.com/package/@forevolve/bootstrap-dark)


### Dev Dependencies
* [`chai 4.3.6`](https://www.npmjs.com/package/chai)
* [`mocha 9.2.2`](https://www.npmjs.com/package/mocha)
* [`nodemon 2.0.1`](https://www.npmjs.com/package/nodemon)

### Troubleshooting / Notes for devs

 - Use email `admin` and password `admin` to use built in account
 - Mocha tests for helper functions can be run using `npm test`
 - Server can be run with nodemon by using `npm run dev`
 - If you need to force close the server it can be found using `lsof -i tcp`
 - Find the running service with the matching port number (usually 3000), then enter `kill <PID>`

*Thanks for trying my app!*