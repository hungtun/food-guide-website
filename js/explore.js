
/* =========================================================
   DATA
   ========================================================= */

let foodsCache = [];

const selectedFilters = {
  region: new Set(),
  category: new Set(),
  tags: new Set(),
  price: new Set()
};

let filterMenuOpen = false;

/* =========================================================
   LANGUAGE
   ========================================================= */

function getCurrentLang() {
  return localStorage.getItem("vietnam_food_guide_lang") || "en";
}

/* =========================================================
   LANGUAGE TEXT
   ========================================================= */

function getFilterTitle(type) {
  const isVi = getCurrentLang() === "vi";

  const titles = {
    region: isVi ? "Nguồn gốc" : "Region",
    category: isVi ? "Loại món" : "Category",
    tags: "Tags",
    price: isVi ? "Mức giá" : "Price"
  };

  return titles[type] || type;
}

function getPriceOptions() {
  const isVi = getCurrentLang() === "vi";

  return [
    {
      value: "under50",
      label: isVi ? "Dưới 50.000 VNĐ" : "Under 50,000 VND"
    },
    {
      value: "50to100",
      label: isVi ? "50.000 - 100.000 VNĐ" : "50,000 - 100,000 VND"
    },
    {
      value: "over100",
      label: isVi ? "Trên 100.000 VNĐ" : "Over 100,000 VND"
    }
  ];
}

function getDisplayValue(type, value) {
  const isVi = getCurrentLang() === "vi";

  /* Price has internal values that should not change with language. */
  if (type === "price") {
    const option = getPriceOptions().find(
      (item) => item.value === value
    );

    return option ? option.label : value;
  }

  /* Region / Category / Tags currently use the value directly from foods.json. */
  return value;
}

/* =========================================================
   SEARCH
   ========================================================= */

function filterFoodsByKeyword(foods, keyword) {
  const q = keyword.trim().toLowerCase();

  if (!q) {
    return foods;
  }

  return foods.filter((food) => {
    const name = String(food.name || "").toLowerCase();
    const vietnameseName = String(food.vietnameseName || "").toLowerCase();
    const category = String(food.category || "").toLowerCase();
    const province = String(food.province || "").toLowerCase();
    const region = String(food.region || "").toLowerCase();
    const description = String(food.description || "").toLowerCase();

    const tags = Array.isArray(food.tags)
      ? food.tags.map((tag) => String(tag).toLowerCase())
      : [];

    return (
      name.includes(q) ||
      vietnameseName.includes(q) ||
      category.includes(q) ||
      province.includes(q) ||
      region.includes(q) ||
      description.includes(q) ||
      tags.some((tag) => tag.includes(q))
    );
  });
}
/* =========================================================
   FILTER OPTIONS
   Automatically generated from foods.json
   ========================================================= */

function getFilterOptions(foods) {
  const regions = new Set();
  const categories = new Set();
  const tags = new Set();

  foods.forEach((food) => {
    if (food.region) {
      regions.add(food.region);
    }

    if (food.category) {
      categories.add(food.category);
    }

    if (Array.isArray(food.tags)) {
      food.tags.forEach((tag) => {
        if (tag) {
          tags.add(tag);
        }
      });
    }
  });

  return {
    region: [...regions].sort(),
    category: [...categories].sort(),
    tags: [...tags].sort(),
    price: getPriceOptions()
  };
}

/* =========================================================
   PRICE
   ========================================================= */

function matchPriceRange(food, range) {
  const min = Number(food.priceMin);
  const max = Number(food.priceMax);

  if (Number.isNaN(min) || Number.isNaN(max)) {
    return false;
  }

  switch (range) {
    case "under50":
      return min < 50000;

    case "50to100":
      return max >= 50000 && min <= 100000;

    case "over100":
      return max > 100000;

    default:
      return true;
  }
}

/* =========================================================
   APPLY SELECTED FILTERS
   ========================================================= */

function filterFoodsBySelectedFilters(foods) {
  return foods.filter((food) => {
    /* ---------- Region ---------- */
    if (selectedFilters.region.size > 0) {
      if (!selectedFilters.region.has(food.region)) {
        return false;
      }
    }

    /* ---------- Category ---------- */
    if (selectedFilters.category.size > 0) {
      if (!selectedFilters.category.has(food.category)) {
        return false;
      }
    }

    /* ---------- Tags ---------- */
    if (selectedFilters.tags.size > 0) {
      const foodTags = Array.isArray(food.tags)
        ? food.tags
        : [];

      /* OR logic inside Tags */
      const hasMatchingTag = [...selectedFilters.tags].some(
        (tag) => foodTags.includes(tag)
      );

      if (!hasMatchingTag) {
        return false;
      }
    }

    /* ---------- Price ---------- */
    if (selectedFilters.price.size > 0) {
      /* Price only allows ONE value, but keeping Set makes the rest of the filter system consistent. */
      const selectedPrice = [...selectedFilters.price][0];

      if (!matchPriceRange(food, selectedPrice)) {
        return false;
      }
    }

    return true;
  });
}

