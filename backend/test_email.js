// Test email sending
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '***SET***' : 'NOT SET');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Verify connection
transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Email configuration ERROR:', error.message);
    } else {
        console.log('✅ Email server is ready to send messages');

        // Send a test email
        transporter.sendMail({
            from: `"PothChola Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: 'PothChola Email Test',
            html: '<h1>🎉 Email is working!</h1><p>This is a test email from your PothChola application.</p>'
        }).then(info => {
            console.log('✅ Test email sent! Message ID:', info.messageId);
            console.log('Check your inbox at:', process.env.EMAIL_USER);
        }).catch(err => {
            console.log('❌ Failed to send test email:', err.message);
        });
    }
});
