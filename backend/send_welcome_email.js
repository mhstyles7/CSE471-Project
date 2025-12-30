// Send confirmation email to a specific user
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const mailOptions = {
    from: `"PothChola" <${process.env.EMAIL_USER}>`,
    to: 'shadhin00@gmail.com',
    subject: '✅ Welcome to PothChola - Account Confirmation',
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 32px; }
                .footer { background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to PothChola!</h1>
                </div>
                <div class="content">
                    <p>Dear Traveler,</p>
                    <p>Welcome to <strong>PothChola</strong>! Your account has been successfully created.</p>
                    
                    <p>With PothChola, you can:</p>
                    <ul>
                        <li>🗺️ Discover amazing travel destinations across Bangladesh</li>
                        <li>📦 Book exclusive travel packages from verified agencies</li>
                        <li>🎒 Connect with local guides for authentic experiences</li>
                        <li>👥 Join group events and make new friends</li>
                        <li>🍽️ Explore local culture and cuisine</li>
                    </ul>
                    
                    <p>Start exploring now and plan your next adventure!</p>
                    
                    <p style="margin-top: 24px;">Happy travels! 🌍</p>
                    <p><strong>Team PothChola</strong></p>
                </div>
                <div class="footer">
                    <p>© 2025 PothChola - Explore Bangladesh</p>
                </div>
            </div>
        </body>
        </html>
    `
};

console.log('Sending welcome email to shadhin00@gmail.com...');

transporter.sendMail(mailOptions)
    .then(info => {
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    })
    .catch(err => {
        console.log('❌ Error sending email:', err.message);
    });
