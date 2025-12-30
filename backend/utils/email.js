const nodemailer = require('nodemailer');

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

/**
 * Send booking confirmation email to traveler
 * @param {string} to - Traveler's email address
 * @param {object} booking - Booking details
 */
const sendBookingConfirmation = async (to, booking) => {
    const mailOptions = {
        from: `"PothChola" <${process.env.EMAIL_USER}>`,
        to,
        subject: `✅ Booking Confirmed: ${booking.packageTitle || 'Your Trip'}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center; color: white; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .header p { margin: 8px 0 0; opacity: 0.9; }
                    .content { padding: 32px; }
                    .success-icon { font-size: 48px; margin-bottom: 16px; }
                    .details { background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0; }
                    .details h3 { margin: 0 0 16px; color: #059669; font-size: 18px; }
                    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #d1fae5; }
                    .detail-row:last-child { border-bottom: none; }
                    .detail-label { color: #6b7280; font-weight: 500; }
                    .detail-value { color: #1f2937; font-weight: 600; }
                    .footer { background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
                    .btn { display: inline-block; background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="success-icon">🎉</div>
                        <h1>Booking Confirmed!</h1>
                        <p>Your travel package has been approved</p>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${booking.travelerName || 'Traveler'}</strong>,</p>
                        <p>Great news! Your booking request has been confirmed${booking.agencyName ? ` by <strong>${booking.agencyName}</strong>` : ''}. Here are your booking details:</p>
                        
                        <div class="details">
                            <h3>📋 Booking Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Package</span>
                                <span class="detail-value">${booking.packageTitle || 'Custom Package'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Agency</span>
                                <span class="detail-value">${booking.agencyName || 'Not specified'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Preferred Dates</span>
                                <span class="detail-value">${booking.preferredDates || 'Flexible'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Travelers</span>
                                <span class="detail-value">${booking.numberOfTravelers || 1} person(s)</span>
                            </div>
                            ${booking.proposedPrice ? `
                            <div class="detail-row">
                                <span class="detail-label">Proposed Price</span>
                                <span class="detail-value">৳${booking.proposedPrice}</span>
                            </div>
                            ` : ''}
                            ${booking.agencyResponse ? `
                            <div class="detail-row">
                                <span class="detail-label">Agency Message</span>
                                <span class="detail-value">${booking.agencyResponse}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <p>The agency will contact you soon with further details. If you have any questions, please reach out to them directly.</p>
                        
                        <p style="margin-top: 24px;">Happy travels! 🌍</p>
                        <p><strong>Team PothChola</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated confirmation from PothChola.</p>
                        <p>© 2025 PothChola - Explore Bangladesh</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent to:', to);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send guide booking confirmation email
 * @param {string} to - Traveler's email address
 * @param {object} booking - Guide booking details
 */
const sendGuideBookingConfirmation = async (to, booking) => {
    const mailOptions = {
        from: `"PothChola" <${process.env.EMAIL_USER}>`,
        to,
        subject: `✅ Guide Booking Confirmed: ${booking.guideName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center; color: white; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 32px; }
                    .details { background: #f5f3ff; border-radius: 12px; padding: 24px; margin: 24px 0; }
                    .details h3 { margin: 0 0 16px; color: #7c3aed; }
                    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9d5ff; }
                    .detail-row:last-child { border-bottom: none; }
                    .detail-label { color: #6b7280; }
                    .detail-value { color: #1f2937; font-weight: 600; }
                    .footer { background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎒 Guide Booking Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${booking.travelerName || 'Traveler'}</strong>,</p>
                        <p>Your guide booking has been confirmed!</p>
                        
                        <div class="details">
                            <h3>📋 Booking Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Guide</span>
                                <span class="detail-value">${booking.guideName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Amount</span>
                                <span class="detail-value">৳${booking.amount || 400}</span>
                            </div>
                        </div>
                        
                        <p>Your guide will contact you soon. Happy exploring!</p>
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

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Guide booking email sent to:', to);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendBookingConfirmation,
    sendGuideBookingConfirmation
};
