const nodemailer = require('nodemailer');

// We will initialize the transporter dynamically
let transporter;

const initTransporter = async () => {
    if (transporter) return transporter;

    // Use SMTP environment variables if provided (for production)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Fallback to Ethereal Email for development if no SMTP vars exist
        console.log('📧 No SMTP credentials found in .env, generating Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('📧 Ethereal test account ready.');
    }
    return transporter;
};

/**
 * Sends a real email using Nodemailer.
 * In development, provides a clickable URL to preview the email.
 * @param {string} to Recipient email address
 * @param {string} subject Email subject
 * @param {string} text Email body (plain text)
 */
const sendMail = async (to, subject, text) => {
    try {
        const mailTransporter = await initTransporter();
        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL || '"TaskPro" <no-reply@taskpro.dev>',
            to,
            subject,
            text,
            html: text.replace(/\n/g, '<br>') // Simple HTML fallback
        };

        const info = await mailTransporter.sendMail(mailOptions);
        
        console.log(`✅ Email sent successfully to: ${to}`);
        
        // If using Ethereal email, provide a URL to preview the email in the console
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error; // Re-throw so the controller knows it failed
    }
};

module.exports = {
  sendMail,
};
