const mongoose = require('mongoose');

function connectDB() {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log('Connected to MongoDB...');
        })
        .catch((err) => {
            console.error(`MongoDB connection error: ${err.message}`)
            process.exit(1);
        })
}

module.exports = connectDB;
