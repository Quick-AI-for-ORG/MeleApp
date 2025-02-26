const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "melerimba@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendUpgradeConfirmation = async (userEmail, formData) => {
  try {
    const mailOptions = {
      from: "melerimba@gmail.com",
      to: userEmail,
      subject: "🐝 Mele Keeper Upgrade Confirmation",
      html: `
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
                    <tr>
                        <td style="padding: 20px;">
                            <!-- Header -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7e6; border-radius: 10px; border: 2px solid #fca311;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <h2 style="color: #16404d; margin: 0;">Thank You for Upgrading to Mele Keeper! 🐝</h2>
                                    </td>
                                </tr>

                                <!-- Order Details Section -->
                                <tr>
                                    <td style="padding: 0 20px 20px;">
                                        <table width="100%" cellpadding="20" cellspacing="0" style="background-color: white; border-radius: 8px; border: 1px solid #fca311;">
                                            <tr>
                                                <td>
                                                    <h3 style="color: #fca311; margin: 0 0 15px;">Order Details 📋</h3>
                                                    <div style="color: #16404d;">
                                                        <p style="margin: 5px 0;">🏡 <strong>Apiary Name:</strong> ${
                                                          formData.apiaryName
                                                        }</p>
                                                        <p style="margin: 5px 0;">🔢 <strong>Number of Hives:</strong> ${
                                                          formData.hivesCount
                                                        }</p>
                                                        <p style="margin: 5px 0;">📏 <strong>Dimensions:</strong> ${
                                                          formData.length
                                                        }cm x ${
        formData.width
      }cm x ${formData.height}cm</p>
                                                        <p style="margin: 5px 0;">🎯 <strong>Number of Frames:</strong> ${
                                                          formData.framesCount
                                                        }</p>
                                                        <p style="margin: 5px 0;">📦 <strong>Selected Kits:</strong> ${formData.kitSelection.join(
                                                          ", "
                                                        )}</p>
                                                        ${
                                                          formData.latitude &&
                                                          formData.longitude
                                                            ? `<p style="margin: 5px 0;">📍 <strong>Location:</strong> Lat: ${formData.latitude}, Long: ${formData.longitude}</p>`
                                                            : ""
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Next Steps Section -->
                                <tr>
                                    <td style="padding: 0 20px 20px;">
                                        <table width="100%" cellpadding="20" cellspacing="0" style="background-color: white; border-radius: 8px; border: 1px solid #fca311;">
                                            <tr>
                                                <td>
                                                    <h3 style="color: #fca311; margin: 0 0 15px;">Next Steps 🚀</h3>
                                                    <p style="color: #16404d; margin: 5px 0;">Our team will process your request and contact you shortly with payment instructions.</p>
                                                    <p style="color: #16404d; margin: 5px 0;">If you have any questions, please don't hesitate to contact us.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 20px; text-align: center; border-top: 2px solid #fca311;">
                                        <p style="color: #16404d; margin: 5px 0;">Best regards,</p>
                                        <p style="color: #16404d; font-weight: bold; margin: 5px 0;">The Mele Team 🐝</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>`,
      // Remove alternative and text version to reduce size
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
