/**
 * Region Detail — region-detail.html?region=central
 */

async function initRegionDetail() {
  const mount = document.getElementById("region-page");
  const regionParam = getQueryParam("region") || "north";

  try {
    const [regions, foods] = await Promise.all([loadRegions(), loadFoods()]);
    const region = findRegionById(regions, regionParam);

    if (!region) {
      mount.innerHTML = `<div class="empty-state"><p>Region not found.</p><a class="btn btn--primary mt-4" href="index.html">Back home</a></div>`;
      return;
    }

    document.title = `${region.name} · Vietnam Food Guide`;

    const featured = foods.filter((f) =>
      region.featuredFoodIds.includes(f.id) ||
      regionKeyFromFood(f) === region.shortName.toLowerCase() ||
      regionKeyFromFood(f) === region.id
    ).slice(0, 6);

    const ingredients = region.commonIngredients
      .map((item) => `<li>${item}</li>`)
      .join("");

    const featuredCards = featured.map((f) => createFoodCard(f)).join("");

    mount.innerHTML = `
      <article>
        <div class="page-hero">
          <p class="muted uppercase tracking-wide text-sm mb-2">${region.tagline}</p>
          <h1>${region.name}</h1>
          <p>${region.description}</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 mb-10">
          <img
            src="${region.image}"
            alt="${region.name}"
            class="w-full aspect-[4/3] object-cover bg-[#d9d0c0]"
            onerror="this.src='${placeholderImage(region.name)}'"
          />
          <div class="space-y-5">
            <section>
              <h2 class="text-xl mb-2">Culinary culture</h2>
              <p class="muted">${region.culture}</p>
            </section>
            <section>
              <h2 class="text-xl mb-2">Flavor profile</h2>
              <p class="muted">${region.flavorProfile}</p>
            </section>
            <section>
              <h2 class="text-xl mb-2">Common ingredients</h2>
              <ul class="list-disc pl-5 muted space-y-1">${ingredients}</ul>
            </section>
          </div>
        </div>

        <section class="mb-10">
          <h2 class="text-2xl mb-4">Featured dishes</h2>
          <div class="food-grid">${featuredCards || '<p class="muted">No featured dishes yet.</p>'}</div>
        </section>

        <div class="text-center py-6">
          <a class="btn btn--accent" href="explorer.html?region=${region.id}">Explore Now</a>
        </div>
      </article>
    `;
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state"><p>Could not load region data. Serve this site via a local server (fetch needs HTTP).</p></div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "explore" });
  initRegionDetail();
});
