document.addEventListener("DOMContentLoaded", function () {
  // Range slider for frames
  const framesSlider = document.getElementById("numberOfFrames");
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
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;

  if (!latitude || !longitude) {
    // Only check map location if creating new apiary
    if (document.getElementById("selectedApiaryId").value === "new") {
      alert("Please select a location on the map");
      return false;
    }
  }

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

  // Add search control to the map
  const searchControl = L.Control.geocoder({
    defaultMarkGeocode: false,
    position: "topleft",
    placeholder: "Search for a location...",
  }).addTo(map);

  // Handle search results
  searchControl.on("markgeocode", function (e) {
    const location = e.geocode.center;
    updateLocation(location, e.geocode.name);
    map.setView(location, 13);
  });

  // Handle map clicks
  map.on("click", function (e) {
    const geocoder = L.Control.Geocoder.nominatim();
    geocoder.reverse(e.latlng, map.getMaxZoom(), function (results) {
      if (results && results.length > 0) {
        updateLocation(e.latlng, results[0].name);
      }
    });
  });
}

// New function to handle location updates
function updateLocation(latlng, address) {
  // Update or create marker
  if (marker) {
    map.removeLayer(marker);
  }
  marker = L.marker(latlng).addTo(map);

  // Update form fields
  document.getElementById("searchLocation").value = address;
  document.getElementById("latitude").value = latlng.lat.toFixed(6);
  document.getElementById("longitude").value = latlng.lng.toFixed(6);

  // Update status message
  const statusElement = document.getElementById("selectedLocation");
  statusElement.textContent = `Selected: ${address}`;
  statusElement.style.color = "#16404d";
  statusElement.classList.add("selected");
}

function toggleApiaryList() {
  const dropdownList = document.getElementById("apiaryList");
  dropdownList.classList.toggle("active");
}

function selectApiary(id, name, isNew) {
  const input = document.getElementById("apiaryInput");
  const idInput = document.getElementById("selectedApiaryId");
  const mapSection = document.getElementById("mapSection");
  const mapRequiredMark = document.getElementById("mapRequiredMark");
  const latitudeInput = document.getElementById("latitude");
  const longitudeInput = document.getElementById("longitude");

  if (isNew) {
    input.value = ""; // Clear the input field instead of setting it to "Create New Apiary"
    input.placeholder = "Enter new apiary name";
    input.focus();
    mapSection.classList.remove("disabled");
    mapRequiredMark.style.display = "inline";
    latitudeInput.required = true;
    longitudeInput.required = true;
  } else {
    input.value = name;
    input.placeholder = "Type or select apiary name";
    mapSection.classList.add("disabled");
    mapRequiredMark.style.display = "none";
    latitudeInput.required = false;
    longitudeInput.required = false;
    latitudeInput.value = "";
    longitudeInput.value = "";
  }

  idInput.value = id;
  const dropdownList = document.getElementById("apiaryList");
  dropdownList.classList.remove("active");
}

function filterApiaries(searchText) {
  const items = document.querySelectorAll(".dropdown-item");
  items.forEach((item) => {
    if (item.textContent.toLowerCase().includes(searchText.toLowerCase())) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

// Close dropdown when clicking outside
document.addEventListener("click", function (e) {
  const dropdown = document.querySelector(".custom-dropdown");
  const dropdownList = document.getElementById("apiaryList");
  if (!dropdown.contains(e.target)) {
    dropdownList.classList.remove("active");
  }
});

// Update form submission handler
document
  .querySelector(".upgrade-form")
  .addEventListener("submit", function (event) {
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
    <i class="fas fa-spinner fa-spin"></i>
    Processing your purchase...
  `;

    // Existing form submission code
    const selectedId = document.getElementById("selectedApiaryId").value;
    const apiaryInput = document.getElementById("apiaryInput");
    const apiaryName = document.getElementById("apiaryName");

    if (selectedId === "new") {
      if (!apiaryInput.value.trim()) {
        event.preventDefault();
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        Complete Purchase
      `;
        alert("Please enter an apiary name");
        apiaryInput.focus();
        return;
      }
      apiaryName.value = apiaryInput.value.trim();
    } else {
      apiaryName.value = apiaryInput.value;
    }
  });
