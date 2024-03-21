// create router using express js 
const loginRouter = require('express').Router();

// mailController
const sendEmail = require('./mailController.js');

// date and time utils
const formattedDateTime = require('../utils/dateAndTime.js');

// import userModel,config.js and loggerjs
const userModel = require('../models/userModel.js');
const  config = require('../utils/config.js');
const {info,error} = require('../utils/logger.js');

// import bcrypt for password hash
const bcrypt = require("bcrypt");

// import jwt - json web token for validation
const jwt = require('jsonwebtoken');

// -------------------------------------------------------------------------------

// getToken function 
const getToken = (request) => {
    const authorization = request.get('authorization');
     if(authorization && authorization.toLowerCase().startsWith('bearer')){
         return authorization.substring(7);
     }
     return null;
}

// --------------------------------------------------------------------------------------

// reister api
loginRouter.post('/register',async (request,response) => {
    try {
        //  get data from client side
        const {username,email,password} = request.body;

        //  check if user already exists in the database
        const userExist = await userModel.findOne({ $or: [{ username: username }, { email: email }] });

        //   If user is not exist then create a new user and save it to the database
        if(!userExist){

            // password pattern
            const passwordPattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

            // password validation
            if(passwordPattern.test(password)){

// generate salt round with hash password using  bcrypt
const hashedPassword = await bcrypt.hash(password,10);

//  user count  for generating unique id
const userCount = await userModel.find().countDocuments();

let userId = "";

// userID genarate based on custom  algorithm
if (userCount < 10) {
 userId += "U00" + userCount;
} else if (userCount < 100) {
 userId += "U0" + userCount;
} else {
 userId += "U" + userCount;
};

//  Create an object of User and add properties to it
const user = new userModel({
 userid : userId,
 username:username,
 email:email,
 password:hashedPassword,
 createdAt : formattedDateTime,
 updatedAt : ""
});

// Save the user to the database
const savedUser = await user.save();

// log info
info(`New User Created ${savedUser._id}`);

// send response
response.status(200).json({message : 'user signed up sucessfully',data:savedUser});

           }else{
                error("Password Doesn't Match the Pattern");
                response.status(403).json({message:"Password should contain at least one number,one special character and be 8 characters long"});
            }

        }else{
            error("User Already Exists");
            response.status(401).json({message:'Username or Email already exists'});
           }

    } catch (error) {
        response.status(500).json({error : error.message});
    }
});

// --------------------------------------------------------------------------

// login api 
loginRouter.post('/login',async (request,response) => {

    const {email,password} = request.body;

    const user = await userModel.findOne({ email: email });

    // user check
    if(!user){
        return response.status(401).json({message : "user not found"});
    }

    // password verify
    const passwordVerify = await bcrypt.compare(password, user.password);

    if(!passwordVerify){
        return response.status(401).json({message:"invalid password"});
    }

    // payload
    const userPayload = {
        username : user.username,
        userid : user.userid
    };

    // jwt token define
    const token = jwt.sign(userPayload, config.Jwt, { expiresIn: '1h' });

    // send response 
    response.status(200).json({token,username : user.username,userid : user.userid,email : user.email});

});

// ----------------------------------------------------------

 // password reset email
 loginRouter.post('/reset-password', async (request, response) => { 
    try {
        const {email} = request.body;

        const oldUser = await userModel.findOne({ email: email });

        if (!oldUser) {
            return response.status(401
                ).json({ message: "User not found" });
        };

        // const secret = config.Jwt + oldUser.userId; // Use the same secret for signing and verifying the token

        const userPayload = {
            email: oldUser.email,
            userID: oldUser.userid
        };

        const token = jwt.sign(userPayload, config.Jwt, { expiresIn: '5m' });

        const link = `${config.BaseUrl_FE}/updatePassword/${oldUser.userid}/${token}`;

        const emailInfo = await sendEmail(oldUser.email, link);

        if (emailInfo.response.match(/OK/)) {
            console.log('Email sent successfully to ..', oldUser.email);
            return response.status(200).json({message : "Check your Email,mail sent sucessfully."});
        } else {
            console.log('Email not sent !');
        }
    } catch (Error) {
        error(Error);
        response.status(500).json({ Error: Error });
    }
});

// ----------------------------------------------------------------------------------------

// update password
loginRouter.patch('/updatePassword', async (request, response) => {
    try {
        const { newPassword, confirmPassword, userid } = request.body;

        const existUser = await userModel.findOne({ userid: userid });

        const passwordPattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        const token = getToken(request);

        const verifyPassword = await bcrypt.compare(newPassword, existUser.password);

        let errorMessage = null;
        let userPayload = null;
        let tokenValue = null;

        jwt.verify(token, config.Jwt, async (err, decodedToken) => {

            if(err instanceof jwt.TokenExpiredError){
               return errorMessage = "Session Expired,Please send email again!";
            } else if (err) {
              return  errorMessage = "invalid Token";
            } else {
                info('password validation start here ..');
                if (!existUser) {
                  return  errorMessage = "User not found";
                } else if (!passwordPattern.test(newPassword) || !passwordPattern.test(confirmPassword)) {
                  return  errorMessage = "Please enter a valid Password!, " 
                    + "Password should contain at least one number,one special character and be 8 characters long.";
                } else if (newPassword !== confirmPassword) {
                  return  errorMessage = "the new password and confirm password should be equal!";
                } else if (verifyPassword) {
                  return  errorMessage = "the new password and old password should not be equal!";
                } 
            }
        });

        if (errorMessage) {
            error(errorMessage);
            return response.status(403).json({ message: errorMessage });
        } else {

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updatedUser = await userModel.findOneAndUpdate({ userid: userid }, { $set: { password: hashedPassword, updatedAt: formattedDateTime } });
            info('password updated ',updatedUser.userid);
            userPayload = {
                id: updatedUser._id,
                userid: updatedUser.userid,
                username: updatedUser.username
            };
            tokenValue = jwt.sign(userPayload, config.Jwt, { expiresIn: '1h' });
            
            return response.status(200).json({ message: "Password Updated Successfully", token: tokenValue, user: userPayload });
        }

    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
});


// ------------------------------------------------------------------------------


// export router 
module.exports = loginRouter;