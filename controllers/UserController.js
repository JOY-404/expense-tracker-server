const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.postAddNewUser = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;

  if (name.trim() == '') {
    res.status(400).json({ success: false, msg: 'Name is Mandatory' });
  }
  else if (email.trim() == '') {
    res.status(400).json({ success: false, msg: 'Email ID is Mandatory' });
  }
  else if (phone.trim() == '') {
    res.status(400).json({ success: false, msg: 'Phone Number is Mandatory' });
  }
  else if (password.trim() == '') {
    res.status(400).json({ success: false, msg: 'Password is Missing' });
  }
  else {
    User.findAndCountAll({ where: { email: email } })
      .then(userCnt => {
        // Here I have considered email id as unique identifier 
        if (userCnt.count == 0) {
          bcrypt.hash(password, saltRounds)
            .then(hash => {
              return hash;
            })
            .then(hashedPW => {
              return User.create({
                name: name,
                email: email,
                phone: phone,
                password: hashedPW
              })
            })
            .then(resp => res.status(200).json({ success: true, msg: 'Signup Successful' }))
            .catch(err => res.status(500).json({ success: false, msg: err }));
        }
        else {
          res.status(200).json({ success: false, msg: 'User Already Exists' });
        }
      })
      .catch(err => res.status(500).json({ success: false, msg: err }));
  }
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (email.trim() == '') {
    res.status(400).json({ success: false, msg: 'Email ID not passed' });
  }
  else if (password.trim() == '') {
    res.status(400).json({ success: false, msg: 'Password is Missing' });
  }
  else {
    User.findAll({ where: { email: email } })
      .then(users => {
        if (users.length > 0) {
          // user exists in the DB
          bcrypt.compare(password, users[0].password)
            .then(isMatched => {
              if (isMatched) {
                // password is correct
                const token = generateAccessToken({ id: users[0].id });
                res.status(200).json({ token: token, success: true, msg: 'Successfully Logged In' });
              }
              else {
                // password is incorrect
                res.status(401).json({ success: false, msg: 'User Not Authorized' });
              }
            })
            .catch(err => res.status(500).json({ success: false, msg: err }));
        }
        else {
          // No user exists
          res.status(404).json({ success: false, msg: 'User Not Found' });
        }
      })
      .catch(err => res.status(500).json({ success: false, msg: err }));
  }
};

function generateAccessToken(det) {
  return jwt.sign(det, process.env.TOKEN_SECRET);
}