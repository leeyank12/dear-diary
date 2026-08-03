const nodemailer = require('nodemailer');

let testTransporter = null;

/**
 * Creates and returns a Nodemailer transporter.
 * Uses SMTP settings from process.env if provided, otherwise creates an Ethereal test account.
 */
async function getTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const isSecure = port === 465 || process.env.SMTP_SECURE === 'true';

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: isSecure, // true for port 465 (Direct SSL), false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }

  // Fallback to Ethereal Test Account if no SMTP env vars configured
  if (!testTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[MAILER] Ethereal SMTP Test Account initialized for: ${testAccount.user}`);
    } catch (err) {
      console.error('[MAILER] Failed to create Ethereal test account:', err);
    }
  }

  return testTransporter;
}

/**
 * Sends an email using Nodemailer.
 * @param {Object} options - { to, subject, html, text }
 */
async function sendEmail({ to, subject, html, text }) {
  try {
    // 1. HTTPS API Layer (Bypasses Render firewall blocks over standard Port 443)
    if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Dear Diary <onboarding@resend.dev>',
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log(`[RESEND HTTPS API] Email sent to ${to}. Message ID: ${data.id}`);
          return { success: true, messageId: data.id };
        } else {
          console.error('[RESEND API ERROR]', data);
        }
      } catch (err) {
        console.error('[RESEND FETCH ERROR]', err.message);
      }
    }

    // 1b. Brevo (Sendinblue) HTTPS API (Bypasses Render firewall over Port 443)
    if (process.env.BREVO_API_KEY) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Dear Diary', email: process.env.SMTP_USER || 'itsdiary000@gmail.com' },
            to: [{ email: Array.isArray(to) ? to[0] : to }],
            subject,
            htmlContent: html,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log(`[BREVO HTTPS API] Email sent to ${to}. Message ID: ${data.messageId}`);
          return { success: true, messageId: data.messageId };
        } else {
          console.error('[BREVO API ERROR]', data);
        }
      } catch (err) {
        console.error('[BREVO FETCH ERROR]', err.message);
      }
    }

    // 2. Nodemailer Transporter (SMTP)
    const transporter = await getTransporter();
    if (!transporter) {
      console.log(`[MAILER FALLBACK LOG] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    const fromAddress = process.env.EMAIL_FROM || '"Dear Diary" <itsdiary000@gmail.com>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    });

    console.log(`[MAILER] Email sent to ${to}. Message ID: ${info.messageId}`);
    
    // If using Ethereal, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[MAILER ETHEREAL PREVIEW] View email online: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    };
  } catch (error) {
    console.error('[MAILER ERROR] Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Styled HTML Template Generator for Journal Reminders & Guardian Stress Alerts
 */
function createEmailTemplate({ title, greeting, bodyContent, actionText, actionUrl, badgeText }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #090a12; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #121526; border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #7e22ce, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .badge { display: inline-block; background: rgba(217, 119, 6, 0.15); color: #fbbf24; border: 1px solid rgba(217, 119, 6, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 10px; }
          .content { padding: 24px 0; line-height: 1.6; color: #cbd5e1; font-size: 15px; }
          .title { font-size: 22px; color: #ffffff; margin-bottom: 12px; font-weight: 700; }
          .button-box { text-align: center; margin: 28px 0; }
          .button { background: linear-gradient(135deg, #6b21a8, #7e22ce, #d97706); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(126,34,206,0.4); }
          .footer { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📔 Dear Diary</div>
            ${badgeText ? `<div class="badge">${badgeText}</div>` : ''}
          </div>
          <div class="content">
            <h2 class="title">${title}</h2>
            <p>Hello ${greeting || 'there'},</p>
            ${bodyContent}
            ${actionText && actionUrl ? `
              <div class="button-box">
                <a href="${actionUrl}" class="button" target="_blank">${actionText}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>Sent with care by Dear Diary — Personal Mood Tracker & Journal</p>
            <p>If you wish to change your notification preferences, visit your Profile & Settings.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

module.exports = { sendEmail, createEmailTemplate };
