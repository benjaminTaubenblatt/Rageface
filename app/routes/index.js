'use strict';

const spawn = require("child_process").spawn;
const async = require('async');
const config = require('../config');
const helpers = require('../helpers');
const User = require('../models/user.js');
const Auth = require('../auth');
const expressJwt = require('express-jwt');
const Authenticate = expressJwt({secret: config.secret});
const passport = Auth.passport;

const React = require('react');
const ReactDOM = require ('react-dom');
//const App = require('/Users/benjamintaubenblatt/RageFace/Rageface/src/App.js');
//const indexCSS = require ('/Users/benjamintaubenblatt/RageFace/Rageface/src/index.css');
//const indexhtml = require('/Users/benjamintaubenblatt/RageFace/Rageface/views/index.html');


module.exports = () => {
  let routes = {
    'get': {
      '/': (req, res, next) => {
        res.send("Success!");
      },

      '/getgifs': (req, res, next) => {
        let pyScriptPath = "/Users/Dave/Documents/Uni Work/COMP 307/Rageface/app/scripts/test.py";

        var process = spawn('python', [pyScriptPath]);

        process.stdout.on('data', function(data){
          res.send(JSON.parse(data));
        });
      }
    },
    'post': {

      '/signin': [passport.authenticate('local', {session: false}), (req, res, next)  => {

          //serialize
          var user = req.user;
          Auth.generateAccessToken(user, (error, result) => {
            if (error) {
              res.status(500).send(error);
            }
            else if (result) {
              res.status(200).send(result);
            }
            else {
              res.status(500).send("An unknown error has occured.");
            }
          });

      }],

      //[validateSender, (req, res, next) => {... more stuff here ...}]
      '/signup': (req, res, next) => {

        let username = req.body.username;
        let pw = req.body.password;

        function serializeUser(cb) {
          return User.createUser(username, pw, cb);
        }

        async.waterfall([
          serializeUser,
          Auth.generateAccessToken
        ], (err, results) => {

          if (err) {
            throw err;
            res.status(500).send(err);
          }
          else if (results) {
            res.status(200).send(results);
          }
          else {
            res.status(500).send("An unknown error has occured.");
          }
        });
      },

      '/saveflow': [Authenticate, (req, res, next) => {

      }]
    },
    'update': {

    },
    'patch': {

    },
    'delete': {

    }
  }

  return helpers.route(routes);
}
