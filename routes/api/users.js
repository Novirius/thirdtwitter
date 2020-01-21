// users.js

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const passport = require("passport");
const jwt = require('jsonwebtoken');
const express = require("express");
const router = express.Router();
const keys = require('../../config/keys');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

router.get("/test", (req, res) => res.json({ msg: "This is the users route" }));


router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
      id: req.user.id,
      handle: req.user.handle,
      email: req.user.email
    });
  })

// Register
router.post("/register", (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    User.findOne({ handle: req.body.handle }).then(user => {
      if (user) {
        errors.handle = "User already exists";
        return res.status(400).json(errors);
      } else {
        const newUser = new User({
          handle: req.body.handle,
          email: req.body.email,
          password: req.body.password
        });
  
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                const payload = { id: user.id, handle: user.handle };
  
                jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                  res.json({
                    success: true,
                    token: "Bearer " + token
                  });
                });
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  });


// Login
router.post("/login", (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const email = req.body.email;
    const handle = req.body.handle;
    const password = req.body.password;
  
    User.findOne({email})
    .then(user => {
      if (!user) {
        return res.status(404).json({email: 'This user does not exist'});
      }
  
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          const payload = { id: user.id, handle: user.handle };
  
          jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          });
        } else {
          errors.password = "Incorrect password";
          return res.status(400).json(errors);
        }
      });
    });
  });

//Second route
// router.post('/login', (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   User.findOne({email})
//     .then(user => {
//       if (!user) {
//         return res.status(404).json({email: 'This user does not exist'});
//       }

//       bcrypt.compare(password, user.password)
//         .then(isMatch => {
//           if (isMatch) {
//             res.json({msg: 'Success'});
//           } else {
//             return res.status(400).json({password: 'Incorrect password'});
//           }
//         })
//     })
// })


// Private auth route
// You may want to start commenting in information about your routes so that you can find the appropriate ones quickly.
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({msg: 'Success'});
  })

module.exports = router;