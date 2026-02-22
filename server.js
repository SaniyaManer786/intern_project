const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const Job = require('./models/Job');
const Application = require('./models/Application');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dmless')
    .then(() => console.log('✅ MongoDB Connected!'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });

// API Routes

// Create Job
app.post('/api/jobs', async (req, res) => {
    try {
        const { role, jd, mcqs } = req.body;
        const linkId = uuidv4().slice(0, 8);

        const job = new Job({ role, jd, mcqs, linkId });
        await job.save();

        const link = `http://localhost:3000/apply.html?job=${linkId}`;
        res.json({ link });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Job by linkId
app.get('/api/jobs/:linkId', async (req, res) => {
    try {
        const job = await Job.findOne({ linkId: req.params.linkId });
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const total = await Application.countDocuments();
        const knocked = await Application.countDocuments({ status: 'knocked_out' });
        const shortlisted = await Application.countDocuments({ status: 'shortlisted' });
        res.json({ total, knocked, shortlisted });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Applications
app.get('/api/applications', async (req, res) => {
    try {
        const apps = await Application.find().populate('jobId', 'role');
        res.json(apps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MCQ Knockout Check
app.post('/api/apply/:linkId/knockout', async (req, res) => {
    try {
        const job = await Job.findOne({ linkId: req.params.linkId });
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const { score, isCorrect } = req.body;

        if (!isCorrect) {
            await new Application({
                jobId: job._id,
                mcqScores: score,
                status: 'knocked_out'
            }).save();
            return res.json({ knockedOut: true });
        }

        res.json({ continue: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit Application
app.post('/api/apply/:linkId/submit', upload.single('resume'), async (req, res) => {
    try {
        const job = await Job.findOne({ linkId: req.params.linkId });
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const { name, email, mcqScores } = req.body;
        const resumePath = req.file ? `/uploads/${req.file.filename}` : null;

        const app = new Application({
            jobId: job._id,
            candidateName: name,
            email,
            resumePath,
            mcqScores: parseInt(mcqScores),
            status: 'shortlisted'
        });

        await app.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});





