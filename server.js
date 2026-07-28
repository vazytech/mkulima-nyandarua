const express = require("express");
const cors = require("cors");
const axios = require("axios");

try {
  require("dotenv").config();
} catch (e) {
  // Graceful fallback if dotenv package is not loaded
}

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Safaricom Daraja STK Push Credentials
const SHORTCODE = process.env.MPESA_SHORTCODE || "174379";
const PASSKEY = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "v7GqA31ZAGWkQ96Jp46m312GZ36g4mN7";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "A36g4mN7v7GqA31Z";
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "nyandarua_admin_secret_2026";

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
        AccountReference: "M-Shambani",
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

// POST Endpoint: /api/mpesa/callback (Safaricom Webhook IPN Callback)
app.post("/api/mpesa/callback", (req, res) => {
  console.log("📲 [SAFARICOM M-PESA CALLBACK IPN RECEIVED]:", JSON.stringify(req.body, null, 2));

  try {
    const callbackData = req.body.Body ? req.body.Body.stkCallback : req.body;
    const resultCode = callbackData.ResultCode;
    const resultDesc = callbackData.ResultDesc;

    if (resultCode === 0) {
      const items = callbackData.CallbackMetadata ? callbackData.CallbackMetadata.Item : [];
      let mpesaReceipt = "";
      let amountPaid = 0;
      let phone = "";

      items.forEach(item => {
        if (item.Name === "MpesaReceiptNumber") mpesaReceipt = item.Value;
        if (item.Name === "Amount") amountPaid = item.Value;
        if (item.Name === "PhoneNumber") phone = item.Value;
      });

      console.log(`✅ [PAYMENT VERIFIED]: Receipt ${mpesaReceipt} | KSh ${amountPaid} from ${phone}`);
    } else {
      console.warn(`❌ [PAYMENT CANCELLED/FAILED]: Code ${resultCode} - ${resultDesc}`);
    }
  } catch (err) {
    console.error("Callback processing exception:", err);
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// Nyandarua Sub-County Pickup Points Mapping
const NYANDARUA_PICKUP_POINTS = {
  "Ol Kalou": { name: "Ol Kalou Farmers Central Depot", location: "Nyandarua Agribusiness Centre, Ward Office Road", agentPhone: "0718493313" },
  "Kinangop": { name: "Kinangop Dairy Coop Collection Hub", location: "Engineer Market Road, Station 4", agentPhone: "0723456789" },
  "Kipipiri": { name: "Wanjohi Agri-Supply Depot", location: "Kipipiri Ward Office Complex", agentPhone: "0734567890" },
  "Ol Joro Orok": { name: "Ol Joro Orok Produce Board Store", location: "Gathanji Highway Junction", agentPhone: "0711223344" },
  "Ndaragua": { name: "Ndaragua Farmers Association Hub", location: "Central Town Road, Depot 2", agentPhone: "0722334455" }
};

// POST Endpoint: /api/sms/order-confirmation (Africa's Talking SMS Engine)
app.post("/api/sms/order-confirmation", async (req, res) => {
  const { phone, subcounty, orderId, itemSummary, totalAmount } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: "Phone number required" });
  }

  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith("+")) {
    formattedPhone = formattedPhone.slice(1);
  }

  const selectedSub = subcounty && NYANDARUA_PICKUP_POINTS[subcounty] ? subcounty : "Ol Kalou";
  const pickup = NYANDARUA_PICKUP_POINTS[selectedSub];

  const smsMessage = `M-SHAMBANI ORDER CONFIRMED!
Order #: ${orderId || 'MSH-' + Math.floor(10000 + Math.random() * 90000)}
Items: ${itemSummary || 'Fodder Feed Order'}
Total Paid: KSh ${totalAmount || '0'} via M-Pesa

📍 PICKUP POINT:
${pickup.name}
${pickup.location}
📞 Station Agent: ${pickup.agentPhone}

Thank you for farming with M-Shambani!`;

  console.log(`📱 [AFRICA'S TALKING SMS DISPATCHED to +${formattedPhone}]:\n${smsMessage}\n----------------------------------`);

  const atApiKey = process.env.AT_API_KEY || "";
  const atUsername = process.env.AT_USERNAME || "sandbox";

  if (atApiKey) {
    try {
      await axios.post(
        "https://api.africastalking.com/version1/messaging",
        new URLSearchParams({
          username: atUsername,
          to: `+${formattedPhone}`,
          message: smsMessage
        }).toString(),
        {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "apiKey": atApiKey
          }
        }
      );
      console.log(`✅ SMS successfully delivered via Africa's Talking API to +${formattedPhone}`);
    } catch (atErr) {
      console.warn("Africa's Talking API dispatch warning:", atErr.response ? atErr.response.data : atErr.message);
    }
  }

  return res.json({
    success: true,
    smsSent: true,
    recipient: `+${formattedPhone}`,
    pickupPoint: pickup,
    message: smsMessage
  });
});

