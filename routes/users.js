const auth = require('../middleware/auth');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {
  User,
  validate
} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//! NOTE: to log out user
//! need to be handled on the client, just delete the token because we are not storing the 'generateAuthToken' anywhere on the server

router.get('/', async (req, res) => {
  const user = await User.find();
  res.send(user);
});

//! added auth middleware
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

router.get('/:email', async (req, res) => {

  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
  //! Lindsay create separate validation 
  let user = await User.findOne({
    email: req.params.email
  })
  res.send(user);
})

//? Create new user 
//! Below I added salt and hash for password protection in th DB 
router.post('/', async (req, res) => {

  const {
    error
  } = validate(req.body);
  if (error) {
    console.log(error)
    return res.status(400).send({
      message: error.details[0].message
    });
  }

  let user = await User.findOne({
    email: req.body.email
  });
  if (user) {
    return res.status(400).send({
      message: 'User is already registered.'
    });
  }

  user = new User(_.pick(req.body, ['firstName', 'lastName', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  let newUser = await user.save();

  console.log(newUser)

  if (!newUser) {
    return res.status(500).send("There was a problem creating your user, please try again later")
  } else {
    const token = user.generateAuthToken();
    //* pick what you want returned back to the user 
    
    //! you will need to create a header for the creation of the blank you document in personalRecord
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'firstName', 'lastName', 'email']));

    let headers = {
      "Content-Type": "application/json"
  }
    //! Call out to your existing endpoint to create a new PR record with empty arrays (lifts, cardio, skills)
    let baseURL ='http://localhost:9999' 
    let url = `${baseURL}/api/personalrecord/usersetup/${newUser._id}`;
    console.log(url)
    try {
      let response = await fetch(url, {
        method: "POST",
        headers: headers
      })
  
      let json = await response.json()
        console.log(json)
    } catch (error) {
      console.log(error)
    }

    
  }
});

module.exports = router;