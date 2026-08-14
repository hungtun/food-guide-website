/**
 * Home page — simple slideshow (show/hide slides)
 */

function initSlideshow() {
  const slides = [...document.querySelectorAll(".hero-slide")];
  if (!slides.length) return;

  let index = 0;

  function show(i) {
    slides.forEach((slide, n) => {
      slide.classList.toggle("hidden", n !== i);
    });
    index = i;
  }

  function next() {
    show((index + 1) % slides.length);
  }

  function prev() {
    show((index - 1 + slides.length) % slides.length);
  }

  document.getElementById("slide-next")?.addEventListener("click", next);
  document.getElementById("slide-prev")?.addEventListener("click", prev);

  setInterval(next, 5000);
}

document.addEventListener("DOMContentLoaded", initSlideshow);
