//  Utilities
function currency(n) {
  n = Number(n) || 0;
  return "₦" + n.toLocaleString();
}

// Fetch API
async function fetchProps() {
  const res = await fetch("http://localhost:3000/properties", {
    credentials: "include",
  });
  return res.ok ? res.json() : [];
}

async function toggleBooked(id) {
  try {
    const res = await fetch(
      `http://localhost:3000/properties/toggle-booked/${id}`,
      {
        method: "POST",
        credentials: "include", // THIS IS MANDATORY to send cookies
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return res.ok;
  } catch (err) {
    console.error("Fetch error:", err);
    return false;
  }
}
async function verifyProperty(id) {
  await fetch(`http://localhost:3000/properties/${id}/verify`, {
    method: "PATCH",
    credentials: "include",
  });
}

// Delete property function
async function deleteProperty(id) {
  try {
    const res = await fetch(`http://localhost:3000/properties/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return res.ok;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function fetchLandlords() {
  const res = await fetch("http://localhost:3000/users?role=landlord", {
    credentials: "include",
  });
  return res.ok ? res.json() : [];
}

async function fetchStudent() {
  const res = await fetch("http://localhost:3000/users?role=student", {
    credentials: "include",
  });
  return res.ok ? res.json() : [];
}

async function deleteLandlord(id) {
  try {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    // If the request was successful (2xx status)
    if (res.ok) {
      return true;
    }
    // Attempt to read backend error (optional)
    try {
      const errorData = await res.json();
      console.error("Delete failed:", errorData);
    } catch (_) {
      console.error("Delete failed: Unknown backend error");
    }

    return false;
  } catch (err) {
    console.error("Network error while deleting:", err);
    return false;
  }
}

// handle view details
async function handleViewDetails(id) {
  const props = await fetchProps();
  const p = props.find((x) => x.id.toString() === id);
  if (!p) {
    showToast("Property not found", "error");
    return;
  }

  // Define global-like variables if not already defined at the top of admin.js
  const detailsOverlay = document.getElementById("detailsOverlay");
  const detailsWrap = document.getElementById("detailsWrap");

  let images = [];
  try {
    images = JSON.parse(p.images || "[]");
  } catch {
    images = p.images ? [p.images] : [];
  }

  if (!images.length) {
    images = ["https://via.placeholder.com/1000x560?text=No+Image+Available"];
  }

  let sliderHTML = `
  <div class="slider-container">
     <button class="slide-btn" id="prevSlide">&#10094;</button>
      <div class="slider-track">
        ${images.map(img => `<img src="${img}" class="slide-img" />`).join("")}
      </div>
     <button class="slide-btn" id="nextSlide">&#10095;</button>
    </div>
  `;

  detailsWrap.innerHTML = `
    <div class="details-inner">
      <div class="details-header">
        <h2>${p.title}</h2>
        <div>
          <span class="badge ${p.verified ? "ok" : "warn"}">${p.verified ? "Verified" : "Pending"}</span>
          <button class="btn outline" id="closeDetails">Close</button>
        </div>
      </div>
      ${sliderHTML}
      <p><strong>Price:</strong> ${currency(p.price)}</p>
      <p><strong>Landlord:</strong> ${p.landlord_email}</p>
      <p><strong>Contact:</strong> <a href="tel:234${p.contact}"> +234 ${p.contact}</a></p>
      <p><strong>Location:</strong> ${p.location}</p>
      <p class="mt-2">${p.description || "No description provided."}</p>
      
      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:20px;">
        <a href="${p.live_location_link}" target="_blank" class="btn" rel="noopener noreferrer" style="text-decoration: none;">
            View on Map
        </a>
      </div>
    </div>
  `;

  detailsOverlay.style.display = "block";

  document.getElementById("closeDetails").onclick = () => (detailsOverlay.style.display = "none");

  // Slider Logic
  const track = detailsWrap.querySelector(".slider-track");
  const slides = Array.from(track.querySelectorAll(".slide-img"));
  let index = 0;

  track.style.display = "flex";
  track.style.transition = "transform 0.4s ease";
  track.style.width = `${slides.length * 100}%`;
  slides.forEach(slide => { slide.style.width = `${100 / slides.length}%`; });

  function updateSlider() {
    track.style.transform = `translateX(-${index * (100 / slides.length)}%)`;
  }

  document.getElementById("prevSlide").onclick = () => {
    index = index === 0 ? slides.length - 1 : index - 1;
    updateSlider();
  };

  document.getElementById("nextSlide").onclick = () => {
    index = index === slides.length - 1 ? 0 : index + 1;
    updateSlider();
  };
}
async function deleteStudent(id) {
  try {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    // If the request was successful (2xx status)
    if (res.ok) {
      return true;
    }
    // Attempt to read backend error (optional)
    try {
      const errorData = await res.json();
      console.error("Delete failed:", errorData);
    } catch (_) {
      console.error("Delete failed: Unknown backend error");
    }

    return false;
  } catch (err) {
    console.error("Network error while deleting:", err);
    return false;
  }
}

// Rendering the Properties on dashboard
async function renderProps() {
  const propsBody = document.getElementById("allPropsTBody");
  const props = await fetchProps();

  propsBody.innerHTML = "";
  if (props.length === 0) {
    propsBody.innerHTML = `<tr><td colspan="9" class="center">No properties found.</td></tr>`;
    return;
  }

  props.forEach((p) => {
    // console.log(p.id, p.booked); //Shows the id and if its bookes(1 yes 0 no)

    const tr = document.createElement("tr");
    const created = p.createdAt || p.created_at;
    const isBooked = Number(p.booked) > 0;

    tr.innerHTML = `
      <td>${p.title}</td>
      <td>${currency(p.price)}</td>
      <td>${p.location}</td>
      <td>${p.landlord_email}</td>
     
      <td>${p.verified
        ? '<span class="badge ok">Yes</span>'
        : '<span class="badge warn">No</span>'
      }</td>
      <td>
        <button class="btn info" data-view="${p.id}">View</button>
      </td>

      <td>${created ? new Date(created).toLocaleString() : "N/A"}</td>
      <td>
      <button class="btn ${isBooked ? "warn" : "success"}" data-booked="${p.id}">
        ${isBooked ? "Unbook" : "Book"}
      </button>
      </td>


      <td><button class="btn ok" data-verify="${p.id}">${p.verified ? "Unverify" : "Verify"
      }</button></td>
      <td><button class="btn danger" data-del="${p.id}">Delete</button></td>
    `;
    propsBody.appendChild(tr);
  });
  // ADDED: Listener for the new booking toggle button
  propsBody.querySelectorAll("[data-booked]").forEach((btn) => {
    btn.onclick = async (e) => {
      const id = btn.getAttribute("data-booked");
      const ok = await toggleBooked(id); // You'll need the toggleBooked API function
      if (ok) {
        showToast("Status updated", "success", 2000);
        renderProps();
      } else {
        showToast("Failed to update status", "error", 2000);
      }
    };
  });

  // View details buttons
  propsBody.querySelectorAll("[data-view]").forEach((btn) => {
  btn.onclick = () => {
    const id = btn.getAttribute("data-view");
    handleViewDetails(id);
  };
});

  // To verify/unverify and delete buttons
  propsBody.querySelectorAll("[data-verify]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-verify");
      await verifyProperty(id);
      renderProps();
    };
  });

  // delete property buttons
  propsBody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-del");

      // Show confirmation modal
      const overlay = document.getElementById("confirmOverlay2");
      overlay.style.display = "flex";

      // YES button
      document.getElementById("confirmYes2").onclick = async () => {
        overlay.style.display = "none";

        const ok = await deleteProperty(id);

        if (ok) {
          showToast("Property deleted successfully", "success", 2000);
          renderProps();
        } else {
          showToast("Failed to delete property", "error", 2000);
        }
      };

      // NO button
      document.getElementById("confirmNo2").onclick = () => {
        overlay.style.display = "none";
        showToast("Action cancelled", "error", 2000);
      };
    };
  });
}

// Rendering the Landlords
async function renderLandlords() {
  const lordsBody = document.getElementById("landlordsTBody");
  const landlords = await fetchLandlords();
  // Note: We don't necessarily need props anymore for the contact info

  lordsBody.innerHTML = "";
  if (!landlords || landlords.length === 0) {
    lordsBody.innerHTML = `<tr><td colspan="5" class="center">No landlords found.</td></tr>`;
    return;
  }

  landlords.forEach((u) => {
    // 1. Get contact from the updated profile, fallback to "-"
    const profileContact = u.contact || "-";

    // 2. Handle Profile Image for Admin view
    const profileImg = u.profileImage
      ? `http://localhost:3000/${u.profileImage}`
      : "https://via.placeholder.com/40?text=L";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <img src="${profileImg}" style="width:35px; height:35px; border-radius:50%; object-fit:cover; vertical-align:middle; margin-right:10px; border:1px solid #ddd;">
        ${u.name || "-"}
      </td>
      <td>${u.email}</td>
      <td>${profileContact}</td>
      <td><button class="btn danger" data-remove="${u.id}">Remove</button></td>
    `;
    lordsBody.appendChild(tr);
  });

  // Remove landlord buttons logic
  lordsBody.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-remove");
      const overlay = document.getElementById("confirmOverlay");
      overlay.style.display = "flex";

      document.getElementById("confirmYes").onclick = async () => {
        overlay.style.display = "none";
        const ok = await deleteLandlord(id);
        if (ok) {
          showToast("Landlord removed successfully", "success", 2000);
          renderLandlords();
        } else {
          showToast("Failed to remove landlord", "error", 2000);
        }
      };

      document.getElementById("confirmNo").onclick = () => {
        overlay.style.display = "none";
        showToast("Action cancelled", "error", 2000);
      };
    };
  });
}

// Rendering the Students
async function renderStudents() {
  const studsBody = document.getElementById("studentTBody");
  const students = await fetchStudent();

  studsBody.innerHTML = "";
  if (!students || students.length === 0) {
    studsBody.innerHTML = `<tr><td colspan="6" class="center">No Students found.</td></tr>`;
    return;
  }

  students.forEach((u) => {
    // Construct the image URL. Use a fallback if profileImage is null.
    const profileImgPath = u.profileImage
      ? `http://localhost:3000/${u.profileImage}`
      : "https://via.placeholder.com/40x40?text=User";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <img src="${profileImgPath}" alt="Profile" style="width:40px; height:40px; border-radius:50%; object-fit:cover; vertical-align:middle; border: 1px solid #ddd;">
      </td>
      <td>
        <strong>${u.name || "-"}</strong><br>
        <small style="color:#666">${u.email}</small>
      </td>
      <td>${u.regNo || '<span class="text-muted">Not Set</span>'}</td>
      <td>${u.department || '<span class="text-muted">Not Set</span>'}</td>
      <td>${u.contact || '<span class="text-muted">Not Set</span>'}</td>
      <td>
        <button class="btn danger" style="padding: 5px 10px;" data-remove="${u.id}">Remove</button>
      </td>
    `;
    studsBody.appendChild(tr);
  });

  // --- Remove student logic ---
  studsBody.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-remove");
      const overlay3 = document.getElementById("confirmOverlay3");
      overlay3.style.display = "flex";

      document.getElementById("confirmYes3").onclick = async () => {
        overlay3.style.display = "none";
        // Ensure you have a deleteStudent function; if not, you can use deleteLandlord if it's generic
        const ok = await deleteStudent(id);

        if (ok) {
          showToast("Student removed successfully", "success", 2000);
          renderStudents();
        } else {
          showToast("Failed to remove student", "error", 2000);
        }
      };

      document.getElementById("confirmNo3").onclick = () => {
        overlay3.style.display = "none";
        showToast("Action cancelled", "error", 2000);
      };
    };
  });
}

// Initialize
async function renderAdmin() {
  await renderProps();
  await renderLandlords();
  await renderStudents();
}

document.addEventListener("DOMContentLoaded", renderAdmin);
