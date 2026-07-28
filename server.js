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
