// // Ensure only landlords access this page
async function requireLandlord() {
  const me = await fetchLogged();
  if (!me || me.role !== "landlord") {
    window.location.href = "login.html?next=" + encodeURIComponent(location.pathname);
    return null;
  }
  return me;
}

async function fetchLogged() {
  const res = await fetch("http://localhost:3000/me", { credentials: "include" });
  return res.ok ? res.json() : null;
}

async function fetchProps() {
  const res = await fetch("http://localhost:3000/properties");
  return res.ok ? res.json() : [];
}

// --- 2. API ACTIONS ---

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

// --- 3. RENDERING & UI LOGIC ---

async function lRender() {
  const me = await requireLandlord();
  if (!me) return;

  const profileSection = document.getElementById("landlordProfileSection");
  const landlordHeader = document.getElementById("landlordHeader");
  const mainDashboard = document.getElementById("mainDashboard");
  const addPropertyWrapper = document.getElementById("addPropertyWrapper");

  // Step A: Check if profile is incomplete
  if (!me.contact) {
    profileSection.style.display = "block";
    landlordHeader.style.display = "none";
    mainDashboard.style.display = "none";
    addPropertyWrapper.style.display = "none";
    setupProfileForm();
  } 
  // Step B: Profile is complete, show dashboard
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
    const mainImage = images.length ? images[0] : "https://via.placeholder.com/200";

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
      if (success) lRender(); // Refresh everything
    };
  });
}

// --- 4. FORM HANDLERS & TOGGLES ---

function setupProfileForm() {
  const form = document.getElementById("landlordProfileForm");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(new FormData(form));
    if (result) {
      alert("Profile updated!");
      location.reload();
    } else {
      alert("Error updating profile.");
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
      toggleAddForm(); // Hide form
      renderMyProps(me);
    }
  };
}

function toggleAddForm() {
  const wrap = document.getElementById("addPropertyWrapper");
  wrap.style.display = wrap.style.display === "none" ? "block" : "none";
  if (wrap.style.display === "block") wrap.scrollIntoView({ behavior: "smooth" });
}

function toggleProfileEdit() {
  document.getElementById("landlordProfileSection").style.display = "block";
  document.getElementById("mainDashboard").style.display = "none";
  document.getElementById("landlordHeader").style.display = "none";
  document.getElementById("addPropertyWrapper").style.display = "none";
}

function currency(n) {
  return "₦" + (Number(n) || 0).toLocaleString();
}

// Start
document.addEventListener("DOMContentLoaded", lRender);