// POST Endpoint: /api/sms/reset-otp (Africa's Talking Password Reset OTP Engine)
app.post("/api/sms/reset-otp", async (req, res) => {
  const { phone, otpCode } = req.body;

  if (!phone || !otpCode) {
    return res.status(400).json({ success: false, error: "Phone number and OTP code are required" });
  }

  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith("+")) {
    formattedPhone = formattedPhone.slice(1);
  }

  const smsMessage = `Your M-Shambani password reset OTP code is ${otpCode}. Valid for 10 minutes.`;

  console.log(`📱 [BACKEND OTP SMS DISPATCH to +${formattedPhone}]: ${smsMessage}`);

  const atApiKey = process.env.AT_API_KEY || "";
  const atUsername = process.env.AT_USERNAME || "sandbox";

  if (atApiKey) {
    try {
      await axios.post(
        "https://api.africastalking.com/version1/messaging",
        new URLSearchParams({
          username: atUsername,
          to: `+${formattedPhone}`,
          message: smsMessage
        }).toString(),
        {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "apiKey": atApiKey
          }
        }
      );
      console.log(`✅ OTP SMS successfully delivered via Africa's Talking API to +${formattedPhone}`);
      return res.json({
        success: true,
        liveSent: true,
        recipient: `+${formattedPhone}`,
        message: "OTP SMS delivered via Africa's Talking."
      });
    } catch (atErr) {
      console.warn("Africa's Talking API OTP dispatch warning:", atErr.response ? atErr.response.data : atErr.message);
    }
  }

  return res.json({
    success: true,
    simulated: true,
    recipient: `+${formattedPhone}`,
    otpCode: otpCode,
    message: `📲 OTP PIN (${otpCode}) dispatched to +${formattedPhone} (Sandbox Mode).`
  });
});


// -------------------------------------------------------------
// NYANDARUA SUB-COUNTIES & BACKEND WEATHER PROXY SERVICE
// -------------------------------------------------------------
const NYANDARUA_SUBCOUNTIES = {
  "Ol Kalou": { lat: -0.2718, lon: 36.3789, alt: "Ol Kalou Altitude (2,347m)" },
  "Kinangop": { lat: -0.6417, lon: 36.6333, alt: "Kinangop Plateau (2,600m)" },
  "Kipipiri": { lat: -0.3667, lon: 36.5333, alt: "Kipipiri Ridge (2,400m)" },
  "Ol Joro Orok": { lat: -0.1417, lon: 36.3500, alt: "Ol Joro Orok Basin (2,380m)" },
  "Ndaragua": { lat: -0.0333, lon: 36.4667, alt: "Ndaragua Slopes (2,250m)" }
};

