let articlesCache = [];

// Hàm hỗ trợ lấy ngôn ngữ hiện tại (Đã đồng bộ với mã nguồn layout của bạn)
function getCurrentLang() {
  return localStorage.getItem("vietnam_food_guide_lang") || "en";
}

function renderArticleCards(list) {
  const grid = document.getElementById("articles-grid");
  if (!grid) return;

  const isVi = getCurrentLang() === "vi";

  // Đa ngôn ngữ hóa thông báo trống
  if (!list.length) {
    const emptyMsg = isVi ? "Không tìm thấy bài viết nào." : "No articles found.";
    grid.innerHTML = `<div class="empty-state col-span-full">${emptyMsg}</div>`;
    return;
  }

  // Đa ngôn ngữ hóa nhãn nút bấm
  const readMoreLabel = isVi ? "Xem thêm" : "Read more";

  grid.innerHTML = list
    .map(
      (a) => `
      <article class="article-card flex flex-col h-full bg-transparent">
        
        <!-- Khung ảnh tỷ lệ 4:3 -->
        <a href="article-detail.html?slug=${encodeURIComponent(a.slug)}" class="article-card__media">
          <img src="${a.image}" alt="" onerror="this.src='${placeholderImage(a.title, 600, 450)}'" />
        </a>
        
        <!-- Nội dung chữ bên dưới sát vào ảnh -->
        <div class="article-card__body">
          <p class="muted text-sm mb-1 text-gray-500">${a.category} · ${a.date}</p>
          
          <h2 class="text-xl font-bold mb-2 line-clamp-2 min-h-[3rem] text-gray-900">
            <a href="article-detail.html?slug=${encodeURIComponent(a.slug)}" class="hover:text-primary transition-colors">${a.title}</a>
          </h2>
          
          <p class="muted text-sm mb-3 text-gray-600">${a.excerpt}</p>
          
          <!-- Nhãn nút bấm tự động thay đổi theo ngôn ngữ hệ thống -->
          <a href="article-detail.html?slug=${encodeURIComponent(a.slug)}" class="mt-auto inline-block underline font-medium text-primary hover:opacity-80 transition-opacity">${readMoreLabel}</a>
        </div>
      </article>`
    )
    .join("");
}

