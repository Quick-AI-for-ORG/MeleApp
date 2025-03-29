const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendUpgradeConfirmation = async (userEmail, formData) => {
  try {
    const msg = {
      to: userEmail,
      from: {
        email: "melerimba@gmail.com", // Must exactly match a verified sender
        name: "Mele Support", // Optional display name
      },
      replyTo: "melerimba@gmail.com",
      subject: "Mele Keeper Upgrade Confirmation",
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
                                                            ? `<div style="margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-radius: 6px;">
                                                                <p style="margin: 5px 0;">📍 <strong>Installation Location:</strong></p>
                                                                <p style="margin: 5px 0 10px 20px;">Coordinates: ${formData.latitude}, ${formData.longitude}</p>
                                                                <p style="margin: 5px 0 5px 20px;">
                                                                    <a href="https://www.openstreetmap.org/?mlat=${formData.latitude}&mlon=${formData.longitude}&zoom=15" 
                                                                       style="color: #fca311; text-decoration: none;" 
                                                                       target="_blank">
                                                                       View on OpenStreetMap ↗
                                                                    </a>
                                                                </p>
                                                              </div>`
                                                            : ""
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Weather Information -->
                                ${
                                  formData.weather
                                    ? `<tr>
                                        <td style="padding: 0 20px 20px;">
                                            <table width="100%" cellpadding="20" cellspacing="0" style="background-color: white; border-radius: 8px; border: 1px solid #fca311;">
                                                <tr>
                                                    <td>
                                                        <h3 style="color: #fca311; margin: 0 0 15px;">Weather Conditions 🌤️</h3>
                                                        <div style="color: #16404d;">
                                                            <p style="margin: 5px 0;">📍 <strong>Location:</strong> ${formData.weather.location}</p>
                                                            <p style="margin: 5px 0;">🌡️ <strong>Temperature:</strong> ${formData.weather.temperature}°C</p>
                                                            <p style="margin: 5px 0;">💧 <strong>Humidity:</strong> ${formData.weather.humidity}%</p>
                                                            <p style="margin: 5px 0;">💨 <strong>Wind Speed:</strong> ${formData.weather.windSpeed} m/s</p>
                                                            <p style="margin: 5px 0;">☁️ <strong>Conditions:</strong> ${formData.weather.description}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>`
                                    : ""
                                }

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
    };

    const result = await sgMail.send(msg);
    console.log("Email sent successfully to:", userEmail);
    console.log("SendGrid Response:", result);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response?.body?.errors) {
      console.error(
        "SendGrid Detailed Errors:",
        JSON.stringify(error.response.body.errors, null, 2)
      );
    }
    return false;
  }
};

module.exports = {
  sendUpgradeConfirmation,
};
