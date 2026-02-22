const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateName: String,
    email: String,
    resumePath: String,
    mcqScores: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['applied', 'knocked_out', 'shortlisted'],
        default: 'applied'
    },
    appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);
