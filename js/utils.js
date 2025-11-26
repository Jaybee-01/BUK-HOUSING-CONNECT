
//Utilities 
function currency(n) {
  n = Number(n) || 0;
  return "₦" + n.toLocaleString();
}

function genId(prefix = "p") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e5)}`;
}

// Role check 
async function requireRole(role, redirect = "login.html") {
  const u = await fetchLoggedUser();
  if (!u || (Array.isArray(role) ? !role.includes(u.role) : u.role !== role)) {
    window.location.href = `${redirect}?next=${encodeURIComponent(location.pathname)}`;
  }
}

//  Fetch logged user 
async function fetchLoggedUser() {
  try {
    const res = await fetch("http://localhost:3000/me", {
      credentials: "include",
    });
    return res.ok ? res.json() : null;
  } catch (err) {
    console.error("Error fetching logged user:", err);
    return null;
  }
}

//  Logout 
async function logout() {
  try {
    await fetch("http://localhost:3000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Error logging out:", err);
  } finally {
    window.location.href = "index.html";
  }
}

//  Navbar render 
async function navRender() {
  const u = await fetchLoggedUser();
  const navUser = document.getElementById("navUser");
  const navActions = document.getElementById("navActions1");
  if (!navUser || !navActions) return;

  if (u) {
    navUser.innerHTML = `${u.name ? u.name.split(" ")[0] : u.email} (<a href="${u.role}.html">${u.role}</a>)`;
    navActions.innerHTML = `<a href="#" id="logoutLink">Logout</a>`;

    const link = document.getElementById("logoutLink");
    if (link) link.onclick = (e) => {
      e.preventDefault();
      logout();
    };
  } else {
    navUser.textContent = "Guest";
    navActions.innerHTML = `<a href="login.html">Login/Signup</a>`;
  }
}

document.addEventListener("DOMContentLoaded", navRender);
