// server.js

// install packages
import express from "express";
import bodyParser = require("body-parser");
import timeout = require("connect-timeout");
import * as routes from "./router";

// init application
const app: express.Application = express();

// set timeout
app.use(timeout("30s"));

// set body-parser
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json())

// set response header　
app.use((_req: express.Request, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS"
  )
  next()
})

// set port
var port = process.env.PORT || 8080;

routes.init(app);

// start server
app.listen(port);

console.log("listen on port: " + port);
