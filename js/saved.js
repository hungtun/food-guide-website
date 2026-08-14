/**
 * Saved Foods — localStorage IDs → foods.json
 */

async function initSaved() {
  const grid = document.getElementById("saved-grid");

  try {
    const foods = await loadFoods();
    const ids = getSavedFoodIds();
    const saved = ids
      .map((id) => findFoodById(foods, id))
      .filter(Boolean);

    if (!saved.length) {
      grid.innerHTML = `
        <div class="empty-state col-span-full">
          <p>No saved foods yet.</p>
          <a href="explore.html" class="btn btn--primary mt-4 inline-flex">Explore foods</a>
        </div>`;
      return;
    }

    grid.innerHTML = saved.map((f) => createFoodCard(f, { removable: true })).join("");

    grid.querySelectorAll(".btn-remove-saved").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeSavedFood(btn.dataset.id);
        initSaved();
      });
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="empty-state">Could not load saved foods.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "saved" });
  initSaved();
});
