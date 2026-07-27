# 🌾 M-Mkulima Nyandarua Pro

> **Regulated Agricultural Knowledge & Commercial Trading Platform for Nyandarua County, Kenya.**

M-Mkulima is a modern, mobile-first and desktop-responsive web application designed to connect dairy and crop farmers in Nyandarua County with high-protein fodder suppliers, verified agricultural inputs, veterinary services, and seamless mobile money transactions.

---

## 🚀 Key Features

### 1. 🛡️ Independent Authentication & Navigation Guard
- **Dedicated Auth Gateway:** Mandatory Sign In / Sign Up screen before accessing internal features.
- **Location-Based Profile:** Sub-County (*Ol Kalou, Kinangop, Kipipiri, Ol Joro Orok, Ndaragwa*) and Ward selection.
- **Security Policy:** Enforces strong password rules and includes eye toggle icons (`👁️` / `🙈`) for password visibility.
- **Top-Right Profile Avatar Menu:** Displays logged-in farmer credentials with an instant Logout option.

### 2. 🌾 Fodder Knowledge Base & Hub
- Catalogues protein-rich (Lucerne, Desmodium) and energy-rich (Corn Silage) feeds.
- Live data fetching from **Supabase Cloud Database** with offline demo fallback.
- **Upload Fodder Form:** 1MB image attachment cap and direct publish to cloud.

### 3. 🛒 Nyandarua Visual Marketplace
- Trade farm produce (certified potato seeds), dairy livestock (Holstein Friesian heifers), and machinery (chaff cutters).
- Direct seller contact phone links.

### 4. 🩺 KVB Regulatory Verified Vet Directory
- Verified directory compliant with the **Kenya Veterinary Board (KVB)** guidelines.
- Filter by Sub-County jurisdiction.
- **Appointment Scheduler:** Book clinical livestock checkups with automated SMS dispatch via Africa's Talking Gateway.

### 5. 💳 M-Pesa STK Push Express Checkout
- Integrated M-Pesa payment prompt modal for one-tap purchasing of fodder bales and market goods directly on mobile.

### 6. 🔍 Live Search & Sub-County Filtering
- Instant keyword search across Fodder, Marketplace, and Vets.
- Filter feeds by local Sub-County region.

### 7. ⛅ Nyandarua Agro-Climate Weather & Extension Advisory
- Live weather widget showing temperature (19°C), humidity, rainfall probability, and farming advisory for optimal harvesting and silage curing.

### 8. 📱 Progressive Web App (PWA - Installable)
- Fully installable on Android, iPhone, and desktop browsers via `manifest.json` and `sw.js` Service Worker.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, Modern CSS3 Design System (CSS Grid, Glassmorphism, HSL Tokens), Vanilla JavaScript (ES6+).
- **Backend & Cloud Database:** [Supabase Cloud](https://supabase.com) (`@supabase/supabase-js@2`) with PostgreSQL and Storage Buckets.
- **Mobile Payments & SMS:** M-Pesa Express (Daraja Gateway) & Africa's Talking SMS API.
- **PWA & Offline Support:** Service Worker Caching (`sw.js`) and Web App Manifest (`manifest.json`).

---

## 📁 Project File Structure

```
/home/muchiri/Downloads/mkulima/
├── index.html            # Main SPA Entry Point & HTML Markup
├── mkulima.html          # Secondary Production Template
├── styles.css            # Custom Modern Design System & Media Queries
├── app.js                # Core Business Logic, Search, Weather & Supabase Sync
├── supabase-config.js    # Supabase Client Initialization & Credentials
├── manifest.json         # PWA App Manifest Settings
├── sw.js                 # PWA Service Worker for Offline Caching
└── README.md             # Project Documentation
```

---

## ⚙️ Cloud Database Schema (Supabase)

The project connects to Supabase project `https://vggyemyygayyraffopri.supabase.co` with 3 core tables:

1. **`fodder`**: `id`, `title`, `category`, `price`, `subcounty`, `seller`, `phone`, `description`, `created_at`
2. **`marketplace`**: `id`, `title`, `category`, `price`, `location`, `contact`, `description`, `created_at`
3. **`vets`**: `id`, `name`, `reg_number`, `subcounty`, `phone`, `specialization`, `created_at`

---

## 💻 How to Run Locally

1. Clone or download the repository:
   ```bash
   git clone https://github.com/vazytech/mkulima-nyandarua.git
   cd mkulima-nyandarua
   ```

2. Start a local HTTP web server:
   ```bash
   python3 -m http.server 8080
   ```

3. Open your browser and navigate to:
   ```text
   http://localhost:8080
   ```

---

## 📞 Support & Systems Help Desk

- **Phone:** `+254 718 493 313`
- **Email:** `gnmtech245@gmail.com`
- **GitHub Repository:** [vazytech/mkulima-nyandarua](https://github.com/vazytech/mkulima-nyandarua.git)
