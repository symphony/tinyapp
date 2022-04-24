# TinyApp
URL Shortener API built using Express Node.js

## Usage

**Clone or Download Project**

`git clone git@github.com:symphony/tinyapp.git`

**Install Dependencies:**

`npm install` (in project folder)

**Run the Server:**

`npm start`

**Visit the API:**

`http://localhost:3000` (3000 is default port)


## Documentation

Main Features

* `Short URL` - Convert any long URL into a Short URL
* `User Account` - Save your Short URLs to an account
* `Edit URLs` - Delete or update your Short URLs
* `Share URLs` - Short URLs are usuable by anyone with the link
* `Secure Registration` - Passwords are securely stored via one-way hashing
* `Encrypted Session` - Cookie IDs are unique per session
* `Dark Page Design` - Easier on the eyes

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
