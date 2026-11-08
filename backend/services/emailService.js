const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendStudentCredentials(email, name, studentId, password) {
  await transporter.sendMail({
    from: `"Educore" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your EduCore Account",
    text: `
Hello ${name},

Your student account has been created successfully.

Student ID: ${studentId}
Email: ${email}
Temporary Password: ${password}

Please log in using these credentials and change your password after your first login.

Regards,
Educore
    `,
  });
}

async function sendPasswordResetEmail(email, name, resetUrl, expiresInMinutes) {
  await transporter.sendMail({
    from: `"Educore" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your EduCore password",
    text: `
Hello ${name},

We received a request to reset the password for your EduCore account.

Open the link below to choose a new password:
${resetUrl}

This link expires in ${expiresInMinutes} minutes and can only be used once.

If you did not request a password reset, you can ignore this email. Your password will not change.

Regards,
Educore
    `,
  });
}

module.exports = sendStudentCredentials;
module.exports.sendStudentCredentials = sendStudentCredentials;
module.exports.sendPasswordResetEmail = sendPasswordResetEmail;