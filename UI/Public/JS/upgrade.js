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
  console.log("Map initializing..."); // Debug log
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 30.0444, lng: 31.2357 }, // Cairo coordinates
    zoom: 8,
    mapTypeControl: true,
    streetViewControl: false,
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
