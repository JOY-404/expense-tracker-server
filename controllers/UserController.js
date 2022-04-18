const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.postAddNewUser = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;

    if (name.trim() == '') {
        res.status(400).json({ msg: 'Name is Mandatory' });
    }
    else if (email.trim() == '') {
        res.status(400).json({ msg: 'Email ID is Mandatory' });
    }
    else if (phone.trim() == '') {
        res.status(400).json({ msg: 'Phone Number is Mandatory' });
    }
    else if (password.trim() == '') {
        res.status(400).json({ msg: 'Password is Missing' });
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
                        .then(resp => res.status(200).json({ msg: 'Signup Successful' }))
                        .catch(err => res.status(500).json({ msg: err }));
                }
                else {
                    res.status(400).json({ msg: 'User Already Exists' });
                }
            })
            .catch(err => res.status(500).json({ msg: err }));
    }
};