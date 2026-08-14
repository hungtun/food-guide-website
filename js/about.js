/**
 * About & Contact — validation + character counter
 */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  const message = document.getElementById("message");
  const count = document.getElementById("msg-count");
  const status = document.getElementById("contact-status");

  message.addEventListener("input", () => {
    count.textContent = String(message.value.length);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();

    if (!name || !email || !msg) {
      status.textContent = "Please fill in all required fields.";
      status.style.color = "#b33a2b";
      return;
    }
    if (!isValidEmail(email)) {
      status.textContent = "Please enter a valid email address.";
      status.style.color = "#b33a2b";
      return;
    }

    // Scaffold: no backend — show success and reset
    status.textContent = "Thanks! Your message was validated successfully (demo — no server send yet).";
    status.style.color = "#0f4c3a";
    form.reset();
    count.textContent = "0";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "about" });
  initContactForm();
});
