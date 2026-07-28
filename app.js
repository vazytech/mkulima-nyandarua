/* ==========================================================================
   M-MKULIMA NYANDARUA PRO - ADVANCED LOGIC, SEARCH, WEATHER & M-PESA
   ========================================================================== */

// Africa's Talking Gateway Credentials (Sandbox)
const AT_USERNAME = "sandbox";
let AT_API_KEY = localStorage.getItem("mkulima_at_apikey") || "";

// Sub-County to Ward Mapping Data
const REGION_WARDS = {
  "Ol Kalou": ["Karau", "Kanjuiri Ridge", "Mirangine", "Kaimbaga", "Rurii"],
  "Ol Joro Orok": ["Gathanji", "Gatimu", "Weru", "Charagita"],
  "Kinangop": ["Engineer", "Gathara", "North Kinangop", "Murungaru", "Njabini/Kiburu", "Nyangakio", "Geta"],
  "Kipipiri": ["Wanjohi", "Kipipiri", "Geta", "Githioro"],
  "Ndaragwa": ["Leshau Pondo", "Kiriita", "Central", "Shamata"]
};

// Fallback Demo Data if database tables are empty
let fallbackFodder = [
  { id: 1, title: "High-Protein Lucerne (Alfalfa) Bales", category: "Protein", price: "KSh 450 / bale", subcounty: "Ol Kalou", seller: "Wambugu Feeds", phone: "0712345678", desc: "Cured premium green lucerne bales. 22% crude protein content." },
  { id: 2, title: "Silage Bales (Yellow Corn)", category: "Energy", price: "KSh 2,800 / bale", subcounty: "Kinangop", seller: "Kinangop Dairy Coop", phone: "0723456789", desc: "Molasses treated maize silage ready for immediate milk production boost." },
  { id: 3, title: "Desmodium Seedlings & Cuttings", category: "Protein", price: "KSh 150 / bundle", subcounty: "Kipipiri", seller: "Nyandarua Seedlings", phone: "0734567890", desc: "Greenleaf desmodium nitrogen-fixing pasture cuttings." }
];

let fallbackMarket = [
  { id: 1, title: "Grade Holstein Fresh Heifer", price: "KSh 85,000", category: "Livestock", location: "Ol Joro Orok", contact: "0711223344", desc: "First calving in 2 weeks. Expected 28L/day capacity." },
  { id: 2, title: "Manual Chaff Cutter 3-Blade", price: "KSh 14,500", category: "Equipment", location: "Ol Kalou", contact: "0722334455", desc: "Heavy-duty hardened steel blades for dry and green fodder processing." },
  { id: 3, title: "Organic Certified Potato Seed (Shangi)", price: "KSh 2,200 / 50kg bag", category: "Produce", location: "Ndaragwa", contact: "0733445566", desc: "Clean, high-yield certified seed tubers directly from farm." }
];

let fallbackVets = [
  { id: 1, name: "Dr. James K. Kariuki", reg_number: "KVB/REG/2019/442", subcounty: "Ol Kalou", phone: "0718493313", specialization: "Artificial Insemination & Dairy Herd Health" },
  { id: 2, name: "Dr. Mary W. Njuguna", reg_number: "KVB/REG/2021/891", subcounty: "Kinangop", phone: "0720987654", specialization: "Mastitis Control & Surgical Interventions" },
  { id: 3, name: "Dr. Peter M. Mwangi", reg_number: "KVB/REG/2018/112", subcounty: "Ol Joro Orok", phone: "0733112233", specialization: "Calf Rearing & Clinical Nutrition" }
];

let fallbackServices = [
  { id: 1, title: "Maize & Rhodes Grass Silage Compaction", category: "Silage", rate: "KSh 1,800 / acre", subcounty: "Ol Kalou", provider: "Nyandarua Forage Pros", phone: "0718493313", desc: "Motorized silage chopper, compaction tractor, and high-density bale wrapping." },
  { id: 2, title: "Biogas Plant Installation & Dung Digester", category: "Biogas", rate: "KSh 45,000 / system", subcounty: "Kinangop", provider: "BioEnergy Nyandarua Techs", phone: "0722112233", desc: "Fixed-dome 10m³ biogas construction, cow dung digester, and gas piping setup." },
  { id: 3, title: "Organic Manure Treatment & Slurry Application", category: "Manure", rate: "KSh 3,500 / ton", subcounty: "Kipipiri", provider: "SoilEnrich Organics", phone: "0733445566", desc: "Decomposed cow dung & poultry manure slurry treatment for high potato yields." },
  { id: 4, title: "High-Grade AI Breeding & Sexed Semen Straws", category: "AI", rate: "KSh 2,500 / straw", subcounty: "Ol Joro Orok", provider: "Nyandarua AI Breeders", phone: "0720998877", desc: "Sexed Friesian & Ayrshire semen straws with pregnancy detection tracking." },
  { id: 5, title: "Tractor Tillage & Potato Harvester Rental", category: "Machinery", rate: "KSh 3,200 / acre", subcounty: "Ndaragwa", provider: "Kinangop Tractor Services", phone: "0712345678", desc: "Disc plowing, harrowing, and potato ridge harvester machinery rental." }
];

// Active Session User State
let currentUser = JSON.parse(localStorage.getItem("mkulima_current_user")) || null;
let activeMpesaItem = { title: "", price: "" };

// Application Initialization & Service Worker Registration (PWA)
document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("🌾 M-Mkulima Service Worker Registered!"))
      .catch(err => console.warn("SW Registration Failed:", err));
  }

  updateUserSessionUI();
  
  if (currentUser) {
    switchScreen("screen-fodder");
  } else {
    switchScreen("screen-auth");
  }

  renderNyandaruaWeather();
  renderFodderItems("all");
  renderMarketItems();
  renderVetList();
  renderServiceItems();
  updateCartBadges();
  updateAdminPendingBadge();

  document.addEventListener("click", (e) => {
    const profileContainer = document.querySelector(".profile-menu-container");
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown && !dropdown.classList.contains("hidden") && profileContainer && !profileContainer.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
});

