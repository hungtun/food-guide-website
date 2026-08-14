/**
 * Province & Food Explorer — Netflix-style rows
 */

let allFoods = [];
let regions = [];

function sortFoods(list, mode) {
  const sorted = [...list];
  switch (mode) {
    case "price-asc":
      return sorted.sort((a, b) => a.priceMin - b.priceMin);
    case "price-desc":
      return sorted.sort((a, b) => b.priceMax - a.priceMax);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

function getFilteredFoods() {
  const region = document.getElementById("filter-region").value;
  const province = document.getElementById("filter-province").value;
  const keyword = document.getElementById("search-explorer").value;
  const sort = document.getElementById("sort-foods").value;

  let list = [...allFoods];

  if (region) {
    list = list.filter((f) => regionKeyFromFood(f) === region);
  }
  if (province) {
    list = list.filter((f) => f.province === province);
  }
  list = filterFoodsByKeyword(list, keyword);
  return sortFoods(list, sort);
}

function populateProvinceFilter(foods) {
  const select = document.getElementById("filter-province");
  const current = select.value;
  const provinces = [...new Set(foods.map((f) => f.province))].sort();
  select.innerHTML =
    `<option value="">All provinces</option>` +
    provinces.map((p) => `<option value="${p}">${p}</option>`).join("");
  if (provinces.includes(current)) select.value = current;
}

function renderRows() {
  const mount = document.getElementById("explorer-rows");
  const foods = getFilteredFoods();

  if (!foods.length) {
    mount.innerHTML = `<div class="empty-state">No foods match your filters.</div>`;
    return;
  }

  const grouped = groupFoodsByProvince(foods);
  let html = "";

  grouped.forEach((items, province) => {
    const cards = items.map((f) => createFoodCard(f)).join("");
    const rowId = `row-${province.replace(/\s+/g, "-").toLowerCase()}`;
    html += `
      <section class="province-row">
        <div class="province-row__head">
          <h2>${province}</h2>
          <div class="row-controls">
            <button type="button" data-scroll="${rowId}" data-dir="-1" aria-label="Previous">‹</button>
            <button type="button" data-scroll="${rowId}" data-dir="1" aria-label="Next">›</button>
          </div>
        </div>
        <div class="scroll-row" id="${rowId}">${cards}</div>
      </section>
    `;
  });

  mount.innerHTML = html;

  mount.querySelectorAll("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = document.getElementById(btn.dataset.scroll);
      const dir = Number(btn.dataset.dir);
      row.scrollBy({ left: dir * 280, behavior: "smooth" });
    });
  });
}

async function initExplorer() {
  const regionParam = (getQueryParam("region") || "").toLowerCase();
  const title = document.getElementById("explorer-title");

  try {
    [allFoods, regions] = await Promise.all([loadFoods(), loadRegions()]);

    if (regionParam) {
      const region = findRegionById(regions, regionParam);
      document.getElementById("filter-region").value = region?.id || regionParam;
      if (region) {
        title.textContent = region.name;
        document.title = `${region.name} · Explorer`;
      }
    }

    populateProvinceFilter(allFoods);
    renderRows();

    ["filter-region", "filter-province", "sort-foods", "search-explorer"].forEach((id) => {
      document.getElementById(id).addEventListener("input", () => {
        if (id === "filter-region") {
          const region = document.getElementById("filter-region").value;
          const scoped = region
            ? allFoods.filter((f) => regionKeyFromFood(f) === region)
            : allFoods;
          populateProvinceFilter(scoped);
        }
        renderRows();
      });
    });
  } catch (err) {
    console.error(err);
    document.getElementById("explorer-rows").innerHTML =
      `<div class="empty-state">Could not load foods.json. Use a local HTTP server.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "explore" });
  initExplorer();
});
