const DataPaths = {
  foods: "data/foods.json",
  regions: "data/regions.json",
  articles: "data/articles.json",
};

async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

async function loadFoods() {
  const currentLang = localStorage.getItem("vietnam_food_guide_lang") || "en";
  const jsonFile = currentLang === "vi" ? "foods_vi.json" : "foods_en.json";
  
  const response = await fetch(`data/${jsonFile}`);
  if (!response.ok) throw new Error("Could not load foods data");
  return await response.json();
}


async function loadArticles() {
  const currentLang = localStorage.getItem("vietnam_food_guide_lang") || "en";
  const jsonFile = currentLang === "vi" ? "articles_vi.json" : "articles_en.json";
  
  const response = await fetch(`data/${jsonFile}`); 
  if (!response.ok) throw new Error("Could not load articles data");
  return await response.json();
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatPrice(min, max) {
  const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n);
  if (min === max) return `${fmt(min)}₫`;
  return `${fmt(min)} – ${fmt(max)}₫`;
}

function findFoodById(foods, id) {
  return foods.find((food) => food.id === Number(id));
}

function filterFoodsByKeyword(foods, keyword) {
  const q = keyword.trim().toLowerCase();
  if (!q) return foods;
  return foods.filter(
    (food) =>
      food.name.toLowerCase().includes(q) ||
      food.vietnameseName.toLowerCase().includes(q) ||
      food.category.toLowerCase().includes(q) ||
      food.province.toLowerCase().includes(q) ||
      food.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

/** Placeholder image when asset is missing */
function foodImage(food, index = 0) {
  const src = food.images && food.images[index];
  if (src) return src;
  return `https://placehold.co/600x400/1a3a2a/f5f0e8?text=${encodeURIComponent(food.name)}`;
}

function placeholderImage(label, w = 800, h = 500) {
  return `https://placehold.co/${w}x${h}/1a3a2a/f5f0e8?text=${encodeURIComponent(label)}`;
}