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
      // Show confirmation modal
      const modal = document.getElementById("confirmationModal");
      modal.style.display = "flex";

      // Don't submit form automatically
      return false;
    }
  });

  // Validate location in form submission
  const originalValidateForm = validateForm;

  validateForm = function () {
    if (
      !document.getElementById("latitude").value ||
      !document.getElementById("longitude").value
    ) {
      alert("Please select a location on the map");
      return false;
    }
    return originalValidateForm();
  };
});

function closeConfirmation() {
  const modal = document.getElementById("confirmationModal");
  modal.style.display = "none";
  // Now submit the form and redirect
  document.querySelector(".upgrade-form").submit();
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
  console.log("Map initializing..."); // Debug log
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 30.0444, lng: 31.2357 }, // Cairo coordinates
    zoom: 8,
    mapTypeControl: true,
    streetViewControl: false
  });

  const searchInput = document.getElementById("searchLocation");
  const autocomplete = new google.maps.places.Autocomplete(searchInput);

  map.addListener("click", (e) => {
    placeMarker(e.latLng);
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      map.setCenter(place.geometry.location);
      placeMarker(place.geometry.location);
    }
  });
}

// Make sure initMap is globally available
window.initMap = initMap;

function placeMarker(location) {
  if (marker) {
    marker.setMap(null);
  }
  marker = new google.maps.Marker({
    position: location,
    map: map,
  });

  document.getElementById("latitude").value = location.lat();
  document.getElementById("longitude").value = location.lng();

  // Update display text
  updateLocationDisplay(location);
}

function updateLocationDisplay(location) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: location }, (results, status) => {
    if (status === "OK") {
      if (results[0]) {
        document.getElementById(
          "selectedLocation"
        ).textContent = `Selected: ${results[0].formatted_address}`;
      }
    }
  });
}
