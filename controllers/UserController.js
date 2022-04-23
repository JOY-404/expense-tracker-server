const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.authenticate = (req, res, next) => {
  try {
    const token = req.header('authorization');
    //console.log(token);
    const tokenData = jwt.verify(token, process.env.TOKEN_SECRET)
    const userId = tokenData.id;
    //console.log(userId);
    User.findByPk(userId).then(user => {
      if (user) {
        req.user = user;
        //res.status(200).json('check');
        next();
      }
      else {
        // User not found
        return res.status(401).json({ success: false, msg: 'User doesn\'t exist' });
        //throw new Error('User doesn\'t exist');
      }
    }).catch(err => {
      return res.status(401).json({ success: false, msg: err });
      //throw new Error(err) 
    });
  }
  catch (err) {
    return res.status(401).json({ success: false, msg: err });
  }
}

exports.postAddNewUser = (req, res, next) => {
  try {
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
              .then(hashedPW => {
                return User.create({
                  name: name,
                  email: email,
                  phone: phone,
                  password: hashedPW
                })
              })
              .then(user => {
                // create standard categories for the user
                user.createCategory({ category: 'Apparel' });
                user.createCategory({ category: 'Education' });
                user.createCategory({ category: 'Food' });
                user.createCategory({ category: 'Gift' });
                user.createCategory({ category: 'Household' });
                user.createCategory({ category: 'Health' });
                user.createCategory({ category: 'Petrol' });
                res.status(200).json({ success: true, msg: 'Signup Successful' });
              })
              .catch(err => res.status(500).json({ success: false, msg: err }));
          }
          else {
            res.status(200).json({ success: false, msg: 'User Already Exists' });
          }
        })
        .catch(err => res.status(500).json({ success: false, msg: err }));
    }
  }
  catch (err) {
    return res.status(500).json({ success: false, msg: err });
  }
};

exports.postLogin = (req, res, next) => {
  try {
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
                  const userDetails = {
                    name: users[0].name,
                    email: users[0].email,
                    phone: users[0].phone
                  }
                  const token = generateAccessToken({ id: users[0].id, isPremiumMember: users[0].isPremiumMember });
                  res.status(200).json({
                    token: token,
                    userDetails: userDetails,
                    success: true,
                    msg: 'Successfully Logged In'
                  });
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
  }
  catch (err) {
    return res.status(500).json({ success: false, msg: err });
  }
};

function generateAccessToken(det) {
  return jwt.sign(det, process.env.TOKEN_SECRET);
}