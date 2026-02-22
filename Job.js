const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    role: { type: String, required: true },
    jd: { type: String, required: true },
    mcqs: [{
        q: String,
        options: [String],
        correct: Number
    }],
    linkId: { type: String, unique: true, required: true },
    recruiterId: { type: String, default: 'demo_recruiter' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
