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

// API Calls
async function fetchProps() {
  const res = await fetch("http://localhost:3000/properties");
  return res.ok ? res.json() : [];
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

async function fetchLogged() {
  const res = await fetch("http://localhost:3000/me", {
    credentials: "include",
  });
  return res.ok ? res.json() : null;
}

// -------------------- Utilities --------------------
function genId(prefix = "prop") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e5)}`;
}

function currency(n) {
  n = Number(n) || 0;
  return "₦" + n.toLocaleString();
}

// -------------------- Render Properties --------------------
async function renderMyProps(me) {
  const props = (await fetchProps()).filter((p) => p.landlord_id === me.id);
  const myTableBody = document.getElementById("myPropsTBody");
  myTableBody.innerHTML = "";

  if (!props.length) {
    myTableBody.innerHTML = `<tr><td colspan="7" class="center">No properties yet.</td></tr>`;
    return;
  }

  props.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.title}</td>
      <td><img src="${
        p.image
      }" alt="Property" style="width:70px;height:55px;border-radius:10px;object-fit:cover;" /></td>
      <td>${currency(p.price)}</td>
      <td>${p.contact}</td>
      <td>${p.location}</td>
      <td>${p.verified ? "Yes" : "No"}</td>
     
      <td>${new Date(p.createdAt).toLocaleString()}</td>
        <td>${
         Number(p.booked) > 0
           ? `<span class="badge booked">${p.booked} Booked</span>`
           : '<span class="badge available">Available</span>'
       }</td>
      <td>
        <button class="btn danger" data-del="${p.id}">Delete</button>
      </td>
    `;
    myTableBody.appendChild(tr);
  });

  // Attach delete buttons
  myTableBody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm("Delete this property?")) return;
      const id = btn.getAttribute("data-del");
      const success = await deleteProp(id);
      if (success) renderMyProps(me);
      else showToast("Failed to delete property.", 4000);
    };
  });
}

// -------------------- Handle Form Submission --------------------
async function setupForm(me) {
  const form = document.getElementById("propForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    fd.append("landlord_id", me.id);
    const success = await createProp(fd);
    if (success) {
      showToast(
        "Property added! It’s now visible on the homepage (Pending verification).",
        "success",
        7000
      );
      form.reset();
      renderMyProps(me);
    } else {
      showToast("Failed to add property.", "error", 4000);
    }
    // const prop = {
    //   // id: genId("prop"),
    //   title: fd.get("title").toString().trim(),
    //   price: Number(fd.get("price") || 0),
    //   contact: fd.get("contact").toString().trim(),
    //   type: fd.get("type")?.toString().trim().toLowerCase() || "apartment",
    //   location: fd.get("location").toString().trim(),
    //   description: fd.get("description").toString().trim(),
    //   image: fd.get("image").toString().trim(),
    //   landlord_id: me.id,
    //   verified: false,
    //   // createdAt: new Date().toISOString(),
    // };

    if (!prop.title || !prop.contact || !prop.price || !prop.location) {
      return showToast(
        "Title, price, contact and location are required.",
        4000
      );
    }

    await createProp(prop);
    form.reset();
    showToast(
      "Property added! It’s now visible on the homepage (Pending verification).",
      "success",
      4000
    );
    renderMyProps(me);
  });
}

// -------------------- Initialize --------------------
document.addEventListener("DOMContentLoaded", async () => {
  const me = await requireLandlord();
  if (!me) return; // redirect already handled
  await renderMyProps(me);
  await setupForm(me);
});
