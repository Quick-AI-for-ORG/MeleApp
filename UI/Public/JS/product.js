document.addEventListener("DOMContentLoaded", function () {
  const mainImage = document.getElementById("mainImage");
  const thumbnails = document.querySelectorAll(".thumbnail");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  let currentIndex = 0;

  // Hide navigation if less than 2 images
  if (thumbnails.length <= 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    return; // Exit if there's only one image
  }

  // Function to update image
  function updateImage(index) {
    // Remove active class from all thumbnails
    thumbnails.forEach((thumb) => thumb.classList.remove("active"));

    // Add active class to current thumbnail
    thumbnails[index].classList.add("active");

    // Update main image
    const newImageSrc = thumbnails[index].querySelector("img").src;
    mainImage.src = newImageSrc;

    currentIndex = index;
  }

  // Previous button click
  prevBtn.addEventListener("click", () => {
    let newIndex = currentIndex - 1;
    if (newIndex < 0) newIndex = thumbnails.length - 1;
    updateImage(newIndex);
  });

  // Next button click
  nextBtn.addEventListener("click", () => {
    let newIndex = currentIndex + 1;
    if (newIndex >= thumbnails.length) newIndex = 0;
    updateImage(newIndex);
  });

  // Thumbnail clicks
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => updateImage(index));
  });

  // Arrow key navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevBtn.click();
    if (e.key === "ArrowRight") nextBtn.click();
  });

  // Auto slideshow
  let slideInterval = setInterval(() => nextBtn.click(), 180000); // 3 minutes

  // Pause slideshow on user interaction
  function resetSlideshow() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => nextBtn.click(), 180000);
  }

  // Add event listeners to reset slideshow
  [prevBtn, nextBtn].forEach((btn) => {
    btn.addEventListener("click", resetSlideshow);
  });

  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", resetSlideshow);
  });

  // Quantity control
  window.updateQuantity = function (change) {
    const quantityInput = document.getElementById("quantity");
    const newValue = parseInt(quantityInput.value) + change;
    if (newValue >= 1) quantityInput.value = newValue;
  };
});
