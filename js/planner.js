/**
 * Food Planner — 7-day table (Morning / Lunch / Dinner)
 */

const MEALS = [
  { key: "morning", label: "Morning" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
];

let foodsCache = [];
let activeDate = null;
let activeMeal = null;

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function shiftDate(key, days) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function formatDayLabel(key) {
  return parseDateKey(key).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getWeekDates() {
  const startKey = document.getElementById("planner-start").value;
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(shiftDate(startKey, i));
  }
  return days;
}

function cellContent(dateKey, mealKey) {
  const dayPlan = getPlanner()[dateKey] || {};
  const foodId = dayPlan[mealKey];
  const food = foodId ? findFoodById(foodsCache, foodId) : null;

  if (food) {
    return `
      <div class="planner-cell">
        <a href="food-detail.html?id=${food.id}">${food.name}</a>
        <div class="planner-actions">
          <button type="button" class="btn btn--ghost btn-clear"
            data-date="${dateKey}" data-meal="${mealKey}">Remove</button>
        </div>
      </div>
    `;
  }

  return `
    <button type="button" class="btn btn--primary btn-add"
      data-date="${dateKey}" data-meal="${mealKey}">+ Add</button>
  `;
}

function renderWeek() {
  const body = document.getElementById("planner-body");
  const week = getWeekDates();

  body.innerHTML = week
    .map(
      (dateKey) => `
      <tr>
        <th>${formatDayLabel(dateKey)}</th>
        ${MEALS.map((meal) => `<td>${cellContent(dateKey, meal.key)}</td>`).join("")}
      </tr>
    `
    )
    .join("");

  body.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.date, btn.dataset.meal));
  });

  body.querySelectorAll(".btn-clear").forEach((btn) => {
    btn.addEventListener("click", () => {
      clearPlannerMeal(btn.dataset.date, btn.dataset.meal);
      renderWeek();
    });
  });
}

function openModal(dateKey, meal) {
  activeDate = dateKey;
  activeMeal = meal;
  const modal = document.getElementById("food-modal");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("modal-search").value = "";
  renderModalList("");
  document.getElementById("modal-search").focus();
}

function closeModal() {
  const modal = document.getElementById("food-modal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  activeDate = null;
  activeMeal = null;
}

function renderModalList(keyword) {
  const list = document.getElementById("modal-list");
  const results = filterFoodsByKeyword(foodsCache, keyword).slice(0, 20);

  if (!results.length) {
    list.innerHTML = `<p class="muted">No matches.</p>`;
    return;
  }

  list.innerHTML = results
    .map(
      (f) => `
      <button type="button" data-id="${f.id}">
        <strong>${f.name}</strong>
        <span class="muted"> · ${f.vietnameseName} · ${f.province}</span>
      </button>`
    )
    .join("");

  list.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      setPlannerMeal(activeDate, activeMeal, btn.dataset.id);
      closeModal();
      renderWeek();
    });
  });
}

async function initPlanner() {
  const startInput = document.getElementById("planner-start");
  startInput.value = toDateKey(new Date());

  try {
    foodsCache = await loadFoods();
  } catch (err) {
    console.error(err);
    foodsCache = [];
  }

  renderWeek();

  startInput.addEventListener("change", renderWeek);

  document.getElementById("week-prev").addEventListener("click", () => {
    startInput.value = shiftDate(startInput.value, -7);
    renderWeek();
  });

  document.getElementById("week-next").addEventListener("click", () => {
    startInput.value = shiftDate(startInput.value, 7);
    renderWeek();
  });

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("food-modal").addEventListener("click", (e) => {
    if (e.target.id === "food-modal") closeModal();
  });
  document.getElementById("modal-search").addEventListener("input", (e) => {
    renderModalList(e.target.value);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "planner" });
  initPlanner();
});
