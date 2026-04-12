const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

async function initTransporter() {
    if (transporter) return transporter;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    // Use environment variables if host and port are provided
    if (SMTP_HOST && SMTP_PORT) {
        const transportConfig = {
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT, 10),
            secure: SMTP_PORT == 465, // true for 465, false for other ports
        };

        // Only add auth if credentials are provided (internal relays may not need auth)
        if (SMTP_USER && SMTP_PASS) {
            transportConfig.auth = {
                user: SMTP_USER,
                pass: SMTP_PASS,
            };
        }

        transporter = nodemailer.createTransport(transportConfig);
        console.log(`[Email] Configured using SMTP server at ${SMTP_HOST}:${SMTP_PORT}`);
    } else {
        // Fallback to Ethereal Testing
        console.log('[Email] No SMTP credentials provided, creating Ethereal test account...');
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log(`[Email] Fake Ethereal account ready: ${testAccount.user}`);
    }
    return transporter;
}

const getFromEmail = () => process.env.SMTP_FROM_EMAIL || '"CertifiedCityWhips" <no-reply@certifiedcitywhips.com>';
const getAdminEmail = () => process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@certifiedcitywhips.com';

/**
 * Send an order/reservation confirmation to the user.
 * @param {Object} user - { email, name }
 * @param {Number} id - Order or Reservation ID
 * @param {String} type - 'order' or 'rental'
 * @param {String} origin - Base URL of the site, e.g. 'http://localhost:3000'
 */
async function sendOrderConfirmation(user, id, type, origin = 'http://localhost:3000') {
    try {
        const tp = await initTransporter();
        const invoiceLink = `${origin}/invoice.html?type=${type}&id=${id}`;
        
        let subject = type === 'order' ? `CCW: Store Order Confirmation #${id}` : `CCW: Vehicle Reservation Confirmation #${id}`;
        
        let htmlContent = `
            <h2>Thank you for your ${type === 'order' ? 'order' : 'reservation'}, ${user.name || 'valued customer'}!</h2>
            <p>Your ${type === 'order' ? 'order' : 'rental'} has been confirmed. Your transaction number is: <strong>${id}</strong>.</p>
            <p>You can view your detailed invoice and receipt online using the link below:</p>
            <p><a href="${invoiceLink}" style="padding: 10px 15px; color: white; background-color: #ff3c3c; text-decoration: none; border-radius: 5px;">View Your Invoice</a></p>
            <p>If you have any questions, please contact our help desk.</p>
            <br>
            <p>Sincerely,</p>
            <p>The CertifiedCityWhips Team</p>
        `;

        let info = await tp.sendMail({
            from: getFromEmail(),
            to: user.email,
            subject: subject,
            html: htmlContent,
        });

        console.log(`[Email] Confirmation sent to ${user.email} (Message ID: ${info.messageId})`);
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log(`[Email Preview]: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (err) {
        console.error('[Email] Failed to send order confirmation:', err);
    }
}

/**
 * Send a notification to the admin about a new order/reservation.
 * @param {Object} user - { email, name }
 * @param {Number} id - Order or Reservation ID
 * @param {String} type - 'order' or 'rental'
 * @param {Number} totalCost - Total cost for the transaction
 */
async function sendAdminNotification(user, id, type, totalCost) {
    try {
        const tp = await initTransporter();
        let subject = `New ${type === 'order' ? 'Store Order' : 'Reservation'} Received! (#${id})`;
        
        let htmlContent = `
            <h2>New ${type === 'order' ? 'Order' : 'Reservation'} Alert</h2>
            <p><strong>Customer:</strong> ${user.name || 'Unknown'} (${user.email})</p>
            <p><strong>Transaction ID:</strong> ${id}</p>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Total Amount:</strong> $${totalCost}</p>
            <p>Please log in to the legacy metrics portal to view full details securely.</p>
        `;

        let info = await tp.sendMail({
            from: getFromEmail(),
            to: getAdminEmail(),
            subject: subject,
            html: htmlContent,
        });

        console.log(`[Email] Admin notification sent (Message ID: ${info.messageId})`);
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log(`[Email Preview]: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (err) {
        console.error('[Email] Failed to send admin notification:', err);
    }
}

module.exports = {
    sendOrderConfirmation,
    sendAdminNotification
};
