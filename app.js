/* ==========================================================================
   M-MKULIMA NYANDARUA PRO - APPLICATION LOGIC & INTERACTIVITY
   ========================================================================== */

// Sub-County to Ward Mapping Data
const REGION_WARDS = {
  "Ol Kalou": ["Karau", "Kanjuiri Ridge", "Mirangine", "Kaimbaga", "Rurii"],
  "Ol Joro Orok": ["Gathanji", "Gatimu", "Weru", "Charagita"],
  "Kinangop": ["Engineer", "Gathara", "North Kinangop", "Murungaru", "Njabini/Kiburu", "Nyangakio", "Geta"],
  "Kipipiri": ["Wanjohi", "Kipipiri", "Geta", "Githioro"],
  "Ndaragwa": ["Leshau Pondo", "Kiriita", "Central", "Shamata"]
};

// Initial Mock Data
let fodderDatabase = [
  { id: 1, title: "High-Protein Lucerne (Alfalfa) Bales", category: "Protein", price: "KSh 450 / bale", subcounty: "Ol Kalou", seller: "Wambugu Feeds", phone: "0712345678", desc: "Cured premium green lucerne bales. 22% crude protein content." },
  { id: 2, title: "Silage Bales (Yellow Corn)", category: "Energy", price: "KSh 2,800 / bale", subcounty: "Kinangop", seller: "Kinangop Dairy Coop", phone: "0723456789", desc: "Molasses treated maize silage ready for immediate milk production boost." },
  { id: 3, title: "Desmodium Seedlings & Cuttings", category: "Protein", price: "KSh 150 / bundle", subcounty: "Kipipiri", seller: "Nyandarua Seedlings", phone: "0734567890", desc: "Greenleaf desmodium nitrogen-fixing pasture cuttings." }
];

let marketDatabase = [
  { id: 1, title: "Grade Holstein Fresh Heifer", price: "KSh 85,000", category: "Livestock", location: "Ol Joro Orok", contact: "0711223344", desc: "First calving in 2 weeks. Expected 28L/day capacity." },
  { id: 2, title: "Manual Chaff Cutter 3-Blade", price: "KSh 14,500", category: "Equipment", location: "Ol Kalou", contact: "0722334455", desc: "Heavy-duty hardened steel blades for dry and green fodder processing." },
  { id: 3, title: "Organic Certified Potato Seed (Shangi)", price: "KSh 2,200 / 50kg bag", category: "Produce", location: "Ndaragwa", contact: "0733445566", desc: "Clean, high-yield certified seed tubers directly from farm." }
];

let vetDatabase = [
  { id: 1, name: "Dr. James K. Kariuki", reg: "KVB/REG/2019/442", subcounty: "Ol Kalou", phone: "0718493313", spec: "Artificial Insemination & Dairy Herd Health" },
  { id: 2, name: "Dr. Mary W. Njuguna", reg: "KVB/REG/2021/891", subcounty: "Kinangop", phone: "0720987654", spec: "Mastitis Control & Surgical Interventions" },
  { id: 3, name: "Dr. Peter M. Mwangi", reg: "KVB/REG/2018/112", subcounty: "Ol Joro Orok", phone: "0733112233", spec: "Calf Rearing & Clinical Nutrition" }
];

let registeredFarmer = null;

// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderFodderItems("all");
  renderMarketItems();
  renderVetList();
});

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

// Password Validation Policy Check
function validatePasswordPolicy(password) {
  const hasMinLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasMinLength && hasUpper && hasNumber && hasSpecial;
}

// Farmer Registration Handler
function processFarmerRegistration(e) {
  e.preventDefault();
  const name = document.getElementById("farmerName").value.trim();
  const phone = document.getElementById("farmerPhone").value.trim();
  const pass = document.getElementById("farmerPass").value;
  const subcounty = document.getElementById("farmerSubCounty").value;
  const ward = document.getElementById("farmerWard").value;

  if (!validatePasswordPolicy(pass)) {
    alert("🔒 Password Policy Error:\nPassword must be at least 6 characters long and include an UPPERCASE letter, a number, and a special character (e.g. Abc1@).");
    return;
  }

  registeredFarmer = { name, phone, subcounty, ward };
  
  // Update UI Badge Header
  const badgeLocation = document.getElementById("badgeLocation");
  if (badgeLocation) {
    badgeLocation.textContent = `📍 ${subcounty} - ${ward}`;
    badgeLocation.classList.remove("hidden");
  }

  alert(`✅ Welcome, ${name}!\nAccount successfully created under ${subcounty} Sub-County (${ward} Ward).`);
  switchScreen("screen-fodder");
}

// Screen Navigation Controller
function switchScreen(screenId) {
  const screens = ["screen-register", "screen-fodder", "screen-marketplace", "screen-vets"];
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

  // Highlight active bottom nav tab
  const navMap = {
    "screen-register": "nav-register",
    "screen-fodder": "nav-fodder",
    "screen-marketplace": "nav-market",
    "screen-vets": "nav-vets"
  };

  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(navMap[screenId]);
  if (activeBtn) activeBtn.classList.add("active");
}

