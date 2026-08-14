/* =========================================================
   LANGUAGE
   ========================================================= */
function getCurrentLang() {
  return localStorage.getItem("vietnam_food_guide_lang") || "en";
}

/* =========================================================
   TOAST
   ========================================================= */
function showToast(message) {
  const el = document.getElementById("toast");

  if (!el) return;

  el.textContent = message;
  el.classList.add("is-visible");

  setTimeout(() => {
    el.classList.remove("is-visible");
  }, 2200);
}

/* =========================================================
   LIGHTBOX
   ========================================================= */
function openLightbox(src, alt) {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");

  if (!box || !img) return;

  img.src = src;
  img.alt = alt || "";
  box.classList.add("is-open");
}

function closeLightbox() {
  const box = document.getElementById("lightbox");

  if (box) {
    box.classList.remove("is-open");
  }
}

/* =========================================================
   RECOMMENDATIONS
   ========================================================= */
function getRecommendedFoods(currentFood, foods) {
  const currentCategory = String(currentFood.category || "").toLowerCase();
  const currentRegion = String(currentFood.region || "").toLowerCase();
  const currentTags = Array.isArray(currentFood.tags)
    ? currentFood.tags.map((tag) => String(tag).toLowerCase())
    : [];

  return foods
    .filter((food) => food.id !== currentFood.id)
    .map((food) => {
      let score = 0;
      const category = String(food.category || "").toLowerCase();
      const region = String(food.region || "").toLowerCase();
      const tags = Array.isArray(food.tags)
        ? food.tags.map((tag) => String(tag).toLowerCase())
        : [];

      /* Same category */
      if (currentCategory && category === currentCategory) {
        score += 5;
      }

      /* Shared tags */
      const sharedTags = tags.filter((tag) => currentTags.includes(tag));
      score += sharedTags.length * 2;

      /* Same region */
      if (currentRegion && region === currentRegion) {
        score += 2;
      }

      return {
        food,
        score
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.food);
}

/* =========================================================
   RECOMMENDATION CARDS
   ========================================================= */
function createRecommendationCards(foods) {
  return foods
    .map((food) => createFoodCard(food))
    .join("");
}

/* =========================================================
   FOOD DETAIL
   ========================================================= */
async function initFoodDetail() {
  const mount = document.getElementById("food-detail");
  const id = getQueryParam("id");
  const isVi = getCurrentLang() === "vi";

  /* ---------- No ID ---------- */
  if (!id) {
    mount.innerHTML = `
      <div class="empty-state">
        <p>
          ${
            isVi
              ? "Chưa chọn món ăn."
              : "No food selected."
          }
        </p>
        <a href="explore.html" class="btn btn--primary mt-4">
          ${
            isVi
              ? "Khám phá món ăn"
              : "Explore foods"
          }
        </a>
      </div>
    `;

    return;
  }

  try {
    const foods = await loadFoods();
    const food = findFoodById(foods, id);

    /* ---------- Food not found ---------- */
    if (!food) {
      mount.innerHTML = `
        <div class="empty-state">
          <p>
            ${
              isVi
                ? "Không tìm thấy món ăn."
                : "Food not found."
            }
          </p>
          <a href="explore.html" class="btn btn--primary mt-4">
            ${
              isVi
                ? "Khám phá món ăn"
                : "Explore foods"
            }
          </a>
        </div>
      `;

      return;
    }

    /* =====================================================
       BASIC DATA
       ===================================================== */

    const displayName =
      isVi
        ? (food.vietnameseName || food.name)
        : food.name;


    document.title =
      `${displayName} · Vietnam Food Guide`;


    addRecentlyViewed(food.id);


    /* =====================================================
       IMAGES
       ===================================================== */

    const images =
      food.images?.length
        ? food.images
        : [placeholderImage(displayName)];


    /* =====================================================
       SAVED
       ===================================================== */

    const saved =
      isFoodSaved(food.id);


    /* =====================================================
       TAGS
       ===================================================== */

    const tags =
      Array.isArray(food.tags)
        ? food.tags
            .map(
              (tag) =>
                `<span class="tag">${tag}</span>`
            )
            .join("")
        : "";


    /* =====================================================
       INGREDIENTS
       ===================================================== */

    const ingredients =
      Array.isArray(food.ingredients)
        ? food.ingredients
            .map(
              (ingredient) =>
                `<li>${ingredient}</li>`
            )
            .join("")
        : "";


    /* =====================================================
       GALLERY THUMBNAILS
       ===================================================== */

    const thumbs =
      images
        .map(
          (src, i) => `
            <button
              type="button"
              class="${i === 0 ? "is-active" : ""}"
              data-index="${i}"
            >
              <img
                src="${src}"
                alt=""
                onerror="
                  this.src='${placeholderImage(
                    displayName,
                    150,
                    150
                  )}'
                "
              />
            </button>
          `
        )
        .join("");


/* =====================================================
   VEGETARIAN
   ===================================================== */

const foodTags = Array.isArray(food.tags)
  ? food.tags.map((tag) =>
      String(tag).trim().toLowerCase()
    )
  : [];

const isVegetarian =
  foodTags.includes("vegetarian") ||
  foodTags.includes("ăn chay") ||
  foodTags.includes("chay");

const vegetarianText = isVegetarian
  ? (isVi ? "Có" : "Yes")
  : (isVi ? "Không" : "No");


/* =====================================================
   SPICY LEVEL
   ===================================================== */

let spicyText = "";

switch (Number(food.spicyLevel)) {

  case 0:
    spicyText = isVi
      ? "Không cay"
      : "Not spicy";
    break;

  case 1:
    spicyText = isVi
      ? "Cay vừa"
      : "Mild";
    break;

  case 2:
    spicyText = isVi
      ? "Siêu cay"
      : "Very spicy";
    break;

  default:
    spicyText = isVi
      ? "Không xác định"
      : "Unknown";
}


/* =====================================================
   SUMMARY LABELS
   ===================================================== */

const summaryLabels = isVi
  ? {
      title: "Tóm tắt món ăn",
      foodName: "Tên món",
      category: "Loại món",
      price: "Giá",
      region: "Nguồn gốc",
      province: "Tỉnh / Thành phố",
      vegetarian: "Ăn chay",
      spicyLevel: "Độ cay"
    }
  : {
      title: "Food Summary",
      foodName: "Food name",
      category: "Category",
      price: "Price",
      region: "Region",
      province: "Province",
      vegetarian: "Vegetarian",
      spicyLevel: "Spicy level"
    };


/* =====================================================
   RECOMMENDED FOODS
   ===================================================== */

const recommendedFoods =
  getRecommendedFoods(
    food,
    foods
  );

const recommendedCards =
  createRecommendationCards(
    recommendedFoods
  );


/* =====================================================
   RENDER PAGE
   ===================================================== */

mount.innerHTML = `

<div class="food-detail-back">
    <a
      href="explore.html"
      class="food-back-btn"
    >
      ← ${
        isVi
          ? "Quay lại"
          : "Back"
      }
    </a>
  </div>

  <!-- ================================================
       MAIN FOOD
  ================================================= -->

  <div class="grid lg:grid-cols-2 gap-8 mb-12">

    <!-- Gallery -->

    <div>

      <div
        class="gallery-main"
        id="gallery-main"
      >

        <img
          id="gallery-image"
          src="${images[0]}"
          alt="${displayName}"
          onerror="
            this.src='${placeholderImage(
              displayName
            )}'
          "
        />

      </div>


      <div
        class="gallery-thumbs"
        id="gallery-thumbs"
      >
        ${thumbs}
      </div>

    </div>


    <!-- Basic information -->

    <div>

      <p class="muted mb-1">
        ${food.province} · ${food.region}
      </p>


      <h1 class="text-4xl mb-4">
        ${displayName}
      </h1>


      <p class="mb-5">
        ${food.description}
      </p>


     <p class="mb-4">
  <strong>
    ${isVi ? "Giá:" : "Price:"}
  </strong>

  ${formatPrice(
    food.priceMin,
    food.priceMax
  )}

  ${
    food.priceUnit
      ? `<span class="price-unit"> / ${food.priceUnit}</span>`
      : ""
  }
</p>


      <div class="mb-5">
        ${tags}
      </div>


      <!-- Save button -->

      <div class="food-save-wrapper">

        <button
          type="button"
          class="btn food-save-btn ${
            saved
              ? "btn--ghost"
              : "btn--primary"
          }"
          id="btn-save"
        >

          ${
            saved
              ? (isVi
                  ? "♥ Đã lưu"
                  : "♥ Saved")
              : (isVi
                  ? "♡ Lưu món ăn"
                  : "♡ Save Food")
          }

        </button>

      </div>

    </div>

  </div>


  <!-- ================================================
       INGREDIENTS
  ================================================= -->

  <section
    class="food-detail-section food-detail-ingredients"
  >

    <h2 class="text-2xl mb-3">

      ${
        isVi
          ? "Nguyên liệu"
          : "Ingredients"
      }

    </h2>


    <ul
      class="list-disc pl-5 muted space-y-1"
    >
      ${ingredients}
    </ul>

  </section>


  <!-- ================================================
       COOKING METHOD
  ================================================= -->

  <section
    class="food-detail-section food-detail-cooking"
  >

    <h2 class="text-2xl mb-3">

      ${
        isVi
          ? "Cách chế biến"
          : "Cooking Method"
      }

    </h2>


    <div class="cooking-method-content">
  ${renderContentBlocks(food.cookingMethod)}
</div>

  </section>


  <!-- ================================================
       SUMMARY
  ================================================= -->

  <section class="food-summary-section">

    <h2 class="text-2xl mb-4">
      ${summaryLabels.title}
    </h2>


    <div class="food-summary">

      <table class="food-summary__table">

        <tbody>

          <tr>
            <th>
              ${summaryLabels.foodName}
            </th>

            <td>
              ${displayName}
            </td>
          </tr>


          <tr>
            <th>
              ${summaryLabels.category}
            </th>

            <td>
              ${food.category}
            </td>
          </tr>


          <tr>
  <th>${isVi ? "Giá" : "Price"}</th>
  <td>
    ${formatPrice(food.priceMin, food.priceMax)}
    ${
      food.priceUnit
        ? `<span class="price-unit"> / ${food.priceUnit}</span>`
        : ""
    }
  </td>
</tr>


          <tr>
            <th>
              ${summaryLabels.region}
            </th>

            <td>
              ${food.region}
            </td>
          </tr>


          <tr>
            <th>
              ${summaryLabels.province}
            </th>

            <td>
              ${food.province}
            </td>
          </tr>


          <tr>
            <th>
              ${summaryLabels.vegetarian}
            </th>

            <td>
              ${vegetarianText}
            </td>
          </tr>


          <tr>
            <th>
              ${summaryLabels.spicyLevel}
            </th>

            <td>
              ${spicyText}
            </td>
          </tr>

        </tbody>

      </table>

    </div>

  </section>


  <!-- ================================================
       YOU MAY ALSO LIKE
  ================================================= -->

  ${
    recommendedFoods.length
      ? `

        <section class="mb-10">

          <h2 class="text-2xl mb-4">

            ${
              isVi
                ? "Có thể bạn cũng thích"
                : "You may also like"
            }

          </h2>


          <div class="food-grid">
            ${recommendedCards}
          </div>

        </section>

      `
      : ""
  }


  <!-- ================================================
       BACK TO EXPLORE
  ================================================= -->

  <div class="text-center py-6">

    <a
      href="explore.html"
      class="btn btn--accent"
    >

      ${
        isVi
          ? "Khám phá thêm món ăn"
          : "Explore More Foods"
      }

    </a>

  </div>

`;


    /* =====================================================
       GALLERY
       ===================================================== */

    let current = 0;

    const mainImg =
      document.getElementById(
        "gallery-image"
      );

    const thumbBtns = [
      ...document.querySelectorAll(
        "#gallery-thumbs button"
      )
    ];


    function setImage(index) {

      current = index;

      const src =
        images[index];

      mainImg.src = src;


      thumbBtns.forEach(
        (btn, i) => {

          btn.classList.toggle(
            "is-active",
            i === index
          );

        }
      );

    }


    thumbBtns.forEach(
      (btn) => {

        btn.addEventListener(
          "click",
          () => {

            setImage(
              Number(
                btn.dataset.index
              )
            );

          }
        );

      }
    );


    /* =====================================================
       LIGHTBOX
       ===================================================== */

    document
      .getElementById(
        "gallery-main"
      )
      .addEventListener(
        "click",
        () => {

          openLightbox(
            images[current],
            displayName
          );

        }
      );


    /* =====================================================
       SAVE FOOD
       ===================================================== */

    document
      .getElementById(
        "btn-save"
      )
      .addEventListener(
        "click",
        (e) => {

          const nowSaved =
            toggleSavedFood(
              food.id
            );


          e.currentTarget.textContent =
            nowSaved
              ? (
                  isVi
                    ? "♥ Đã lưu"
                    : "♥ Saved"
                )
              : (
                  isVi
                    ? "♡ Lưu món ăn"
                    : "♡ Save Food"
                );


         e.currentTarget.className = `btn food-save-btn ${
  nowSaved ? "btn--ghost" : "btn--primary"
}`;


          showToast(
            nowSaved
              ? (
                  isVi
                    ? "Đã thêm vào món ăn đã lưu"
                    : "Added to Saved Foods"
                )
              : (
                  isVi
                    ? "Đã xóa khỏi món ăn đã lưu"
                    : "Removed from Saved Foods"
                )
          );

        }
      );


  } catch (err) {

    console.error(err);

    mount.innerHTML = `
      <div class="empty-state">

        ${
          isVi
            ? "Không thể tải dữ liệu món ăn."
            : "Could not load food data."
        }

      </div>
    `;

  }
}


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initLayout({
      activeId: "explore"
    });

    initFoodDetail();


    /* ---------- Lightbox close ---------- */

    document
      .getElementById(
        "lightbox-close"
      )
      ?.addEventListener(
        "click",
        closeLightbox
      );


    document
      .getElementById(
        "lightbox"
      )
      ?.addEventListener(
        "click",
        (e) => {

          if (
            e.target.id ===
            "lightbox"
          ) {
            closeLightbox();
          }

        }
      );


    /* ---------- ESC ---------- */

    document.addEventListener(
      "keydown",
      (e) => {

        if (
          e.key === "Escape"
        ) {
          closeLightbox();
        }

      }
    );

  }
);