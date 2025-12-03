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

    card.innerHTML = `
      <img src="${
        p.image || "https://via.placeholder.com/400x220?text=Property"
      }" style="width:100%; border-radius:8px; aspect-ratio:16/9; object-fit:cover;">
      <h3>${p.title}</h3>
      <p><strong>${currency(p.price)}</strong> • ${p.location}</p>
      <button class="btn mt-3" data-id="${p.id}">View Details</button>
    `;

    // if (p.booked > 0) {
    //   card.innerHTML += `<span class="badged booked
    //   background: red;
    //   color: white;
    //   padding: 4px 8px;
    //   border-radius: 4px;
    //   display: inline-block;
    //   margin-top: 8px;
    //   fontweight: bold;
    //   ">
    //   BOOKED
    //   </span>`;
    // }

    sList.appendChild(card);
  });

  // Handle View Details and Booking
  sList.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-id");
      const p = props.find((x) => x.id === id);
      if (!p) return;

      currentProp = p;

      sDetailsWrap.innerHTML = `
        <div class="details-inner mt-details">
          <div class="details-header">
            <h2>${p.title}</h2>
            <button class="btn outline" id="sCloseDetails">Close</button>
          </div>
          <img src="${
            p.image || "https://via.placeholder.com/1000x560?text=Property"
          }" style="width:100%; border-radius:12px; margin:12px 0; aspect-ratio:16/9; object-fit:cover;">
          <p><strong>Price:</strong> ${currency(p.price)}</p>
          <p><strong>Contact:</strong> <a href="tel:234${p.contact}"> +234 ${
        p.contact
      }</a></p>
          <p><strong>Location:</strong> ${p.location}</p>
          <p class="mt-2">${p.description || ""}</p>
          <div class="mt-4">
            <button class="btn" id="sBookNow">Book Now</button>
          </div>
        </div>
      `;

      sDetailsOverlay.style.display = "block";
      document.getElementById("sCloseDetails").onclick = () =>
        (sDetailsOverlay.style.display = "none");
      document.getElementById("sBookNow").onclick = () =>
        (sBookingModal.style.display = "flex");

      // Handle Confirm Booking
      document
        .getElementById("sConfirmBookingBtn")
        ?.addEventListener("click", async () => {
          const note = document.getElementById("sBkNote").value.trim();
          const booking = {
            id: genId("b"),
            property_id: currentProp.id,
            student_id: u.id,
            note,
            created_at: new Date().toISOString(),
          };
          await createBooking(booking);
          showToast("Booking sent ohhhhhh!", 4000);
          document.getElementById("sBkNote").value = "";
          sBookingModal.style.display = "none";
        });
    };
  });
}

//  Initialize
document.addEventListener("DOMContentLoaded", sRender);

window.addEventListener("click", (e) => {
  const sBookingModal = document.getElementById("sBookingModal");
  if (e.target === sBookingModal) sBookingModal.style.display = "none";
});
