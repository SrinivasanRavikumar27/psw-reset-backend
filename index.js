const config = require('./utils/config.js');
const app = require('./app.js');
const mongoose = require('mongoose');
const {info,error} = require('./utils/logger.js');

mongoose.set('strictQuery',false);  

// connect mongodb using mongoose
info('connecting to db ...',config.MongoDb_Url);

mongoose.connect(config.MongoDb_Url).then(
    () => {
        
        info( "Mongodb connected successfully" );

        // listener
app.listen(config.Port,() => {
    info( `Server is running at port : ${config.Port}` );
});

    }
).catch( (Error) => {
    error("Error while connecting to Mongodb ...",Error);
});

