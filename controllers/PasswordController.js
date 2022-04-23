const User = require('../models/user');
const ForgotPasswordRequest = require('../models/forgotpasswordrequests');
const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.postForgotPassword = (req, res, next) => {
    try {
        const toEmail = req.body.email;
        User.findOne({ where: { email: toEmail } })
            .then(user => {
                if (user) {
                    user.createForgotpasswordrequest({
                        id: uuidv4(),
                        isactive: true
                    })
                        .then(resetRequest => {
                            const resetPWlink = `${process.env.BASE_URL}/password/resetpassword/${resetRequest.id}`;
                            const msg = {
                                to: toEmail, // Change to your recipient
                                from: 'janmejoysahoo007@gmail.com', // Change to your verified sender
                                subject: 'Please reset your password',
                                //text: '',
                                html: `Hi ${user.name}, <br><br> You have requested to reset your Expense Tracker password. <br><br>
                                You can use the following link to reset your password: <br><br>
                                <a href='${resetPWlink}' target='_blank'>${resetPWlink}</a> <br><br>
                                If you didn't request this, please ignore this email. <br><br>
                                Thanks,<br>Team Expense Tracker`,
                            }
                            return sendgrid.send(msg);
                        })
                        .then(response => {
                            // console.log(response[0].statusCode);
                            // console.log(response[0].headers);
                            // console.log('Mail sent successfully');
                            if (response[0].statusCode == 202) {
                                res.status(200).json('Mail Sent');
                            }
                            else {
                                res.status(400).json('Mail Sent Error');
                            }
                        })
                        .catch(error => {
                            //console.error(error);
                            res.status(500).json('Mail Sent Error');
                        });
                }
                else {
                    // User not found
                    res.status(401).json({ success: false, msg: 'User doesn\'t exist' });
                    //throw new Error('User doesn\'t exist');
                }
            })
            .catch(err => {
                res.status(401).json({ success: false, msg: err });
                //throw new Error(err) 
            });
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
};

exports.getResetPassword = (req, res, next) => {
    try {
        const resetId = req.params.resetId;
        ForgotPasswordRequest.findByPk(resetId)
            .then(resetRecord => {
                if (!resetRecord){
                    return res.redirect(`${process.env.FRONT_BASE_URL}/login.html`);
                }
                if (!resetRecord.isactive){
                    return res.redirect(`${process.env.FRONT_BASE_URL}/login.html`);
                }
                res.render('reset-password', { 
                    resetId: resetId,
                    frontBaseUrl: process.env.FRONT_BASE_URL 
                });
            })
            .catch(err => {
                res.redirect(`${process.env.FRONT_BASE_URL}/login.html`);
                //res.status(401).json({ success: false, msg: err });
            });
    }
    catch (err) {
        res.redirect(`${process.env.FRONT_BASE_URL}/login.html`);
        //return res.status(500).json({ success: false, msg: err });
    }
};

exports.postResetPassword = (req, res, next) => {
    try {
        const resetId = req.params.resetId;
        const newPW = req.body.password;
        let userId; 
        ForgotPasswordRequest.findByPk(resetId)
            .then(resetRecord => {
                if (!resetRecord) return res.redirect(`${process.env.FRONT_BASE_URL}/login.html`);
                if (!resetRecord.isactive) return res.redirect(`${process.env.FRONT_BASE_URL}/login.html`);
                
                userId = resetRecord.userId;
                resetRecord.isactive = false;
                return resetRecord.save();
            })
            .then(resp => {
                return User.findByPk(userId)
            })
            .then(async user => {
                const hashedPW = await bcrypt.hash(newPW, saltRounds);
                user.password = hashedPW;
                return user.save();
            })
            .then(resp => {
                res.redirect(`${process.env.FRONT_BASE_URL}/login.html?pr=1`);
                // res.status(202).json({
                //     success: true,
                //     msg: 'Password Reset Done'
                // });
            })
            .catch(err => {
                res.redirect(`${process.env.FRONT_BASE_URL}/login.html`);
                //res.status(401).json({ success: false, msg: err });
            });
    }
    catch (err) {
        res.redirect(`${process.env.FRONT_BASE_URL}/login.html`);
        //return res.status(500).json({ success: false, msg: err });
    }
};