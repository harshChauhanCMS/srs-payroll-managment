import nodemailer from "nodemailer";

// Configuration & Constants
const BRAND_COLORS = {
  primary: "#1E3A5F", // Navy
  accent: "#C2A368", // Gold
  bg: "#F4F7F6",
  text: "#333333",
};

// Ensure environment variables exist to avoid silent failures
const { EMAIL_ID, EMAIL_PASS, NEXT_PUBLIC_APP_URL } = process.env;
if (!EMAIL_ID || !EMAIL_PASS) {
  console.warn("⚠️  Email credentials missing in environment variables.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_ID,
    pass: EMAIL_PASS,
  },
});

/**
 * Generates the HTML template for the welcome email.
 * Separating this keeps the logic clean.
 */
function getWelcomeTemplate(name, email, password, loginUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SRS Payroll</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${BRAND_COLORS.bg}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      
      <div style="display: none; max-height: 0px; overflow: hidden;">
        Welcome to the team! Here are your login credentials for SRS Payroll.
      </div>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden;">
              
              <tr>
                <td style="background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #2D5A87 100%); padding: 40px; text-align: center;">
                  <h1 style="color: ${BRAND_COLORS.accent}; margin: 0; font-size: 28px; letter-spacing: 1px; font-weight: 600;">SRS Payroll</h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: ${BRAND_COLORS.primary}; margin-top: 0; font-size: 24px;">Welcome aboard, ${name}!</h2>
                  <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
                    Your account has been successfully created. We are thrilled to have you with us. Please use the credentials below to access your dashboard.
                  </p>

                  <div style="background-color: #f8f9fa; border: 1px dashed #d1d9e0; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 5px;">Username / Email</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.text}; font-weight: bold; font-size: 16px; padding-bottom: 20px;">${email}</td>
                      </tr>
                      <tr>
                        <td style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 5px;">Temporary Password</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.text}; font-weight: bold; font-family: monospace; font-size: 18px; letter-spacing: 1px;">${password}</td>
                      </tr>
                    </table>
                  </div>

                  <p style="color: #dc3545; background-color: #fff5f5; padding: 10px; border-radius: 4px; font-size: 13px; text-align: center; border-left: 3px solid #dc3545;">
                    <strong>Security Alert:</strong> Please change your password immediately after your first login.
                  </p>

                  <div style="text-align: center; margin-top: 35px;">
                    <a href="${loginUrl}" 
                       style="background-color: ${BRAND_COLORS.accent}; color: ${BRAND_COLORS.primary}; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; transition: background 0.3s;">
                      Login to Dashboard
                    </a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} SRS Payroll. All rights reserved.<br>
                    This is an automated message, please do not reply.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Send welcome email with login credentials to new user
 * @param {string} to - Recipient email
 * @param {string} name - User's full name
 * @param {string} password - Generated temporary password
 */
export async function sendWelcomeEmail(to, name, password) {
  const loginUrl = NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const mailOptions = {
    from: `"SRS Payroll Team" <${EMAIL_ID}>`,
    to,
    subject: "Welcome to SRS Payroll - Your Login Details",
    text: `Welcome ${name}! Your login details are: Email: ${to}, Password: ${password}. Please login at ${loginUrl}`, // Fallback for clients blocking HTML
    html: getWelcomeTemplate(name, to, password, loginUrl),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${to} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

export default transporter;
