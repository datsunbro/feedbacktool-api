// THis file will handle the connection logic to the MongoDB database
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect( 'mongodb://localhost:27017/feedbacktool', { useNewUrlParser: true } ).then( () => {
    console.log( "Connected to MongoDB successfully!" );
}).catch( ( e ) => {
    console.log( "Error while connecting to MongoDB!" );
    console.log( e );
});

// To prevent deprecation warnings from MongoDB native driver
mongoose.set( 'useCreateIndex', true );
mongoose.set( 'useFindAndModify', false);

module.exports = {
    mongoose
};