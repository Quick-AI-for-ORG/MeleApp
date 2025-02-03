document.addEventListener("DOMContentLoaded", function () {
  let currentSlide = 0;
  const mainImage = document.getElementById("mainImage");
  const thumbnails = document.querySelectorAll(".thumbnail");

  // Initialize first image as active
  if (thumbnails.length > 0) {
    thumbnails[0].classList.add("active");
  }

  window.changeImage = function (imageSrc, thumbnail) {
    mainImage.src = `/Images/Products/${imageSrc}`;
    thumbnails.forEach((thumb) => thumb.classList.remove("active"));
    thumbnail.classList.add("active");
    currentSlide = Array.from(thumbnails).indexOf(thumbnail);
  };

  window.changeSlide = function (direction) {
    currentSlide =
      (currentSlide + direction + thumbnails.length) % thumbnails.length;
    const newThumb = thumbnails[currentSlide];
    const imageSrc = newThumb.querySelector("img").src.split("/").pop();
    changeImage(imageSrc, newThumb);
  };

  // Add click handlers to thumbnails
  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      const imageSrc = this.querySelector("img").src.split("/").pop();
      changeImage(imageSrc, this);
    });
  });

  // Add click handlers to prev/next buttons
  document
    .querySelector(".prev")
    .addEventListener("click", () => changeSlide(-1));
  document
    .querySelector(".next")
    .addEventListener("click", () => changeSlide(1));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "ArrowRight") changeSlide(1);
  });

  let touchstartX = 0;
  mainImage.addEventListener("touchstart", (e) => {
    touchstartX = e.changedTouches[0].screenX;
  });

  mainImage.addEventListener("touchend", (e) => {
    const touchendX = e.changedTouches[0].screenX;
    if (touchendX <= touchstartX) changeSlide(1);
    if (touchendX >= touchstartX) changeSlide(-1);
  });

  // Add quantity update function
  window.updateQuantity = function (change) {
    const quantityInput = document.getElementById("quantity");
    const newValue = parseInt(quantityInput.value) + change;
    if (newValue >= 1) {
      quantityInput.value = newValue;
    }
  };

  // Add auto-slideshow functionality
  let slideInterval;

  function startAutoSlide() {
    slideInterval = setInterval(() => {
      changeSlide(1);
    }, 1800);
  }

  function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
  }

  // Start auto-slideshow
  startAutoSlide();

  // Reset timer when user interacts with slideshow
  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", resetAutoSlide);
  });

  document.querySelector(".prev").addEventListener("click", resetAutoSlide);
  document.querySelector(".next").addEventListener("click", resetAutoSlide);

  // Reset timer on keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      resetAutoSlide();
    }
  });

  // Reset timer on touch interaction
  mainImage.addEventListener("touchstart", resetAutoSlide);

  // Pause slideshow when tab/window is not visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(slideInterval);
    } else {
      startAutoSlide();
    }
  });
});