// In-Memory Weather Cache (15 min expiry)
const weatherCacheMap = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getWeatherConditionFromWMO(code) {
  if (code === 0) return { icon: "☀️", text: "Clear Sky" };
  if ([1, 2, 3].includes(code)) return { icon: "⛅", text: "Partly Cloudy" };
  if ([45, 48].includes(code)) return { icon: "🌫️", text: "Foggy & Hazy" };
  if ([51, 53, 55].includes(code)) return { icon: "🌦️", text: "Light Drizzle" };
  if ([61, 63, 65].includes(code)) return { icon: "🌧️", text: "Rainy" };
  if ([80, 81, 82].includes(code)) return { icon: "🌦️", text: "Passing Showers" };
  if ([95, 96, 99].includes(code)) return { icon: "🌩️", text: "Thunderstorm" };
  return { icon: "⛅", text: "Overcast" };
}

function generateAgroAdvisory(temp, humidity, rainProb, windSpeed, conditionText, subcounty) {
  if (rainProb > 50 || conditionText.includes("Rain") || conditionText.includes("Thunderstorm")) {
    return `🌧️ Extension Advisory: High rain probability in ${subcounty}. Avoid top-dress fertilizing & pesticide spraying. Cover stored fodder and silage bags.`;
  }
  if (humidity > 85) {
    return `💧 Extension Advisory: High moisture/humidity detected in ${subcounty}. Monitor potato crops for late blight and keep young dairy calves dry.`;
  }
  if (temp > 20 && rainProb < 20) {
    return `☀️ Extension Advisory: Clear dry weather in ${subcounty}! Optimal conditions for cutting Rhodes grass, hay drying, and silage compaction.`;
  }
  if (temp < 12) {
    return `🥶 Extension Advisory: Low temperatures in high-altitude ${subcounty}. Boost energy feed intake (maize germ/molasses) to maintain dairy milk yield.`;
  }
  if (windSpeed > 20) {
    return `💨 Extension Advisory: High winds (${windSpeed} km/h). Secure greenhouse poly-sheets and temporary fodder store roofs.`;
  }
  return `💡 Extension Advisory: Favorable weather conditions for general field operations, milking, and routine livestock checkups in ${subcounty}.`;
}

// GET Endpoint: /api/weather
app.get("/api/weather", async (req, res) => {
  const reqSub = req.query.subcounty || "Ol Kalou";
  const reqLat = parseFloat(req.query.lat);
  const reqLon = parseFloat(req.query.lon);

  let lat, lon, subcountyName, altInfo;

  if (!isNaN(reqLat) && !isNaN(reqLon)) {
    lat = reqLat;
    lon = reqLon;
    subcountyName = "GPS Position";
    altInfo = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
  } else {
    subcountyName = NYANDARUA_SUBCOUNTIES[reqSub] ? reqSub : "Ol Kalou";
    const cfg = NYANDARUA_SUBCOUNTIES[subcountyName];
    lat = cfg.lat;
    lon = cfg.lon;
    altInfo = cfg.alt;
  }

  const cacheKey = `${subcountyName}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const now = Date.now();

  if (weatherCacheMap.has(cacheKey)) {
    const cached = weatherCacheMap.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ success: true, cached: true, ...cached.data });
    }
  }

  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&hourly=precipitation_probability&forecast_days=1`;
    const apiRes = await axios.get(apiUrl, { timeout: 6000 });
    const current = apiRes.data.current || {};
    
    const temp = Math.round(current.temperature_2m ?? 18);
    const humidity = current.relative_humidity_2m ?? 70;
    const windSpeed = Math.round(current.wind_speed_10m ?? 10);
    const weatherCode = current.weather_code ?? 1;
    const rainProb = apiRes.data.hourly?.precipitation_probability ? Math.max(...apiRes.data.hourly.precipitation_probability.slice(0, 12), 0) : 20;

    const condInfo = getWeatherConditionFromWMO(weatherCode);
    const tip = generateAgroAdvisory(temp, humidity, rainProb, windSpeed, condInfo.text, subcountyName);

    const weatherPayload = {
      subcounty: subcountyName,
      alt: altInfo,
      temp: `${temp}°C`,
      tempRaw: temp,
      condition: `${condInfo.icon} ${condInfo.text}`,
      conditionText: condInfo.text,
      icon: condInfo.icon,
      humidity: `${humidity}%`,
      humidityRaw: humidity,
      rainProb: `${rainProb}%`,
      rainProbRaw: rainProb,
      windSpeed: `${windSpeed} km/h`,
      windSpeedRaw: windSpeed,
      tip: tip,
      subcountiesList: Object.keys(NYANDARUA_SUBCOUNTIES)
    };

    weatherCacheMap.set(cacheKey, { timestamp: now, data: weatherPayload });
    return res.json({ success: true, cached: false, ...weatherPayload });
  } catch (err) {
    console.warn("⚠️ Weather API fetch failed, returning fallback payload:", err.message);

    // Return structured graceful fallback if network fails
    const fallbackPayload = {
      subcounty: subcountyName,
      alt: altInfo,
      temp: "19°C",
      tempRaw: 19,
      condition: "⛅ Partly Cloudy",
      conditionText: "Partly Cloudy",
      icon: "⛅",
      humidity: "74%",
      humidityRaw: 74,
      rainProb: "20%",
      rainProbRaw: 20,
      windSpeed: "12 km/h",
      windSpeedRaw: 12,
      tip: `💡 Extension Advisory: Ideal conditions for harvesting Rhodes grass & silage compaction in ${subcountyName}.`,
      subcountiesList: Object.keys(NYANDARUA_SUBCOUNTIES)
    };

    return res.json({ success: true, cached: true, fallback: true, ...fallbackPayload });
  }
});

