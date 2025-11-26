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

async function deleteProperty(id) {
  await fetch(`http://localhost:3000/properties/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}

async function fetchLandlords() {
  const res = await fetch("http://localhost:3000/users?role=landlord", {
    credentials: "include",
  });
  return res.ok ? res.json() : [];
}

async function deleteLandlord(id) {
  await fetch(`http://localhost:3000/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}

// Rendering the Properties on dashboar
async function renderProps() {
  const propsBody = document.getElementById("allPropsTBody");
  const props = await fetchProps();

  propsBody.innerHTML = "";
  if (props.length === 0) {
    propsBody.innerHTML = `<tr><td colspan="8" class="center">No properties found.</td></tr>`;
    return;
  }

  props.forEach((p) => {
    const tr = document.createElement("tr");
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
      <td>${new Date(p.createdAt).toLocaleString()}</td>
      <td><button class="btn ok" data-verify="${p.id}">${
      p.verified ? "Unverify" : "Verify"
    }</button></td>
      <td><button class="btn danger" data-del="${p.id}">Delete</button></td>
    `;
    propsBody.appendChild(tr);
  });

  propsBody.querySelectorAll("[data-verify]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-verify");
      await verifyProperty(id);
      renderProps();
    };
  });

  propsBody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm("Delete this property?")) return;
      const id = btn.getAttribute("data-del");
      await deleteProperty(id);
      renderProps();
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

  // delete landlord buttons
  lordsBody.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-remove");
      if (
        !confirm("Remove this landlord? Their properties will also be removed.")
      )
        return;
      await deleteLandlord(id);
      renderLandlords();
      renderProps();
    };
  });
}

// Initialize
async function renderAdmin() {
  await renderProps();
  await renderLandlords();
}

document.addEventListener("DOMContentLoaded", renderAdmin);
