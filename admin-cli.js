#!/usr/bin/env node
const axios = require("axios");
const readline = require("readline");

const API_BASE = process.env.API_BASE || "http://localhost:8080";
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "nyandarua_admin_secret_2026";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log("\n====================================================");
  console.log("🛡️  M-MKULIMA BACKEND ADMIN MODERATION CLI");
  console.log("====================================================\n");

  try {
    console.log(`📡 Fetching pending listings from ${API_BASE}...`);
    const res = await axios.get(`${API_BASE}/api/admin/pending`, {
      headers: { "x-admin-key": ADMIN_SECRET_KEY }
    });

    const pendingItems = res.data && res.data.pendingItems ? res.data.pendingItems : [];

    if (pendingItems.length === 0) {
      console.log("✅ No pending submissions! All farmer listings are reviewed and live.\n");
      rl.close();
      return;
    }

    console.log(`\n📋 Found ${pendingItems.length} pending listing(s) awaiting approval:\n`);
    pendingItems.forEach((item, idx) => {
      console.log(`[${idx + 1}] ID: ${item.id} | Type: ${(item.type || 'ITEM').toUpperCase()}`);
      console.log(`    Title: ${item.title}`);
      console.log(`    Price/Rate: ${item.price || item.rate} | Location: ${item.subcounty || item.location}`);
      console.log(`    Seller/Provider: ${item.seller || item.provider || 'Farmer'} (Phone: ${item.phone || item.contact})`);
      console.log(`    Description: ${item.desc || item.description || 'N/A'}`);
      console.log("----------------------------------------------------");
    });

    const choice = await prompt("\nEnter item number to moderate (or 'q' to quit): ");
    if (choice.toLowerCase() === "q" || !choice) {
      console.log("Exiting CLI.");
      rl.close();
      return;
    }

    const itemIdx = parseInt(choice, 10) - 1;
    if (isNaN(itemIdx) || itemIdx < 0 || itemIdx >= pendingItems.length) {
      console.log("❌ Invalid item selection.");
      rl.close();
      return;
    }

    const selectedItem = pendingItems[itemIdx];
    const action = await prompt(`Approve or Reject "${selectedItem.title}"? (a/r): `);

    if (action.toLowerCase() === "a") {
      const approveRes = await axios.post(`${API_BASE}/api/admin/approve`, 
        { id: selectedItem.id },
        { headers: { "x-admin-key": ADMIN_SECRET_KEY } }
      );
      console.log(`\n✅ APPROVED: "${selectedItem.title}" is now published live!`);
    } else if (action.toLowerCase() === "r") {
      const rejectRes = await axios.post(`${API_BASE}/api/admin/reject`, 
        { id: selectedItem.id },
        { headers: { "x-admin-key": ADMIN_SECRET_KEY } }
      );
      console.log(`\n❌ REJECTED: "${selectedItem.title}" removed from queue.`);
    } else {
      console.log("Action cancelled.");
    }

  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.error("⛔ Unauthorized: Invalid Admin Secret Key.");
    } else {
      console.error("❌ CLI Error:", err.message);
    }
  }

  rl.close();
}

main();
