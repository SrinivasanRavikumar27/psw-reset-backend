require('dotenv').config();

const MongoDb_Url = process.env.MONGODB_URL;
const Port = process.env.PORT;
const Jwt = process.env.JWT_TOKEN;
const UserName = process.env.USER_NAME;
const Password = process.env.PASSWORD;
const BaseUrl_FE = process.env.BASEURL_FE;

module.exports = {
    MongoDb_Url,Port,Jwt,UserName,Password,BaseUrl_FE
}