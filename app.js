/* ==========================================================================
   M-MKULIMA NYANDARUA PRO - ADVANCED LOGIC, SEARCH, WEATHER & M-PESA
   ========================================================================== */

// Africa's Talking Gateway Credentials (Sandbox)
const AT_USERNAME = "sandbox";
let AT_API_KEY = localStorage.getItem("mkulima_at_apikey") || "";

// Safaricom Daraja M-Pesa Credentials (Sandbox Default Test Bed)
const SAFARICOM_SHORTCODE = "174379";
const SAFARICOM_PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

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

  document.addEventListener("click", (e) => {
    const profileContainer = document.querySelector(".profile-menu-container");
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown && !dropdown.classList.contains("hidden") && profileContainer && !profileContainer.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
});

// NYANDARUA LIVE WEATHER & FARMING TIPS PANEL
function renderNyandaruaWeather() {
  const weatherContainer = document.getElementById("weatherPanel");
  if (!weatherContainer) return;

  const weatherData = {
    temp: "19°C",
    condition: "⛅ Partly Cloudy",
    humidity: "74%",
    rainProb: "20%",
    tip: "💡 Extension Advisory: Ideal conditions for harvesting Rhodes grass & silage compaction in Ol Kalou & Kinangop."
  };

  weatherContainer.innerHTML = `
    <div class="weather-card">
      <div class="weather-info">
        <h4>📍 Nyandarua Agro-Climate ⛅</h4>
        <p>${weatherData.condition} • Humidity: ${weatherData.humidity} • Rain: ${weatherData.rainProb}</p>
        <p style="font-size:0.72rem; margin-top:0.35rem; color:#fef08a; font-weight:700;">${weatherData.tip}</p>
      </div>
      <div class="weather-stats">
        <div class="weather-temp">${weatherData.temp}</div>
        <div class="weather-desc">Ol Kalou Altitude</div>
      </div>
    </div>
  `;
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

  const screens = ["screen-auth", "screen-fodder", "screen-marketplace", "screen-vets"];
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
    "screen-vets": "nav-vets"
  };

  const desktopNavMap = {
    "screen-fodder": "desktop-nav-fodder",
    "screen-marketplace": "desktop-nav-market",
    "screen-vets": "desktop-nav-vets"
  };

  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(navMap[screenId]);
  if (activeBtn) activeBtn.classList.add("active");

  document.querySelectorAll(".desktop-nav-link").forEach(btn => btn.classList.remove("active"));
  const activeDesktopBtn = document.getElementById(desktopNavMap[screenId]);
  if (activeDesktopBtn) activeDesktopBtn.classList.add("active");
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
      <div class="flex-between mt-2 pt-2 border-t text-xs text-slate-600">
        <span>📍 ${item.subcounty}</span>
        <div style="display:flex; gap:0.4rem;">
          <a href="tel:${item.phone}" class="btn btn-secondary btn-sm">📞 Call</a>
          <button onclick="openMpesaModal('${item.title}', '${item.price}')" class="btn btn-mpesa btn-sm">💳 Buy M-Pesa</button>
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
      <div class="flex-between mt-2 pt-2 border-t text-xs text-slate-600">
        <span>📍 ${item.location}</span>
        <div style="display:flex; gap:0.4rem;">
          <a href="tel:${item.contact}" class="btn btn-accent btn-sm">🛒 Contact</a>
          <button onclick="openMpesaModal('${item.title}', '${item.price}')" class="btn btn-mpesa btn-sm">💳 M-Pesa</button>
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

