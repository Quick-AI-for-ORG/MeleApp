const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dalia2110446@miuegypt.edu.eg",
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendUpgradeConfirmation = async (userEmail, formData) => {
  try {
    const mailOptions = {
      from: "dalia2110446@miuegypt.edu.eg",
      to: userEmail,
      subject: "🐝 Mele Keeper Upgrade Confirmation",
      text: `Thank you for upgrading to Mele Keeper!
                
Apiary Name: ${formData.apiaryName}
Number of Hives: ${formData.hivesCount}
Dimensions: ${formData.length}cm x ${formData.width}cm x ${formData.height}cm
Number of Frames: ${formData.framesCount}
Selected Kits: ${formData.kitSelection.join(", ")}
${
  formData.latitude && formData.longitude
    ? `Location: Lat: ${formData.latitude}, Long: ${formData.longitude}`
    : ""
}

Our team will process your request and contact you shortly with payment instructions.
If you have any questions, please don't hesitate to contact us.

Best regards,
The Mele Team 🐝`,
      html: `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mele Keeper Upgrade Confirmation</title>
                </head>
                <body>
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #fff7e6; border-radius: 10px; border: 2px solid #fca311;">
                        <!-- Header -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h2 style="color: #16404d; margin: 0;">Thank You for Upgrading to Mele Keeper! 🐝</h2>
                        </div>

                        <!-- Order Details -->
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fca311;">
                            <h3 style="color: #fca311; margin-top: 0;">Order Details 📋</h3>
                            <ul style="list-style: none; padding: 0; color: #16404d;">
                                <li style="margin-bottom: 10px;">🏡 <strong>Apiary Name:</strong> ${
                                  formData.apiaryName
                                }</li>
                                <li style="margin-bottom: 10px;">🔢 <strong>Number of Hives:</strong> ${
                                  formData.hivesCount
                                }</li>
                                <li style="margin-bottom: 10px;">📏 <strong>Dimensions:</strong> ${
                                  formData.length
                                }cm x ${formData.width}cm x ${
        formData.height
      }cm</li>
                                <li style="margin-bottom: 10px;">🎯 <strong>Number of Frames:</strong> ${
                                  formData.framesCount
                                }</li>
                                <li style="margin-bottom: 10px;">📦 <strong>Selected Kits:</strong> ${formData.kitSelection.join(
                                  ", "
                                )}</li>
                                ${
                                  formData.latitude && formData.longitude
                                    ? `<li style="margin-bottom: 10px;">📍 <strong>Location:</strong> Lat: ${formData.latitude}, Long: ${formData.longitude}</li>`
                                    : ""
                                }
                            </ul>
                        </div>

                        <!-- Next Steps -->
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fca311;">
                            <h3 style="color: #fca311; margin-top: 0;">Next Steps 🚀</h3>
                            <p style="color: #16404d;">Our team will process your request and contact you shortly with payment instructions.</p>
                            <p style="color: #16404d;">If you have any questions, please don't hesitate to contact us.</p>
                        </div>

                        <!-- Footer -->
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #fca311;">
                            <p style="color: #16404d; margin: 5px 0;">Best regards,</p>
                            <p style="color: #16404d; font-weight: bold; margin: 5px 0;">The Mele Team 🐝</p>
                        </div>
                    </div>
                </body>
                </html>`,
      alternative: true,
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
