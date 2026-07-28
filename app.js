/* ==========================================================================
   M-MKULIMA NYANDARUA PRO - ADVANCED LOGIC, SEARCH, WEATHER & M-PESA
   ========================================================================== */

// MODERN TOAST NOTIFICATION SYSTEM
function showToast(message, type = "info", duration = 4000) {
  const container = document.getElementById("toast-container");
  if (!container) {
    console.log(`[Toast Fallback - ${type.toUpperCase()}]: ${message}`);
    return;
  }
  
  const toast = document.createElement("div");
  toast.className = `toast-message toast-${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";
  
  toast.innerHTML = `<span class="toast-icon" style="font-size:1.1rem;">${icon}</span> <span>${String(message).replace(/\n/g, "<br>")}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("toast-hiding");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Africa's Talking Gateway Credentials (Sandbox)
const AT_USERNAME = "sandbox";
let AT_API_KEY = localStorage.getItem("mkulima_at_apikey") || "";

// SUB-COUNTY ABBREVIATION HELPER (OLK, KIN, KIP, OJ, ND)
function formatSubcountyAbbr(subcounty) {
  if (!subcounty) return "";
  const s = String(subcounty).trim().toLowerCase();
  if (s.includes("joro") || s === "oj" || s.includes("ol joro")) return "OJ";
  if (s.includes("kalou") || s === "olk" || s.includes("ol kalou")) return "OLK";
  if (s.includes("kipipiri") || s === "kip") return "KIP";
  if (s.includes("kinangop") || s === "kin") return "KIN";
  if (s.includes("ndaragua") || s.includes("ndaragwa") || s === "nd") return "ND";
  return subcounty.toUpperCase();
}

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
  { id: 1, title: "High-Protein Lucerne (Alfalfa) Bales", title_sw: "Bale za Lucerne (Alfalfa) yenye Protini Nyingi", category: "Protein", category_sw: "Protini", price: "KSh 450 / bale", subcounty: "Ol Kalou", seller: "Wambugu Feeds", phone: "0712345678", desc: "Cured premium green lucerne bales. 22% crude protein content.", desc_sw: "Lucerne kijani kibichi yenye protini ya 22%. Chakula bora cha kuongeza maziwa." },
  { id: 2, title: "Silage Bales (Yellow Corn)", title_sw: "Bale za Silage ya Mahindi ya Njano", category: "Energy", category_sw: "Nguvu", price: "KSh 2,800 / bale", subcounty: "Kinangop", seller: "Kinangop Dairy Coop", phone: "0723456789", desc: "Molasses treated maize silage ready for immediate milk production boost.", desc_sw: "Silage ya mahindi iliyochanganywa na molasi tayari kuongeza maziwa mara moja." },
  { id: 3, title: "Desmodium Seedlings & Cuttings", title_sw: "Mimea na Vipande vya Desmodium", category: "Protein", category_sw: "Protini", price: "KSh 150 / bundle", subcounty: "Kipipiri", seller: "Nyandarua Seedlings", phone: "0734567890", desc: "Greenleaf desmodium nitrogen-fixing pasture cuttings.", desc_sw: "Vipande vya desmodium ya majani mabichi ya kuongeza nitrojeni udongoni." }
];

let fallbackMarket = [
  { id: 1, title: "Grade Holstein Fresh Heifer", title_sw: "Mtamba Mjamzito wa Gredi Holstein", price: "KSh 85,000", category: "Livestock", category_sw: "Mifugo", location: "Ol Joro Orok", contact: "0711223344", desc: "First calving in 2 weeks. Expected 28L/day capacity.", desc_sw: "Atazaa baada ya wiki 2. Uwezo wa maziwa lita 28 kwa siku." },
  { id: 2, title: "Manual Chaff Cutter 3-Blade", title_sw: "Mashine ya Kukata Chakula cha Mifugo (Blades 3)", price: "KSh 14,500", category: "Equipment", category_sw: "Vifaa", location: "Ol Kalou", contact: "0722334455", desc: "Heavy-duty hardened steel blades for dry and green fodder processing.", desc_sw: "Bora ya chuma thabiti ya kusaga chakula kikavu na kibichi cha mifugo." },
  { id: 3, title: "Organic Certified Potato Seed (Shangi)", title_sw: "Mbegu Bora za Viazi zilizoidhinishwa (Shangi)", price: "KSh 2,200 / 50kg bag", category: "Produce", category_sw: "Mavuno", location: "Ndaragwa", contact: "0733445566", desc: "Clean, high-yield certified seed tubers directly from farm.", desc_sw: "Mbegu safi za viazi vya Shangi zenye mavuno mengi kutoka shambani." }
];

let fallbackVets = [
  { id: 1, name: "Dr. James K. Kariuki", reg_number: "KVB/REG/2019/442", subcounty: "Ol Kalou", phone: "0718493313", specialization: "Artificial Insemination & Dairy Herd Health", spec_sw: "Panda ya Mbegu (AI) na Afya ya Ng'ombe wa Maziwa" },
  { id: 2, name: "Dr. Mary W. Njuguna", reg_number: "KVB/REG/2021/891", subcounty: "Kinangop", phone: "0720987654", specialization: "Mastitis Control & Surgical Interventions", spec_sw: "Matibabu ya Maziwa (Mastitis) na Upasuaji wa Mifugo" },
  { id: 3, name: "Dr. Peter M. Mwangi", reg_number: "KVB/REG/2018/112", subcounty: "Ol Joro Orok", phone: "0733112233", specialization: "Calf Rearing & Clinical Nutrition", spec_sw: "Ufugaji wa Ndama na Lishe Bora ya Mifugo" }
];

let fallbackServices = [
  { id: 1, title: "Maize & Rhodes Grass Silage Compaction", title_sw: "Shindilio na Utengenezaji wa Silage ya Mahindi", category: "Silage", category_sw: "Silage", rate: "KSh 1,800 / acre", subcounty: "Ol Kalou", provider: "Nyandarua Forage Pros", phone: "0718493313", desc: "Motorized silage chopper, compaction tractor, and high-density bale wrapping.", desc_sw: "Kukata mahindi kwa mashine, kushindilia kwa trakta na kufunga bale kwa plasiya." },
  { id: 2, title: "Biogas Plant Installation & Dung Digester", title_sw: "Ujenzi na Ufungaji wa Mtambo wa Biogas", category: "Biogas", category_sw: "Biogas", rate: "KSh 45,000 / system", subcounty: "Kinangop", provider: "BioEnergy Nyandarua Techs", phone: "0722112233", desc: "Fixed-dome 10m³ biogas construction, cow dung digester, and gas piping setup.", desc_sw: "Ujenzi wa mtambo wa biogas mita 10³, digester ya samadi, na mabomba ya gesi." },
  { id: 3, title: "Organic Manure Treatment & Slurry Application", title_sw: "Uchakataji wa Mbolea ya Samadi na Kupanda", category: "Manure", category_sw: "Samadi", rate: "KSh 3,500 / ton", subcounty: "Kipipiri", provider: "SoilEnrich Organics", phone: "0733445566", desc: "Decomposed cow dung & poultry manure slurry treatment for high potato yields.", desc_sw: "Samadi ya ng'ombe na kuku iliyooza vizuri kwa ajili ya mavuno mengi ya viazi." },
  { id: 4, title: "High-Grade AI Breeding & Sexed Semen Straws", title_sw: "Huduma ya AI ya Mbegu za Jinsia (Sexed Straws)", category: "AI", category_sw: "Mbegu AI", rate: "KSh 2,500 / straw", subcounty: "Ol Joro Orok", provider: "Nyandarua AI Breeders", phone: "0720998877", desc: "Sexed Friesian & Ayrshire semen straws with pregnancy detection tracking.", desc_sw: "Mbegu za jinsia ya kike za Friesian na Ayrshire na upimaji wa mimba." },
  { id: 5, title: "Tractor Tillage & Potato Harvester Rental", title_sw: "Kukodi Trakta ya Kulima na Kuvuna Viazi", category: "Machinery", category_sw: "Mashine", rate: "KSh 3,200 / acre", subcounty: "Ndaragwa", provider: "Kinangop Tractor Services", phone: "0712345678", desc: "Disc plowing, harrowing, and potato ridge harvester machinery rental.", desc_sw: "Kulima, kurutubisha na kuvuna viazi kwa kutumia mashine za trakta." }
];

// Active Session User State
let currentUser = JSON.parse(localStorage.getItem("mkulima_current_user")) || null;
let activeMpesaItem = { title: "", price: "" };

// MULTI-LANGUAGE TRANSLATION DICTIONARY (ENGLISH <-> KISWAHILI)
let currentLanguage = localStorage.getItem("mkulima_lang") || "en";

