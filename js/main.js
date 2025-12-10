const listEl = document.getElementById("propertyList");
const detailsOverlay = document.getElementById("detailsOverlay");
const detailsWrap = document.getElementById("detailsWrap");
const bookingModal = document.getElementById("bookingModal");

let currentProp = null;

//  API Calls
async function fetchProps() {
  const res = await fetch("http://localhost:3000/properties");
  return res.ok ? res.json() : [];
}

async function fetchLogged() {
  const res = await fetch("http://localhost:3000/me", {
    credentials: "include", // if using cookies for session
  });
  return res.ok ? res.json() : null;
}

async function fetchBookings() {
  const res = await fetch("http://localhost:3000/bookings");
  return res.ok ? res.json() : [];
}

async function createBooking(booking) {
  const res = await fetch("http://localhost:3000/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    showToast(data.message || "Booking Failed!", "error", 4000);
    return null;
  }

  return data;
}
// Utilities
function genId(prefix = "b") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e5)}`;
}

function currency(n) {
  n = Number(n) || 0;
  return "₦" + n.toLocaleString();
}

//  Render Home
async function renderHome() {
  const props = await fetchProps();
  listEl.innerHTML = "";

  if (!props.length) {
    listEl.innerHTML = `<div class="card"><p class="center">No properties yet. Landlords can add from their dashboard.</p></div>`;
    return;
  }

  props.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = p.price;
    card.dataset.type = (p.type || "").toLowerCase();

    let firstImage = "https://via.placeholder.com/400x220?text=Property"; // a fallback image just incase the uploaded images did not show
    try {
      const imagesArray = JSON.parse(p.images || "[]");
      if (imagesArray.length) {
        firstImage = imagesArray[0];
      }
    } catch (err) {
      console.error("Error parsing images for property ID " + p.id + ": ", err);
    }

    card.innerHTML = `
      <img src="${firstImage}" style="width:100%; border-radius:8px; aspect-ratio:16/9; object-fit:cover;">
      <h3>${p.title}</h3>
      <p class="location" data-location=${p.location}><strong>${currency(
      p.price
    )}</strong> • ${p.location}</p>
     <p class="mt-2" style="display:flex; gap:8px; align-items:center;">
  <span class="badge ${p.verified ? "ok" : "warn"}">
    ${p.verified ? "Verified" : "Pending"}
  </span>

  ${
    p.booked
      ? `<span class="badge danger" style="background:green; color: white">Booked</span>`
      : ""
  }
  </p>
      <button class="btn mt-3" data-id="${p.id}">View Details</button>
    `;
    listEl.appendChild(card);
  });

  listEl.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      handleViewDetails(e.currentTarget.dataset.id);
    });
  });
}

//  Filters
function setupFilters() {
  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");

  priceRange.addEventListener("input", () => {
    priceValue.textContent = Number(priceRange.value).toLocaleString();
  });

  document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      const location = card
        .querySelector(".location")
        .dataset.location.toLowerCase();
      card.style.display = location.includes(query) ? "block" : "none";
    });
  });

  document.getElementById("type").addEventListener("change", function () {
    const selectedType = this.value.toLowerCase();
    document.querySelectorAll(".card").forEach((card) => {
      const type = (card.dataset.type || "").toLowerCase();
      card.style.display =
        selectedType === "all" || type === selectedType ? "block" : "none";
    });
  });

  priceRange.addEventListener("input", () => {
    const selectedValue = Number(priceRange.value);
    document.querySelectorAll(".card").forEach((card) => {
      const price = Number(card.dataset.value);
      card.style.display = price === selectedValue ? "block" : "none";
    });
  });
}

// For toast Notifications
function showToast(message, type = "success", duration = 7000) {
  const container = document.getElementById("toastContainer");
  if (!container) return console.error("Toast container missing");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // Choose icon
  const icon = type === "success" ? "✔️" : "❌";

  toast.innerHTML = `
    <i>${icon}</i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.classList.add("fadeOut");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// open map function
