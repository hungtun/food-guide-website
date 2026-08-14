/**
 * Add New Food — form validation + Google Apps Script submit
 *
 * Replace GAS_WEB_APP_URL with your deployed Apps Script Web App URL.
 * Until then, submissions are simulated locally for scaffold demos.
 */

const GAS_WEB_APP_URL = ""; // e.g. "https://script.google.com/macros/s/XXXX/exec"

function setMessage(text, isError = false) {
  const el = document.getElementById("form-message");
  el.textContent = text;
  el.style.color = isError ? "#b33a2b" : "#0f4c3a";
}

function validateForm(data) {
  const required = ["foodName", "vietnameseName", "province", "region", "category", "description"];
  for (const key of required) {
    if (!String(data[key] || "").trim()) {
      return `${key} is required.`;
    }
  }
  if (data.description.trim().length < 20) {
    return "Description should be at least 20 characters.";
  }
  return null;
}

async function submitToSheets(payload) {
  if (!GAS_WEB_APP_URL) {
    // Scaffold fallback: store pending suggestions in localStorage
    const pending = JSON.parse(localStorage.getItem("pendingFoodSuggestions") || "[]");
    pending.push({ ...payload, status: "Pending", timestamp: new Date().toISOString() });
    localStorage.setItem("pendingFoodSuggestions", JSON.stringify(pending));
    return { ok: true, simulated: true };
  }

  const response = await fetch(GAS_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // no-cors cannot read body; treat as fired
  return { ok: true, response };
}

function initAddFood() {
  const form = document.getElementById("add-food-form");
  const desc = document.getElementById("description");
  const count = document.getElementById("desc-count");

  desc.addEventListener("input", () => {
    count.textContent = String(desc.value.length);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const error = validateForm(data);
    if (error) {
      setMessage(error, true);
      return;
    }

    const btn = document.getElementById("submit-btn");
    btn.disabled = true;
    setMessage("Submitting…");

    try {
      const result = await submitToSheets(data);
      if (result.simulated) {
        setMessage("Saved locally (Pending). Add your Google Apps Script URL in js/add-food.js to send to Sheets.");
      } else {
        setMessage("Submitted successfully. Status: Pending review.");
      }
      form.reset();
      count.textContent = "0";
    } catch (err) {
      console.error(err);
      setMessage("Submit failed. Please try again.", true);
    } finally {
      btn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "about" });
  initAddFood();
});
