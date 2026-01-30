// // Signup
// async function signup() {
//   const name = document.getElementById("signupName").value.trim();
//   const email = document
//     .getElementById("signupEmail")
//     .value.trim()
//     .toLowerCase();
//   const password = document.getElementById("signupPassword").value;
//   const role = document.getElementById("signupRole").value;

//   if (!name || !email || !password)
//     return showToast("Fill all signup fields.", "error", 4000);

//   try {
//     const res = await fetch("http://localhost:3000/auth/signup", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name, email, password, role }),
//       credentials: "include",
//     });

//     if (res.ok) {
//       showToast("Signup successful. You can log in now.", "success", 4000);
//       switchToLogin();
//     } else {
//       const data = await res.json();
//       showToast(data.message || "Signup failed.", "error", 4000);
//     }
//   } catch (err) {
//     showToast("Error connecting to server.", "error", 4000);
//     console.error(err);
//   }
// }

// // Login
// async function login() {
//   const email = (
//     document.getElementById("loginEmail").value || ""
//   ).toLowerCase();
//   const password = document.getElementById("loginPassword").value;

//   try {
//     const res = await fetch("http://localhost:3000/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//       credentials: "include",
//     });

//     const data = await res.json();

//     if (res.ok) {
//       // Backend must return role
//       if (!data.role) {
//         alert("Login failed: No role returned.");
//         return;
//       }

//       if (data.role === "admin") location.href = "admin.html";
//       else if (data.role === "landlord") location.href = "landlord.html";
//       else if (data.role === "student") location.href = "student.html";
//       else location.href = "index.html";
//     } else {
//       // const data = await res.json();
//       showToast(data.message || "Invalid credentials.", "error", 4000);
//     }
//   } catch (err) {
//     showToast("Error connecting to server.", "error");
//     console.error(err);
//   }
// }


// Signup
async function signup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;

  if (!name || !email || !password)
    return showToast("Fill all signup fields.", "error", 4000);

  // --- BUK EMAIL RESTRICTION ---
  if (role === "student" && !email.endsWith("@buk.edu.ng")) {
    return showToast("Students must use a @buk.edu.ng email address.", "error", 5000);
  }

  try {
    const res = await fetch("http://localhost:3000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
      credentials: "include",
    });

    if (res.ok) {
      showToast("Signup successful. You can log in now.", "success", 4000);
      switchToLogin();
    } else {
      const data = await res.json();
      showToast(data.message || "Signup failed.", "error", 4000);
    }
  } catch (err) {
    showToast("Error connecting to server.", "error", 4000);
    console.error(err);
  }
}

// Login
async function login() {
  const email = (document.getElementById("loginEmail").value || "").toLowerCase();
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
      if (!data.role) {
        alert("Login failed: No role returned.");
        return;
      }

      // --- LOGIN RESTRICTION ---
      // This prevents students who somehow bypassed signup from logging in with a non-BUK email
      if (data.role === "student" && !email.endsWith("@buk.edu.ng")) {
        return showToast("Enter valid Email Address", "error", 5000);
      }

      if (data.role === "admin") location.href = "admin.html";
      else if (data.role === "landlord") location.href = "landlord.html";
      else if (data.role === "student") location.href = "student.html";
      else location.href = "index.html";
    } else {
      showToast(data.message || "Invalid credentials.", "error", 4000);
    }
  } catch (err) {
    showToast("Error connecting to server.", "error");
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