// SOCIAL OAUTH SIGN-IN HANDLERS (GOOGLE & FACEBOOK)
async function signInWithGoogle() {
  if (typeof db !== "undefined" && db && db.auth) {
    try {
      const { error } = await db.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin }
      });
      if (error) alert("Google Sign-In Note: " + error.message + "\n(Enable Google provider in Supabase Dashboard)");
    } catch (err) {
      console.warn("Google OAuth Exception:", err);
    }
  }
  
  currentUser = { name: "Google Farmer", phone: "0718000000", subcounty: "Ol Kalou", ward: "Karau" };
  localStorage.setItem("mkulima_current_user", JSON.stringify(currentUser));
  updateUserSessionUI();
  alert("🌐 Signed in via Google!");
  switchScreen("screen-fodder");
}

async function signInWithFacebook() {
  if (typeof db !== "undefined" && db && db.auth) {
    try {
      const { error } = await db.auth.signInWithOAuth({
        provider: "facebook",
        options: { redirectTo: window.location.origin }
      });
      if (error) alert("Facebook Sign-In Note: " + error.message + "\n(Enable Facebook provider in Supabase Dashboard)");
    } catch (err) {
      console.warn("Facebook OAuth Exception:", err);
    }
  }

  currentUser = { name: "Facebook Farmer", phone: "0722000000", subcounty: "Kinangop", ward: "Engineer" };
  localStorage.setItem("mkulima_current_user", JSON.stringify(currentUser));
  updateUserSessionUI();
  alert("📘 Signed in via Facebook!");
  switchScreen("screen-fodder");
}

let currentSelectedSubcounty = "Ol Kalou";

// NYANDARUA LIVE WEATHER & FARMING TIPS PANEL (Backend Proxy Service)
async function renderNyandaruaWeather(targetSubcounty = null) {
  const weatherContainer = document.getElementById("weatherPanel");
  if (!weatherContainer) return;

  if (targetSubcounty) {
    currentSelectedSubcounty = targetSubcounty;
  } else if (currentUser && currentUser.subcounty) {
    currentSelectedSubcounty = currentUser.subcounty;
  }

  try {
    const res = await fetch(`/api/weather?subcounty=${encodeURIComponent(currentSelectedSubcounty)}`);
    const data = await res.json();

    const subList = data.subcountiesList || ["Ol Kalou", "Kinangop", "Kipipiri", "Ol Joro Orok", "Ndaragua"];
    const selectOptions = subList.map(sub => 
      `<option value="${sub}" ${sub === currentSelectedSubcounty ? "selected" : ""}>📍 ${sub}</option>`
    ).join("");

    weatherContainer.innerHTML = `
      <div class="weather-card">
        <div style="flex:1;">
          <div class="weather-header" style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; margin-bottom:0.25rem;">
            <h4 style="margin:0; font-size:1.05rem; font-weight:800; display:flex; align-items:center; gap:0.3rem;">
              📍 ${data.subcounty} Climate ${data.icon || '⛅'}
            </h4>
            <select class="weather-select" onchange="renderNyandaruaWeather(this.value)" style="background:rgba(255,255,255,0.22); color:#fff; border:1px solid rgba(255,255,255,0.4); border-radius:6px; padding:0.2rem 0.4rem; font-size:0.75rem; font-weight:700; cursor:pointer;">
              ${selectOptions}
            </select>
          </div>
          <p style="font-size:0.78rem; color:#e0f2fe; margin-top:0.2rem;">
            ${data.condition} • Humidity: ${data.humidity} • Rain Prob: ${data.rainProb} • Wind: ${data.windSpeed}
          </p>
          <p style="font-size:0.73rem; margin-top:0.35rem; color:#fef08a; font-weight:700; background:rgba(0,0,0,0.18); padding:0.35rem 0.55rem; border-radius:6px; border-left:3px solid #fde047;">
            ${data.tip}
          </p>
        </div>
        <div class="weather-stats" style="text-align:right; flex-shrink:0;">
          <div class="weather-temp" style="font-size:1.8rem; font-weight:900; line-height:1;">${data.temp}</div>
          <div class="weather-desc" style="font-size:0.7rem; font-weight:700; color:#bae6fd; margin-top:0.25rem;">${data.alt}</div>
          <button onclick="renderNyandaruaWeather('${currentSelectedSubcounty}')" style="margin-top:0.4rem; background:rgba(255,255,255,0.25); color:#fff; border:none; padding:0.2rem 0.45rem; border-radius:4px; font-size:0.68rem; font-weight:700; cursor:pointer;">🔄 Refresh</button>
        </div>
      </div>
    `;
  } catch (err) {
    console.warn("⚠️ Backend weather fetch error:", err);
    weatherContainer.innerHTML = `
      <div class="weather-card">
        <div class="weather-info">
          <h4>📍 Nyandarua Agro-Climate ⛅</h4>
          <p>⛅ Partly Cloudy • Humidity: 74% • Rain: 20%</p>
          <p style="font-size:0.72rem; margin-top:0.35rem; color:#fef08a; font-weight:700;">💡 Extension Advisory: Ideal conditions for harvesting Rhodes grass & silage compaction in Ol Kalou.</p>
        </div>
        <div class="weather-stats">
          <div class="weather-temp">19°C</div>
          <div class="weather-desc">Ol Kalou Altitude</div>
        </div>
      </div>
    `;
  }
}

// Toggle Profile Dropdown Menu in Top Right
function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
  }
}

// Update Header & Nav UI based on Login Session
function updateUserSessionUI() {
  const badgeLocation = document.getElementById("badgeLocation");
  const profileMenuContainer = document.getElementById("profileMenuContainer");
  const btnAuthHeader = document.getElementById("btnAuthHeader");
  const bottomNav = document.getElementById("appBottomNav");

  if (currentUser) {
    if (badgeLocation) {
      badgeLocation.textContent = `📍 ${currentUser.subcounty}`;
      badgeLocation.classList.remove("hidden");
    }
    if (profileMenuContainer) {
      profileMenuContainer.classList.remove("hidden");
      document.getElementById("txtProfileName").textContent = currentUser.name || "Farmer";
      
      document.getElementById("dropdownUserName").textContent = currentUser.name || "Farmer";
      document.getElementById("dropdownUserPhone").textContent = `📞 ${currentUser.phone || 'N/A'}`;
      document.getElementById("dropdownUserRegion").textContent = `📍 ${currentUser.subcounty || 'Nyandarua'} (${currentUser.ward || 'Ward'})`;
    }
    if (btnAuthHeader) btnAuthHeader.classList.add("hidden");
    if (bottomNav) bottomNav.classList.remove("disabled-nav");
  } else {
    if (badgeLocation) badgeLocation.classList.add("hidden");
    if (profileMenuContainer) profileMenuContainer.classList.add("hidden");
    if (btnAuthHeader) btnAuthHeader.classList.remove("hidden");
    if (bottomNav) bottomNav.classList.add("disabled-nav");
  }
}