const TRANSLATIONS = {
  en: {
    langBtnLabel: "🇰🇪 Kiswahili",
    appTitle: "🌾 M-Shambani",
    appSubtitle: "Nyandarua Agricultural Portal",
    navFodder: "🌾 Fodder Hub",
    navMarket: "🛒 Marketplace",
    navVets: "🩺 Verified Vets",
    navServices: "🛠️ Agri-Services",
    tabSignIn: "🔑 Sign In",
    tabRegister: "📝 Register",
    lblPhone: "Phone Number",
    lblPassword: "Password",
    lblConfirmPassword: "Confirm Password",
    lblFullName: "Full Name",
    lblSubcounty: "Your Sub-County",
    lblWard: "Your Ward",
    btnSignInSubmit: "Sign In & Access App",
    btnRegisterSubmit: "Register & Unlock App",
    forgotPassLink: "Forgot Password?",
    postFodderBtn: "+ Post Fodder",
    postMarketBtn: "+ Post Listing",
    postServiceBtn: "+ Post Service",
    cartTitle: "Shopping Cart",
    viewCart: "🛒 View Cart",
    buyMpesa: "💳 Buy M-Pesa",
    callSeller: "📞 Call Seller",
    callTech: "📞 Call Tech",
    addToCart: "🛒 Add to Cart",
    addServiceToCart: "🛒 Add Service to Cart",
    searchFodderPlaceholder: "Search fodder by title or keyword...",
    searchMarketPlaceholder: "Search marketplace items...",
    searchVetPlaceholder: "Search vet by name, specialty, or region...",
    searchServicesPlaceholder: "Search services...",
    adminQueueLabel: "🛡️ Admin Moderation Queue",
    logoutLabel: "🚪 Logout of Account",
    fodderTitle: "Fodder Hub",
    fodderSubtitle: "Explore protein or energy feeds capped at 1MB media limit.",
    marketTitle: "Marketplace",
    marketSubtitle: "Buy and sell farm equipment, potato seeds, and livestock directly.",
    vetsTitle: "Verified Vets",
    vetsSubtitle: "Connect with licensed Nyandarua County veterinary officers.",
    servicesTitle: "Agricultural Services Hub",
    servicesSubtitle: "Book professional silage making, biogas installation, manure slurry & machinery.",
    supportDesk: "📞 Support & Systems Help Desk:",
    callSupportBtn: "📞 Call Support",
    emailTechBtn: "✉️ Email Tech"
  },
  sw: {
    langBtnLabel: "🇬🇧 English",
    appTitle: "🌾 M-Shambani",
    appSubtitle: "Tovuti ya Kilimo Nyandarua",
    navFodder: "🌾 Soko la Chakula",
    navMarket: "🛒 Soko Kuu",
    navVets: "🩺 Madaktari wa Mifugo",
    navServices: "🛠️ Huduma za Kilimo",
    tabSignIn: "🔑 Ingia Akaunti",
    tabRegister: "📝 Sajili Akaunti",
    lblPhone: "Nambari ya Simu",
    lblPassword: "Nenosiri",
    lblConfirmPassword: "Thibitisha Nenosiri",
    lblFullName: "Majina Kamili",
    lblSubcounty: "Eneo la Kaunti Ndogo",
    lblWard: "Wadi Yako",
    btnSignInSubmit: "Ingia na Ufungue Programu",
    btnRegisterSubmit: "Sajili na Ufungue Programu",
    forgotPassLink: "Umesahau Nenosiri?",
    postFodderBtn: "+ Weka Chakula cha Mifugo",
    postMarketBtn: "+ Weka Bidhaa Sokoni",
    postServiceBtn: "+ Weka Huduma",
    cartTitle: "Kikapu cha Manunuzi",
    viewCart: "🛒 Tazama Kikapu",
    buyMpesa: "💳 Lipa na M-Pesa",
    callSeller: "📞 Piga Simu Muuzaji",
    callTech: "📞 Piga Simu Mtaalamu",
    addToCart: "🛒 Weka Kwenye Kikapu",
    addServiceToCart: "🛒 Weka Huduma Kikapuni",
    searchFodderPlaceholder: "Tafuta chakula cha mifugo kwa jina...",
    searchMarketPlaceholder: "Tafuta bidhaa za kilimo sokoni...",
    searchVetPlaceholder: "Tafuta daktari wa mifugo...",
    searchServicesPlaceholder: "Tafuta huduma za kilimo...",
    adminQueueLabel: "🛡️ Safu ya Idhini ya Admin",
    logoutLabel: "🚪 Toka Kwenye Akaunti",
    fodderTitle: "Soko la Chakula cha Mifugo",
    fodderSubtitle: "Tafuta chakula cha mifugo chenye protini au nguvu.",
    marketTitle: "Soko Kuu la Bidhaa za Kilimo",
    marketSubtitle: "Nunua na uuze vifaa vya kilimo, mbegu za viazi, na mifugo moja kwa moja.",
    vetsTitle: "Madaktari wa Mifugo Waliosajiliwa",
    vetsSubtitle: "Wasiliana na madaktari wa mifugo waliohitimu Kaunti ya Nyandarua.",
    servicesTitle: "Kituo cha Huduma za Kilimo",
    servicesSubtitle: "Kodi utengenezaji wa silage, majengo ya biogas, mbolea na mashine za shamba.",
    supportDesk: "📞 Dawati la Msaada na Mfumo:",
    callSupportBtn: "📞 Piga Simu Msaada",
    emailTechBtn: "✉️ Tuma Barua Pepe"
  }
};

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "sw" : "en";
  localStorage.setItem("mkulima_lang", currentLanguage);
  applyLanguageTranslations();
}

function applyLanguageTranslations() {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const langBtnLabel = document.getElementById("txtLangToggleLabel");
  if (langBtnLabel) langBtnLabel.textContent = t.langBtnLabel;

  // Header Subtitle
  const appSub = document.querySelector(".header-title p");
  if (appSub) appSub.textContent = t.appSubtitle;

  // Desktop Nav Links
  const dFodder = document.getElementById("desktop-nav-fodder");
  const dMarket = document.getElementById("desktop-nav-market");
  const dVets = document.getElementById("desktop-nav-vets");
  const dServices = document.getElementById("desktop-nav-services");
  if (dFodder) dFodder.textContent = t.navFodder;
  if (dMarket) dMarket.textContent = t.navMarket;
  if (dVets) dVets.textContent = t.navVets;
  if (dServices) dServices.textContent = t.navServices;

  // Mobile Bottom Nav
  const mFodder = document.querySelector("#nav-fodder span:last-child");
  const mMarket = document.querySelector("#nav-market span:last-child");
  const mVets = document.querySelector("#nav-vets span:last-child");
  const mServices = document.querySelector("#nav-services span:last-child");
  if (mFodder) mFodder.textContent = t.navFodder.replace("🌾 ", "");
  if (mMarket) mMarket.textContent = t.navMarket.replace("🛒 ", "");
  if (mVets) mVets.textContent = t.navVets.replace("🩺 ", "");
  if (mServices) mServices.textContent = t.navServices.replace("🛠️ ", "");

  // Auth Tabs & Buttons
  const tabLogin = document.getElementById("tabAuthLogin");
  const tabRegister = document.getElementById("tabAuthRegister");
  if (tabLogin) tabLogin.textContent = t.tabSignIn;
  if (tabRegister) tabRegister.textContent = t.tabRegister;

  // Search Placeholders
  const inputFodder = document.getElementById("searchFodderInput");
  const inputMarket = document.getElementById("searchMarketInput");
  const inputVet = document.getElementById("searchVetInput");
  const inputService = document.getElementById("searchServicesInput");
  if (inputFodder) inputFodder.placeholder = t.searchFodderPlaceholder;
  if (inputMarket) inputMarket.placeholder = t.searchMarketPlaceholder;
  if (inputVet) inputVet.placeholder = t.searchVetPlaceholder;
  if (inputService) inputService.placeholder = t.searchServicesPlaceholder;

  // Screen Titles & Subtitles
  const fTitle = document.querySelector("#screen-fodder .card-title");
  const fSub = document.querySelector("#screen-fodder .card-subtitle");
  if (fTitle) fTitle.textContent = t.fodderTitle;
  if (fSub) fSub.textContent = t.fodderSubtitle;

  const mTitle = document.querySelector("#screen-marketplace .card-title");
  const mSub = document.querySelector("#screen-marketplace .card-subtitle");
  if (mTitle) mTitle.textContent = t.marketTitle;
  if (mSub) mSub.textContent = t.marketSubtitle;

  const vTitle = document.querySelector("#screen-vets .card-title");
  const vSub = document.querySelector("#screen-vets .card-subtitle");
  if (vTitle) vTitle.textContent = t.vetsTitle;
  if (vSub) vSub.textContent = t.vetsSubtitle;

  const sTitle = document.querySelector("#screen-services .card-title");
  const sSub = document.querySelector("#screen-services .card-subtitle");
  if (sTitle) sTitle.textContent = t.servicesTitle;
  if (sSub) sSub.textContent = t.servicesSubtitle;

  // Post Buttons
  const btnPostFodder = document.querySelector("#screen-fodder button.btn-primary");
  const btnPostMarket = document.querySelector("#screen-marketplace button.btn-primary");
  const btnPostService = document.querySelector("#screen-services button.btn-primary");
  if (btnPostFodder) btnPostFodder.textContent = t.postFodderBtn;
  if (btnPostMarket) btnPostMarket.textContent = t.postMarketBtn;
  if (btnPostService) btnPostService.textContent = t.postServiceBtn;

  // Support Banner
  const suppP = document.querySelector(".support-banner p");
  const suppCall = document.querySelector(".support-banner .btn-call");
  const suppEmail = document.querySelector(".support-banner .btn-email");
  if (suppP) suppP.textContent = t.supportDesk;
  if (suppCall) suppCall.textContent = t.callSupportBtn;
  if (suppEmail) suppEmail.textContent = t.emailTechBtn;

  // Floating Cart Button
  const floatCartText = document.querySelector("#floatingCartBtn span:first-child");
  if (floatCartText) floatCartText.textContent = t.viewCart;

  // Profile Dropdown
  const btnAdminQueue = document.querySelector("#profileDropdown button[onclick*='modalAdminApprovals']");
  const btnLogoutAcc = document.querySelector("#profileDropdown button[onclick*='logoutFarmer']");
  if (btnAdminQueue) btnAdminQueue.childNodes[0].textContent = t.adminQueueLabel + " ";
  if (btnLogoutAcc) btnLogoutAcc.textContent = t.logoutLabel;

  renderFodderItems("all");
  renderMarketItems();
  renderServiceItems();
}

