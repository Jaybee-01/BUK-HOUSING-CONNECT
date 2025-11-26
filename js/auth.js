// Signup 
async function signup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document
    .getElementById("signupEmail")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;

  if (!name || !email || !password) return alert("Fill all signup fields.");

  try {
    const res = await fetch("http://localhost:3000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
      credentials: "include",
    });

    if (res.ok) {
      alert("Signup successful. You can log in now.");
      switchToLogin();
    } else {
      const data = await res.json();
      alert(data.message || "Signup failed.");
    }
  } catch (err) {
    alert("Error connecting to server.");
    console.error(err);
  }
}

// Login
async function login() {
  const email = (
    document.getElementById("loginEmail").value || ""
  ).toLowerCase();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok) {
      // Backend must return role
      if (!data.role) {
        alert("Login failed: No role returned.");
        return;
      }

      if (data.role === "admin") location.href = "admin.html";
      else if (data.role === "landlord") location.href = "landlord.html";
      else if (data.role === "student") location.href = "student.html";
      else location.href = "index.html";
    } else {
      // const data = await res.json();
      alert(data.message || "Invalid credentials.");
    }
  } catch (err) {
    alert("Error connecting to server.");
    console.error(err);
  }
}

// UI Switching 
const loginform = document.getElementById("loginForm");
const signupform = document.getElementById("signupForm");
const loginformBtn = document.getElementById("loginformBtn");
const signupformBtn = document.getElementById("signupformBtn");
const logSecondBtn = document.getElementById("logSecondBtn");
const signSecondBtn = document.getElementById("signSecondBtn");

function switchToLogin() {
  loginform.classList.add("active");
  signupform.classList.remove("active");
  loginformBtn.classList.add("active");
  signupformBtn.classList.remove("active");
  logSecondBtn.classList.add("active");
  signSecondBtn.classList.remove("active");
}

function switchToSignup() {
  signupform.classList.add("active");
  loginform.classList.remove("active");
  signupformBtn.classList.add("active");
  loginformBtn.classList.remove("active");
  signSecondBtn.classList.add("active");
  logSecondBtn.classList.remove("active");
}

// Event Listeners
loginformBtn.addEventListener("click", switchToLogin);
signupformBtn.addEventListener("click", switchToSignup);
logSecondBtn.addEventListener("click", switchToLogin);
signSecondBtn.addEventListener("click", switchToSignup);

// Form Submit
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  login();
});

document.getElementById("signupForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  signup();
});
