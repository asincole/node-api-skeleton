const express = require('express');
const router = express.Router();
const User = require('../models/users');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/db');

// register
router.post('/register',(req, res, next) =>{
    let newUser = new User({
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        creationDate: req.body.cdate,
        interests: req.body.interests
    });

    const username = req.body.username;
    User.getUserByUsername(username, (err, user)=>{
        if (err) throw err;

        if(user){
            return res.json({success: false, msg: " user already exists"});
        } 
            User.addUser(newUser, (err, user) =>{
                if(err){
                    res.json({success: false, msg: " Failed to register user"});
                }
                else {
                    res.json({success: true, msg: " user registered"});
                }
            });
        
    });
    
    
});

// Authenticate
router.post('/auth',(req, res, next) =>{
   
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username.toLowerCase(), (err, user)=>{
        if (err) throw err;

        if(!user){
            return res.json({success: false, msg: " user not found"});
        }

        User.comparePassword(password, user.password, (err, isMatch)=>{
            if (err) throw err;

            if (isMatch){
                const token = jwt.sign({id: user._id}, config.secret,{
                    expiresIn: 604800
                });

                res.json ({
                    success: true,
                    token: 'JWT '+ token ,
                    user:{
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                });
            } else{
                return res.json({success: false, msg: " wrong password"});
            }
        });
    });
});

// profile
router.get('/profile', passport.authenticate('jwt', {session:false}),(req, res, next) =>{
    console.log('testing');
    res.json({user: req.user});
});





module.exports = router;