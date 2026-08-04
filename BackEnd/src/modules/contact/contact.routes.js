/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact form operations
 */
const express = require("express");
const router = express.Router();
const contactController = require("./contact.controller");

// POST /api/contact - Submit a contact form
/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact form
 *     tags: [Contact]
 *     responses:
 *       201:
 *         description: Contact form submitted
 */
router.post("/", contactController.submitContactForm);

// GET /api/contact - Get all contact submissions (admin only, no auth middleware for now)
/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get all contact submissions
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: List of contact submissions
 */
router.get("/", contactController.getContactSubmissions);

module.exports = router;
