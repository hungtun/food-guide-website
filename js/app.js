/**
 * Shared layout: header, footer, mobile nav
 */

// Hàm lấy ngôn ngữ hiện tại (Mặc định ban đầu là tiếng Anh 'en')
function getCurrentLang() {
  return localStorage.getItem("vietnam_food_guide_lang") || "en";
}

// Chuyển đổi giữa 'en' và 'vi' khi người dùng click
function toggleLanguage() {
  const currentLang = getCurrentLang();
  const nextLang = currentLang === "en" ? "vi" : "en";
  localStorage.setItem("vietnam_food_guide_lang", nextLang);
  window.location.reload(); // Tải lại trang để áp dụng ngôn ngữ mới
}

// Danh mục điều hướng đa ngôn ngữ dựa trên lựa chọn hiện tại
function getNavLinks() {
  const lang = getCurrentLang();
  if (lang === "vi") {
    return [
      { href: "index.html", label: "Trang chủ", id: "home" },
      { href: "explore.html", label: "Khám phá", id: "explore" },
      { href: "planner.html", label: "Lịch trình", id: "planner" },
      { href: "saved.html", label: "Đã lưu", id: "saved" },
      { href: "articles.html", label: "Bài viết", id: "articles" },
      { href: "about.html", label: "Giới thiệu", id: "about" },
    ];
  }
  // Mặc định tiếng Anh
  return [
    { href: "index.html", label: "Home", id: "home" },
    { href: "explore.html", label: "Explore", id: "explore" },
    { href: "planner.html", label: "Planner", id: "planner" },
    { href: "saved.html", label: "Saved Foods", id: "saved" },
    { href: "articles.html", label: "Articles", id: "articles" },
    { href: "about.html", label: "About", id: "about" },
  ];
}

function getCurrentPageId() {
  const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (!file || file === "index.html") return "home";
  if (file.includes("explore") || file.includes("explorer") || file.includes("region") || file.includes("food-detail")) {
    return "explore";
  }
  if (file.includes("planner")) return "planner";
  if (file.includes("saved")) return "saved";
  if (file.includes("article")) return "articles";
  if (file.includes("about") || file.includes("add-food")) return "about";
  return "";
}

function renderHeader(activeId) {
  const lang = getCurrentLang();
  const navLinks = getNavLinks();
  
  const links = navLinks.map((link) => {
    const active = link.id === activeId ? "is-active" : "";
    return `<a href="${link.href}" class="nav-link ${active}">${link.label}</a>`;
  }).join("");

  // Nhãn ngôn ngữ hiển thị: Nếu đang ở 'en' thì hiện nút chuyển sang 'VI', và ngược lại
  const langLabel = lang === "en" ? "VI" : "EN";
  const ctaLabel = lang === "vi" ? "Gợi ý món ăn" : "Suggest Food";

  return `
    <header class="site-header">
      <div class="site-header__inner">
        <a href="index.html" class="brand">Taste Vietnam</a>
        <button type="button" class="nav-toggle" id="nav-toggle">Menu</button>
        <nav class="site-nav" id="site-nav">
          ${links}
          <a href="add-food.html" class="nav-cta">${ctaLabel}</a>
          
          <!-- Nút chuyển ngôn ngữ tinh tế -->
          <button type="button" class="lang-switch-btn" id="lang-switch-btn">
            ${langLabel}
          </button>
        </nav>
      </div>
    </header>
  `;
}

function renderFooter() {
  const lang = getCurrentLang();
  const desc = lang === "vi" 
    ? "Khám phá tinh hoa ẩm thực Việt Nam qua ba miền Bắc, Trung, Nam." 
    : "Discover Vietnamese cuisine across North, Central, and South.";
  const ctaLabel = lang === "vi" ? "Gợi ý món ăn" : "Suggest Food";
  const aboutLabel = lang === "vi" ? "Giới thiệu" : "About";
  const exploreLabel = lang === "vi" ? "Khám phá" : "Explore";
  const plannerLabel = lang === "vi" ? "Lịch trình" : "Planner";

  return `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <strong>Taste Vietnam</strong>
        <p class="muted">${desc}</p>
        <div class="footer-links">
          <a href="explore.html">${exploreLabel}</a>
          <a href="planner.html">${plannerLabel}</a>
          <a href="add-food.html">${ctaLabel}</a>
          <a href="about.html">${aboutLabel}</a>
        </div>
        <p class="muted">&copy; ${new Date().getFullYear()} Taste Vietnam</p>
      </div>
    </footer>
  `;
}



function initLayout(options = {}) {
  const activeId = options.activeId || getCurrentPageId();
  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");

  if (headerMount) headerMount.innerHTML = renderHeader(activeId);
  if (footerMount) footerMount.innerHTML = renderFooter();

  // Đăng ký sự kiện click cho nút chuyển ngôn ngữ
  const langBtn = document.getElementById("lang-switch-btn");
  if (langBtn) {
    langBtn.addEventListener("click", toggleLanguage);
  }

  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }
}


