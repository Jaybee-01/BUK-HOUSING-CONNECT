// Ensure only students access this page
async function requireStudent() {
  const u = await fetchLogged();
  if (!u || u.role !== "student") {
    window.location.href =
      "login.html?next=" + encodeURIComponent(location.pathname);
    return null;
  }
  return u;
}

//  API Calls
async function fetchProps() {
  const res = await fetch("http://localhost:3000/properties");
  return res.ok ? res.json() : [];
}

async function fetchLogged() {
  const res = await fetch("http://localhost:3000/me", {
    credentials: "include",
  });
  return res.ok ? res.json() : null;
}

async function createBooking(booking) {
  const res = await fetch("http://localhost:3000/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
    credentials: "include",
  });
  return res.ok ? res.json() : null;
}

//  Utilities
function genId(prefix = "b") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e5)}`;
}

function currency(n) {
  n = Number(n) || 0;
  return "₦" + n.toLocaleString();
}

//  Render Properties
async function sRender() {
  const u = await requireStudent();
  if (!u) return;

  const props = (await fetchProps()).filter((p) => p.verified);
  const sList = document.getElementById("sPropertyList");
  const sDetailsOverlay = document.getElementById("sDetailsOverlay");
  const sDetailsWrap = document.getElementById("sDetailsWrap");
  const sBookingModal = document.getElementById("sBookingModal");

  let currentProp = null;

  sList.innerHTML = "";
  if (!props.length) {
    sList.innerHTML = `<div class="card"><p class="center">No verified properties yet.</p></div>`;
    return;
  }

  props.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";

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
      <img src="${firstImage || "https://via.placeholder.com/400x220?text=Property"
      }" style="width:100%; border-radius:8px; aspect-ratio:16/9; object-fit:cover;">
      <h3 style="margin-top: 15px;">${p.title}</h3>
      <p style="margin-top: 15px;"><strong>${currency(p.price)}</strong> • ${p.location}</p>
      <button class="btn mt-2" data-id="${p.id}" disabled>View Details</button>
    `;
    sList.appendChild(card);
  });
}

//  Initialize
document.addEventListener("DOMContentLoaded", sRender);

window.addEventListener("click", (e) => {
  const sBookingModal = document.getElementById("sBookingModal");
  if (e.target === sBookingModal) sBookingModal.style.display = "none";
});
