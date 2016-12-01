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


module.exports = () => {
  let routes = {
    'get': {
      '/': (req, res, next) => {

        res.send("Hooray!");
      },

      '/getgifs': [Authenticate, (req, res, next) => {
        let pyScriptPath = "/Users/Dave/Documents/Uni Work/COMP 307/Rageface/app/scripts/test.py";
        console.log(req.user);
        var process = spawn('python', [pyScriptPath]);

        process.stdout.on('data', function(data){
          res.send(JSON.parse(data));
        });
      }]
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
      }
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
