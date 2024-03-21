const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userid : {type : String}, 
    username: { type: String },
    email : {type : String},
    password: { type: String},
    createdAt : {type : String},
    updatedAt : {type : String},
});

const userModel = mongoose.model('User',userSchema,'users');

module.exports = userModel;