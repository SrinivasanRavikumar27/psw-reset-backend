const userRouter = require('express').Router();
const userModel = require('../models/userModel.js');
const bycrpt = require('bcrypt');
const {info,error} = require('../utils/logger.js');

 // user profile
 userRouter.get('/getProfile', async (request,response) => {

    try {
        
        // define user id
        const userId = request.userId;

        // find by id query
        const user = await userModel.findById(userId,{});

        response.status(200).json(user);

    } catch (error) {
        response.status(500).json({error : error.message});
    }

});

// edit and update profile
userRouter.put('/edit', async (request,response) => {

    try {
        
        // define user 
        const userID = request.userId;

        // get request body
        const {username,name} = request.body;

        // find by id and update query 
        const user = await userModel.findByIdAndUpdate(userID,{username,name},{new:true});

        console.log(user);

        // response update
        response.status(200).json({message : 'user updated sucessfully',user});

    } catch (error) {
        response.status(500).json({error : error.message});
    }

});

// delete user profile
userRouter.delete('/delete', async (request,response) => {

    try {
        
        // define user
        const userId = request.userId;

        // find by id and delete query
        const user = await userModel.findByIdAndDelete(userId);

        // response update 
        response.status(200).json({message : 'user deleted sucessfuly'});

    } catch (error) {
        response.status(500).json({error : error.message});
    }

});


module.exports = userRouter;