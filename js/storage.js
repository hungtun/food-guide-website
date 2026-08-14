/**
 * LocalStorage helpers for user-specific data.
 * Keys: savedFoods, foodPlanner, ratings, recentlyViewed, language, theme
 */

const StorageKeys = {
  savedFoods: "savedFoods",
  foodPlanner: "foodPlanner",
  ratings: "ratings",
  recentlyViewed: "recentlyViewed",
  language: "language",
  theme: "theme",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---- Saved Foods ---- */
function getSavedFoodIds() {
  return readJSON(StorageKeys.savedFoods, []);
}

function isFoodSaved(id) {
  return getSavedFoodIds().includes(Number(id));
}

function toggleSavedFood(id) {
  const foodId = Number(id);
  const list = getSavedFoodIds();
  const index = list.indexOf(foodId);
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(foodId);
  }
  writeJSON(StorageKeys.savedFoods, list);
  return list.includes(foodId);
}

function removeSavedFood(id) {
  const foodId = Number(id);
  const list = getSavedFoodIds().filter((item) => item !== foodId);
  writeJSON(StorageKeys.savedFoods, list);
  return list;
}

/* ---- Food Planner ---- */
function getPlanner() {
  return readJSON(StorageKeys.foodPlanner, {});
}

function setPlannerMeal(dateKey, meal, foodId) {
  const planner = getPlanner();
  if (!planner[dateKey]) {
    planner[dateKey] = { morning: null, lunch: null, dinner: null };
  }
  planner[dateKey][meal] = foodId === null ? null : Number(foodId);
  writeJSON(StorageKeys.foodPlanner, planner);
  return planner;
}

function clearPlannerMeal(dateKey, meal) {
  return setPlannerMeal(dateKey, meal, null);
}

/* ---- Ratings ---- */
function getRatings() {
  return readJSON(StorageKeys.ratings, {});
}

function setRating(foodId, rating) {
  const ratings = getRatings();
  ratings[String(foodId)] = Number(rating);
  writeJSON(StorageKeys.ratings, ratings);
  return ratings;
}

/* ---- Recently Viewed ---- */
function getRecentlyViewed() {
  return readJSON(StorageKeys.recentlyViewed, []);
}

function addRecentlyViewed(id, limit = 8) {
  const foodId = Number(id);
  const list = getRecentlyViewed().filter((item) => item !== foodId);
  list.unshift(foodId);
  writeJSON(StorageKeys.recentlyViewed, list.slice(0, limit));
  return list;
}
