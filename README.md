# 🌾 M-Shambani Nyandarua Pro

> **Regulated Agricultural Knowledge & Commercial Trading Platform for Nyandarua County, Kenya.**

M-Shambani is a modern, mobile-first and desktop-responsive web application designed to connect dairy and crop farmers in Nyandarua County with high-protein fodder suppliers, certified agricultural inputs, veterinary services, AI-powered extension assistance, and seamless mobile money transactions.

---

## 🚀 Key Features

### 1. 🤖 Nyandarua AgriBot Dedicated AI Assistant
- **Strict Agricultural Guardrails:** Strictly locked to answer questions exclusively about Nyandarua agriculture, fodder curing, crop management, dairy cow rations, weather advisories, KVB certified vets, and M-Pesa trading.
- **Dual Hybrid Engine:** Powered by **Google Gemini 2.0 Flash (`gemini-2.0-flash`)** with system instruction guardrails + built-in offline rules engine fallback.
- **Quick Query Chips:** One-tap quick prompts for *Silage Curing*, *Potato Seeds*, *Milk Yield*, and *Vet Help*.

### 2. 🛡️ Account Security & Unique Phone Enforcement
- **Mandatory Authentication:** Secure Sign In & Registration gateway.
- **Unique Phone Policy:** Strictly blocks duplicate account creation for phone numbers across local storage, Supabase Cloud Database (`farmers` table), and backend Express APIs.
- **Live Input Validation:** Real-time Kenyan phone normalization (`07...`, `01...`, `254...`) and live password strength badges.

### 3. 📶 PWA Offline Action Queue & Auto-Sync Engine
- **Offline Submissions:** Form actions (*Fodder uploads, Marketplace listings, Vet bookings, Agri-services*) performed without internet connection are safely queued in `localStorage`.
- **Auto-Synchronization:** Automatically syncs queued actions to the server and database as soon as connection is restored, complete with an interactive banner counter.

### 4. 🌾 Fodder Knowledge Base & Hub
- Catalogues high-protein (*Lucerne, Desmodium*) and energy-rich (*Maize Silage, Boma Rhodes*) feeds tailored to high-altitude farming in Ol Kalou, Kinangop, Kipipiri, Ol Joro Orok, and Ndaragwa.
- Live data fetching from **Supabase Cloud Database** with offline demo fallback.

### 5. 🛒 Nyandarua Visual Marketplace
- Trade farm produce (*Shangi certified potato seeds*), dairy livestock (*Holstein Friesian heifers*), and machinery (*chaff cutters, silage bags*).
- Direct seller contact phone links and depot pickup assignments.

### 6. 🩺 KVB Regulatory Verified Vet Directory
- Directory compliant with **Kenya Veterinary Board (KVB)** regulations.
- Sub-County station filtering and direct clinical checkup booking.

### 7. 💳 M-Pesa STK Push Express Checkout
- Integrated M-Pesa express payment modal for one-tap purchasing of fodder bales and market goods directly on mobile.

### 8. 💬 Interactive Toast Notifications
- Modern overlay Toast notifications replacing native browser popups for smooth UX.

### 9. ⛅ Nyandarua Agro-Climate Weather & Extension Advisory
- High-contrast mobile widget displaying live temperature, humidity, rainfall risk, wind speed, and localized Nyandarua extension harvesting advice.

### 10. 📱 Progressive Web App (PWA & Custom Branding)
- Fully installable on Android, iPhone, and desktop browsers via `manifest.json` and `sw.js` Service Worker.
- Custom brand logo icons (`logo.png`, `favicon.png`) with offline asset caching.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, Modern CSS3 Design System (CSS Grid, Glassmorphism, HSL Tokens), Vanilla JavaScript (ES6+).
- **Backend Server:** Node.js Express API (`server.js`) on port `8080`.
- **Cloud Database:** [Supabase Cloud](https://supabase.com) (`@supabase/supabase-js@2`) with PostgreSQL and Storage Buckets.
- **AI Extension Assistant:** Google Gemini API (`gemini-2.0-flash`) with offline rules engine fallback.
- **Mobile Payments & SMS:** Safaricom Daraja M-Pesa Express API & Africa's Talking Gateway.
- **PWA & Offline Support:** Service Worker Caching (`sw.js`) and Web App Manifest (`manifest.json`).

---

## 📁 Project File Structure

```text
mkulima-nyandarua/
├── index.html            # Main SPA Entry Point & HTML Markup
├── styles.css            # Custom Modern Design System & Responsive Styles
├── app.js                # Core Business Logic, AgriBot, Offline Queue & Validation
├── server.js             # Node.js Express Backend API (M-Pesa, SMS, Gemini AI, Admin)
├── supabase-config.js    # Supabase Client Initialization
├── manifest.json         # PWA App Manifest Settings
├── sw.js                 # PWA Service Worker for Offline Caching
├── favicon.png           # App Favicon Icon
├── logo.png              # PWA Touch Screen App Logo
├── .env.example          # Environment Configuration Template
└── README.md             # Project Documentation
```

---

## ⚙️ Cloud Database Schema (Supabase)

The project connects to Supabase Cloud Database with 4 core tables:

1. **`farmers`**: `id`, `name`, `phone`, `password`, `subcounty`, `ward`, `created_at`
2. **`fodder`**: `id`, `title`, `category`, `price`, `subcounty`, `seller`, `phone`, `description`, `created_at`
3. **`marketplace`**: `id`, `title`, `category`, `price`, `location`, `contact`, `description`, `created_at`
4. **`vets`**: `id`, `name`, `reg_number`, `subcounty`, `phone`, `specialization`, `created_at`

---

## 💻 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vazytech/mkulima-nyandarua.git
   cd mkulima-nyandarua
   ```

2. **Configure Environment Variables:**
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies & Start the Backend Server:**
   ```bash
   npm install
   npm start
   ```

4. **Open in Browser:**
   Navigate to:
   ```text
   http://localhost:8080
   ```

---

## 📞 Support & Portal Information

- **County Portal:** Nyandarua Agricultural Extension & Farmers Hub
- **GitHub Repository:** [vazytech/mkulima-nyandarua](https://github.com/vazytech/mkulima-nyandarua.git)