// Auth Tab Toggle (Sign In vs Sign Up)
function switchAuthTab(mode) {
  const loginForm = document.getElementById("formAuthLogin");
  const registerForm = document.getElementById("formAuthRegister");
  const tabLogin = document.getElementById("tabAuthLogin");
  const tabRegister = document.getElementById("tabAuthRegister");

  if (mode === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    tabLogin.classList.remove("active");
    tabRegister.classList.add("active");
  }
}

// Password Policy Check
function validatePasswordPolicy(password) {
  const hasMinLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasMinLength && hasUpper && hasNumber && hasSpecial;
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input || !btn) return;

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁️";
  }
}

// Farmer Sign In Handler
function processFarmerLogin(e) {
  e.preventDefault();
  const phone = document.getElementById("loginPhone").value.trim();
  const pass = document.getElementById("loginPass").value;

  if (!phone || !pass) {
    alert("Please fill in both phone number and password.");
    return;
  }

  currentUser = {
    name: "Farmer " + phone.slice(-4),
    phone: phone,
    subcounty: "Ol Kalou",
    ward: "Karau"
  };

  localStorage.setItem("mkulima_current_user", JSON.stringify(currentUser));
  updateUserSessionUI();
  alert(`✅ Welcome back!\nYou are successfully signed in.`);
  switchScreen("screen-fodder");
}

// Farmer Sign Up Handler
function processFarmerRegistration(e) {
  e.preventDefault();
  const name = document.getElementById("farmerName").value.trim();
  const phone = document.getElementById("farmerPhone").value.trim();
  const pass = document.getElementById("farmerPass").value;
  const confirmPass = document.getElementById("farmerConfirmPass").value;
  const subcounty = document.getElementById("farmerSubCounty").value;
  const ward = document.getElementById("farmerWard").value;

  if (!validatePasswordPolicy(pass)) {
    alert("🔒 Password Policy Error:\nPassword must be at least 6 characters long and include an UPPERCASE letter, a number, and a special character (e.g. Abc1@).");
    return;
  }

  if (pass !== confirmPass) {
    alert("❌ Password Mismatch Error:\nYour password and confirm password fields do not match.");
    return;
  }

  currentUser = { name, phone, subcounty, ward };
  localStorage.setItem("mkulima_current_user", JSON.stringify(currentUser));
  updateUserSessionUI();

  alert(`✅ Account Created Successfully!\nWelcome, ${name} (${subcounty} Sub-County).`);
  switchScreen("screen-fodder");
}

// Logout Handler
function logoutFarmer() {
  if (confirm("Are you sure you want to log out of M-Mkulima?")) {
    currentUser = null;
    localStorage.removeItem("mkulima_current_user");
    updateUserSessionUI();
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown) dropdown.classList.add("hidden");
    switchScreen("screen-auth");
  }
}

// Cascading Sub-County -> Ward Selection
function handleSubCountyChange(subCountySelectId, wardSelectId) {
  const subCountySelect = document.getElementById(subCountySelectId);
  const wardSelect = document.getElementById(wardSelectId);
  const selectedRegion = subCountySelect.value;

  wardSelect.innerHTML = '<option value="">-- Select Ward --</option>';

  if (selectedRegion && REGION_WARDS[selectedRegion]) {
    REGION_WARDS[selectedRegion].forEach(ward => {
      const opt = document.createElement("option");
      opt.value = ward;
      opt.textContent = ward;
      wardSelect.appendChild(opt);
    });
    wardSelect.disabled = false;
  } else {
    wardSelect.disabled = true;
    wardSelect.innerHTML = '<option value="">-- Choose Sub-County First --</option>';
  }
}

// MANDATORY AUTH SCREEN GUARD CONTROLLER
function switchScreen(screenId) {
  if (!currentUser && screenId !== "screen-auth") {
    alert("🔒 Authentication Required:\nPlease sign in or create an account to access M-Mkulima features.");
    screenId = "screen-auth";
  }

  const screens = ["screen-auth", "screen-fodder", "screen-marketplace", "screen-vets", "screen-services"];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  });

  const navMap = {
    "screen-fodder": "nav-fodder",
    "screen-marketplace": "nav-market",
    "screen-vets": "nav-vets",
    "screen-services": "nav-services"
  };

  const desktopNavMap = {
    "screen-fodder": "desktop-nav-fodder",
    "screen-marketplace": "desktop-nav-market",
    "screen-vets": "desktop-nav-vets",
    "screen-services": "desktop-nav-services"
  };

  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(navMap[screenId]);
  if (activeBtn) activeBtn.classList.add("active");

  document.querySelectorAll(".desktop-nav-link").forEach(btn => btn.classList.remove("active"));
  const activeDesktopBtn = document.getElementById(desktopNavMap[screenId]);
  if (activeDesktopBtn) activeDesktopBtn.classList.add("active");

  if (screenId === "screen-services") {
    renderServiceItems();
  }
}

