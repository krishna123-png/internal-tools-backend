const mongoose = require('mongoose')

const userLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },

    tool: {
        type: String,
        required: true,
        enum: ['ai-assistant', 'code-tool', 'summarizer', 'resume-analyzer']
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});

const UserLog = mongoose.model('UserLog', userLogSchema);
module.exports = UserLog;
