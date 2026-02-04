// Ensure only landlords access this page
async function requireLandlord() {
  const me = await fetchLogged();
  if (!me || me.role !== "landlord") {
    window.location.href =
      "login.html?next=" + encodeURIComponent(location.pathname);
    return null;
  }
  return me;
}

async function fetchLogged() {
  const res = await fetch("http://localhost:3000/me", {
    credentials: "include",
  });
  return res.ok ? res.json() : null;
}

async function fetchProps() {
  const res = await fetch("http://localhost:3000/properties");
  return res.ok ? res.json() : [];
}

// API ACTIONS 
async function updateProfile(formData) {
  const res = await fetch("http://localhost:3000/update-profile", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  return res.ok ? res.json() : null;
}

async function createProp(fd) {
  const res = await fetch("http://localhost:3000/properties", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  return res.ok ? res.json() : null;
}

async function deleteProp(id) {
  const res = await fetch(`http://localhost:3000/properties/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.ok;
}

// render landlord on the interface
async function lRender() {
  const me = await requireLandlord();
  if (!me) return;

  const profileSection = document.getElementById("landlordProfileSection");
  const landlordHeader = document.getElementById("landlordHeader");
  const mainDashboard = document.getElementById("mainDashboard");
  const addPropertyWrapper = document.getElementById("addPropertyWrapper");
  const cancelBtn = document.getElementById("cancelLandlordEdit");

  // Check if profile is incomplete
  if (!me.contact) {
    profileSection.style.display = "block";
    landlordHeader.style.display = "none";
    mainDashboard.style.display = "none";
    addPropertyWrapper.style.display = "none";
    if (cancelBtn) cancelBtn.style.display = "none";
    setupProfileForm();
  }
  // Profile is complete, show dashboard
  else {
    profileSection.style.display = "none";
    landlordHeader.style.display = "flex";
    mainDashboard.style.display = "block";

    // Update Header Data
    document.getElementById("landlordName").innerText = me.name || "Landlord";
    document.getElementById("landlordContact").innerText = me.contact;

    const avatar = document.getElementById("landlordAvatar");
    avatar.src = me.profileImage
      ? `http://localhost:3000/${me.profileImage}`
      : "https://via.placeholder.com/80?text=Host";

    renderMyProps(me);
    setupAddPropertyForm(me);
  }
}

async function renderMyProps(me) {
  const props = (await fetchProps()).filter((p) => p.landlord_id === me.id);
  const myTableBody = document.getElementById("myPropsTBody");
  myTableBody.innerHTML = "";

  if (!props.length) {
    myTableBody.innerHTML = `<tr><td colspan="9" class="center">No properties yet.</td></tr>`;
    return;
  }

  props.forEach((p) => {
    const images = p.images ? JSON.parse(p.images) : [];
    const mainImage = images.length
      ? images[0]
      : "https://via.placeholder.com/200";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.title}</td>
      <td><img src="${mainImage}" alt="Property" style="width:70px;height:55px;border-radius:10px;object-fit:cover;" /></td>
      <td>${currency(p.price)}</td>
      <td>${p.contact}</td>
      <td>${p.location}</td>
      <td>${p.verified ? "Yes" : "No"}</td>
      <td>${new Date(p.createdAt).toLocaleDateString()}</td>
      <td>${Number(p.booked) > 0 ? '<span class="badge booked">Booked</span>' : '<span class="badge available">Available</span>'}</td>
      <td><button class="btn danger" data-del="${p.id}">Delete</button></td>
    `;
    myTableBody.appendChild(tr);
  });

  // Handle Deletion
  myTableBody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm("Delete this property?")) return;
      const success = await deleteProp(btn.dataset.del);
      if (success) lRender();
    };
  });
}

// show the bookings from student
async function renderLandlordBookings() {
  const tbody = document.getElementById("landlordBookingsTBody");
  const res = await fetch("http://localhost:3000/bookings/landlord", {
    credentials: "include",
  });
  const bookings = res.ok ? await res.json() : [];

  tbody.innerHTML = "";

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="center">No bookings received yet.</td></tr>`;
    return;
  }

  bookings.forEach((b) => {
    // console.log("Booking Row:", b);
    const tr = document.createElement("tr");

    const rawDate = b.createdAt;


    let displayDate = "N/A";
    if (rawDate) {
      const dateObj = new Date(rawDate);
      if (!isNaN(dateObj.getTime())) {
        displayDate = dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }

    tr.innerHTML = `
      <td>${b.property_title}</td>
      <td>${b.student_name}</td>
      <td>${b.student_email}</td>
      <td>${b.student_contact || "No Contact Provided"}</td>
      <td>${displayDate}</td>
      <td><span class="badge ok">Confirmed</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// Handles forms and toggles
function setupProfileForm() {
  const form = document.getElementById("landlordProfileForm");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const result = await updateProfile(formData);

    if (result) {
      showToast("Profile updated!", "success", 4000);
      location.reload();
    } else {
      showToast("Error updating profile.", "error", 4000);
    }
  };
}

function setupAddPropertyForm(me) {
  const form = document.getElementById("propForm");
  // Set default contact from profile
  form.querySelector('[name="contact"]').value = me.contact;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    fd.append("landlord_id", me.id);

    const result = await createProp(fd);
    if (result) {
      showToast("Property added successfully!", "success", 4000);
      // form.reset();
      toggleAddForm();
      renderMyProps(me);
    }
  };
}

function toggleAddForm() {
  const wrap = document.getElementById("addPropertyWrapper");
  wrap.style.display = wrap.style.display === "none" ? "block" : "none";
  if (wrap.style.display === "block")
    wrap.scrollIntoView({ behavior: "smooth" });
}

function toggleProfileEdit() {
  // Fetch current user data from the global 'me' or re-fetch
  // Assuming 'me' is available or you re-fetch it:
  fetchLogged().then((me) => {
    document.getElementById("landlordProfileSection").style.display = "block";
    document.getElementById("mainDashboard").style.display = "none";
    document.getElementById("landlordHeader").style.display = "none";
    document.getElementById("addPropertyWrapper").style.display = "none";

    const cancelBtn = document.getElementById("cancelLandlordEdit");
    if (cancelBtn) cancelBtn.style.display = "inline-block";

    // PRE-FILL THE CONTACT FIELD
    const contactInput = document.querySelector(
      '#landlordProfileForm [name="contact"]',
    );
    if (contactInput) contactInput.value = me.contact || "";
  });
}

function toggleBookingsTable() {
  const section = document.getElementById("landlordBookingsSection");
  if (section.style.display === "none") {
    section.style.display = "block";
    section.scrollIntoView({ behavior: "smooth" });
    renderLandlordBookings(); // Function to fetch and show data
  } else {
    section.style.display = "none";
  }
}

function closeLandlordEdit() {
  lRender();
}
function currency(n) {
  return "₦" + (Number(n) || 0).toLocaleString();
}

// Start
document.addEventListener("DOMContentLoaded", lRender);