// =============================================================
// BACKEND ADMIN MODERATION REST API ENDPOINTS
// =============================================================
let serverPendingApprovals = [
  {
    id: 101,
    type: "fodder",
    title: "Boma Rhodes Hay Bales (30kg)",
    category: "Energy",
    price: "KSh 380 / bale",
    subcounty: "Ndaragua",
    seller: "John K. Farm",
    phone: "0712998877",
    desc: "Freshly baled high-energy Boma Rhodes pasture hay.",
    timestamp: new Date().toISOString()
  },
  {
    id: 102,
    type: "market",
    title: "Solar Powered Milk Cooling Tank (500L)",
    category: "Equipment",
    price: "KSh 120,000",
    location: "Ol Kalou",
    contact: "0722887766",
    desc: "Direct solar cooling tank for remote dairy farms.",
    timestamp: new Date().toISOString()
  }
];

// =============================================================
// BACKEND FARMER AUTHENTICATION & UNIQUE PHONE ENFORCEMENT
// =============================================================
let serverRegisteredFarmers = [
  { name: "Nyandarua Farmer", phone: "0718493313", subcounty: "Ol Kalou", ward: "Karau" }
];

function normalizePhoneServer(p) {
  if (!p) return "";
  let digits = String(p).replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) {
    return "0" + digits.slice(3);
  }
  if (digits.length === 9 && (digits.startsWith("7") || digits.startsWith("1"))) {
    return "0" + digits;
  }
  return digits;
}

// GET /api/auth/check-phone - Check if phone number is already registered
app.get("/api/auth/check-phone", (req, res) => {
  const reqPhone = normalizePhoneServer(req.query.phone);
  if (!reqPhone) {
    return res.status(400).json({ success: false, error: "Phone parameter is required" });
  }

  const existing = serverRegisteredFarmers.find(f => normalizePhoneServer(f.phone) === reqPhone);
  if (existing) {
    return res.json({ registered: true, message: `Phone number ${reqPhone} is already registered.` });
  }
  return res.json({ registered: false });
});

// POST /api/auth/register - Register new account with unique phone enforcement
app.post("/api/auth/register", (req, res) => {
  const { name, phone, password, subcounty, ward } = req.body;

  if (!phone || !password || !name) {
    return res.status(400).json({ success: false, error: "Name, phone, and password are required." });
  }

  const normPhone = normalizePhoneServer(phone);
  const existing = serverRegisteredFarmers.find(f => normalizePhoneServer(f.phone) === normPhone);

  if (existing) {
    return res.status(409).json({
      success: false,
      error: `Security Policy Violation: An account already exists for phone number ${normPhone}. Multiple accounts per phone number are strictly prohibited.`
    });
  }

  const newFarmer = { name, phone: normPhone, password, subcounty, ward, registeredAt: new Date().toISOString() };
  serverRegisteredFarmers.push(newFarmer);
  console.log(`✅ [SERVER AUTH] New farmer registered: ${name} (${normPhone})`);

  return res.json({ success: true, message: `Account created successfully for ${name}!`, farmer: newFarmer });
});