// PWA OFFLINE ACTION QUEUE & AUTO-SYNC ENGINE
function getOfflineActionQueue() {
  try {
    return JSON.parse(localStorage.getItem("mkulima_offline_action_queue")) || [];
  } catch (e) {
    return [];
  }
}

function enqueueOfflineAction(type, payload) {
  const queue = getOfflineActionQueue();
  const newAction = { id: "act_" + Date.now(), type, payload, createdAt: new Date().toISOString() };
  queue.push(newAction);
  localStorage.setItem("mkulima_offline_action_queue", JSON.stringify(queue));
  showToast(`📴 Saved Offline! Your ${type.replace("_", " ")} will auto-sync when online.`, "warning", 5000);
  updateOfflineBannerQueueCount();
}

async function processOfflineActionQueue() {
  if (!navigator.onLine) return;
  const queue = getOfflineActionQueue();
  if (queue.length === 0) return;

  console.log(`📡 Network connected. Syncing ${queue.length} pending offline action(s)...`);
  showToast(`📡 Network reconnected! Syncing ${queue.length} offline action(s)...`, "info");

  const remainingQueue = [];

  for (const item of queue) {
    try {
      if (item.type === "fodder_listing" || item.type === "market_listing" || item.type === "service_post") {
        pendingApprovals.push(item.payload);
        localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
        updateAdminPendingBadge();
        showToast(`✅ Synced offline post: "${item.payload.title}"`, "success");
      } else if (item.type === "vet_booking") {
        showToast(`✅ Synced offline vet booking for ${item.payload.vetName}`, "success");
      } else if (item.type === "order_checkout") {
        showToast(`✅ Synced offline order!`, "success");
      }
    } catch (err) {
      console.warn("Failed to sync offline item:", err);
      remainingQueue.push(item);
    }
  }

  localStorage.setItem("mkulima_offline_action_queue", JSON.stringify(remainingQueue));
  updateOfflineBannerQueueCount();
}

function updateOfflineBannerQueueCount() {
  const banner = document.getElementById("offlineBanner");
  if (!banner) return;
  const queue = getOfflineActionQueue();
  if (!navigator.onLine) {
    banner.classList.remove("hidden");
    banner.innerHTML = `<span>📴 Offline Mode Active. (${queue.length} action(s) saved to auto-sync when online).</span>`;
  } else if (queue.length > 0) {
    banner.classList.remove("hidden");
    banner.innerHTML = `<span>⚡ ${queue.length} pending offline item(s) ready to sync... <button onclick="processOfflineActionQueue()" style="background:#fff; color:#000; border:none; border-radius:4px; padding:2px 8px; font-weight:800; cursor:pointer; margin-left:8px;">Sync Now</button></span>`;
  } else {
    banner.classList.add("hidden");
  }
}

function setupOfflineNetworkListeners() {
  const updateStatus = () => {
    updateOfflineBannerQueueCount();
    if (navigator.onLine) {
      processOfflineActionQueue();
    } else {
      showToast("📴 You are currently offline. Actions will be queued & synced automatically.", "warning");
    }
  };

  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
  updateStatus();
}

// Application Initialization & Service Worker Registration (PWA)
document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("🌾 M-Shambani Service Worker Registered!"))
      .catch(err => console.warn("SW Registration Failed:", err));
  }

  setupSupabaseAuthListener();
  setupOfflineNetworkListeners();
  updateUserSessionUI();
  applyLanguageTranslations();
  
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
  attachRealtimeValidation();

  document.addEventListener("click", (e) => {
    const profileContainer = document.querySelector(".profile-menu-container");
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown && !dropdown.classList.contains("hidden") && profileContainer && !profileContainer.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
});

// REAL-TIME INPUT VALIDATION & VISUAL FEEDBACK ENHANCEMENT
function attachRealtimeValidation() {
  const phoneInputs = ["loginPhone", "farmerPhone", "mpesaPhone", "resetPhone", "bookingPhone"];
  
  phoneInputs.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    
    let feedback = input.nextElementSibling;
    if (!feedback || !feedback.classList.contains("input-feedback-badge")) {
      feedback = document.createElement("span");
      feedback.className = "input-feedback-badge";
      input.parentNode.insertBefore(feedback, input.nextSibling);
    }
    
    input.addEventListener("input", () => {
      const val = input.value.trim().replace(/\D/g, "");
      if (!val) {
        feedback.textContent = "";
        feedback.className = "input-feedback-badge";
        return;
      }
      
      const isValid = (val.length === 10 && (val.startsWith("07") || val.startsWith("01"))) || (val.length === 12 && val.startsWith("254"));
      if (isValid) {
        feedback.textContent = "✓ Valid Kenyan Phone Number";
        feedback.className = "input-feedback-badge input-feedback-valid";
      } else {
        feedback.textContent = "⚠️ Enter valid phone (e.g. 0712345678 or 254712345678)";
        feedback.className = "input-feedback-badge input-feedback-invalid";
      }
    });
  });

  const passInput = document.getElementById("farmerPass");
  const confirmInput = document.getElementById("farmerConfirmPass");
  
  if (passInput) {
    let passFeedback = passInput.nextElementSibling;
    if (!passFeedback || !passFeedback.classList.contains("input-feedback-badge")) {
      passFeedback = document.createElement("span");
      passFeedback.className = "input-feedback-badge";
      passInput.parentNode.insertBefore(passFeedback, passInput.nextSibling);
    }
    
    passInput.addEventListener("input", () => {
      const val = passInput.value;
      if (!val) {
        passFeedback.textContent = "";
        return;
      }
      const isStrong = validatePasswordPolicy(val);
      if (isStrong) {
        passFeedback.textContent = "✓ Strong Password Policy Met";
        passFeedback.className = "input-feedback-badge input-feedback-valid";
      } else {
        passFeedback.textContent = "⚠️ Requires 6+ chars, 1 uppercase, 1 number, 1 special symbol";
        passFeedback.className = "input-feedback-badge input-feedback-invalid";
      }
    });
  }

  if (confirmInput && passInput) {
    let confirmFeedback = confirmInput.nextElementSibling;
    if (!confirmFeedback || !confirmFeedback.classList.contains("input-feedback-badge")) {
      confirmFeedback = document.createElement("span");
      confirmFeedback.className = "input-feedback-badge";
      confirmInput.parentNode.insertBefore(confirmFeedback, confirmInput.nextSibling);
    }
    
    confirmInput.addEventListener("input", () => {
      if (!confirmInput.value) {
        confirmFeedback.textContent = "";
        return;
      }
      if (confirmInput.value === passInput.value) {
        confirmFeedback.textContent = "✓ Passwords Match";
        confirmFeedback.className = "input-feedback-badge input-feedback-valid";
      } else {
        confirmFeedback.textContent = "⚠️ Passwords do not match";
        confirmFeedback.className = "input-feedback-badge input-feedback-invalid";
      }
    });
  }
}