// Fodder Hub Render Logic
function renderFodderItems(filter = "all") {
  const container = document.getElementById("containerFodderItems");
  if (!container) return;

  const items = filter === "all" ? fodderDatabase : fodderDatabase.filter(item => item.category === filter);

  if (items.length === 0) {
    container.innerHTML = '<p class="text-center text-slate-400 text-xs py-6">No fodder listings found in this category.</p>';
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
        <p class="text-xs text-slate-500 mt-1">${item.desc}</p>
      </div>
      <div class="flex-between mt-2 pt-2 border-t text-xs text-slate-600">
        <span>📍 ${item.subcounty}</span>
        <a href="tel:${item.phone}" class="btn btn-primary btn-sm">📞 Call ${item.seller}</a>
      </div>
    </div>
  `).join('');
}

function filterFodderDisplay(category) {
  document.querySelectorAll(".filter-tab").forEach(tab => tab.classList.remove("active"));
  const activeTab = document.getElementById(`tab-fodder-${category.toLowerCase()}`);
  if (activeTab) activeTab.classList.add("active");
  renderFodderItems(category);
}

// Marketplace Render Logic
function renderMarketItems() {
  const container = document.getElementById("containerMarketItems");
  if (!container) return;

  container.innerHTML = marketDatabase.map(item => `
    <div class="item-card">
      <div class="flex-between">
        <span class="item-badge badge-verified">${item.category}</span>
        <span class="price-tag">${item.price}</span>
      </div>
      <div>
        <h3 class="font-extrabold text-slate-900 text-base">${item.title}</h3>
        <p class="text-xs text-slate-500 mt-1">${item.desc}</p>
      </div>
      <div class="flex-between mt-2 pt-2 border-t text-xs text-slate-600">
        <span>📍 Location: ${item.location}</span>
        <a href="tel:${item.contact}" class="btn btn-accent btn-sm">🛒 Contact Seller</a>
      </div>
    </div>
  `).join('');
}

// Verified Vets Render Logic
function renderVetList() {
  const container = document.getElementById("containerVetsList");
  if (!container) return;

  container.innerHTML = vetDatabase.map(vet => `
    <div class="item-card">
      <div class="flex-between">
        <span class="item-badge badge-protein">🛡️ ${vet.reg}</span>
        <span class="text-xs font-bold text-emerald-700">📍 ${vet.subcounty}</span>
      </div>
      <div>
        <h3 class="font-extrabold text-slate-900 text-base">${vet.name}</h3>
        <p class="text-xs text-slate-600 mt-0.5">Specialization: ${vet.spec}</p>
      </div>
      <div class="flex gap-2 mt-2 pt-2 border-t">
        <a href="tel:${vet.phone}" class="btn btn-secondary btn-sm" style="flex:1">📞 Call Vet</a>
        <button onclick="openBookingModal('${vet.name}')" class="btn btn-primary btn-sm" style="flex:1">📅 Schedule Visit</button>
      </div>
    </div>
  `).join('');
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

function processFodderUpload(e) {
  e.preventDefault();
  const title = document.getElementById("newFodderTitle").value.trim();
  const category = document.getElementById("newFodderCategory").value;
  const price = document.getElementById("newFodderPrice").value.trim();
  const desc = document.getElementById("newFodderDesc").value.trim();
  const fileInput = document.getElementById("newFodderFile");

  if (fileInput && fileInput.files.length > 0 && fileInput.files[0].size > 1024 * 1024) {
    alert("⚠️ File upload error: Media attachment must be capped at 1MB max.");
    return;
  }

  const newItem = {
    id: Date.now(),
    title,
    category,
    price,
    subcounty: registeredFarmer ? registeredFarmer.subcounty : "Ol Kalou",
    seller: registeredFarmer ? registeredFarmer.name : "Local Farmer",
    phone: registeredFarmer ? registeredFarmer.phone : "0718493313",
    desc
  };

  fodderDatabase.unshift(newItem);
  renderFodderItems("all");
  toggleModal("modalFodderUpload", false);
  alert("🌾 Fodder listing published successfully!");
}

function processMarketListing(e) {
  e.preventDefault();
  const title = document.getElementById("newMarketTitle").value.trim();
  const category = document.getElementById("newMarketCategory").value;
  const price = document.getElementById("newMarketPrice").value.trim();
  const contact = document.getElementById("newMarketContact").value.trim();
  const desc = document.getElementById("newMarketDesc").value.trim();

  const newItem = {
    id: Date.now(),
    title,
    category,
    price,
    location: registeredFarmer ? registeredFarmer.subcounty : "Nyandarua",
    contact: contact || (registeredFarmer ? registeredFarmer.phone : "0700000000"),
    desc
  };

  marketDatabase.unshift(newItem);
  renderMarketItems();
  toggleModal("modalMarketUpload", false);
  alert("🛒 Listing added to Nyandarua Marketplace!");
}

function triggerPasswordResetSMS() {
  const phone = document.getElementById("resetPhone").value.trim();
  if (!phone) {
    alert("Please enter a valid phone number.");
    return;
  }
  alert(`📲 Africa's Talking Gateway:\n\nA password reset OTP pin has been sent via SMS to ${phone}.`);
  toggleModal("modalPasswordReset", false);
}
