const express = require('express');
const router = express.Router();
const contactController = require('./contact.controller');

// POST /api/contact - Submit a contact form
router.post('/', contactController.submitContactForm);

// GET /api/contact - Get all contact submissions (admin only, no auth middleware for now)
router.get('/', contactController.getContactSubmissions);

module.exports = router;