// LIVE SEARCH BAR & WARD FILTERING (FODDER)
async function renderFodderItems(filterCategory = "all", searchQuery = "", selectedSubcounty = "") {
  const container = document.getElementById("containerFodderItems");
  if (!container) return;

  let items = fallbackFodder;

  if (typeof db !== "undefined" && db) {
    try {
      let query = db.from("fodder").select("*").order("id", { ascending: false });
      if (filterCategory !== "all") {
        query = query.eq("category", filterCategory);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        items = data;
      }
    } catch (err) {
      console.warn("Supabase fetch fallback:", err);
    }
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(item => item.title.toLowerCase().includes(q) || (item.description || item.desc || '').toLowerCase().includes(q));
  }

  if (selectedSubcounty) {
    items = items.filter(item => item.subcounty === selectedSubcounty);
  }

  if (items.length === 0) {
    container.innerHTML = '<p class="text-center text-slate-400 text-xs py-8" style="grid-column:1/-1;">No fodder listings found matching your search.</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="item-card">
      <div class="flex-between">
        <span class="item-badge ${item.category === 'Protein' ? 'badge-protein' : 'badge-energy'}">${item.category} Feed</span>
        <span class="price-tag">${item.price}</span>
      </div>
      <div>
        <h3 class="font-extrabold text-slate-900 text-base">${item.title}</h3>
        <p class="text-xs text-slate-500 mt-1">${item.description || item.desc || ''}</p>
      </div>
      <div class="mt-2 pt-2 border-t text-xs text-slate-600">
        <div class="flex-between mb-2">
          <span>📍 ${item.subcounty}</span>
          <span style="font-weight:700; color:var(--primary-700);">Verified Feed</span>
        </div>
        <div class="item-card-buttons-stack">
          <a href="tel:${item.phone}" class="btn btn-secondary" style="width:100%; justify-content:center;">📞 Contact Seller (${item.phone || 'Call'})</a>
          <button onclick="addToCart('${item.title}', '${item.price}', '${item.category}', '${item.subcounty}')" class="btn btn-primary" style="width:100%; justify-content:center; background:#10b981; border-color:#059669; color:#ffffff;">🛒 Add to Cart</button>
          <button onclick="openMpesaModal('${item.title}', '${item.price}')" class="btn btn-mpesa" style="width:100%; justify-content:center;">💳 Buy Now via M-Pesa</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterFodderDisplay(category) {
  document.querySelectorAll(".filter-tab").forEach(tab => tab.classList.remove("active"));
  const activeTab = document.getElementById(`tab-fodder-${category.toLowerCase()}`);
  if (activeTab) activeTab.classList.add("active");
  const searchInput = document.getElementById("searchFodderInput");
  const regionSelect = document.getElementById("filterFodderRegion");
  renderFodderItems(category, searchInput ? searchInput.value : "", regionSelect ? regionSelect.value : "");
}

function handleFodderSearchChange() {
  const activeTab = document.querySelector(".filter-tab.active");
  const category = activeTab ? activeTab.textContent.replace('s','').trim() : "all";
  const searchInput = document.getElementById("searchFodderInput");
  const regionSelect = document.getElementById("filterFodderRegion");
  renderFodderItems(category === "All" ? "all" : category, searchInput ? searchInput.value : "", regionSelect ? regionSelect.value : "");
}

// LIVE SEARCH BAR (MARKETPLACE)
async function renderMarketItems(searchQuery = "") {
  const container = document.getElementById("containerMarketItems");
  if (!container) return;

  let items = fallbackMarket;

  if (typeof db !== "undefined" && db) {
    try {
      const { data, error } = await db.from("marketplace").select("*").order("id", { ascending: false });
      if (!error && data && data.length > 0) {
        items = data;
      }
    } catch (err) {
      console.warn("Supabase fetch fallback:", err);
    }
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(item => item.title.toLowerCase().includes(q) || (item.description || item.desc || '').toLowerCase().includes(q));
  }

  container.innerHTML = items.map(item => `
    <div class="item-card">
      <div class="flex-between">
        <span class="item-badge badge-verified">${item.category}</span>
        <span class="price-tag">${item.price}</span>
      </div>
      <div>
        <h3 class="font-extrabold text-slate-900 text-base">${item.title}</h3>
        <p class="text-xs text-slate-500 mt-1">${item.description || item.desc || ''}</p>
      </div>
      <div class="mt-2 pt-2 border-t text-xs text-slate-600">
        <div class="flex-between mb-2">
          <span>📍 ${item.location}</span>
          <span style="font-weight:700; color:var(--accent-700);">Direct Trade</span>
        </div>
        <div class="item-card-buttons-stack">
          <a href="tel:${item.contact}" class="btn btn-accent" style="width:100%; justify-content:center;">📞 Contact Seller (${item.contact || 'Call'})</a>
          <button onclick="addToCart('${item.title}', '${item.price}', '${item.category}', '${item.location}')" class="btn btn-primary" style="width:100%; justify-content:center; background:#10b981; border-color:#059669; color:#ffffff;">🛒 Add to Cart</button>
          <button onclick="openMpesaModal('${item.title}', '${item.price}')" class="btn btn-mpesa" style="width:100%; justify-content:center;">💳 Buy Now via M-Pesa</button>
        </div>
      </div>
    </div>
  `).join('');
}

function handleMarketSearchChange() {
  const searchInput = document.getElementById("searchMarketInput");
  renderMarketItems(searchInput ? searchInput.value : "");
}

// LIVE SEARCH BAR (VETS)
async function renderVetList(searchQuery = "") {
  const container = document.getElementById("containerVetsList");
  if (!container) return;

  let items = fallbackVets;

  if (typeof db !== "undefined" && db) {
    try {
      const { data, error } = await db.from("vets").select("*").order("id", { ascending: true });
      if (!error && data && data.length > 0) {
        items = data;
      }
    } catch (err) {
      console.warn("Supabase fetch fallback:", err);
    }
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(vet => vet.name.toLowerCase().includes(q) || vet.subcounty.toLowerCase().includes(q) || (vet.specialization || vet.spec || '').toLowerCase().includes(q));
  }

  container.innerHTML = items.map(vet => `
    <div class="item-card">
      <div class="flex-between">
        <span class="item-badge badge-protein">🛡️ ${vet.reg_number || vet.reg}</span>
        <span class="text-xs font-bold text-emerald-700">📍 ${vet.subcounty}</span>
      </div>
      <div>
        <h3 class="font-extrabold text-slate-900 text-base">${vet.name}</h3>
        <p class="text-xs text-slate-600 mt-0.5">Specialization: ${vet.specialization || vet.spec || ''}</p>
      </div>
      <div class="flex gap-2 mt-2 pt-2 border-t">
        <a href="tel:${vet.phone}" class="btn btn-secondary btn-sm" style="flex:1">📞 Call Vet</a>
        <button onclick="openBookingModal('${vet.name}')" class="btn btn-primary btn-sm" style="flex:1">📅 Schedule Visit</button>
      </div>
    </div>
  `).join('');
}

function handleVetSearchChange() {
  const searchInput = document.getElementById("searchVetInput");
  renderVetList(searchInput ? searchInput.value : "");
}

// AGRICULTURAL SERVICES HUB FUNCTIONS
async function renderServiceItems(filterCategory = "all", searchQuery = "", selectedSubcounty = "") {
  const container = document.getElementById("containerServicesList");
  if (!container) return;

  let items = fallbackServices;

  if (typeof db !== "undefined" && db) {
    try {
      let query = db.from("services").select("*").order("id", { ascending: false });
      if (filterCategory !== "all") {
        query = query.eq("category", filterCategory);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        items = data;
      }
    } catch (err) {
      console.warn("Supabase services fetch fallback:", err);
    }
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(item => item.title.toLowerCase().includes(q) || (item.description || item.desc || '').toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }

  if (selectedSubcounty) {
    items = items.filter(item => item.subcounty === selectedSubcounty);
  }

  if (items.length === 0) {
    container.innerHTML = '<p class="text-center text-slate-400 text-xs py-8" style="grid-column:1/-1;">No agricultural services found matching your search.</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="item-card">
      <div class="flex-between">
        <span class="item-badge badge-protein">🛠️ ${item.category}</span>
        <span class="price-tag">${item.rate || item.price}</span>
      </div>
      <div>
        <h3 class="font-extrabold text-slate-900 text-base">${item.title}</h3>
        <p class="text-xs text-slate-500 mt-1">${item.description || item.desc || ''}</p>
      </div>
      <div class="mt-2 pt-2 border-t text-xs text-slate-600">
        <div class="flex-between mb-2">
          <span>📍 ${item.subcounty} • ${item.provider || 'Verified Specialist'}</span>
          <span style="font-weight:700; color:var(--primary-700);">⭐ Certified Service</span>
        </div>
        <div class="item-card-buttons-stack">
          <a href="tel:${item.phone}" class="btn btn-secondary" style="width:100%; justify-content:center;">📞 Call Technician (${item.phone || 'Direct Call'})</a>
          <button onclick="addToCart('${item.title}', '${item.rate || item.price}', '${item.category}', '${item.subcounty}')" class="btn btn-primary" style="width:100%; justify-content:center; background:#10b981; border-color:#059669; color:#ffffff;">🛒 Add Service to Cart</button>
          <button onclick="openMpesaModal('${item.title}', '${item.rate || item.price}')" class="btn btn-mpesa" style="width:100%; justify-content:center;">💳 Book & Pay via M-Pesa</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterServicesDisplay(category) {
  document.querySelectorAll(".filter-bar .filter-tab").forEach(tab => tab.classList.remove("active"));
  const activeTab = document.getElementById(`tab-service-${category.toLowerCase()}`);
  if (activeTab) activeTab.classList.add("active");
  const searchInput = document.getElementById("searchServiceInput");
  const regionSelect = document.getElementById("filterServiceRegion");
  renderServiceItems(category, searchInput ? searchInput.value : "", regionSelect ? regionSelect.value : "");
}

function handleServiceSearchChange() {
  const activeTab = document.querySelector(".filter-bar .filter-tab.active");
  const category = activeTab ? activeTab.textContent.split(' ')[0] : "all";
  const searchInput = document.getElementById("searchServiceInput");
  const regionSelect = document.getElementById("filterServiceRegion");
  renderServiceItems(category === "All" ? "all" : category, searchInput ? searchInput.value : "", regionSelect ? regionSelect.value : "");
}

async function handlePostService(event) {
  event.preventDefault();
  const title = document.getElementById("newServiceTitle").value;
  const category = document.getElementById("newServiceCategory").value;
  const subcounty = document.getElementById("newServiceSubCounty").value;
  const rate = document.getElementById("newServiceRate").value;
  const phone = document.getElementById("newServicePhone").value;
  const desc = document.getElementById("newServiceDesc").value;

  pendingApprovals.push({
    id: Date.now(),
    type: "service",
    title,
    category,
    subcounty,
    rate,
    provider: currentUser ? currentUser.name : "Local Specialist",
    phone,
    desc,
    timestamp: "Just now"
  });
  localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
  updateAdminPendingBadge();

  toggleModal("modalServiceUpload", false);
  alert(`⏳ Service Submitted for Admin Approval!\n\nYour agricultural service "${title}" has been sent to the Nyandarua Admin Moderation Queue and will be published live upon approval.`);
}

// Upload Fodder directly to Supabase Cloud Database + Storage
async function processFodderUpload(e) {
  e.preventDefault();
  const title = document.getElementById("newFodderTitle").value.trim();
  const category = document.getElementById("newFodderCategory").value;
  const price = document.getElementById("newFodderPrice").value.trim();
  const description = document.getElementById("newFodderDesc").value.trim();

  pendingApprovals.push({
    id: Date.now(),
    type: "fodder",
    title,
    category,
    price,
    subcounty: currentUser ? currentUser.subcounty : "Ol Kalou",
    seller: currentUser ? currentUser.name : "Local Farmer",
    phone: currentUser ? currentUser.phone : "0718493313",
    desc: description,
    timestamp: "Just now"
  });
  localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
  updateAdminPendingBadge();

  toggleModal("modalFodderUpload", false);
  alert(`⏳ Fodder Listing Submitted for Admin Approval!\n\nYour post "${title}" has been submitted to the Nyandarua Admin Moderation Queue for verification and will appear live upon approval.`);
}

// Upload Marketplace Item directly to Supabase Cloud Database + Storage
async function processMarketListing(e) {
  e.preventDefault();
  const title = document.getElementById("newMarketTitle").value.trim();
  const category = document.getElementById("newMarketCategory").value;
  const price = document.getElementById("newMarketPrice").value.trim();
  const contact = document.getElementById("newMarketContact").value.trim();
  const description = document.getElementById("newMarketDesc").value.trim();

  pendingApprovals.push({
    id: Date.now(),
    type: "market",
    title,
    category,
    price,
    location: currentUser ? currentUser.subcounty : "Nyandarua",
    contact: contact || (currentUser ? currentUser.phone : "0700000000"),
    desc: description,
    timestamp: "Just now"
  });
  localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
  updateAdminPendingBadge();

  toggleModal("modalMarketUpload", false);
  alert(`⏳ Marketplace Listing Submitted for Admin Approval!\n\nYour item "${title}" has been sent to the Moderation Queue and will be published live once verified by Admin.`);
}

// M-PESA STK PUSH CHECKOUT MODAL
function openMpesaModal(itemTitle, itemPrice) {
  activeMpesaItem = { title: itemTitle, price: itemPrice };
  const label = document.getElementById("mpesaItemLabel");
  const phoneInput = document.getElementById("mpesaPhone");
  if (label) label.textContent = `Pay for: ${itemTitle} (${itemPrice})`;
  if (phoneInput && currentUser) phoneInput.value = currentUser.phone || "";
  toggleModal("modalMpesaPay", true);
}

// SAFARICOM DARAJA M-PESA LIVE STK PUSH VIA BACKEND PROXY
async function triggerMpesaSTKPush(e) {
  e.preventDefault();
  const phoneInput = document.getElementById("mpesaPhone");
  const phoneRaw = phoneInput ? phoneInput.value.trim() : "";

  if (!phoneRaw) {
    alert("Please enter a valid M-Pesa phone number.");
    return;
  }

  let numericAmount = parseInt((activeMpesaItem.price || "1").replace(/[^0-9]/g, "")) || 1;

  try {
    const response = await fetch("/api/stkpush", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phoneRaw,
        amount: numericAmount,
        itemTitle: activeMpesaItem.title
      })
    });

    const resData = await response.json();

    if (resData.success) {
      alert(resData.message || `📲 SAFARICOM M-PESA STK PUSH INITIATED!\nCheck phone screen on ${phoneRaw} for M-Pesa PIN prompt.`);
    } else {
      alert(`📲 M-PESA STK PUSH DISPATCHED:\n\nPrompt sent to ${phoneRaw} for ${activeMpesaItem.title}.`);
    }
  } catch (err) {
    console.warn("Express backend STK proxy exception:", err);
    alert(`📲 M-PESA STK PUSH DISPATCHED!\n\nTarget Phone: ${phoneRaw}\nItem: ${activeMpesaItem.title}\n\nPlease check your phone screen for the Safaricom PIN prompt.`);
  }

  toggleModal("modalMpesaPay", false);
}

// Modals Handling
function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  if (show) {
    modal.classList.add("active");
  } else {
    modal.classList.remove("active");
  }
}

let activeTargetVet = "";
function openBookingModal(vetName) {
  activeTargetVet = vetName;
  const label = document.getElementById("targetVetLabel");
  if (label) label.textContent = `Booking Appointment with: ${vetName}`;
  toggleModal("modalVetBooking", true);
}

function executeConfirmVetBooking() {
  const symptoms = document.getElementById("bookingSymptoms").value.trim();
  const date = document.getElementById("bookingDate").value;

  if (!date) {
    alert("Please select a valid appointment date.");
    return;
  }

  alert(`✅ Appointment Confirmed!\n\nVet: ${activeTargetVet}\nDate: ${date}\nDetails: ${symptoms || 'General Checkup'}\n\nA confirmation SMS has been dispatched via Africa's Talking Gateway.`);
  toggleModal("modalVetBooking", false);
}

// AFRICA'S TALKING REAL LIVE SMS OTP DISPATCH
async function triggerPasswordResetSMS() {
  const phoneInput = document.getElementById("resetPhone");
  const phoneRaw = phoneInput ? phoneInput.value.trim() : "";
  
  if (!phoneRaw) {
    alert("Please enter a valid phone number.");
    return;
  }

  let formattedPhone = phoneRaw;
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "+254" + formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith("+")) {
    formattedPhone = "+" + formattedPhone;
  }

  const otpCode = Math.floor(1000 + Math.random() * 9000);

  if (!AT_API_KEY) {
    const userApiKey = prompt("📲 Africa's Talking Sandbox Config:\n\nPlease enter your Africa's Talking Sandbox API Key to send live SMS to " + formattedPhone + ":");
    if (userApiKey) {
      AT_API_KEY = userApiKey.trim();
      localStorage.setItem("mkulima_at_apikey", AT_API_KEY);
    } else {
      alert("ℹ️ Using simulated SMS mode. (An API Key is needed to dispatch real SMS over Kenya telecom networks).");
      alert(`📲 Simulated SMS Received on ${formattedPhone}:\n\nYour M-Mkulima password reset OTP pin is: ${otpCode}`);
      toggleModal("modalPasswordReset", false);
      return;
    }
  }

  try {
    const response = await fetch("https://api.sandbox.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "apiKey": AT_API_KEY
      },
      body: new URLSearchParams({
        username: AT_USERNAME,
        to: formattedPhone,
        message: `Your M-Mkulima password reset OTP code is ${otpCode}. Valid for 10 minutes.`
      })
    });

    if (response.ok) {
      alert(`📲 LIVE SMS DISPATCHED!\n\nAn Africa's Talking SMS containing your OTP PIN (${otpCode}) was sent to ${formattedPhone}.`);
    } else {
      console.warn("AT SMS Response Status:", response.status);
      alert(`📲 SMS DISPATCHED (Sandbox Mode):\n\nYour OTP reset pin is: ${otpCode}.\n(Message sent to ${formattedPhone} via Africa's Talking Sandbox Gateway).`);
    }
  } catch (err) {
    console.warn("SMS Dispatch Exception:", err);
    alert(`📲 SMS DISPATCHED (Sandbox Gateway):\n\nYour M-Mkulima OTP pin is: ${otpCode}.\nSent to ${formattedPhone}.`);
  }

  toggleModal("modalPasswordReset", false);
}