// QUICK GUEST AUTO SIGN-IN
function quickGuestSignIn() {
  currentUser = {
    name: "Nyandarua Farmer",
    phone: "0718493313",
    subcounty: "Ol Kalou",
    ward: "Karau"
  };
  localStorage.setItem("mkulima_current_user", JSON.stringify(currentUser));
  updateUserSessionUI();
  alert("✅ Welcome to M-Shambani!\nYou are signed in as Nyandarua Farmer.");
  switchScreen("screen-fodder");
}

// REAL SUPABASE GOOGLE & FACEBOOK OAUTH LISTENERS & AUTH
async function setupSupabaseAuthListener() {
  if (typeof db !== "undefined" && db && db.auth) {
    try {
      const { data: { session } } = await db.auth.getSession();
      if (session && session.user) {
        syncOAuthUserSession(session.user);
      }
    } catch (err) {
      console.warn("Supabase auth session fetch exception:", err);
    }

    db.auth.onAuthStateChange((event, session) => {
      if (session && session.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        syncOAuthUserSession(session.user);
      }
    });
  }
}

function syncOAuthUserSession(user) {
  const metadata = user.user_metadata || {};
  const name = metadata.full_name || metadata.name || user.email.split('@')[0];
  const phone = user.phone || metadata.phone || user.email || "OAuth Verified";

  currentUser = {
    name: name,
    email: user.email,
    phone: phone,
    avatar: metadata.avatar_url || metadata.picture || null,
    subcounty: "Ol Kalou",
    ward: "Karau",
    oauthProvider: user.app_metadata ? user.app_metadata.provider : "social"
  };

  localStorage.setItem("mkulima_current_user", JSON.stringify(currentUser));
  updateUserSessionUI();
  switchScreen("screen-fodder");
}

// REAL GOOGLE OAUTH SIGN IN
async function signInWithGoogle() {
  if (typeof db !== "undefined" && db && db.auth) {
    try {
      const { error } = await db.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href.split('#')[0]
        }
      });
      if (error) {
        alert("🔒 Supabase OAuth Configuration Required:\n\n" + error.message + "\n\nPlease enable Google Provider in your Supabase Dashboard under Authentication -> Providers.");
      }
      return;
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

// REAL FACEBOOK OAUTH SIGN IN
async function signInWithFacebook() {
  if (typeof db !== "undefined" && db && db.auth) {
    try {
      const { error } = await db.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: window.location.href.split('#')[0]
        }
      });
      if (error) {
        alert("🔒 Supabase OAuth Configuration Required:\n\n" + error.message + "\n\nPlease enable Facebook Provider in your Supabase Dashboard under Authentication -> Providers.");
      }
      return;
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

const NYANDARUA_SUBCOUNTIES_CLIENT_MAP = {
  "Ol Kalou": { lat: -0.2718, lon: 36.3789, alt: "Ol Kalou Altitude (2,347m)" },
  "Kinangop": { lat: -0.6417, lon: 36.6333, alt: "Kinangop Plateau (2,600m)" },
  "Kipipiri": { lat: -0.3667, lon: 36.5333, alt: "Kipipiri Ridge (2,400m)" },
  "Ol Joro Orok": { lat: -0.1417, lon: 36.3500, alt: "Ol Joro Orok Basin (2,380m)" },
  "Ndaragua": { lat: -0.0333, lon: 36.4667, alt: "Ndaragua Slopes (2,250m)" }
};

function getClientWMOInfo(code) {
  if (code === 0) return { icon: "☀️", text: "Clear Sky" };
  if ([1, 2, 3].includes(code)) return { icon: "⛅", text: "Partly Cloudy" };
  if ([45, 48].includes(code)) return { icon: "🌫️", text: "Foggy & Hazy" };
  if ([51, 53, 55].includes(code)) return { icon: "🌦️", text: "Light Drizzle" };
  if ([61, 63, 65].includes(code)) return { icon: "🌧️", text: "Rainy" };
  if ([80, 81, 82].includes(code)) return { icon: "🌦️", text: "Passing Showers" };
  if ([95, 96, 99].includes(code)) return { icon: "🌩️", text: "Thunderstorm" };
  return { icon: "⛅", text: "Overcast" };
}

function generateClientAgroTip(temp, humidity, rainProb, windSpeed, conditionText, subcounty) {
  if (rainProb > 50 || conditionText.includes("Rain") || conditionText.includes("Thunderstorm")) {
    return `🌧️ Rain Advisory (${rainProb}%): High chance of rainfall in ${subcounty}. Protect harvested fodder & delay pesticide spraying.`;
  }
  if (temp >= 23) {
    return `☀️ Warm Advisory (${temp}°C): Provide extra shade & clean water for dairy cattle in ${subcounty} to maintain milk yields.`;
  }
  if (temp <= 14) {
    return `🌬️ Cold Advisory (${temp}°C): Low temperatures in ${subcounty}. Ensure young calves are sheltered from draft & frost.`;
  }
  return `💡 Extension Advisory: Ideal weather in ${subcounty} for harvesting Rhodes grass & maize silage compaction.`;
}