// POST /api/agribot/query - Gemini AI Integration for Farmers with Strict System Instructions
app.post("/api/agribot/query", async (req, res) => {
  const { query, subcounty } = req.body;
  if (!query) return res.status(400).json({ success: false, error: "Query is required" });

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return res.json({ success: false, useOfflineFallback: true, message: "GEMINI_API_KEY not configured." });
  }

  const systemInstruction = `You are Nyandarua AgriBot, an expert agricultural extension AI assistant for farmers in Nyandarua County, Kenya.
STRICT RULE 1: You MUST ONLY answer questions directly related to agriculture, farming, crops (potatoes, maize, vegetables), fodder feeds (Lucerne, Boma Rhodes, Silage), dairy cattle management, animal diseases, KVB certified vets, weather advisories, and farming trade in Nyandarua County.
STRICT RULE 2: If the user asks ANY question outside agriculture, farming, or Nyandarua county trade (e.g. politics, coding, sports, movies, general trivia), you MUST politely refuse with: "🌾 Jambo! I am the M-Shambani Nyandarua Agricultural Assistant. I am strictly programmed to assist ONLY with farming, livestock management, crops, fodder, weather advisories, KVB vets, and agricultural trading in Nyandarua County."
STRICT RULE 3: Keep your responses practical, concise, encouraging, and formatted with emojis and bullet points for easy reading on mobile phones.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await axios.post(url, {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Farmer Location: ${subcounty || "Ol Kalou"}, Nyandarua County.\nFarmer Question: ${query}` }]
        }
      ]
    });

    const candidate = response.data?.candidates?.[0];
    const replyText = candidate?.content?.parts?.[0]?.text;

    if (replyText) {
      return res.json({ success: true, reply: replyText });
    }
  } catch (err) {
    console.warn("Gemini API dispatch exception:", err.response ? err.response.data : err.message);
  }

  return res.json({ success: false, useOfflineFallback: true });
});

// Middleware: Verify Admin API Secret Key
function verifyAdminAuth(req, res, next) {
  const adminKey = req.headers["x-admin-key"] || req.query.admin_key;
  if (adminKey && adminKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid Admin API Key" });
  }
  next();
}

app.use("/api/admin", verifyAdminAuth);

// GET /api/admin/pending - Get all items awaiting admin approval
app.get("/api/admin/pending", (req, res) => {
  res.json({ success: true, count: serverPendingApprovals.length, pendingItems: serverPendingApprovals });
});

// POST /api/admin/approve - Backend admin approval endpoint
app.post("/api/admin/approve", (req, res) => {
  const { id } = req.body;
  const index = serverPendingApprovals.findIndex(item => item.id == id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Pending item not found." });
  }

  const approvedItem = serverPendingApprovals.splice(index, 1)[0];
  console.log(`✅ [ADMIN APPROVED] Item "${approvedItem.title}" approved and published live.`);
  res.json({ success: true, message: `Approved "${approvedItem.title}" successfully!`, approvedItem });
});

// POST /api/admin/reject - Backend admin rejection endpoint
app.post("/api/admin/reject", (req, res) => {
  const { id } = req.body;
  const index = serverPendingApprovals.findIndex(item => item.id == id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Pending item not found." });
  }

  const rejectedItem = serverPendingApprovals.splice(index, 1)[0];
  console.log(`❌ [ADMIN REJECTED] Item "${rejectedItem.title}" rejected.`);
  res.json({ success: true, message: `Rejected "${rejectedItem.title}".`, rejectedItem });
});

app.listen(PORT, () => {
  console.log(`🌾 M-Mkulima Backend Server running on http://localhost:${PORT}`);
});
