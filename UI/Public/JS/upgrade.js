document.addEventListener("DOMContentLoaded", function () {
  // Range slider for frames
  const framesSlider = document.getElementById("framesCount");
  const framesOutput = document.getElementById("framesOutput");

  framesSlider.addEventListener("input", function () {
    framesOutput.textContent = `${this.value} frames`;
  });

  // Prevent unchecking readonly checkboxes
  document
    .querySelectorAll('input[type="checkbox"][readonly]')
    .forEach((checkbox) => {
      checkbox.addEventListener("click", function (e) {
        e.preventDefault();
        return false;
      });
    });

  // Form validation
  const form = document.querySelector(".upgrade-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (validateForm()) {
      // Submit form data using fetch
      fetch("/keeper/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiaryName: document.getElementById("apiaryName").value,
          hivesCount: document.getElementById("hivesCount").value,
          latitude: document.getElementById("latitude").value,
          longitude: document.getElementById("longitude").value,
          kitSelection: Array.from(
            document.querySelectorAll('input[name="kitSelection"]:checked')
          ).map((input) => input.value),
          framesCount: document.getElementById("framesCount").value,
          length: document.getElementById("length").value,
          width: document.getElementById("width").value,
          height: document.getElementById("height").value,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const modal = document.getElementById("confirmationModal");
            modal.style.display = "flex";
          } else {
            alert("Failed to process upgrade request. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred. Please try again.");
        });
    }
  });

  initMap();
});

function closeConfirmation() {
  const modal = document.getElementById("confirmationModal");
  modal.style.display = "none";
  // Remove the form submission and just reset the form
  document.querySelector(".upgrade-form").reset();
}

function validateForm() {
  const length = document.getElementById("length").value;
  const width = document.getElementById("width").value;
  const height = document.getElementById("height").value;
  const agreement = document.getElementById("agreement");

  if (length <= 0 || width <= 0 || height <= 0) {
    alert("Please enter valid dimensions");
    return false;
  }

  if (!agreement.checked) {
    alert("Please agree to the terms and conditions");
    return false;
  }

  return true;
}

let map;
let marker;

function initMap() {
  // Initialize the map
  map = L.map("map").setView([30.0444, 31.2357], 8); // Cairo coordinates

  // Add OpenStreetMap tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Add geocoding control
  const geocoder = L.Control.geocoder({
    defaultMarkGeocode: false,
  }).addTo(map);

  // Handle geocoding results
  geocoder.on("markgeocode", function (e) {
    const latlng = e.geocode.center;
    placeMarker(latlng);
    map.setView(latlng, 13);
  });

  // Handle map clicks
  map.on("click", function (e) {
    placeMarker(e.latlng);
  });

  // Initialize search input
  const searchInput = document.getElementById("searchLocation");
  searchInput.addEventListener("change", function () {
    geocoder.geocode(this.value);
  });
}

function placeMarker(latlng) {
  if (marker) {
    map.removeLayer(marker);
  }

  marker = L.marker(latlng).addTo(map);

  document.getElementById("latitude").value = latlng.lat;
  document.getElementById("longitude").value = latlng.lng;

  // Update location display
  updateLocationDisplay(latlng);
}

function updateLocationDisplay(latlng) {
  // Use Leaflet's geocoding control to get address
  const geocoder = L.Control.Geocoder.nominatim();
  geocoder.reverse(latlng, map.getMaxZoom(), function (results) {
    if (results && results.length > 0) {
      document.getElementById(
        "selectedLocation"
      ).textContent = `Selected: ${results[0].name}`;
    }
  });
}
