const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dalia2110446@miuegypt.edu.eg",
    pass: process.env.EMAIL_PASSWORD, // Add this to your .env file
  },
});

const sendUpgradeConfirmation = async (userEmail, apiaryName, hivesCount) => {
  try {
    const mailOptions = {
      from: "dalia2110446@miuegypt.edu.eg",
      to: userEmail,
      subject: "Mele Keeper Upgrade Confirmation",
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16404d;">Thank You for Upgrading to Mele Keeper!</h2>
                    <p>We have received your upgrade request for:</p>
                    <ul>
                        <li>Apiary Name: ${apiaryName}</li>
                        <li>Number of Hives: ${hivesCount}</li>
                    </ul>
                    <p>Our team will process your request and contact you shortly with payment instructions.</p>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666;">Best regards,<br>The Mele Team</p>
                    </div>
                </div>
            `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = {
  sendUpgradeConfirmation,
};
