const { required } = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    resetPasswordToken: {
        type: String,
        default: ''
    },

    resetPasswordExpires: {
        type: Date
    }
    
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
