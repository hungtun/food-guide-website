const translations = {
  en: {
    aboutTitle: "About & Contact",
    aboutIntro:
      "Taste Vietnam helps international travelers explore Vietnamese cuisine by region, save favorites, and plan meals.",

    purposeTitle: "Purpose",
    purposeText:
      "Discover local flavors, one dish at a time. Our website helps you discover delicious local dishes, interesting food spots, and unique culinary experiences across Vietnam.",

    whoTitle: "Who it's for",
    whoText:
      "For curious food lovers. Whether you're a traveler looking for what to eat, a foodie searching for new flavors, or simply someone who loves discovering Vietnamese cuisine, this website is for you.",

    teamTitle: "Team",
    teamText:
      "Made by a small team with a big love for food. We created this website to share our passion for Vietnamese cuisine and make it easier for everyone to discover great food and memorable culinary experiences.",

    contactTitle: "Contact",
    suggestFood: "Suggest a new food",
    sendMessage: "Send a message",
    nameLabel: "Name",
    emailLabel: "Email",
    messageLabel: "Message",
    sendButton: "Send"
  },

  vi: {
    aboutTitle: "Giới thiệu & Liên hệ",
    aboutIntro:
      "Taste Vietnam giúp du khách quốc tế khám phá ẩm thực Việt Nam theo từng vùng miền, lưu lại những món ăn yêu thích và lên kế hoạch cho hành trình ẩm thực.",

    purposeTitle: "Mục đích",
    purposeText:
      "Khám phá hương vị địa phương qua từng món ăn. Website giúp bạn tìm hiểu những món ăn ngon, các địa điểm ẩm thực thú vị và những trải nghiệm ẩm thực độc đáo trên khắp Việt Nam.",

    whoTitle: "Dành cho ai",
    whoText:
      "Dành cho những người yêu thích khám phá ẩm thực. Dù bạn là du khách đang tìm kiếm món ăn để thử, một người yêu ẩm thực muốn khám phá hương vị mới hay đơn giản là người yêu thích ẩm thực Việt Nam, website này dành cho bạn.",

    teamTitle: "Đội ngũ",
    teamText:
      "Được thực hiện bởi một nhóm nhỏ với tình yêu lớn dành cho ẩm thực. Chúng tôi tạo ra website này để chia sẻ niềm yêu thích với ẩm thực Việt Nam và giúp mọi người dễ dàng khám phá những món ăn ngon cùng những trải nghiệm ẩm thực đáng nhớ.",

    contactTitle: "Liên hệ",
    suggestFood: "Đề xuất món ăn mới",
    sendMessage: "Gửi tin nhắn",
    nameLabel: "Tên",
    emailLabel: "Email",
    messageLabel: "Tin nhắn",
    sendButton: "Gửi"
  }
};

function getCurrentLang() {
  return localStorage.getItem("vietnam_food_guide_lang") || "en";
}

function applyLanguage() {
  const lang = getCurrentLang();

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });

  document.documentElement.lang = lang;
}



function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  const message = document.getElementById("message");
  const count = document.getElementById("msg-count");
  const status = document.getElementById("contact-status");

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwvHLBgAeNUy-Sfof3iNibL2-14kKPGPKQjI3kg3NtQpgZPQL1IMOUf1At3uh_nTFmtaQ/exec";

  message.addEventListener("input", () => {
    count.textContent = String(message.value.length);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();

    if (!name || !email || !msg) {
  status.textContent = getCurrentLang() === "vi"
    ? "Vui lòng điền đầy đủ thông tin."
    : "Please fill in all the information.";
  status.style.color = "#b33a2b";
  return;
}

if (!isValidEmail(email)) {
  status.textContent = getCurrentLang() === "vi"
    ? "Vui lòng nhập địa chỉ email hợp lệ."
    : "Please enter a valid email address.";
  status.style.color = "#b33a2b";
  return;
}

try {
  status.textContent = getCurrentLang() === "vi"
    ? "Đang gửi..."
    : "Sending...";
  status.style.color = "#555";

  await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      name: name,
      email: email,
      message: msg
    })
  });

  status.textContent = getCurrentLang() === "vi"
    ? "Cảm ơn bạn! Tin nhắn đã được gửi."
    : "Thank you! The message has been sent.";
  status.style.color = "#0f4c3a";

  form.reset();
  count.textContent = "0";
} catch (error) {
  status.textContent = getCurrentLang() === "vi"
    ? "Đã xảy ra lỗi! Vui lòng thử lại."
    : "Something went wrong! Please try again.";
  status.style.color = "#b33a2b";
}
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "about" });
  applyLanguage();
  initContactForm();
});