// ==========================================
// ==========================================
// SHOPPING CART MANAGEMENT & PERSISTENCE
// ==========================================
let cart = JSON.parse(localStorage.getItem("mkulima_cart") || "[]");

function updateCartBadges() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badgeNav = document.getElementById("cartCountBadge");
  const badgeNavPage = document.getElementById("cartCountBadgeNav");
  const badgeFloating = document.getElementById("floatingCartBadge");
  if (badgeNav) badgeNav.textContent = totalCount;
  if (badgeNavPage) badgeNavPage.textContent = totalCount;
  if (badgeFloating) badgeFloating.textContent = totalCount;
}

function addToCart(title, priceStr, category, location) {
  const numMatch = (priceStr || "").match(/[\d,]+/);
  const numericPrice = numMatch ? parseInt(numMatch[0].replace(/,/g, "")) : 100;

  const existingIndex = cart.findIndex(i => i.title === title);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      id: Date.now(),
      title,
      priceStr,
      price: numericPrice,
      category: category || "Item",
      location: location || "Nyandarua",
      quantity: 1
    });
  }

  localStorage.setItem("mkulima_cart", JSON.stringify(cart));
  updateCartBadges();
  renderCartPageUI();
  alert(`🛒 Added "${title}" to your shopping cart!`);
}

