// // Ensure only landlords access this page
// async function requireLandlord() {
//   const me = await fetchLogged();
//   if (!me || me.role !== "landlord") {
//     window.location.href =
//       "login.html?next=" + encodeURIComponent(location.pathname);
//     return null;
//   }
//   return me;
// }

// // API Calls
// async function fetchProps() {
//   const res = await fetch("http://localhost:3000/properties");
//   return res.ok ? res.json() : [];
// }

// async function createProp(fd) {
//   const res = await fetch("http://localhost:3000/properties", {
//     method: "POST",
//     body: fd,
//     credentials: "include",
//   });
//   return res.ok ? res.json() : null;
// }

// async function deleteProp(id) {
//   const res = await fetch(`http://localhost:3000/properties/${id}`, {
//     method: "DELETE",
//     credentials: "include",
//   });
//   return res.ok;
// }

// async function fetchLogged() {
//   const res = await fetch("http://localhost:3000/me", {
//     credentials: "include",
//   });
//   return res.ok ? res.json() : null;
// }

// // function genId(prefix = "prop") {
// //   return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e5)}`;
// // }

// //  Utilities
// function currency(n) {
//   n = Number(n) || 0;
//   return "₦" + n.toLocaleString();
// }

// async function renderMyProps(me) {
//   const props = (await fetchProps()).filter((p) => p.landlord_id === me.id);
//   const myTableBody = document.getElementById("myPropsTBody");
//   myTableBody.innerHTML = "";

//   if (!props.length) {
//     myTableBody.innerHTML = `<tr><td colspan="7" class="center">No properties yet.</td></tr>`;
//     return;
//   }

//   props.forEach((p) => {
//     const images = p.images ? JSON.parse(p.images) : [];
//     const mainImage = images.length
//       ? images[0]
//       : "https://via.placeholder.com/200";

//     const tr = document.createElement("tr");

//     tr.innerHTML = `
//       <td>${p.title}</td>
//       <td><img src="${mainImage}" alt="Property" style="width:70px;height:55px;border-radius:10px;object-fit:cover;" /></td>
//       <td>${currency(p.price)}</td>
//       <td>${p.contact}</td>
//       <td>${p.location}</td>
//       <td>${p.verified ? "Yes" : "No"}</td>

//       <td>${new Date(p.createdAt).toLocaleString()}</td>
//         <td>${
//           Number(p.booked) > 0
//             ? `<span class="badge booked">${p.booked} Booked</span>`
//             : '<span class="badge available">Available</span>'
//         }</td>
//       <td>
//         <button class="btn danger" data-del="${p.id}">Delete</button>
//       </td>
//     `;
//     myTableBody.appendChild(tr);
//   });

//   // Delete buttons
//   myTableBody.querySelectorAll("[data-del]").forEach((btn) => {
//     btn.onclick = async () => {
//       if (!confirm("Delete this property?")) return;
//       const id = btn.getAttribute("data-del");
//       const success = await deleteProp(id);
//       if (success) renderMyProps(me);
//       else showToast("Failed to delete property.", 4000);
//     };
//   });
// }

// // Handle Form Submission
// async function setupForm(me) {
//   const form = document.getElementById("propForm");

//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const fd = new FormData(form);

//     fd.append("landlord_id", me.id);

//     const result = await createProp(fd);

//     if (!result || !result.success) {
//       showToast(
//         "Property added! It’s now visible on the homepage (Pending verification).",
//         "success",
//         7000
//       );
//     } else {
//       return showToast("Failed to add property.", "error", 7000);
//       form.reset();
//       renderMyProps(me);
//     }
//   });
// }

// // Initialize
// document.addEventListener("DOMContentLoaded", async () => {
//   const me = await requireLandlord();
//   if (!me) return; // redirect already handled
//   await renderMyProps(me);
//   await setupForm(me);
// });


// // Ensure only landlords access this page
// async function requireLandlord() {
//   const me = await fetchLogged();
//   if (!me || me.role !== "landlord") {
//     window.location.href = "login.html?next=" + encodeURIComponent(location.pathname);
//     return null;
//   }
//   return me;
// }

// // API Calls
// async function fetchProps() {
//   const res = await fetch("http://localhost:3000/properties");
//   return res.ok ? res.json() : [];
// }

// async function createProp(fd) {
//   const res = await fetch("http://localhost:3000/properties", {
//     method: "POST",
//     body: fd,
//     credentials: "include",
//   });
//   return res.ok ? res.json() : null;
// }

// async function deleteProp(id) {
//   const res = await fetch(`http://localhost:3000/properties/${id}`, {
//     method: "DELETE",
//     credentials: "include",
//   });
//   return res.ok;
// }

// async function fetchLogged() {
//   const res = await fetch("http://localhost:3000/me", {
//     credentials: "include",
//   });
//   return res.ok ? res.json() : null;
// }

