const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendAdminNotification(student) {
  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [process.env.ADMIN_EMAIL],

    // Student can reply directly to the applicant
    replyTo: student.email,

    subject: "New Student Application Received",

    html: `
      <h2>New Recruitment Application!</h2>

      <p>A new student has submitted an application.</p>

      <h3>Applicant Details</h3>

      <p><b>Name:</b> ${escapeHtml(student.name)}</p>
      <p><b>Email:</b> ${escapeHtml(student.email)}</p>
      <p><b>Branch:</b> ${escapeHtml(student.branch)}</p>
      <p><b>Year:</b> ${escapeHtml(student.year)}</p>

      <h3>Reason for Applying</h3>
      <p>${escapeHtml(student.reason)}</p>

      <hr />

      <p>Please review this application.</p>
      <p>Recruitment Team</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

module.exports = { sendAdminNotification };