function filterArticles() {
  const q = document.getElementById("article-search")?.value.trim().toLowerCase() || "";
  const cat = document.getElementById("article-filter")?.value || "";

  return articlesCache.filter((a) => {
    const matchCat = !cat || a.category === cat;
    const matchQ =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
}

// Hàm bổ sung: loadArticles tự động nhận diện ngôn ngữ để gọi đúng file JSON
// async function loadArticles() {
//   const currentLang = localStorage.getItem("vietnam_food_guide_lang") || "en";
//   const jsonFile = currentLang === "vi" ? "articles_vi.json" : "articles_en.json";
  
//   // Bạn có thể chỉnh lại đường dẫn file fetch cho đúng cấu trúc thư mục của mình
//   const response = await fetch(`data/${jsonFile}`); 
//   if (!response.ok) throw new Error("Could not load data");
//   return await response.json();
// }

async function initArticlesList() {
  const grid = document.getElementById("articles-grid");
  if (!grid) return;

  const isVi = getCurrentLang() === "vi";

  // 1. TÍCH HỢP ĐA NGÔN NGỮ CHO H1 VÀ Ô TÌM KIẾM (MỚI THÊM)
  // Đổi chữ tiêu đề H1
  const pageTitle = document.querySelector(".page-hero h1");
  if (pageTitle) {
    pageTitle.innerText = isVi ? "TIN TỨC" : "ARTICLES & NEWS";
  }

  // Đổi chữ Placeholder của ô tìm kiếm
  const searchInput = document.getElementById("article-search");
  if (searchInput) {
    searchInput.placeholder = isVi ? "Tìm kiếm bài viết..." : "Search articles...";
  }

  try {
    articlesCache = await loadArticles();
    const cats = [...new Set(articlesCache.map((a) => a.category))];
    const filter = document.getElementById("article-filter");
    
    // Đa ngôn ngữ nhãn mặc định của ô lọc danh mục
    const allTopicsLabel = isVi ? "Tất cả chủ đề" : "All topics";
    filter.innerHTML =
      `<option value="">${allTopicsLabel}</option>` +
      cats.map((c) => `<option value="${c}">${c}</option>`).join("");

    const refresh = () => renderArticleCards(filterArticles());
    document.getElementById("article-search").addEventListener("input", refresh);
    filter.addEventListener("change", refresh);
    refresh();
  } catch (err) {
    console.error(err);
    // Đa ngôn ngữ thông báo lỗi khi không nạp được dữ liệu
    const errorMsg = isVi ? "Không thể tải danh sách bài viết." : "Could not load articles data.";
    grid.innerHTML = `<div class="empty-state">${errorMsg}</div>`;
  }
}



async function initArticleDetail() {
  const mount = document.getElementById("article-detail");
  if (!mount) return;

  const slug = getQueryParam("slug");
  const isVi = getCurrentLang() === "vi";

  // 1. Đa ngôn ngữ hóa thông báo lỗi khi thiếu Slug điều hướng
  if (!slug) {
    const notFoundTxt = isVi ? "Không tìm thấy bài viết." : "Article not found.";
    const backBtnTxt = isVi ? "Quay lại danh sách" : "Back to articles";
    mount.innerHTML = `<div class="empty-state"><p>${notFoundTxt}</p><a href="articles.html" class="btn btn--primary mt-4">${backBtnTxt}</a></div>`;
    return;
  }

  try {
    const articles = await loadArticles();
    const article = articles.find((a) => a.slug === slug);

    // 2. Đa ngôn ngữ hóa thông báo khi không khớp dữ liệu bài viết
    if (!article) {
      const notFoundTxt = isVi ? "Không tìm thấy bài viết." : "Article not found.";
      const backBtnTxt = isVi ? "Quay lại danh sách" : "Back to articles";
      mount.innerHTML = `<div class="empty-state"><p>${notFoundTxt}</p><a href="articles.html" class="btn btn--primary mt-4">${backBtnTxt}</a></div>`;
      return;
    }

    document.title = `${article.title} · Taste Vietnam`;

    // Phần gợi ý bài viết liên quan
    const relatedArticles = articles
      .filter((a) => a.category === article.category && a.slug !== article.slug)
      .slice(0, 3);

    let relatedHtml = "";
    if (relatedArticles.length > 0) {
      // Đa ngôn ngữ nhãn nút bấm trong danh sách bài viết liên quan
      const readMoreLabel = isVi ? "Xem thêm →" : "Read more →";

      const relatedCards = relatedArticles
        .map(
          (ra) => `
          <article class="article-card flex flex-col h-full bg-transparent">
            <a href="article-detail.html?slug=${encodeURIComponent(ra.slug)}" class="article-card__media">
              <img src="${ra.image}" alt="${ra.title}" onerror="this.src='${placeholderImage(ra.title, 600, 450)}'" />
            </a>
            <div class="article-card__body">
              <p class="muted text-sm mb-1 text-gray-500">${ra.category} · ${ra.date}</p>
              <h2 class="text-xl font-bold mb-2 line-clamp-2 min-h-[3rem] text-gray-900">
                <a href="article-detail.html?slug=${encodeURIComponent(ra.slug)}">${ra.title}</a>
              </h2>
              <p class="muted text-sm mb-3 text-gray-600">${ra.excerpt}</p>
              <a href="article-detail.html?slug=${encodeURIComponent(ra.slug)}" class="mt-auto inline-block underline font-medium text-primary">${readMoreLabel}</a>
            </div>
          </article>`
        )
        .join("");

      // Đa ngôn ngữ tiêu đề khối bài viết liên quan
      const relatedSectionTitle = isVi ? "Bài viết liên quan" : "Related articles";

      relatedHtml = `
        <section class="related-articles-section">
          <h3 class="related-articles-title">${relatedSectionTitle}</h3>
          <div class="related-articles-grid">${relatedCards}</div>
        </section>
      `;
    }
    
    const contentHtml = renderContentBlocks(article.content);

    // Đa ngôn ngữ nút quay lại ở trên cùng trang chi tiết
    const backLabel = isVi ? "← Trở về" : "← Back";

    mount.innerHTML = `
      <a href="articles.html" class="muted text-sm inline-block mb-6">${backLabel}</a>
      
      <!-- Khung Hero phía trên chia làm 2 cột -->
      <header class="article-hero">
        <!-- Cột bên trái: Ảnh bìa bo tròn -->
        <div class="article-hero__media">
          <img
            src="${article.image}"
            alt="${article.title}"
            onerror="this.src='${placeholderImage(article.title, 800, 600)}'"
          />
        </div>
        
        <!-- Cột bên phải: Toàn bộ thông tin chữ -->
        <div class="article-hero__meta">
          <h1 class="article-title">${article.title}</h1>
          <p class="article-excerpt">${article.excerpt}</p>
          <div class="article-author-info">
            <span class="article-badge">${article.category}</span>
            <span class="font-medium text-gray-900">${article.author}</span>
            <span class="text-gray-400">·</span>
            <time>${article.date}</time>
          </div>
        </div>
      </header>

      <!-- Khung dưới: Nội dung bài viết chi tiết -->
      <div class="article-body-wrapper">
        <div class="article-content">${contentHtml}</div>
      </div>

      <!-- Vị trí hiển thị phần bài viết liên quan ở dưới cùng -->
      ${relatedHtml}
    `;
  } catch (err) {
    console.error(err);
    const globalErrorMsg = isVi ? "Không thể tải nội dung bài viết." : "Could not load article.";
    mount.innerHTML = `<div class="empty-state">${globalErrorMsg}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "articles" });
  initArticlesList();
  initArticleDetail();
});
