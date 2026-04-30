const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS, // Support both variable names
    },
});

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email to user
 * @param {string} email - User email
 * @param {string} otp - OTP to send
 * @param {string} name - User name
 */
const sendOTPEmail = async (email, otp, name) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'CivicConnect - Email Verification OTP',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
                        .container { max-width: 600px; margin: 20px auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
                        .header h1 { margin: 0; font-size: 24px; }
                        .content { color: #333; line-height: 1.6; }
                        .otp-box { background-color: #f0f0f0; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; letter-spacing: 5px; font-family: monospace; }
                        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
                        .warning { color: #e74c3c; font-size: 12px; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>CivicConnect</h1>
                            <p>Email Verification</p>
                        </div>
                        <div class="content">
                            <p>Hi <strong>${name}</strong>,</p>
                            <p>Thank you for registering with CivicConnect! To complete your registration, please verify your email address using the OTP below:</p>
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                            </div>
                            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
                            <p>If you didn't request this OTP, please ignore this email or contact support.</p>
                            <div class="warning">
                                ⚠️ Never share this OTP with anyone. CivicConnect team will never ask for your OTP via email or phone.
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 CivicConnect. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error('Email sending error:', err);
        return false;
    }
};

module.exports = { generateOTP, sendOTPEmail };