function createFoodCard(food, options = {}) {
  const removable = options.removable;
  const isVi = getCurrentLang() === "vi";

  // 1. Lấy ảnh đại diện từ mảng dữ liệu JSON (Ưu tiên phần tử ảnh đầu tiên)
  const img = (Array.isArray(food.images) && food.images.length > 0) 
    ? food.images[0] 
    : (typeof foodImage === "function" ? foodImage(food) : "assets/images/placeholder.jpg");

  // 2. Định nghĩa các nhãn chữ tương tác đa ngôn ngữ
  const removeLabel = isVi ? "Xóa" : "Remove";
  
  // Dữ liệu chữ đã được dịch sẵn trong file JSON tương ứng (foods_vi.json / foods_en.json)
  const displayName = food.name;
  const displayRegion = food.region; // Đọc trực tiếp chữ "Miền Bắc" hoặc "North" từ JSON

  return `
    <!-- THÀNH PHẦN 1: Bọc card có ĐỔ BÓNG, hiệu ứng di chuột nâng card mượt mà -->
    <article class="food-card flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-1 group p-3" data-id="${food.id}">
      
      <!-- Khung ảnh bìa tỷ lệ 4:3 có overflow ẩn để hover ảnh không bị tràn ra ngoài -->
      <div class="article-card__media relative w-full aspect-[4/3] overflow-hidden rounded-xl mb-3">
        <a href="food-detail.html?id=${food.id}" class="block w-full h-full">
          <img src="${img}" alt="${displayName}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            onerror="this.src='${placeholderImage(displayName, 600, 450)}'" />
        </a>
        
        <!-- THÀNH PHẦN 2: BIỂU TƯỢNG KÍNH LÚP (Đã sửa lỗi đường dẫn định dạng xmlns) -->
        <div class="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white pointer-events-none shadow-md transition-all duration-300 group-hover:scale-110" style="background-color: #2d3748cc; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);">
          <svg xmlns="http://w3.org" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <!-- Khối nội dung chữ bên dưới -->
      <div class="food-card__body flex flex-col flex-1 px-1 py-1">
        
        <!-- THÀNH PHẦN 3: TIÊU ĐỀ - Tự động đổi màu sang tông màu kem nhã nhặn khi rê chuột vào card -->
        <h3 class="food-card__title text-lg font-extrabold text-gray-900 mb-1 line-clamp-1 transition-colors duration-300 group-hover:text-[#a20409]" style="transition: color 0.3s ease;">
          <a href="food-detail.html?id=${food.id}">${displayName}</a>
        </h3>
        
        <!-- VÙNG MIỀN & TỈNH THÀNH (Đã được đồng bộ hiển thị) -->
        <p class="food-card__meta text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
           ${food.province}
        </p>
        
        <!-- MÔ TẢ: Khống chế nghiêm ngặt tối đa ĐÚNG 2 DÒNG và tự thêm dấu "..." -->
        <p class="food-card__desc text-sm text-gray-600 mb-3" 
           style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.5; height: 3em;">
          ${food.description}
        </p>
        
        <!-- Nút xóa (Chỉ hiển thị khi truyền thêm tùy chọn removable trong trang Saved) -->
        ${
          removable
            ? `<button type="button" class="btn btn--ghost btn-remove-saved mt-auto text-xs py-1.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-id="${food.id}">${removeLabel}</button>`
            : ""
        }
      </div>
    </article>
  `;
}


// HÀM MỚI: Đã sửa lỗi đóng/mở khối switch-case và dọn sạch các ghi chú thừa
function renderContentBlocks(blocks) {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return `<p class="mb-5 text-lg leading-relaxed text-gray-600">${block.text}</p>`;
          
        case "heading":
          return `<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">${block.text}</h2>`;
          
        case "subheading":
          return `<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-700">${block.text}</h3>`;
          
        case "list":
          if (!Array.isArray(block.items)) return "";
          const isOrdered = block.style === "ordered";
          const tag = isOrdered ? "ol" : "ul";
          const listClass = isOrdered ? "list-decimal pl-6 mb-5 text-lg text-gray-600 space-y-1" : "list-disc pl-6 mb-5 text-lg text-gray-600 space-y-1";
          
          const listItems = block.items.map((item) => `<li>${item}</li>`).join("");
          return `<${tag} class="${listClass}">${listItems}</${tag}>`;
          
        case "image":
          return `
            <figure class="my-6 block">
              <img src="${block.src}" alt="${block.caption || ''}" class="w-full h-auto rounded-lg object-cover" onerror="this.src='${placeholderImage(block.caption || 'Image', 800, 450)}'" />
              ${block.caption ? `<figcaption class="text-center text-sm text-gray-500 mt-2 italic">${block.caption}</figcaption>` : ""}
            </figure>`;
            
        case "quote":
          return `
            <blockquote class="border-l-4 border-primary pl-4 italic text-xl my-6 text-gray-700 bg-gray-50 py-2 pr-2 rounded-r">
              <p class="mb-1">"${block.text}"</p>
              ${block.author ? `<cite class="block text-sm font-semibold text-gray-500 not-italic">— ${block.author}</cite>` : ""}
            </blockquote>`;

        case "bold-text":
          return `<p class="mb-5 text-lg font-bold leading-relaxed text-gray-600">${block.text}</p>`;
          
        default:
          return ""; 
      }
    })
    .join("");
}



document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("site-header") || document.getElementById("site-footer")) {
    initLayout();
  }
});
