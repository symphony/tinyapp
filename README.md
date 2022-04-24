# TinyApp

URL Shortener API built using Express Node.js.
Current version: 1.1.0

*Disclaimer: This app was built for educational purposes only.*
*It currently only runs locally and stores all data in temporary storage. Any submitted user information will be lost upon stopping the server.*

## Features

* `Short URL` - Convert any long URL into a Short URL
* `User Account` - Save your Short URLs to an account
* `Edit URLs` - Delete or update your Short URLs
* `Share URLs` - Short URLs are usuable by anyone with the link
* `Secure Registration` - Passwords are securely stored via one-way hashing
* `Encrypted Session` - Cookie IDs are unique per session
* `Dark App Design` - Easier on the eyes

---

## Usage

**Clone or Download the Project**

`git clone git@github.com:symphony/tinyapp.git`

**Install Dependencies:**

`npm install` (in project folder)

**Run the Server:**

`npm start`

**Visit the API:**

`http://localhost:3000` (default port is 3000)

**Stop the Server**

`CTRL + C` in the terminal (see below for more information)

---
### Dependencies
* `express 4.17`
* `ejs 3.1.6`
* `bcryptjs 2.4.3`
* `cookie-parser 1.4.6`
* `cookie-session 2.0.0`
* `method-override 3.0.0`
* `@forevolve/bootstrap-dark 2.1.0`


### Dev Dependencies
* `chai 4.3.6`
* `mocha 9.2.2`
* `nodemon 2.0.1`

---

![Screenshot of TinyApp Homepage](docs/tiny1.png?raw=true "Homepage")

![Screenshot of New URL](docs/tiny2.png?raw=true "New Short URL")

![Screenshot of Dashboard](docs/tiny3.png?raw=true "User Dashboard")

![Screenshot of Edit Page](docs/tiny4.png?raw=true "Edit Page")

---

### Troubleshooting / Notes for devs

 - Server can be run with nodemon by using:
  `npm run dev`
 - If you need to manually kill the server it can be found using:
  `lsof -i tcp`
 - Find the running service with the matching port number (usually 3000), then use:
  `kill <PID>`
 - Mocha tests for helper functions can be run using:
  `npm test`

*Thanks for trying my app!*