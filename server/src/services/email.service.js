
const sendOtpEmail = async (email, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo environment variables are missing");
  }

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "ContriFlow",
          email: senderEmail,
        },
        to: [{ email }],
        subject: "Your ContriFlow verification code",
        textContent: `Your ContriFlow OTP is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif">
            <h2>Verify your ContriFlow account</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 6px">${otp}</h1>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not request this code, ignore this email.</p>
          </div>
        `,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Brevo API error:", response.status, error);
    throw new Error("Failed to send verification email");
  }

  return response.json();
};

module.exports = {sendOtpEmail};
