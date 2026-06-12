(async function () {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (res.ok) {
      window.location.href = "/dashboard";
      return;
    }
  } catch {
    /* not logged in */
  }

  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");
  const loginBtn = document.getElementById("loginBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span> Signing in...';

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: document.getElementById("username").value,
          password: document.getElementById("password").value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.message || "Login failed";
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      errorMsg.textContent = "Connection error. Please try again.";
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
    }
  });
})();