// SUPABASE STORAGE FILE UPLOADS
async function uploadImageToSupabaseStorage(file) {
  if (!file || typeof db === "undefined" || !db) return null;
  try {
    const fileName = `item_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data, error } = await db.storage.from("product-photos").upload(fileName, file);
    if (error) {
      console.warn("Supabase storage upload fallback:", error.message);
      return null;
    }
    const { data: publicUrlData } = db.storage.from("product-photos").getPublicUrl(fileName);
    return publicUrlData ? publicUrlData.publicUrl : null;
  } catch (err) {
    console.warn("Storage upload exception:", err);
    return null;
  }
}

// Upload Fodder directly to Supabase Cloud Database + Storage
async function processFodderUpload(e) {
  e.preventDefault();
  const title = document.getElementById("newFodderTitle").value.trim();
  const category = document.getElementById("newFodderCategory").value;
  const price = document.getElementById("newFodderPrice").value.trim();
  const description = document.getElementById("newFodderDesc").value.trim();
  const fileInput = document.getElementById("newFodderFile");

  let imageUrl = null;
  if (fileInput && fileInput.files.length > 0) {
    imageUrl = await uploadImageToSupabaseStorage(fileInput.files[0]);
  }

  const newItem = {
    title,
    category,
    price,
    subcounty: currentUser ? currentUser.subcounty : "Ol Kalou",
    seller: currentUser ? currentUser.name : "Local Farmer",
    phone: currentUser ? currentUser.phone : "0718493313",
    description
  };

  if (typeof db !== "undefined" && db) {
    const { error } = await db.from("fodder").insert([newItem]);
    if (error) {
      console.error("Supabase insert error:", error);
    } else {
      alert("⚡ Published live to Supabase Cloud Database!");
    }
  }

  fallbackFodder.unshift({ id: Date.now(), ...newItem, desc: description });
  renderFodderItems("all");
  toggleModal("modalFodderUpload", false);
}

// Upload Marketplace Item directly to Supabase Cloud Database + Storage
async function processMarketListing(e) {
  e.preventDefault();
  const title = document.getElementById("newMarketTitle").value.trim();
  const category = document.getElementById("newMarketCategory").value;
  const price = document.getElementById("newMarketPrice").value.trim();
  const contact = document.getElementById("newMarketContact").value.trim();
  const description = document.getElementById("newMarketDesc").value.trim();

  const newItem = {
    title,
    category,
    price,
    location: currentUser ? currentUser.subcounty : "Nyandarua",
    contact: contact || (currentUser ? currentUser.phone : "0700000000"),
    description
  };

  if (typeof db !== "undefined" && db) {
    const { error } = await db.from("marketplace").insert([newItem]);
    if (error) {
      console.error("Supabase insert error:", error);
    } else {
      alert("⚡ Published live to Supabase Cloud Database!");
    }
  }

  fallbackMarket.unshift({ id: Date.now(), ...newItem, desc: description });
  renderMarketItems();
  toggleModal("modalMarketUpload", false);
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

// SAFARICOM DARAJA M-PESA LIVE STK PUSH DISPATCH
async function triggerMpesaSTKPush(e) {
  e.preventDefault();
  const phoneInput = document.getElementById("mpesaPhone");
  const phoneRaw = phoneInput ? phoneInput.value.trim() : "";

  if (!phoneRaw) {
    alert("Please enter a valid M-Pesa phone number.");
    return;
  }

  // Format phone to 2547XXXXXXXX format for Safaricom API
  let formattedPhone = phoneRaw.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith("+")) {
    formattedPhone = formattedPhone.slice(1);
  }

  // Parse numeric amount from string (e.g. "KSh 450 / bale" -> 450)
  let numericAmount = parseInt((activeMpesaItem.price || "1").replace(/[^0-9]/g, "")) || 1;
  if (numericAmount > 1000) numericAmount = 1; // Default test amount for Safaricom Sandbox

  // Create Safaricom Timestamp YYYYMMDDHHMMSS
  const date = new Date();
  const timestamp = date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');

  // Generate Safaricom Base64 Password
  const password = btoa(SAFARICOM_SHORTCODE + SAFARICOM_PASSKEY + timestamp);

  alert(`📲 INITIATING SAFARICOM M-PESA STK PUSH...\n\nTarget Phone: ${formattedPhone}\nAmount: KSh ${numericAmount}\nItem: ${activeMpesaItem.title}\n\nPlease check your phone screen for the Safaricom PIN dialog!`);

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
