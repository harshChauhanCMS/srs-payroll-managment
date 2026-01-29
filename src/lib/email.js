import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send welcome email with login credentials to new user
 */
export async function sendWelcomeEmail(to, name, password) {
  const mailOptions = {
    from: `"SRS Payroll" <${process.env.EMAIL_ID}>`,
    to,
    subject: "Welcome to SRS Payroll - Your Login Credentials",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: #C2A368; margin: 0; text-align: center;">SRS Payroll</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1E3A5F; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="color: #555; line-height: 1.6;">
            Your account has been created successfully. Please use the following credentials to log in:
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Password:</strong> ${password}</p>
          </div>
          <p style="color: #555; line-height: 1.6;">
            For security reasons, we recommend changing your password after your first login.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" 
               style="background: #C2A368; color: #1E3A5F; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Login Now
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated email. Please do not reply directly to this message.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
}

export default transporter;