// // New API Call for Profile Update
// async function updateProfile(formData) {
//   const res = await fetch("http://localhost:3000/update-profile", {
//     method: "POST",
//     body: formData,
//     credentials: "include",
//   });
//   return res.ok ? res.json() : null;
// }

// // Utilities
// function currency(n) {
//   n = Number(n) || 0;
//   return "₦" + n.toLocaleString();
// }

// // --- RENDERING LOGIC ---

// async function renderMyProps(me) {
//   const props = (await fetchProps()).filter((p) => p.landlord_id === me.id);
//   const myTableBody = document.getElementById("myPropsTBody");
//   myTableBody.innerHTML = "";

//   if (!props.length) {
//     myTableBody.innerHTML = `<tr><td colspan="9" class="center">No properties yet.</td></tr>`;
//     return;
//   }

//   props.forEach((p) => {
//     const images = p.images ? JSON.parse(p.images) : [];
//     const mainImage = images.length ? images[0] : "https://via.placeholder.com/200";

//     const tr = document.createElement("tr");
//     tr.innerHTML = `
//       <td>${p.title}</td>
//       <td><img src="${mainImage}" alt="Property" style="width:70px;height:55px;border-radius:10px;object-fit:cover;" /></td>
//       <td>${currency(p.price)}</td>
//       <td>${p.contact}</td>
//       <td>${p.location}</td>
//       <td>${p.verified ? "Yes" : "No"}</td>
//       <td>${new Date(p.createdAt).toLocaleString()}</td>
//       <td>${Number(p.booked) > 0 ? `<span class="badge booked">${p.booked} Booked</span>` : '<span class="badge available">Available</span>'}</td>
//       <td><button class="btn danger" data-del="${p.id}">Delete</button></td>
//     `;
//     myTableBody.appendChild(tr);
//   });

//   myTableBody.querySelectorAll("[data-del]").forEach((btn) => {
//     btn.onclick = async () => {
//       if (!confirm("Delete this property?")) return;
//       const id = btn.getAttribute("data-del");
//       const success = await deleteProp(id);
//       if (success) renderMyProps(me);
//       else alert("Failed to delete property.");
//     };
//   });
// }

// // Handle Add Property Form
// async function setupForm(me) {
//   const form = document.getElementById("propForm");
//   form.onsubmit = async (e) => {
//     e.preventDefault();
//     const fd = new FormData(form);
//     fd.append("landlord_id", me.id);

//     const result = await createProp(fd);
//     if (result) {
//       alert("Property added successfully!");
//       form.reset();
//       toggleAddForm(); // Hide form after adding
//       renderMyProps(me);
//     } else {
//       alert("Failed to add property.");
//     }
//   };
// }

// // Handle Profile Update Form
// function setupProfileForm() {
//   const form = document.getElementById("landlordProfileForm");
//   form.onsubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(form);
//     const result = await updateProfile(formData);
//     if (result) {
//       alert("Profile updated!");
//       location.reload();
//     } else {
//       alert("Failed to update profile.");
//     }
//   };
// }

// // --- TOGGLES ---

// function toggleAddForm() {
//   const wrap = document.getElementById("addPropertyWrapper");
//   wrap.style.display = wrap.style.display === "none" ? "block" : "none";
// }

// function toggleProfileEdit() {
//   document.getElementById("landlordProfileSection").style.display = "block";
//   document.getElementById("mainDashboard").style.display = "none";
//   document.getElementById("landlordHeader").style.display = "none";
// }

// // --- INITIALIZE ---

// async function lRender() {
//   const me = await requireLandlord();
//   if (!me) return;

//   const profileSection = document.getElementById("landlordProfileSection");
//   const mainDashboard = document.getElementById("mainDashboard");
//   const landlordHeader = document.getElementById("landlordHeader");

//   // Check if contact is missing to show profile form first
//   if (!me.contact) {
//     profileSection.style.display = "block";
//     mainDashboard.style.display = "none";
//     landlordHeader.style.display = "none";
//     setupProfileForm();
//   } else {
//     profileSection.style.display = "none";
//     mainDashboard.style.display = "block";
//     landlordHeader.style.display = "flex";

//     // Populate Header details
//     document.getElementById("landlordName").innerText = me.name || "Landlord";
//     document.getElementById("landlordContact").innerText = me.contact;
//     document.getElementById("landlordAvatar").src = me.profileImage 
//       ? `http://localhost:3000/${me.profileImage}` 
//       : "https://via.placeholder.com/80?text=User";

//     renderMyProps(me);
//     setupForm(me);
//   }
// }

// document.addEventListener("DOMContentLoaded", lRender);


// --- 1. AUTH & DATA FETCHING ---

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
      alert("Property added successfully!");
      form.reset();
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