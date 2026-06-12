(function () {
  let registrations = [];
  let activeModalId = null;

  const tableWrapper = document.getElementById("tableWrapper");
  const totalCount = document.getElementById("totalCount");
  const unreadCountEl = document.getElementById("unreadCount");
  const todayCount = document.getElementById("todayCount");
  const notifBadge = document.getElementById("notifBadge");
  const notifPanel = document.getElementById("notifPanel");
  const notifList = document.getElementById("notifList");
  const refreshBtn = document.getElementById("refreshBtn");
  const detailModal = document.getElementById("detailModal");
  const modalBody = document.getElementById("modalBody");

  function getFullName(r) {
    if (r.first_name || r.last_name) {
      return `${r.first_name || ""} ${r.last_name || ""}`.trim();
    }
    return r.name || "—";
  }

  function getPhone(r) {
    return r.phone_no || r.phone || "—";
  }

  function getZip(r) {
    return r.zip_code || r.zip || "—";
  }

  function display(val) {
    if (val === null || val === undefined || val === "") return "—";
    return String(val);
  }

  async function api(url, options = {}) {
    const res = await fetch(url, { credentials: "include", ...options });
    if (res.status === 401) {
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    return res;
  }

  async function checkAuth() {
    const res = await api("/api/auth/me");
    if (!res.ok) window.location.href = "/login";
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isToday(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }

  function updateStats() {
    const unread = registrations.filter((r) => !r.isRead).length;
    const today = registrations.filter((r) => isToday(r.createdAt)).length;

    totalCount.textContent = registrations.length;
    unreadCountEl.textContent = unread;
    todayCount.textContent = today;

    if (unread > 0) {
      notifBadge.textContent = unread > 99 ? "99+" : unread;
      notifBadge.classList.remove("hidden");
    } else {
      notifBadge.classList.add("hidden");
    }
  }

  function buildDetailHtml(r) {
    const sections = [
      {
        title: "Personal Information",
        fields: [
          ["First Name", r.first_name],
          ["Last Name", r.last_name],
          ["Full Name", getFullName(r)],
          ["Date of Birth", r.dob],
          ["Gender", r.gender],
        ],
      },
      {
        title: "Contact Information",
        fields: [
          ["Phone", getPhone(r)],
          ["Email", r.email],
          ["Address", r.address, true],
          ["ZIP Code", getZip(r)],
        ],
      },
      {
        title: "Health & Weight",
        fields: [
          ["Current Weight (lbs)", r.current_weight],
          ["Ideal Weight (lbs)", r.ideal_weight],
          ["Height (ft.in)", r.height],
          ["BMI", r.bmi],
        ],
      },
      {
        title: "Medical Information",
        fields: [
          ["Medication Plan", r.medication_plan, true],
          ["Medical Condition", r.medical_condition],
          ["Selected Diseases", r.diseases, true],
          ["Other Disease", r.other_disease, true],
          ["Allergic to Medications", r.allergic_to_medications],
          ["Allergies", r.allergies, true],
        ],
      },
      {
        title: "Submission",
        fields: [["Submitted On", formatDate(r.createdAt)]],
      },
    ];

    return sections
      .map(
        (section) => `
      <div class="detail-section">
        <h4>${section.title}</h4>
        <div class="detail-grid">
          ${section.fields
            .map(
              ([label, value, full]) => `
            <div class="detail-item${full ? " full-width" : ""}">
              <label>${label}</label>
              <span>${display(value)}</span>
            </div>`
            )
            .join("")}
        </div>
      </div>`
      )
      .join("");
  }

  function openModal(id) {
    const r = registrations.find((reg) => reg._id === id);
    if (!r) return;

    activeModalId = id;
    modalBody.innerHTML = buildDetailHtml(r);
    detailModal.classList.remove("hidden");
    markAsRead(id);
  }

  function closeModal() {
    detailModal.classList.add("hidden");
    activeModalId = null;
  }

  function renderTable() {
    if (registrations.length === 0) {
      tableWrapper.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-inbox"></i>
          <p>No registrations yet</p>
        </div>`;
      return;
    }

    const rows = registrations
      .map(
        (r) => `
      <tr class="${r.isRead ? "" : "unread"}" data-id="${r._id}">
        <td>${r.isRead ? "" : '<span class="new-dot"></span>'}${getFullName(r)}</td>
        <td>${display(r.dob)}</td>
        <td>${display(r.gender)}</td>
        <td>${getPhone(r)}</td>
        <td>${display(r.email)}</td>
        <td>${display(r.current_weight)}</td>
        <td>${display(r.bmi)}</td>
        <td>${formatDate(r.createdAt)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-view view-btn" data-id="${r._id}" title="View details">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-outline btn-sm download-pdf" data-id="${r._id}" title="Download PDF">
              <i class="fa-solid fa-file-pdf"></i>
            </button>
          </div>
        </td>
      </tr>`
      )
      .join("");

    tableWrapper.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>DOB</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Weight</th>
            <th>BMI</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    tableWrapper.querySelectorAll(".download-pdf").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        downloadPdf(btn.dataset.id);
      });
    });

    tableWrapper.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(btn.dataset.id);
      });
    });
  }

  function renderNotifications() {
    const unread = registrations.filter((r) => !r.isRead);

    if (unread.length === 0) {
      notifList.innerHTML = '<div class="notification-empty">No new notifications</div>';
      return;
    }

    notifList.innerHTML = unread
      .map(
        (r) => `
      <div class="notification-item" data-id="${r._id}">
        <div class="notif-name"><i class="fa-solid fa-user-plus"></i> ${getFullName(r)}</div>
        <div class="notif-meta">${r.email} · ${formatDate(r.createdAt)}</div>
      </div>`
      )
      .join("");

    notifList.querySelectorAll(".notification-item").forEach((item) => {
      item.addEventListener("click", () => openModal(item.dataset.id));
    });
  }

  async function fetchRegistrations() {
    const res = await api("/api/registrations");
    const data = await res.json();
    registrations = data.data || [];
    updateStats();
    renderTable();
    renderNotifications();
  }

  async function markAsRead(id) {
    const reg = registrations.find((r) => r._id === id);
    if (!reg || reg.isRead) return;

    await api(`/api/registrations/${id}/read`, { method: "PATCH" });
    reg.isRead = true;
    updateStats();
    renderTable();
    renderNotifications();
  }

  async function markAllRead() {
    await api("/api/registrations/mark-all-read", { method: "PATCH" });
    registrations.forEach((r) => (r.isRead = true));
    updateStats();
    renderTable();
    renderNotifications();
  }

  async function downloadPdf(id) {
    const res = await api(`/api/registrations/${id}/pdf`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bliss-registration-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportAllPdf() {
    const res = await api("/api/registrations/export/pdf");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bliss-all-registrations.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  document.getElementById("notifBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    notifPanel.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!notifPanel.contains(e.target) && !e.target.closest("#notifBtn")) {
      notifPanel.classList.remove("open");
    }
  });

  document.getElementById("markAllReadBtn").addEventListener("click", markAllRead);

  refreshBtn.addEventListener("click", async () => {
    refreshBtn.querySelector("i").classList.add("fa-spin");
    await fetchRegistrations();
    setTimeout(() => refreshBtn.querySelector("i").classList.remove("fa-spin"), 500);
  });

  document.getElementById("exportAllPdf").addEventListener("click", exportAllPdf);

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  });

  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
  document.getElementById("modalPdfBtn").addEventListener("click", () => {
    if (activeModalId) downloadPdf(activeModalId);
  });

  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) closeModal();
  });

  async function init() {
    await checkAuth();
    await fetchRegistrations();
    setInterval(fetchRegistrations, 30000);
  }

  init();
})();
