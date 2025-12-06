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
// async function deleteLandlord(id) {
//   await fetch(`http://localhost:3000/users/${id}`, {
//     method: "DELETE",
//     credentials: "include",
//   });

// }

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
    console.log(p.id, p.booked);

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
          showToast("Property deleted successfully", "success");
          renderProps();
        } else {
          showToast("Failed to delete property", "error");
        }
      };

      // NO button
      document.getElementById("confirmNo2").onclick = () => {
        overlay.style.display = "none";
        showToast("Action canceled", "error");
      };
    };
  });
}

// Rendering the Landlords
async function renderLandlords() {
  const lordsBody = document.getElementById("landlordsTBody");
  const landlords = await fetchLandlords();
  const props = await fetchProps();

  lordsBody.innerHTML = "";
  if (landlords.length === 0) {
    lordsBody.innerHTML = `<tr><td colspan="4" class="center">No landlords found.</td></tr>`;
    return;
  }

  landlords.forEach((u) => {
    const property = props.find((p) => p.landlord_id === u.id);
    const contact = property ? property.contact : "-";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.name || "-"}</td>
      <td>${u.email}</td>
      <td>${contact || "-"}</td>
      <td>landlord</td>
      <td><button class="btn danger" data-remove="${u.id}">Remove</button></td>
    `;
    lordsBody.appendChild(tr);
  });

  // // delete landlord buttons
  // lordsBody.querySelectorAll("[data-remove]").forEach((btn) => {
  //   btn.onclick = async () => {
  //     const id = btn.getAttribute("data-remove");
  //     if (
  //       !confirm("Remove this landlord? Their properties will also be removed.")
  //     )
  //       return;
  //     await deleteLandlord(id);
  //     renderLandlords();
  //     renderProps();
  //   };
  // });

  lordsBody.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-remove");

      // Show modal
      const overlay = document.getElementById("confirmOverlay");
      overlay.style.display = "flex";

      // YES button
      document.getElementById("confirmYes").onclick = async () => {
        overlay.style.display = "none";

        const ok = await deleteLandlord(id);

        if (ok) {
          showToast("Landlord removed successfully", "success");
          renderLandlords();
          renderProps();
        } else {
          showToast("Failed to remove landlord", "error");
        }
      };

      // NO button
      document.getElementById("confirmNo").onclick = () => {
        overlay.style.display = "none";
        showToast("Action canceled", "error");
      };
    };
  });
}

// Initialize
async function renderAdmin() {
  await renderProps();
  await renderLandlords();
}

document.addEventListener("DOMContentLoaded", renderAdmin);