function openMap(location) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location
  )}`;
  window.open(url, "_blank");
}

// Property Details
async function handleViewDetails(id) {
  const u = await fetchLogged();
  if (!u || u.role !== "student") {
    showToast(
      "You must log in as a Student to view details and book.",
      "error",
      7000
    );
    return;
  }

  const props = await fetchProps();
  const p = props.find((x) => x.id.toString() === id);
  if (!p) {
    console.log("Property not found", id, propsx);
    return;
  }

  currentProp = p;

  let images = [];
  try {
    images = JSON.parse(p.images || "[]");
  } catch {
    images = p.images ? [p.images] : [];
  }

  if (!images.length) {
    images = ["https:://via.placeholder.com/1000x560?text=No+Image+Available"];
  }

  let sliderHTML = `
  <div class="slider-container">
     <button class="slide-btn" id="prevSlide">&#10094;</button>
      <div class="slider-track">
        ${images
          .map(
            (img) => `
          <img src="${img}" class="slide-img" />
        `
          )
          .join("")}
      </div>
      <button class="slide-btn" id="nextSlide">&#10095;</button>
    </div>
  `;

  detailsWrap.innerHTML = `
    <div class="details-inner">
      <div class="details-header">
        <h2>${p.title}</h2>
        <div>
          <span class="badge ${p.verified ? "ok" : "warn"}">${
    p.verified ? "Verified" : "Pending"
  }</span>
          <button class="btn outline" id="closeDetails">Close</button>
        </div>
      </div>

     ${sliderHTML}

      <p><strong>Price:</strong> ${currency(p.price)}</p>
      <p><strong>Contact:</strong> <a href="tel:234${p.contact}"> +234 ${
    p.contact
  }</a></p>
      <p><strong>Location:</strong> ${p.location}</p>
      <p class="mt-2">${p.description || ""}</p>
      
      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <div class="mt-4">
          <button class="btn" id="bookNow">Book Now</button>
        </div>
      <button class="btn mt-4" onclick="openMap('${
        p.location
      }')">View on Map</button>
      </div>
    </div>
  `;
  detailsOverlay.style.display = "block";

  document.getElementById("closeDetails").onclick = () =>
    (detailsOverlay.style.display = "none");
  document.getElementById("bookNow").onclick = openBooking;

  // slider logic
  const sliderContainer = detailsWrap.querySelector(".slider-container");
  const track = sliderContainer.querySelector(".slider-track");
  const slides = Array.from(track.querySelectorAll(".slide-img"));
  let index = 0;

  // Set widths using flex
  track.style.display = "flex";
  track.style.transition = "transform 0.4s ease";
  track.style.width = `${slides.length * 100}%`;

  slides.forEach((slide) => {
    slide.style.width = `${100 / slides.length}%`;
  });

  // Initialize first slide
  track.style.transform = `translateX(0%)`;

  // Update function
  function updateSlider() {
    track.style.transform = `translateX(-${index * (100 / slides.length)}%)`;
  }

  // Attach buttons using correct IDs
  document.getElementById("prevSlide").onclick = () => {
    index = index === 0 ? slides.length - 1 : index - 1;
    updateSlider();
  };

  document.getElementById("nextSlide").onclick = () => {
    index = index === slides.length - 1 ? 0 : index + 1;
    updateSlider();
  };
}
// Booking
function openBooking() {
  if (!currentProp) return;
  document.getElementById("bkTitle").textContent = currentProp.title;
  bookingModal.style.display = "flex";
}

function closeBooking() {
  bookingModal.style.display = "none";
}

async function confirmBooking() {
  const u = await fetchLogged();
  if (!u || u.role !== "student")
    return showToast("Login as student first.", 7000);

  const note = document.getElementById("bkNote").value.trim();
  const booking = {
    id: genId("b"),
    property_id: currentProp.id,
    student_id: u.id,
    note,
    booking_date: new Date().toISOString(),
  };

  const res = await createBooking(booking);

  if (res) {
    showToast("Booking sent to landlord!", "success", 7000);
    closeBooking();
  }
}
//Payment section - fluterwave or paystack(for mockup payment)
async function makePayment() {
  showToast(
    "Loading.... Payment section on it's way stay tuned!",
    "success",
    7000
  );
}

// Only run this if the forgot password form exists on this page
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  function toggleForgot() {
    const box = document.getElementById("forgot-box");
    box.style.display = box.style.display === "none" ? "block" : "none";
  }

  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);

    const payload = {
      name: form.get("fullname").trim(),
      email: form.get("email").trim(),
      role: form.get("role").trim(),
    };

    const res = await fetch("http://localhost:3000/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error resetting password");
      return;
    }

    document.getElementById("newPassValue").textContent = data.newPassword;
    document.getElementById("newPassBox").style.display = "block";
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await renderHome();
  setupFilters();
});

window.addEventListener("click", (e) => {
  if (e.target === bookingModal) closeBooking();
});
