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
// Fetch API
// async function fetchProps() {
//   const res = await fetch("http://localhost:3000/properties", {
//     credentials: "include",
//   });
//   return res.ok ? res.json() : [];
// }

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

    tr.innerHTML = `
      <td>${p.title}</td>
      <td>${currency(p.price)}</td>
      <td>${p.location}</td>
      <td>${p.landlord_email}</td>
     
      <td>${
        p.verified
          ? '<span class="badge ok">Yes</span>'
          : '<span class="badge warn">No</span>'
      }</td>

      <td>${created ? new Date(created).toLocaleString() : "N/A"}</td>
      <td>${
        Number(p.booked) > 0
          ? `<span class="badge booked">${p.booked} Booked</span>`
          : '<span class="badge available">Available</span>'
      }</td>


      <td><button class="btn ok" data-verify="${p.id}">${
      p.verified ? "Unverify" : "Verify"
    }</button></td>
      <td><button class="btn danger" data-del="${p.id}">Delete</button></td>
    `;
    propsBody.appendChild(tr);
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
          showToast("Property deleted successfully", "success", 7000);
          renderProps();
        } else {
          showToast("Failed to delete property", "error", 7000);
        }
      };

      // NO button
      document.getElementById("confirmNo2").onclick = () => {
        overlay.style.display = "none";
        showToast("Action canceled", "error", 7000);
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
          showToast("Landlord removed successfully", "success", 4000);
          renderLandlords();
        } else {
          showToast("Failed to remove landlord", "error", 4000);
        }
      };

      document.getElementById("confirmNo").onclick = () => {
        overlay.style.display = "none";
        showToast("Action canceled", "info", 3000);
      };
    };
  });
}

// Rendering the Students
async function renderStudents() {
  const studsBody = document.getElementById("studentTBody");
  // Assuming fetchStudent() hits an endpoint that returns all users where role = 'student'
  const students = await fetchStudent();

  studsBody.innerHTML = "";

  // Fixed the check: students is the array, not studsBody
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
      const overlay = document.getElementById("confirmOverlay");
      overlay.style.display = "flex";

      document.getElementById("confirmYes").onclick = async () => {
        overlay.style.display = "none";
        // Ensure you have a deleteStudent function; if not, you can use deleteLandlord if it's generic
        const ok = await deleteStudent(id); 

        if (ok) {
          showToast("Student removed successfully", "success", 4000);
          renderStudents();
        } else {
          showToast("Failed to remove student", "error", 4000);
        }
      };

      document.getElementById("confirmNo").onclick = () => {
        overlay.style.display = "none";
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