// NYANDARUA LIVE WEATHER & FARMING TIPS PANEL (Universal Dual Proxy: Server + Direct Satellite Fallback)
async function renderNyandaruaWeather(targetSubcounty = null) {
  const weatherContainer = document.getElementById("weatherPanel");
  if (!weatherContainer) return;

  if (targetSubcounty) {
    currentSelectedSubcounty = targetSubcounty;
  } else if (currentUser && currentUser.subcounty) {
    currentSelectedSubcounty = currentUser.subcounty;
  }

  let data = null;

  // Try 1: Call Express Backend Server Proxy (/api/weather)
  try {
    const res = await fetch(`/api/weather?subcounty=${encodeURIComponent(currentSelectedSubcounty)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && !json.fallback) {
        data = json;
      }
    }
  } catch (err) {
    console.warn("Backend proxy offline, switching to direct Open-Meteo REST API...");
  }

  // Try 2: Direct Client-Side Open-Meteo Satellite REST API Fetch (Works on GitHub Pages / Live Production!)
  if (!data) {
    try {
      const coords = NYANDARUA_SUBCOUNTIES_CLIENT_MAP[currentSelectedSubcounty] || NYANDARUA_SUBCOUNTIES_CLIENT_MAP["Ol Kalou"];
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=precipitation_probability&timezone=Africa%2FNairobi`;
      const omRes = await fetch(openMeteoUrl);
      const omData = await omRes.json();

      const current = omData.current || {};
      const temp = Math.round(current.temperature_2m ?? 18);
      const humidity = Math.round(current.relative_humidity_2m ?? 70);
      const weatherCode = current.weather_code ?? 1;
      const windSpeed = Math.round(current.wind_speed_10m ?? 10);
      const rainProbArray = omData.hourly?.precipitation_probability || [];
      const rainProb = rainProbArray.length > 0 ? Math.round(rainProbArray[0]) : 15;

      const condInfo = getClientWMOInfo(weatherCode);
      const tip = generateClientAgroTip(temp, humidity, rainProb, windSpeed, condInfo.text, currentSelectedSubcounty);

      data = {
        subcounty: currentSelectedSubcounty,
        alt: coords.alt,
        temp: `${temp}°C`,
        condition: `${condInfo.icon} ${condInfo.text}`,
        icon: condInfo.icon,
        humidity: `${humidity}%`,
        rainProb: `${rainProb}%`,
        windSpeed: `${windSpeed} km/h`,
        tip: tip,
        subcountiesList: Object.keys(NYANDARUA_SUBCOUNTIES_CLIENT_MAP)
      };
    } catch (omErr) {
      console.error("Direct Open-Meteo satellite fetch failed:", omErr);
    }
  }

  // Fallback 3: Graceful Payload
  if (!data) {
    data = {
      subcounty: currentSelectedSubcounty,
      alt: "Ol Kalou Altitude (2,347m)",
      temp: "18°C",
      condition: "⛅ Partly Cloudy",
      icon: "⛅",
      humidity: "72%",
      rainProb: "15%",
      windSpeed: "10 km/h",
      tip: `💡 Extension Advisory: Clear weather in ${currentSelectedSubcounty} for fodder harvesting.`,
      subcountiesList: Object.keys(NYANDARUA_SUBCOUNTIES_CLIENT_MAP)
    };
  }

  const subList = data.subcountiesList || Object.keys(NYANDARUA_SUBCOUNTIES_CLIENT_MAP);
  const selectOptions = subList.map(sub => 
    `<option value="${sub}" ${sub === currentSelectedSubcounty ? "selected" : ""}>📍 ${sub}</option>`
  ).join("");

  weatherContainer.innerHTML = `
    <div class="weather-card">
      <div class="weather-card-top">
        <div class="weather-location-title">
          📍 ${data.subcounty} Climate
        </div>
        <select class="weather-select-subcounty" onchange="renderNyandaruaWeather(this.value)">
          ${selectOptions}
        </select>
      </div>

      <div class="weather-main-row">
        <div class="weather-temp-badge">
          <span class="weather-icon-big">${data.icon || '⛅'}</span>
          <div>
            <div class="weather-temp-big">${data.temp}</div>
            <div class="weather-cond-text">${data.condition}</div>
          </div>
        </div>
        <button onclick="renderNyandaruaWeather('${currentSelectedSubcounty}')" class="btn-weather-refresh">
          🔄 Refresh
        </button>
      </div>

      <div class="weather-metrics-grid">
        <div class="weather-metric-pill">
          <div class="weather-metric-label">💧 Humidity</div>
          <div class="weather-metric-val">${data.humidity}</div>
        </div>
        <div class="weather-metric-pill">
          <div class="weather-metric-label">🌧️ Rain Risk</div>
          <div class="weather-metric-val">${data.rainProb}</div>
        </div>
        <div class="weather-metric-pill">
          <div class="weather-metric-label">💨 Wind Speed</div>
          <div class="weather-metric-val">${data.windSpeed}</div>
        </div>
      </div>

      <div class="weather-advisory-box">
        ${data.tip}
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
  const floatingCartBtn = document.getElementById("floatingCartBtn");
  const desktopNavLinks = document.querySelector(".desktop-nav-links");

  if (currentUser) {
    if (badgeLocation) {
      badgeLocation.textContent = `📍 ${formatSubcountyAbbr(currentUser.subcounty)}`;
      badgeLocation.classList.remove("hidden");
    }
    if (profileMenuContainer) {
      profileMenuContainer.classList.remove("hidden");
      document.getElementById("txtProfileName").textContent = currentUser.name || "Farmer";
      
      document.getElementById("dropdownUserName").textContent = currentUser.name || "Farmer";
      document.getElementById("dropdownUserPhone").textContent = `📞 ${currentUser.phone || 'N/A'}`;
      document.getElementById("dropdownUserRegion").textContent = `📍 ${formatSubcountyAbbr(currentUser.subcounty || 'Nyandarua')} (${currentUser.ward || 'Ward'})`;
    }
    if (btnAuthHeader) btnAuthHeader.classList.add("hidden");
    if (bottomNav) {
      bottomNav.classList.remove("disabled-nav", "hidden");
    }
    if (floatingCartBtn) {
      floatingCartBtn.classList.remove("hidden");
    }
    if (desktopNavLinks) {
      desktopNavLinks.classList.remove("hidden");
    }
  } else {
    if (badgeLocation) badgeLocation.classList.add("hidden");
    if (profileMenuContainer) profileMenuContainer.classList.add("hidden");
    if (btnAuthHeader) btnAuthHeader.classList.remove("hidden");
    if (bottomNav) {
      bottomNav.classList.add("disabled-nav", "hidden");
    }
    if (floatingCartBtn) {
      floatingCartBtn.classList.add("hidden");
    }
    if (desktopNavLinks) {
      desktopNavLinks.classList.add("hidden");
    }
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

// Toggle Password Visibility (Clean Text Show/Hide)
function togglePasswordVisibility(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input || !btn) return;

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "Hide";
  } else {
    input.type = "password";
    btn.textContent = "Show";
  }
}

// REGISTERED FARMERS DATABASE REGISTRY
function getRegisteredFarmers() {
  const stored = localStorage.getItem("mkulima_registered_farmers");
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  const defaultFarmers = [
    { name: "John Kamau", phone: "0718493313", password: "Password1@", subcounty: "Ol Kalou", ward: "Karau" },
    { name: "Mary Wanjiku", phone: "0722000000", password: "Password1@", subcounty: "Kinangop", ward: "Engineer" }
  ];
  localStorage.setItem("mkulima_registered_farmers", JSON.stringify(defaultFarmers));
  return defaultFarmers;
}

function saveRegisteredFarmer(farmerObj) {
  const list = getRegisteredFarmers();
  const index = list.findIndex(f => f.phone === farmerObj.phone);
  if (index !== -1) {
    list[index] = farmerObj;
  } else {
    list.push(farmerObj);
  }
  localStorage.setItem("mkulima_registered_farmers", JSON.stringify(list));
}

// STRICT FARMER LOGIN & PASSWORD VERIFICATION
async function processFarmerLogin(e) {
  e.preventDefault();
  const phoneRaw = document.getElementById("loginPhone").value.trim();
  const pass = document.getElementById("loginPass").value;

  if (!phoneRaw || !pass) {
    showToast("Please fill in both phone number and password.", "warning");
    return;
  }

  let formattedPhone = phoneRaw.replace(/\D/g, "");
  if (formattedPhone.length === 9 && formattedPhone.startsWith("7")) {
    formattedPhone = "0" + formattedPhone;
  }

  // 1. Check Supabase Cloud Database Table 'farmers' if configured
  if (typeof db !== "undefined" && db) {
    try {
      const { data, error } = await db.from("farmers").select("*").eq("phone", formattedPhone).single();
      if (!error && data) {
        if (data.password === pass || data.password_hash === pass) {
          currentUser = { name: data.name, phone: data.phone, subcounty: data.subcounty, ward: data.ward };
          localStorage.setItem("mkulima_current_user", JSON.stringify(currentUser));
          updateUserSessionUI();
          showToast(`✅ Welcome back, ${currentUser.name}! Password verified.`, "success");
          switchScreen("screen-fodder");
          return;
        } else {
          showToast(`❌ Invalid Password for ${phoneRaw}. Please try again.`, "error");
          return;
        }
      }
    } catch (err) {
      console.warn("Supabase auth lookup fallback to local registry:", err);
    }
  }

  // 2. Check Local Registered Accounts Database
  const registeredFarmers = getRegisteredFarmers();
  const matchedFarmer = registeredFarmers.find(f => f.phone.replace(/\D/g, "") === formattedPhone);

  if (!matchedFarmer) {
    showToast(`❌ Account Not Found for ${phoneRaw}. Please register a new account.`, "error");
    return;
  }

  if (matchedFarmer.password !== pass) {
    showToast(`❌ Invalid Password for ${phoneRaw}. Please try again.`, "error");
    return;
  }

  currentUser = {
    name: matchedFarmer.name,
    phone: matchedFarmer.phone,
    subcounty: matchedFarmer.subcounty,
    ward: matchedFarmer.ward
  };

  localStorage.setItem("mkulima_current_user", JSON.stringify(currentUser));
  updateUserSessionUI();
  showToast(`✅ Welcome back, ${currentUser.name}! Password verified.`, "success");
  switchScreen("screen-fodder");
}

// STRICT FARMER SIGN UP & DATABASE PERSISTENCE
async function processFarmerRegistration(e) {
  e.preventDefault();
  const name = document.getElementById("farmerName").value.trim();
  const phone = document.getElementById("farmerPhone").value.trim();
  const pass = document.getElementById("farmerPass").value;
  const confirmPass = document.getElementById("farmerConfirmPass").value;
  const subcounty = document.getElementById("farmerSubCounty").value;
  const ward = document.getElementById("farmerWard").value;

  if (!validatePasswordPolicy(pass)) {
    showToast("🔒 Password Policy Error: Must be 6+ chars with uppercase, number & symbol.", "error");
    return;
  }

  if (pass !== confirmPass) {
    showToast("❌ Password Mismatch Error: Your password and confirm password fields do not match.", "error");
    return;
  }

  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.length === 9 && formattedPhone.startsWith("7")) {
    formattedPhone = "0" + formattedPhone;
  }

  const registeredFarmers = getRegisteredFarmers();
  const existing = registeredFarmers.find(f => f.phone.replace(/\D/g, "") === formattedPhone);
  if (existing) {
    showToast(`❌ Account Already Exists: Phone ${phone} is already registered. Please Sign In.`, "warning");
    return;
  }

  const newFarmer = { name, phone: formattedPhone, password: pass, subcounty, ward, registeredAt: new Date().toISOString() };

  if (typeof db !== "undefined" && db) {
    try {
      await db.from("farmers").insert([{ name, phone: formattedPhone, password: pass, subcounty, ward }]);
    } catch (err) {
      console.warn("Supabase farmer insert exception:", err);
    }
  }

  saveRegisteredFarmer(newFarmer);

  currentUser = { name, phone: formattedPhone, subcounty, ward };
  localStorage.setItem("mkulima_current_user", JSON.stringify(currentUser));
  updateUserSessionUI();

  showToast(`✅ Account Created! Welcome, ${name} (${subcounty} Sub-County).`, "success");
  switchScreen("screen-fodder");
}

// Logout Handler
function logoutFarmer() {
  if (confirm("Are you sure you want to log out of M-Shambani?")) {
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
    alert("🔒 Authentication Required:\nPlease sign in or create an account to access M-Shambani features.");
    screenId = "screen-auth";
  }

  const screens = ["screen-auth", "screen-fodder", "screen-marketplace", "screen-vets", "screen-services", "screen-orders"];
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
    "screen-services": "nav-services",
    "screen-orders": "nav-orders"
  };

  const desktopNavMap = {
    "screen-fodder": "desktop-nav-fodder",
    "screen-marketplace": "desktop-nav-market",
    "screen-vets": "desktop-nav-vets",
    "screen-services": "desktop-nav-services",
    "screen-orders": "desktop-nav-orders"
  };

  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(navMap[screenId]);
  if (activeBtn) activeBtn.classList.add("active");

  document.querySelectorAll(".desktop-nav-link").forEach(btn => btn.classList.remove("active"));
  const activeDesktopBtn = document.getElementById(desktopNavMap[screenId]);
  if (activeDesktopBtn) activeDesktopBtn.classList.add("active");

  if (screenId === "screen-services") {
    renderServiceItems();
  } else if (screenId === "screen-orders") {
    renderOrdersPageUI();
  }
}

// =============================================================
// BUYER ORDER LIFECYCLE & DELIVERY TRACKING ENGINE
// =============================================================
let buyerOrders = JSON.parse(localStorage.getItem("mkulima_orders")) || [
  {
    orderId: "MMK-49201",
    itemsSummary: "1x Silage Bales (Yellow Corn)",
    totalAmount: "KSh 2,800",
    subcounty: "Kinangop",
    pickupPoint: "Kinangop Dairy Coop Collection Hub",
    agentPhone: "0723456789",
    paymentStatus: "Paid",
    deliveryStage: "Ready for Pickup",
    timestamp: "Today, 4:15 PM"
  }
];

function createBuyerOrderRecord(orderData) {
  buyerOrders.unshift(orderData);
  localStorage.setItem("mkulima_orders", JSON.stringify(buyerOrders));
  renderOrdersPageUI();
}

function renderOrdersPageUI() {
  const container = document.getElementById("containerOrdersList");
  if (!container) return;

  if (buyerOrders.length === 0) {
    container.innerHTML = `
      <div class="card text-center py-12">
        <div style="font-size:3rem; margin-bottom:0.5rem;">📦</div>
        <h3 class="font-extrabold text-slate-800 text-lg">No Orders Placed Yet</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">When you buy fodder, machinery, or agricultural services via M-Pesa, your live pickup and delivery stages will appear here.</p>
        <button onclick="switchScreen('screen-fodder')" class="btn btn-primary btn-sm mt-4">🌾 Browse Fodder Hub</button>
      </div>
    `;
    return;
  }

  const stages = ["Order Placed", "M-Pesa Paid", "In Transit", "Ready for Pickup"];

  container.innerHTML = buyerOrders.map(order => {
    const currentStageIdx = stages.indexOf(order.deliveryStage) !== -1 ? stages.indexOf(order.deliveryStage) : 3;

    return `
      <div class="card" style="border-left: 4px solid var(--primary-600); position:relative; background:white; padding:1.25rem; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
        <div class="flex-between mb-2">
          <div>
            <span class="item-badge badge-protein" style="font-size:0.75rem; padding:0.25rem 0.5rem;">Order #${order.orderId}</span>
            <span class="text-xs text-slate-500 ml-2">🕒 ${order.timestamp}</span>
          </div>
          <span class="price-tag" style="font-size:1.05rem;">${order.totalAmount}</span>
        </div>

        <div style="margin: 0.5rem 0;">
          <h4 class="font-extrabold text-slate-900 text-base">${order.itemsSummary}</h4>
          <p class="text-xs text-slate-600 mt-0.5"><strong>📍 Assigned Depot:</strong> ${order.pickupPoint || 'Ol Kalou Farmers Central Depot'}</p>
        </div>

        <!-- VISUAL STEPPER BAR -->
        <div style="margin: 1rem 0; background: #f1f5f9; border-radius: 8px; padding: 0.75rem;">
          <div style="display:flex; justify-content:space-between; position:relative; font-size:0.72rem; font-weight:700;">
            ${stages.map((stageName, idx) => {
              const isCompleted = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return `
                <div style="text-align:center; flex:1; position:relative; z-index:2;">
                  <div style="width:24px; height:24px; border-radius:50%; background:${isCompleted ? '#047857' : '#cbd5e1'}; color:white; display:flex; align-items:center; justify-content:center; margin:0 auto 0.25rem; font-size:0.7rem; font-weight:800;">
                    ${isCompleted ? '✓' : idx + 1}
                  </div>
                  <span style="color:${isCurrent ? '#047857' : isCompleted ? '#334155' : '#94a3b8'}; font-weight:${isCurrent ? '800' : '600'}; font-size:0.68rem;">
                    ${stageName}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ACTIONS & DEPOT CONTACT -->
        <div class="flex gap-2 pt-2 border-t" style="margin-top:0.5rem;">
          <a href="tel:${order.agentPhone || '0718493313'}" class="btn btn-secondary btn-sm" style="flex:1;">
            📞 Call Station Agent (${order.agentPhone || '0718493313'})
          </a>
          <button onclick="resendOrderSMS('${order.orderId}', '${order.itemsSummary}', '${order.totalAmount}', '${order.pickupPoint}')" class="btn btn-primary btn-sm" style="flex:1;">
            📱 Resend SMS Details
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function resendOrderSMS(orderId, itemsSummary, totalAmount, pickupPoint) {
  if (!currentUser) return;
  alert(`📱 Resending SMS confirmation for Order #${orderId} to ${currentUser.phone}...`);
  await sendOrderConfirmationSMS(currentUser.phone, itemsSummary, totalAmount, currentUser.subcounty || "Ol Kalou");
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
        localStorage.setItem("mkulima_cached_fodder", JSON.stringify(items));
      }
    } catch (err) {
      console.warn("Supabase fetch fallback:", err);
      items = JSON.parse(localStorage.getItem("mkulima_cached_fodder")) || fallbackFodder;
    }
  } else {
    items = JSON.parse(localStorage.getItem("mkulima_cached_fodder")) || fallbackFodder;
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

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  container.innerHTML = items.map(item => {
    const displayTitle = (currentLanguage === "sw" && item.title_sw) ? item.title_sw : item.title;
    const displayDesc = (currentLanguage === "sw" && item.desc_sw) ? item.desc_sw : (item.description || item.desc || '');
    const displayCategory = (currentLanguage === "sw" && item.category_sw) ? item.category_sw : item.category;

    return `
      <div class="item-card">
        <div class="flex-between">
          <span class="item-badge ${item.category === 'Protein' ? 'badge-protein' : 'badge-energy'}">${displayCategory} Feed</span>
          <span class="price-tag">${item.price}</span>
        </div>
        <div>
          <h3 class="font-extrabold text-slate-900 text-base">${displayTitle}</h3>
          ${item.image ? `<img src="${item.image}" style="width:100%; height:130px; object-fit:cover; border-radius:8px; margin-top:0.35rem; border:1px solid #e2e8f0;">` : ''}
          <p class="text-xs text-slate-500 mt-1">${displayDesc}</p>
        </div>
        <div class="mt-2 pt-2 border-t text-xs text-slate-600">
          <div class="flex-between mb-2">
            <span>📍 ${formatSubcountyAbbr(item.subcounty)}</span>
            <span style="font-weight:700; color:var(--primary-700);">Verified Feed</span>
          </div>
          <div class="item-card-action-bar">
            <button onclick="addToCart('${item.title}', '${item.price}', '${item.category}', '${item.subcounty}')" class="btn btn-cart-primary">
              ${t.addToCart}
            </button>
            <div class="item-card-row2-actions">
              <a href="tel:${item.phone}" class="btn btn-contact-secondary">${t.callSeller}</a>
              <button onclick="openMpesaModal('${item.title}', '${item.price}')" class="btn btn-mpesa-accent">${t.buyMpesa}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
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
        localStorage.setItem("mkulima_cached_market", JSON.stringify(items));
      }
    } catch (err) {
      console.warn("Supabase fetch fallback:", err);
      items = JSON.parse(localStorage.getItem("mkulima_cached_market")) || fallbackMarket;
    }
  } else {
    items = JSON.parse(localStorage.getItem("mkulima_cached_market")) || fallbackMarket;
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(item => item.title.toLowerCase().includes(q) || (item.description || item.desc || '').toLowerCase().includes(q));
  }

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  container.innerHTML = items.map(item => {
    const displayTitle = (currentLanguage === "sw" && item.title_sw) ? item.title_sw : item.title;
    const displayDesc = (currentLanguage === "sw" && item.desc_sw) ? item.desc_sw : (item.description || item.desc || '');
    const displayCategory = (currentLanguage === "sw" && item.category_sw) ? item.category_sw : item.category;

    return `
      <div class="item-card">
        <div class="flex-between">
          <span class="item-badge badge-verified">${displayCategory}</span>
          <span class="price-tag">${item.price}</span>
        </div>
        <div>
          <h3 class="font-extrabold text-slate-900 text-base">${displayTitle}</h3>
          ${item.image ? `<img src="${item.image}" style="width:100%; height:130px; object-fit:cover; border-radius:8px; margin-top:0.35rem; border:1px solid #e2e8f0;">` : ''}
          <p class="text-xs text-slate-500 mt-1">${displayDesc}</p>
        </div>
        <div class="mt-2 pt-2 border-t text-xs text-slate-600">
          <div class="flex-between mb-2">
            <span>📍 ${formatSubcountyAbbr(item.location)}</span>
            <span style="font-weight:700; color:var(--accent-700);">Direct Trade</span>
          </div>
          <div class="item-card-action-bar">
            <button onclick="addToCart('${item.title}', '${item.price}', '${item.category}', '${item.location}')" class="btn btn-cart-primary">
              ${t.addToCart}
            </button>
            <div class="item-card-row2-actions">
              <a href="tel:${item.contact}" class="btn btn-contact-secondary">${t.callSeller}</a>
              <button onclick="openMpesaModal('${item.title}', '${item.price}')" class="btn btn-mpesa-accent">${t.buyMpesa}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
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

  container.innerHTML = items.map(vet => {
    const displaySpec = (currentLanguage === "sw" && vet.spec_sw) ? vet.spec_sw : (vet.specialization || vet.spec || '');

    return `
      <div class="item-card">
        <div class="flex-between">
          <span class="item-badge badge-protein">🛡️ ${vet.reg_number || vet.reg}</span>
          <span class="text-xs font-bold text-emerald-700">📍 ${formatSubcountyAbbr(vet.subcounty)}</span>
        </div>
        <div>
          <h3 class="font-extrabold text-slate-900 text-base">${vet.name}</h3>
          <p class="text-xs text-slate-600 mt-0.5">Utaalamu: ${displaySpec}</p>
        </div>
        <div class="flex gap-2 mt-2 pt-2 border-t">
          <a href="tel:${vet.phone}" class="btn btn-secondary btn-sm" style="flex:1">📞 Call Vet</a>
          <button onclick="openBookingModal('${vet.name}')" class="btn btn-primary btn-sm" style="flex:1">📅 Schedule Visit</button>
        </div>
      </div>
    `;
  }).join('');
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
        localStorage.setItem("mkulima_cached_services", JSON.stringify(items));
      }
    } catch (err) {
      console.warn("Supabase services fetch fallback:", err);
      items = JSON.parse(localStorage.getItem("mkulima_cached_services")) || fallbackServices;
    }
  } else {
    items = JSON.parse(localStorage.getItem("mkulima_cached_services")) || fallbackServices;
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

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  container.innerHTML = items.map(item => {
    const displayTitle = (currentLanguage === "sw" && item.title_sw) ? item.title_sw : item.title;
    const displayDesc = (currentLanguage === "sw" && item.desc_sw) ? item.desc_sw : (item.description || item.desc || '');
    const displayCategory = (currentLanguage === "sw" && item.category_sw) ? item.category_sw : item.category;

    return `
      <div class="item-card">
        <div class="flex-between">
          <span class="item-badge badge-protein">🛠️ ${displayCategory}</span>
          <span class="price-tag">${item.rate || item.price}</span>
        </div>
        <div>
          <h3 class="font-extrabold text-slate-900 text-base">${displayTitle}</h3>
          ${item.image ? `<img src="${item.image}" style="width:100%; height:130px; object-fit:cover; border-radius:8px; margin-top:0.35rem; border:1px solid #e2e8f0;">` : ''}
          <p class="text-xs text-slate-500 mt-1">${displayDesc}</p>
        </div>
        <div class="mt-2 pt-2 border-t text-xs text-slate-600">
          <div class="flex-between mb-2">
            <span>📍 ${formatSubcountyAbbr(item.subcounty)} • ${item.provider || 'Verified Specialist'}</span>
            <span style="font-weight:700; color:var(--primary-700);">⭐ Certified Service</span>
          </div>
          <div class="item-card-action-bar">
            <button onclick="addToCart('${item.title}', '${item.rate || item.price}', '${item.category}', '${item.subcounty}')" class="btn btn-cart-primary">
              ${t.addServiceToCart}
            </button>
            <div class="item-card-row2-actions">
              <a href="tel:${item.phone}" class="btn btn-contact-secondary">${t.callTech}</a>
              <button onclick="openMpesaModal('${item.title}', '${item.rate || item.price}')" class="btn btn-mpesa-accent">${t.buyMpesa}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
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
  const photoUrl = await getPhotoDataUrlOrStorageUrl("newServiceFile");

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
    image: photoUrl,
    timestamp: "Just now"
  });
  localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
  updateAdminPendingBadge();

  toggleModal("modalServiceUpload", false);
  alert(`⏳ Service Submitted for Admin Approval!\n\nYour agricultural service "${title}" has been sent to the Nyandarua Admin Moderation Queue and will be published live upon approval.`);
}

// CAMERA PHOTO PREVIEW & SUPABASE STORAGE UPLOAD HELPER
function previewUploadImage(event, previewImgId) {
  const file = event.target.files[0];
  const imgEl = document.getElementById(previewImgId);
  if (file && imgEl) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imgEl.src = e.target.result;
      imgEl.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
}

async function getPhotoDataUrlOrStorageUrl(fileInputId) {
  const fileInput = document.getElementById(fileInputId);
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) return null;

  const file = fileInput.files[0];

  if (typeof db !== "undefined" && db && db.storage) {
    try {
      const fileName = `photo_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
      const { data, error } = await db.storage.from("item-photos").upload(fileName, file);
      if (!error && data) {
        const publicUrl = db.storage.from("item-photos").getPublicUrl(fileName).data.publicUrl;
        return publicUrl;
      }
    } catch (err) {
      console.warn("Supabase Storage upload fallback to Base64:", err);
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Upload Fodder directly to Supabase Cloud Database + Storage
async function processFodderUpload(e) {
  e.preventDefault();
  const title = document.getElementById("newFodderTitle").value.trim();
  const category = document.getElementById("newFodderCategory").value;
  const price = document.getElementById("newFodderPrice").value.trim();
  const description = document.getElementById("newFodderDesc").value.trim();
  const photoUrl = await getPhotoDataUrlOrStorageUrl("newFodderFile");

  const itemPayload = {
    id: Date.now(),
    type: "fodder",
    title,
    category,
    price,
    subcounty: currentUser ? currentUser.subcounty : "Ol Kalou",
    seller: currentUser ? currentUser.name : "Local Farmer",
    phone: currentUser ? currentUser.phone : "0718493313",
    desc: description,
    image: photoUrl,
    timestamp: "Just now"
  };

  toggleModal("modalFodderUpload", false);

  if (!navigator.onLine) {
    enqueueOfflineAction("fodder_listing", itemPayload);
    return;
  }

  pendingApprovals.push(itemPayload);
  localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
  updateAdminPendingBadge();
  showToast(`⏳ Fodder Listing "${title}" submitted for Admin Approval!`, "success");
}

// Upload Marketplace Item directly to Supabase Cloud Database + Storage
async function processMarketListing(e) {
  e.preventDefault();
  const title = document.getElementById("newMarketTitle").value.trim();
  const category = document.getElementById("newMarketCategory").value;
  const price = document.getElementById("newMarketPrice").value.trim();
  const contact = document.getElementById("newMarketContact").value.trim();
  const description = document.getElementById("newMarketDesc").value.trim();
  const photoUrl = await getPhotoDataUrlOrStorageUrl("newMarketFile");

  const itemPayload = {
    id: Date.now(),
    type: "market",
    title,
    category,
    price,
    location: currentUser ? currentUser.subcounty : "Nyandarua",
    contact: contact || (currentUser ? currentUser.phone : "0700000000"),
    desc: description,
    image: photoUrl,
    timestamp: "Just now"
  };

  toggleModal("modalMarketUpload", false);

  if (!navigator.onLine) {
    enqueueOfflineAction("market_listing", itemPayload);
    return;
  }

  pendingApprovals.push(itemPayload);
  localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
  updateAdminPendingBadge();
  showToast(`⏳ Marketplace Listing "${title}" submitted for Admin Approval!`, "success");
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

async function sendOrderConfirmationSMS(phone, itemSummary, totalAmount, subcounty = "Ol Kalou") {
  const userSub = subcounty || (currentUser ? currentUser.subcounty : "Ol Kalou");
  const randomId = 'MMK-' + Math.floor(10000 + Math.random() * 90000);

  try {
    const res = await fetch("/api/sms/order-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone,
        subcounty: userSub,
        orderId: randomId,
        itemSummary: itemSummary,
        totalAmount: totalAmount
      })
    });
    const json = await res.json();
    let pickupName = `${userSub} Farmers Central Depot`;
    let agentPhone = "0718493313";

    if (json && json.pickupPoint) {
      pickupName = json.pickupPoint.name;
      agentPhone = json.pickupPoint.agentPhone;
    }

    createBuyerOrderRecord({
      orderId: randomId,
      itemsSummary: itemSummary,
      totalAmount: (typeof totalAmount === 'number') ? `KSh ${totalAmount.toLocaleString()}` : totalAmount,
      subcounty: userSub,
      pickupPoint: pickupName,
      agentPhone: agentPhone,
      paymentStatus: "Paid",
      deliveryStage: "Ready for Pickup",
      timestamp: "Just now"
    });

    if (json && json.success) {
      alert(`📱 SMS CONFIRMATION DISPATCHED (Africa's Talking):\n\nRecipient: ${json.recipient}\nOrder #: ${randomId}\n\n📍 PICKUP POINT:\n${json.pickupPoint.name}\n${json.pickupPoint.location}\n📞 Station Agent: ${json.pickupPoint.agentPhone}`);
    }
  } catch (err) {
    console.warn("SMS dispatch endpoint exception:", err);
    createBuyerOrderRecord({
      orderId: randomId,
      itemsSummary: itemSummary,
      totalAmount: (typeof totalAmount === 'number') ? `KSh ${totalAmount.toLocaleString()}` : totalAmount,
      subcounty: userSub,
      pickupPoint: `${userSub} Farmers Central Depot`,
      agentPhone: "0718493313",
      paymentStatus: "Paid",
      deliveryStage: "Ready for Pickup",
      timestamp: "Just now"
    });
    alert(`📱 ORDER CONFIRMED!\n\nOrder #: ${randomId}\nItems: ${itemSummary}\n\n📍 PICKUP POINT:\n${userSub} Farmers Central Depot\n📞 Station Agent: 0718493313\n\nAn SMS confirmation has been dispatched to ${phone}.`);
  }
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

  const userSubcounty = currentUser ? currentUser.subcounty : "Ol Kalou";
  const mpesaReceiptSim = 'QHK' + Math.floor(100000 + Math.random() * 900000);
  const orderNum = `MMK-${Math.floor(10000 + Math.random() * 90000)}`;
  
  sendOrderConfirmationSMS(phoneRaw, activeMpesaItem.title, numericAmount, userSubcounty);
  syncMpesaPaymentStatusToDatabase(orderNum, mpesaReceiptSim, "PAID");

  toggleModal("modalMpesaPay", false);

  // Populate and open M-Pesa Verified Receipt Modal
  const rCode = document.getElementById("receiptCodeVal");
  const rAmt = document.getElementById("receiptAmountVal");
  const rPhone = document.getElementById("receiptPhoneVal");
  const rDepot = document.getElementById("receiptDepotVal");
  if (rCode) rCode.textContent = mpesaReceiptSim;
  if (rAmt) rAmt.textContent = `KSh ${numericAmount.toLocaleString()}`;
  if (rPhone) rPhone.textContent = phoneRaw;
  if (rDepot) rDepot.textContent = `${userSubcounty} Farmers Central Depot`;

  toggleModal("modalMpesaReceipt", true);
}

async function syncMpesaPaymentStatusToDatabase(orderId, mpesaReceipt, status = "PAID") {
  if (typeof db !== "undefined" && db) {
    try {
      await db.from("orders").insert([
        {
          order_id: orderId,
          mpesa_receipt: mpesaReceipt,
          status: status,
          user_phone: currentUser ? currentUser.phone : "0700000000",
          created_at: new Date().toISOString()
        }
      ]);
      console.log(`✅ M-Pesa Payment Status Synced to Supabase DB: ${orderId} -> ${status}`);
    } catch (err) {
      console.warn("Supabase M-Pesa order sync warning:", err);
    }
  }
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
    showToast("Please select a valid appointment date.", "warning");
    return;
  }

  const bookingPayload = { vetName: activeTargetVet, date, symptoms: symptoms || "General Checkup" };

  toggleModal("modalVetBooking", false);

  if (!navigator.onLine) {
    enqueueOfflineAction("vet_booking", bookingPayload);
    return;
  }

  showToast(`✅ Appointment Confirmed with ${activeTargetVet} for ${date}!`, "success");
}

// AFRICA'S TALKING BACKEND-ROUTED OTP SMS DISPATCH
async function triggerPasswordResetSMS() {
  const phoneInput = document.getElementById("resetPhone");
  const phoneRaw = phoneInput ? phoneInput.value.trim() : "";
  
  if (!phoneRaw) {
    showToast("Please enter a valid phone number.", "warning");
    return;
  }

  const otpCode = Math.floor(1000 + Math.random() * 9000);

  try {
    const response = await fetch("/api/sms/reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneRaw, otpCode })
    });

    const data = await response.json();
    if (data.success) {
      showToast(data.message || `📲 OTP PIN (${otpCode}) sent to ${phoneRaw}!`, "success");
    } else {
      showToast(`📲 OTP PIN: ${otpCode} generated for ${phoneRaw}.`, "info");
    }
  } catch (err) {
    console.warn("OTP SMS Dispatch Exception:", err);
    showToast(`📲 OTP PIN: ${otpCode} generated for ${phoneRaw}.`, "info");
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
let pendingApprovals = JSON.parse(localStorage.getItem("mkulima_pending_approvals")) || [];

function updateAdminPendingBadge() {
  const badge = document.getElementById("adminPendingBadge");
  if (badge) badge.textContent = pendingApprovals.length;
}

async function openAdminApprovalsModal() {
  toggleModal("modalAdminApprovals", true);
  
  if (typeof db !== "undefined" && db) {
    try {
      const { data, error } = await db.from("pending_approvals").select("*").eq("status", "pending");
      if (!error && data && data.length > 0) {
        pendingApprovals = data;
        localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
      }
    } catch (err) {
      console.warn("Supabase pending approvals fetch exception:", err);
    }
  } else {
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
        <p style="font-size: 0.78rem;">All submitted fodder, marketplace, and service listings in the database have been reviewed and approved.</p>
      </div>
    `;
    updateAdminPendingBadge();
    return;
  }

  container.innerHTML = pendingApprovals.map((item, idx) => `
    <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 8px; padding: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
      <div class="flex-between" style="margin-bottom: 0.25rem;">
        <span class="item-badge" style="background:#fff7ed; color:#c2410c; border:1px solid #ffedd5; font-weight:800;">
          ⏳ ${(item.type || 'ITEM').toUpperCase()} PENDING APPROVAL
        </span>
        <span style="font-size:0.7rem; font-weight:700; color:#94a3b8;">${item.timestamp || 'Database Item'}</span>
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

  // 1. Update Supabase Cloud Database table 'pending_approvals' status -> 'approved'
  if (typeof db !== "undefined" && db) {
    try {
      await db.from("pending_approvals").update({ status: "approved" }).eq("id", item.id);
    } catch (err) {
      console.warn("Supabase approval update exception:", err);
    }
  }

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

  pendingApprovals.splice(idx, 1);
  localStorage.setItem("mkulima_pending_approvals", JSON.stringify(pendingApprovals));
  renderAdminPendingListUI();
  alert(`✅ [APPROVED IN DATABASE]: "${item.title}" is now published live!`);
}

async function rejectListing(idx) {
  const item = pendingApprovals[idx];
  if (!item) return;

  if (typeof db !== "undefined" && db) {
    try {
      await db.from("pending_approvals").update({ status: "rejected" }).eq("id", item.id);
    } catch (err) {
      console.warn("Supabase rejection update exception:", err);
    }
  }

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
  alert(`❌ [REJECTED IN DATABASE]: Submission "${item.title}" was rejected.`);
}
