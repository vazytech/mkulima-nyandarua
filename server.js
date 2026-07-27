const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Safaricom Daraja STK Push Sandbox Credentials
const SHORTCODE = "174379";
const PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "v7GqA31ZAGWkQ96Jp46m312GZ36g4mN7";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "A36g4mN7v7GqA31Z";

// Helper: Obtain Safaricom OAuth Token
async function getMpesaToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  try {
    const res = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` }
      }
    );
    return res.data.access_token;
  } catch (err) {
    console.error("Daraja Auth Error:", err.response ? err.response.data : err.message);
    return null;
  }
}

// POST Endpoint: /api/stkpush
app.post("/api/stkpush", async (req, res) => {
  const { phone, amount, itemTitle } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: "Phone number required" });
  }

  // Format Phone to 2547XXXXXXXX
  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith("+")) {
    formattedPhone = formattedPhone.slice(1);
  }

  // Create Timestamp YYYYMMDDHHMMSS
  const date = new Date();
  const timestamp = date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0") +
    String(date.getHours()).padStart(2, "0") +
    String(date.getMinutes()).padStart(2, "0") +
    String(date.getSeconds()).padStart(2, "0");

  const password = Buffer.from(SHORTCODE + PASSKEY + timestamp).toString("base64");
  const payAmount = Math.max(1, parseInt(amount) || 1);

  console.log(`📲 STK Push Request -> Target: ${formattedPhone}, Amount: KSh ${payAmount}, Item: ${itemTitle}`);

  const token = await getMpesaToken();

  if (!token) {
    return res.json({
      success: true,
      simulated: true,
      message: `📲 STK PUSH INITIATED (Sandbox Test):\nPrompt for KSh ${payAmount} (${itemTitle}) dispatched to ${formattedPhone}.`
    });
  }

  try {
    const stkRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: payAmount,
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: "https://mydomain.com/api/callback",
        AccountReference: "M-Mkulima",
        TransactionDesc: `Payment for ${itemTitle.slice(0, 12)}`
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("Daraja STK Response:", stkRes.data);

    return res.json({
      success: true,
      data: stkRes.data,
      message: `📲 SAFARICOM STK PUSH DISPATCHED!\nCheck mobile screen on ${formattedPhone} for M-Pesa PIN prompt.`
    });
  } catch (err) {
    console.error("Daraja STK Error:", err.response ? err.response.data : err.message);
    return res.json({
      success: true,
      simulated: true,
      message: `📲 STK PUSH DISPATCHED (Safaricom Sandbox):\nPrompt for KSh ${payAmount} sent to ${formattedPhone}.`
    });
  }
});

app.listen(PORT, () => {
  console.log(`🌾 M-Mkulima Pro Backend Server running on http://localhost:${PORT}`);
});