/* =========================================================
   FILTER BUTTON
   ========================================================= */

function createFilterButton(type, option) {
  const value = typeof option === "object"
    ? option.value
    : option;

  const label = typeof option === "object"
    ? option.label
    : option;

  const isSelected = selectedFilters[type].has(value);

  return `
    <button
      type="button"
      class="filter-option${isSelected ? " selected" : ""}"
      data-filter-type="${escapeHtml(type)}"
      data-filter-value="${escapeHtml(value)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

/* =========================================================
   FILTER GROUP
   ========================================================= */
function createFilterGroup(title, type, options) {
  if (!options.length) return "";

  return `
    <div class="filter-group">
      <h3 class="filter-group-title">${escapeHtml(title)}</h3>
      <div class="filter-options">
        ${options.map((option) => createFilterButton(type, option)).join("")}
      </div>
    </div>
  `;
}

/* =========================================================
   RENDER FILTER MENU
   ========================================================= */
function renderFilterMenu() {
  const container = document.getElementById("food-filters");

  if (!container) {
    console.error("Element #food-filters not found.");
    return;
  }

  const options = getFilterOptions(foodsCache);

  container.innerHTML = `
    ${createFilterGroup(getFilterTitle("region"), "region", options.region)}
    ${createFilterGroup(getFilterTitle("category"), "category", options.category)}
    ${createFilterGroup(getFilterTitle("tags"), "tags", options.tags)}
    ${createFilterGroup(getFilterTitle("price"), "price", options.price)}
  `;

  container.querySelectorAll(".filter-option").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.filterType;
      const value = button.dataset.filterValue;
      toggleFilter(type, value);
    });
  });
}

/* =========================================================
   TOGGLE FILTER
   ========================================================= */
function toggleFilter(type, value) {
  if (!selectedFilters[type]) return;

  const filterSet = selectedFilters[type];

  /* Price: only one value can be selected */
  if (type === "price") {
    if (filterSet.has(value)) {
      filterSet.clear();
    } else {
      filterSet.clear();
      filterSet.add(value);
    }
  }
  /* Other filters: multiple selections allowed */
  else {
    if (filterSet.has(value)) {
      filterSet.delete(value);
    } else {
      filterSet.add(value);
    }
  }

  renderFilterMenu();
  renderActiveFilters();

  const searchInput = document.getElementById("explore-search");
  const keyword = searchInput ? searchInput.value : "";
  renderExplore(keyword);
}

/* =========================================================
   ACTIVE FILTERS
   ========================================================= */
function renderActiveFilters() {
  const container = document.getElementById("active-filters");
  const clearButton = document.getElementById("clear-filters");

  if (!container) return;

  const activeFilters = [];

  Object.entries(selectedFilters).forEach(([type, values]) => {
    values.forEach((value) => {
      activeFilters.push({ type, value });
    });
  });

  /* No active filters */
  if (!activeFilters.length) {
    container.innerHTML = "";
    if (clearButton) clearButton.hidden = true;
    return;
  }

  /* Active filters exist */
  container.innerHTML = activeFilters.map(({ type, value }) => {
    const label = getDisplayValue(type, value);

    return `
      <button
        type="button"
        class="active-filter"
        data-filter-type="${escapeHtml(type)}"
        data-filter-value="${escapeHtml(value)}"
      >
        <span>${escapeHtml(label)}</span>
        <span class="active-filter-remove">×</span>
      </button>
    `;
  }).join("");

  if (clearButton) clearButton.hidden = false;

  container.querySelectorAll(".active-filter").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.filterType;
      const value = button.dataset.filterValue;
      toggleFilter(type, value);
    });
  });
}

/* =========================================================
   CLEAR ALL FILTERS
   ========================================================= */
function clearAllFilters() {
  Object.values(selectedFilters).forEach((filterSet) => {
    filterSet.clear();
  });

  renderFilterMenu();
  renderActiveFilters();

  const searchInput = document.getElementById("explore-search");
  const keyword = searchInput ? searchInput.value : "";
  renderExplore(keyword);
}

/* =========================================================
   FILTER MENU OPEN / CLOSE
   ========================================================= */
function initFilterToggle() {
  const toggleButton = document.getElementById("filter-toggle");
  const menu = document.getElementById("food-filters");
  const arrow = document.getElementById("filter-arrow");

  if (!toggleButton || !menu) {
    console.error("Filter toggle elements not found.");
    return;
  }

  menu.hidden = true;
  filterMenuOpen = false;

  if (arrow) arrow.textContent = "⌄";

  toggleButton.addEventListener("click", () => {
    filterMenuOpen = !filterMenuOpen;
    menu.hidden = !filterMenuOpen;

    if (arrow) {
      arrow.textContent = filterMenuOpen ? "⌃" : "⌄";
    }
  });
}

/* =========================================================
   CLEAR BUTTON
   ========================================================= */
function initClearButton() {
  const button = document.getElementById("clear-filters");

  if (!button) return;

  button.hidden = true;
  button.addEventListener("click", clearAllFilters);
}

/* =========================================================
   RENDER EXPLORE
   ========================================================= */
function renderExplore(keyword = "") {
  const grid = document.getElementById("explore-grid");
  const status = document.getElementById("explore-status");

  if (!grid || !status) {
    console.error("Explore grid or status element not found.");
    return;
  }

  /* 1. Search */
  let results = filterFoodsByKeyword(foodsCache, keyword);

  /* 2. Filters */
  results = filterFoodsBySelectedFilters(results);
  const isVi = getCurrentLang() === "vi";

  /* =====================================================
     NO RESULTS
     ===================================================== */
  if (!results.length) {
    if (keyword) {
      status.textContent = isVi
        ? `Không tìm thấy kết quả cho "${keyword}"`
        : `No results for "${keyword}"`;
    } else {
      status.textContent = isVi
        ? "Không có món ăn phù hợp với bộ lọc."
        : "No foods match your filters.";
    }

    grid.innerHTML = `
      <div class="empty-state col-span-full">
        ${isVi ? "Hãy thử từ khóa khác hoặc thay đổi bộ lọc." : "Try another keyword or change your filters."}
      </div>
    `;
    return;
  }

  /* =====================================================
     STATUS
     ===================================================== */
  const dishText = isVi ? "món" : results.length === 1 ? "dish" : "dishes";

  if (keyword) {
    status.textContent = isVi
      ? `Kết quả tìm kiếm cho "${keyword}" · ${results.length} ${dishText}`
      : `Search results for "${keyword}" · ${results.length} ${dishText}`;
  } else {
    status.textContent = `${results.length} ${dishText}`;
  }

  /* =====================================================
     CARDS
     ===================================================== */
  grid.innerHTML = results
    .map((food) => createFoodCard(food))
    .join("");
}

/* =========================================================
   SEARCH INITIALIZATION
   ========================================================= */
function initSearch() {
  const searchInput = document.getElementById("explore-search");

  if (!searchInput) {
    console.error("Element #explore-search not found.");
    return;
  }

  searchInput.addEventListener("input", (event) => {
    renderExplore(event.target.value);
  });
}

/* =========================================================
   HTML ESCAPE
   ========================================================= */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   INITIALIZE EXPLORE
   ========================================================= */
async function initExplore() {
  try {
    /* Load foods */
    foodsCache = await loadFoods();
    if (!Array.isArray(foodsCache)) {
      throw new Error("foods.json must contain an array of foods.");
    }
    const isVi = getCurrentLang() === "vi";
    // =========================
    // PAGE TEXT
    // =========================
    const pageTitle = document.querySelector(".page-hero h1");
    if (pageTitle) {
      pageTitle.textContent = isVi
        ? "Khám phá ẩm thực Việt Nam"
        : "Explore Vietnamese Foods";
    }

    const pageDescription = document.querySelector(".page-hero p");
    if (pageDescription) {
      pageDescription.textContent = isVi
        ? "Khám phá các món ăn Việt Nam từ nhiều vùng miền, loại món và nét văn hóa ẩm thực khác nhau."
        : "Discover Vietnamese dishes from different regions, categories, and culinary traditions.";
    }
    // =========================
    // SEARCH
    // =========================
    const searchInput = document.getElementById("explore-search");
    if (searchInput) {
      searchInput.placeholder = isVi ? "Tìm kiếm món ăn..." : "Search for a food…";
    }
    // =========================
    // FILTER BUTTON
    // =========================
    const filterButton = document.querySelector("#filter-toggle [data-filter-label]");
    if (filterButton) {
      filterButton.textContent = isVi ? "Lọc" : "Filter";
    }
    /* Render filter options */
    renderFilterMenu();
    /* Render active filters (also hides Clear All) */
    renderActiveFilters();
    /* Filter menu */
    initFilterToggle();
    /* Clear All */
    initClearButton();
    /* Search */
    initSearch();
    /* Initial cards */
    renderExplore();
  } catch (err) {
    console.error("Failed to initialize Explore Foods:", err);
    const grid = document.getElementById("explore-grid");
    const status = document.getElementById("explore-status");
    const isVi = getCurrentLang() === "vi";
    if (status) {
      status.textContent = isVi ? "Không thể tải dữ liệu món ăn." : "Could not load foods.";
    }
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
        ${isVi ? "Không thể tải foods.json.": "Could not load foods.json."}
        </div>
      `;
    }
  }
}

/* =========================================================
   PAGE LOAD
   ========================================================= */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    initLayout({activeId: "explore"});
    initExplore();
  }
);