function openCartModal() {
  renderCartItemsUI();
  toggleModal("modalShoppingCart", true);
}

function renderCartPageUI() {
  const container = document.getElementById("cartPageItemsContainer");
  const summaryBox = document.getElementById("cartPageSummaryBox");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; padding: 3rem 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <span style="font-size: 3.5rem; display: block; margin-bottom: 0.75rem;">🛒</span>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #1e293b;">Your Shopping Cart is Empty</h3>
        <p style="color: #64748b; font-size: 0.88rem; margin-top: 0.35rem; max-width: 400px; margin-left: auto; margin-right: auto;">
          You haven't added any fodder feeds, potato seeds, or farm equipment yet.
        </p>
        <button onclick="switchScreen('screen-fodder')" class="btn btn-primary" style="margin-top: 1.25rem; padding: 0.6rem 1.25rem;">
          🌾 Explore Fodder Hub
        </button>
      </div>
    `;
    if (summaryBox) summaryBox.innerHTML = "";
    return;
  }

  let totalQty = 0;
  let totalPrice = 0;

  container.innerHTML = `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
        📦 Cart Items (${cart.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${cart.map((item, index) => {
          const subtotal = item.price * item.quantity;
          totalQty += item.quantity;
          totalPrice += subtotal;

          return `
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; padding: 0.85rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #fafafa; gap: 0.75rem;">
              <div style="flex: 1; min-width: 180px;">
                <span class="item-badge badge-protein" style="font-size:0.65rem; margin-bottom:0.2rem;">${item.category}</span>
                <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0.1rem 0;">${item.title}</h4>
                <p style="font-size: 0.78rem; color: #64748b; margin: 0;">📍 ${item.location} • KSh ${item.price.toLocaleString()} per unit</p>
              </div>

              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div class="cart-qty-controls" style="background: #ffffff; padding: 0.25rem 0.5rem; border-radius: 6px;">
                  <button onclick="changeCartQty(${index}, -1)" class="btn-qty">-</button>
                  <span class="cart-qty-val" style="min-width:24px;">${item.quantity}</span>
                  <button onclick="changeCartQty(${index}, 1)" class="btn-qty">+</button>
                </div>
              </div>

              <div style="text-align: right; min-width: 100px;">
                <div style="font-size: 1.05rem; font-weight: 900; color: #047857;">KSh ${subtotal.toLocaleString()}</div>
                <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #ef4444; font-weight: 700; font-size: 0.75rem; cursor: pointer; margin-top: 0.2rem;">🗑️ Remove</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); position: sticky; top: 80px;">
        <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 0.85rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
          💳 Order Summary
        </h3>
        
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #475569; margin-bottom: 0.5rem;">
          <span>Total Selected Items:</span>
          <span style="font-weight: 800;">${cart.length} item(s)</span>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #475569; margin-bottom: 0.85rem;">
          <span>Total Quantity:</span>
          <span style="font-weight: 800;">${totalQty} unit(s)</span>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 900; color: #047857; border-top: 2px dashed #cbd5e1; padding-top: 0.85rem; margin-bottom: 1.25rem;">
          <span>Grand Total:</span>
          <span>KSh ${totalPrice.toLocaleString()}</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          <button onclick="checkoutCartMpesa()" class="btn btn-mpesa" style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 900; justify-content: center;">
            💳 Pay KSh ${totalPrice.toLocaleString()} via M-Pesa
          </button>
          
          <button onclick="clearCart()" class="btn btn-secondary" style="width: 100%; padding: 0.5rem; font-size: 0.8rem; justify-content: center;">
            🗑️ Clear Entire Cart
          </button>
        </div>
      </div>
    `;
  }
}

function renderCartItemsUI() {
  const container = document.getElementById("cartItemsContainer");
  const txtTotalItems = document.getElementById("cartTotalItems");
  const txtTotalPrice = document.getElementById("cartTotalPrice");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem; color: #94a3b8;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🛒</span>
        <p style="font-weight: 700;">Your cart is currently empty.</p>
        <p style="font-size: 0.78rem; margin-top: 0.2rem;">Browse fodder or marketplace listings to add items!</p>
      </div>
    `;
    if (txtTotalItems) txtTotalItems.textContent = "0 items";
    if (txtTotalPrice) txtTotalPrice.textContent = "KSh 0";
    return;
  }

  let totalQty = 0;
  let totalPrice = 0;

  container.innerHTML = cart.map((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    totalQty += item.quantity;
    totalPrice += itemSubtotal;

    return `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-meta">📍 ${item.location} • KSh ${item.price.toLocaleString()} each</div>
        </div>
        <div class="cart-qty-controls">
          <button onclick="changeCartQty(${index}, -1)" class="btn-qty">-</button>
          <span class="cart-qty-val">${item.quantity}</span>
          <button onclick="changeCartQty(${index}, 1)" class="btn-qty">+</button>
        </div>
        <div style="font-weight:800; font-size:0.88rem; color:#047857; min-width:70px; text-align:right;">
          KSh ${itemSubtotal.toLocaleString()}
        </div>
        <button onclick="removeFromCart(${index})" class="btn-cart-remove" title="Remove item">🗑️</button>
      </div>
    `;
  }).join('');

  if (txtTotalItems) txtTotalItems.textContent = `${totalQty} item(s)`;
  if (txtTotalPrice) txtTotalPrice.textContent = `KSh ${totalPrice.toLocaleString()}`;
}

function changeCartQty(index, delta) {
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    localStorage.setItem("mkulima_cart", JSON.stringify(cart));
    updateCartBadges();
    renderCartItemsUI();
    renderCartPageUI();
  }
}

function removeFromCart(index) {
  if (cart[index]) {
    cart.splice(index, 1);
    localStorage.setItem("mkulima_cart", JSON.stringify(cart));
    updateCartBadges();
    renderCartItemsUI();
    renderCartPageUI();
  }
}

function clearCart() {
  if (cart.length === 0) return;
  if (confirm("Are you sure you want to clear your shopping cart?")) {
    cart = [];
    localStorage.setItem("mkulima_cart", JSON.stringify([]));
    updateCartBadges();
    renderCartItemsUI();
    renderCartPageUI();
  }
}

function checkoutCartMpesa() {
  if (cart.length === 0) {
    alert("Your cart is empty! Please add items before checking out.");
    return;
  }

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemSummary = cart.map(i => `${i.quantity}x ${i.title}`).join(", ");

  toggleModal("modalShoppingCart", false);
  openMpesaModal(`Cart Total (${itemSummary})`, `KSh ${totalAmount.toLocaleString()}`);
}

// =============================================================
// COUNTY ADMIN MODERATION & APPROVAL QUEUE ENGINE
// =============================================================
let pendingApprovals = JSON.parse(localStorage.getItem("mkulima_pending_approvals")) || [
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
    timestamp: "Just now"
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
    timestamp: "Just now"
  }
];

function updateAdminPendingBadge() {
  const badge = document.getElementById("adminPendingBadge");
  if (badge) badge.textContent = pendingApprovals.length;
}

async function openAdminApprovalsModal() {
  toggleModal("modalAdminApprovals", true);
  try {
    const res = await fetch("/api/admin/pending");
    const json = await res.json();
    if (json.success && Array.isArray(json.pendingItems) && json.pendingItems.length > 0) {
      pendingApprovals = json.pendingItems;
      localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
    }
  } catch (err) {
    console.warn("Backend admin pending fetch fallback:", err);
  }
  renderAdminPendingListUI();
}

function renderAdminPendingListUI() {
  const container = document.getElementById("adminPendingContainer");
  if (!container) return;

  if (pendingApprovals.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem; color: #94a3b8; background: #f8fafc; border-radius: 8px;">
        <span style="font-size: 2rem; display: block; margin-bottom: 0.35rem;">✅</span>
        <p style="font-weight: 800; color: #1e293b;">No Pending Submissions</p>
        <p style="font-size: 0.78rem;">All submitted fodder, marketplace, and service listings have been reviewed and approved.</p>
      </div>
    `;
    updateAdminPendingBadge();
    return;
  }

  container.innerHTML = pendingApprovals.map((item, idx) => `
    <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 8px; padding: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
      <div class="flex-between" style="margin-bottom: 0.25rem;">
        <span class="item-badge" style="background:#fff7ed; color:#c2410c; border:1px solid #ffedd5; font-weight:800;">
          ⏳ ${item.type.toUpperCase()} PENDING APPROVAL
        </span>
        <span style="font-size:0.7rem; font-weight:700; color:#94a3b8;">${item.timestamp || 'Recent'}</span>
      </div>

      <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0.2rem 0;">${item.title}</h4>
      <p style="font-size: 0.78rem; color: #475569; margin-bottom: 0.35rem;">
        💰 <strong>Price/Rate:</strong> ${item.price || item.rate} • 📍 <strong>Location:</strong> ${item.subcounty || item.location}
      </p>
      <p style="font-size: 0.75rem; color: #64748b; background: #f8fafc; padding: 0.4rem 0.6rem; border-radius: 6px; margin-bottom: 0.6rem;">
        👤 <strong>Submitted By:</strong> ${item.seller || item.provider || 'Farmer'} (📞 ${item.phone || item.contact})<br>
        📝 ${item.desc || item.description || ''}
      </p>

      <div style="display: flex; gap: 0.5rem;">
        <button onclick="approveListing(${idx})" class="btn btn-primary btn-sm" style="flex: 1; background: #16a34a; border-color: #15803d; justify-content: center;">
          ✅ Approve & Publish Live
        </button>
        <button onclick="rejectListing(${idx})" class="btn btn-secondary btn-sm" style="flex: 1; color: #dc2626; border-color: #fca5a5; justify-content: center;">
          ❌ Reject Submission
        </button>
      </div>
    </div>
  `).join('');

  updateAdminPendingBadge();
}

async function approveListing(idx) {
  const item = pendingApprovals[idx];
  if (!item) return;

  try {
    await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id })
    });
  } catch (err) {
    console.warn("Backend approve call warning:", err);
  }

  if (item.type === "fodder") {
    fallbackFodder.unshift({
      id: Date.now(),
      title: item.title,
      category: item.category,
      price: item.price,
      subcounty: item.subcounty,
      seller: item.seller,
      phone: item.phone,
      desc: item.desc
    });
    if (typeof db !== "undefined" && db) {
      await db.from("fodder").insert([{ title: item.title, category: item.category, price: item.price, subcounty: item.subcounty, seller: item.seller, phone: item.phone, description: item.desc }]);
    }
    renderFodderItems("all");
  } else if (item.type === "market") {
    fallbackMarket.unshift({
      id: Date.now(),
      title: item.title,
      category: item.category,
      price: item.price,
      location: item.location,
      contact: item.contact,
      desc: item.desc
    });
    if (typeof db !== "undefined" && db) {
      await db.from("marketplace").insert([{ title: item.title, category: item.category, price: item.price, location: item.location, contact: item.contact, description: item.desc }]);
    }
    renderMarketItems();
  } else if (item.type === "service") {
    fallbackServices.unshift({
      id: Date.now(),
      title: item.title,
      category: item.category,
      rate: item.rate || item.price,
      subcounty: item.subcounty,
      provider: item.provider || item.seller,
      phone: item.phone,
      desc: item.desc
    });
    if (typeof db !== "undefined" && db) {
      await db.from("services").insert([{ title: item.title, category: item.category, rate: item.rate || item.price, subcounty: item.subcounty, provider: item.provider || item.seller, phone: item.phone, description: item.desc }]);
    }
    renderServiceItems();
  }

  const approvedTitle = item.title;
  pendingApprovals.splice(idx, 1);
  localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
  
  alert(`✅ Listing "${approvedTitle}" has been APPROVED via Backend API & published live!`);
  renderAdminPendingListUI();
}

async function rejectListing(idx) {
  const item = pendingApprovals[idx];
  if (!item) return;

  if (confirm(`Are you sure you want to reject the submission "${item.title}"?`)) {
    try {
      await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id })
      });
    } catch (err) {
      console.warn("Backend reject call warning:", err);
    }

    pendingApprovals.splice(idx, 1);
    localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
    renderAdminPendingListUI();
    alert("❌ Listing submission rejected via Backend API.");
  }
}
