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

// --- API Calls ---
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

// New API call to update profile
async function updateProfile(formData) {
  const res = await fetch("http://localhost:3000/update-profile", {
    method: "POST",
    body: formData, // Send as FormData to handle the file upload
    credentials: "include",
  });
  return res.ok ? res.json() : null;
}

// Updated sRender with "Skip" functionality
async function sRender() {
  const u = await requireStudent();
  if (!u) return;

  const profileSection = document.getElementById("profileSection");
  const sList = document.getElementById("sPropertyList");
  const studentHeader = document.getElementById("studentHeader");
  const cancelBtn = document.getElementById("cancelProfileBtn");

  // Show form if info is missing (Department or Reg No)
  if (!u.department || !u.regNo) {
    profileSection.style.display = "block";
    sList.style.display = "none";
    studentHeader.style.display = "none";

    // MODIFICATION: Always show the cancel button even on first login
    if (cancelBtn) {
      cancelBtn.style.display = "inline-block";
      cancelBtn.innerText = "Skip for Now"; // Make it clear it's optional
      cancelBtn.onclick = () => {
        // Force show the dashboard if they click skip
        showDashboardManually(u);
      };
    }
    setupProfileForm();
  } else {
    // Normal flow: Profile is already complete
    showDashboardManually(u);
  }
}

// New Helper function to render the dashboard view
function showDashboardManually(u) {
  const profileSection = document.getElementById("profileSection");
  const sList = document.getElementById("sPropertyList");
  const studentHeader = document.getElementById("studentHeader");

  profileSection.style.display = "none";
  sList.style.display = "grid";
  studentHeader.style.display = "flex";

  // Check if elements exist before setting text to avoid errors
  const nameEl = document.getElementById("userName");
  const deptEl = document.getElementById("userDept");
  const regEl = document.getElementById("userReg");
  const contactEl = document.getElementById("userContact");
  const avatar = document.getElementById("userAvatar");

  if (nameEl) nameEl.innerText = u.name || "Student";

  // Use "Not Set" or "N/A" if the data is missing from the u object
  if (deptEl) deptEl.innerText = u.department || "Department Not Set";
  if (regEl) regEl.innerText = u.regNo || "Reg No Not Set";
  if (contactEl) contactEl.innerText = u.contact || "Contact not set";

  if (avatar) {
    // If profileImage is missing OR null, use the placeholder
    avatar.src =
      u.profileImage && u.profileImage !== "null"
        ? `http://localhost:3000/${u.profileImage}`
        : "https://via.placeholder.com/80?text=User";
  }

  renderProperties();
}

// Keep your existing setupProfileForm and toggle functions...
function setupProfileForm() {
  const form = document.getElementById("profileForm");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const result = await updateProfile(formData);
    if (result) {
      showToast("Profile updated successfully!", "success", 4000);
      location.reload();
    } else {
      showToast("Failed to update profile. Please try again.", "error", 4000);
    }
  };
}

// Utility to allow editing later
function toggleProfileEdit() {
  const profileSection = document.getElementById("profileSection");
  const sList = document.getElementById("sPropertyList");
  const studentHeader = document.getElementById("studentHeader");
  const cancelBtn = document.getElementById("cancelProfileBtn");

  // Toggle visibility
  profileSection.style.display = "block";
  sList.style.display = "none";
  studentHeader.style.display = "none";

  if (cancelBtn) cancelBtn.style.display = "inline-block";
  setupProfileForm();
}

function closeProfileEdit() {
  sRender();
}
// --- Render Properties Logic ---
async function renderProperties() {
  const props = (await fetchProps()).filter((p) => p.verified);
  const sList = document.getElementById("sPropertyList");
  sList.innerHTML = "";

  if (!props.length) {
    sList.innerHTML = `<div class="card"><p class="center">No verified properties yet.</p></div>`;
    return;
  }

  props.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";

    let firstImage = "https://via.placeholder.com/400x220?text=Property";
    try {
      const imagesArray = JSON.parse(p.images || "[]");
      if (imagesArray.length) firstImage = imagesArray[0];
    } catch (err) {
      console.error("Error parsing images: ", err);
    }

    card.innerHTML = `
      <img src="${firstImage}" style="width:100%; border-radius:8px; aspect-ratio:16/9; object-fit:cover;">
      <h3 style="margin-top: 15px;">${p.title}</h3>
      <p style="margin-top: 15px;"><strong>${currency(p.price)}</strong> • ${p.location}</p>
      <button class="btn mt-2" data-id="${p.id}" disabled>View Details</button>
    `;
    sList.appendChild(card);
  });
  sList.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      handleViewDetails(e.currentTarget.dataset.id);
    });
  });
}

// --- Utilities ---
function currency(n) {
  n = Number(n) || 0;
  return "₦" + n.toLocaleString();
}

document.addEventListener("DOMContentLoaded", sRender);
