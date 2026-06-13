(function () {
  let registrations = [];
  let contacts = [];
  let activeSection = "registrations";
  let activeModalId = null;
  let activeModalType = null;

  const tableWrapper = document.getElementById("tableWrapper");
  const totalCount = document.getElementById("totalCount");
  const unreadCountEl = document.getElementById("unreadCount");
  const todayCount = document.getElementById("todayCount");
  const totalLabel = document.getElementById("totalLabel");
  const pageTitle = document.getElementById("pageTitle");
  const tableTitle = document.getElementById("tableTitle");
  const modalTitle = document.getElementById("modalTitle");
  const notifBadge = document.getElementById("notifBadge");
  const notifPanel = document.getElementById("notifPanel");
  const notifList = document.getElementById("notifList");
  const refreshBtn = document.getElementById("refreshBtn");
  const detailModal = document.getElementById("detailModal");
  const modalBody = document.getElementById("modalBody");

  const sectionConfig = {
    registrations: {
      pageTitle: "Registration Dashboard",
      tableTitle: "All Registrations",
      totalLabel: "Total Registrations",
      statIcon: "fa-user-plus",
      emptyText: "No registrations yet",
      exportUrl: "/api/registrations/export/pdf",
      exportName: "bliss-all-registrations.pdf",
    },
    contacts: {
      pageTitle: "Contact Us Dashboard",
      tableTitle: "All Contact Requests",
      totalLabel: "Total Contact Requests",
      statIcon: "fa-envelope",
      emptyText: "No contact requests yet",
      exportUrl: "/api/contacts/export/pdf",
      exportName: "bliss-contact-requests.pdf",
    },
  };

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

  function getActiveItems() {
    return activeSection === "contacts" ? contacts : registrations;
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

  function updateSectionUI() {
    const config = sectionConfig[activeSection];
    pageTitle.textContent = config.pageTitle;
    tableTitle.innerHTML = `<i class="fa-solid fa-table-list"></i> ${config.tableTitle}`;
    totalLabel.textContent = config.totalLabel;
    document.getElementById("statIconPrimary").className = `fa-solid ${config.statIcon}`;
  }

  function updateStats() {
    const items = getActiveItems();
    const unread = items.filter((r) => !r.isRead).length;
    const today = items.filter((r) => isToday(r.createdAt)).length;
    const allUnread =
      registrations.filter((r) => !r.isRead).length + contacts.filter((r) => !r.isRead).length;

    totalCount.textContent = items.length;
    unreadCountEl.textContent = unread;
    todayCount.textContent = today;

    if (allUnread > 0) {
      notifBadge.textContent = allUnread > 99 ? "99+" : allUnread;
      notifBadge.classList.remove("hidden");
    } else {
      notifBadge.classList.add("hidden");
    }
  }

  function buildRegistrationDetailHtml(r) {
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

    return buildDetailSections(sections);
  }

  function buildContactDetailHtml(c) {
    const sections = [
      {
        title: "Contact Information",
        fields: [
          ["Name", c.name],
          ["Date of Birth", c.dob],
          ["Gender", c.gender],
          ["Phone", c.phone],
          ["Email", c.email],
          ["Address", c.address, true],
          ["ZIP Code", c.zip],
        ],
      },
      {
        title: "Submission",
        fields: [["Submitted On", formatDate(c.createdAt)]],
      },
    ];

    return buildDetailSections(sections);
  }

  function buildDetailSections(sections) {
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

  function openModal(id, type) {
    const items = type === "contacts" ? contacts : registrations;
    const item = items.find((entry) => entry._id === id);
    if (!item) return;

    activeModalId = id;
    activeModalType = type;
    modalTitle.innerHTML =
      type === "contacts"
        ? '<i class="fa-solid fa-envelope"></i> Contact Request Details'
        : '<i class="fa-solid fa-user"></i> Registration Details';
    modalBody.innerHTML =
      type === "contacts" ? buildContactDetailHtml(item) : buildRegistrationDetailHtml(item);
    detailModal.classList.remove("hidden");
    markAsRead(id, type);
  }

  function closeModal() {
    detailModal.classList.add("hidden");
    activeModalId = null;
    activeModalType = null;
  }

  function renderRegistrationTable() {
    if (registrations.length === 0) {
      tableWrapper.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-inbox"></i>
          <p>${sectionConfig.registrations.emptyText}</p>
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
            <button class="btn-view view-btn" data-id="${r._id}" data-type="registrations" title="View details">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-outline btn-sm download-pdf" data-id="${r._id}" data-type="registrations" title="Download PDF">
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
  }

  function renderContactTable() {
    if (contacts.length === 0) {
      tableWrapper.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-inbox"></i>
          <p>${sectionConfig.contacts.emptyText}</p>
        </div>`;
      return;
    }

    const rows = contacts
      .map(
        (c) => `
      <tr class="${c.isRead ? "" : "unread"}" data-id="${c._id}">
        <td>${c.isRead ? "" : '<span class="new-dot"></span>'}${display(c.name)}</td>
        <td>${display(c.dob)}</td>
        <td>${display(c.gender)}</td>
        <td>${display(c.address)}</td>
        <td>${display(c.zip)}</td>
        <td>${display(c.phone)}</td>
        <td>${display(c.email)}</td>
        <td>${formatDate(c.createdAt)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-view view-btn" data-id="${c._id}" data-type="contacts" title="View details">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-outline btn-sm download-pdf" data-id="${c._id}" data-type="contacts" title="Download PDF">
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
            <th>Address</th>
            <th>ZIP</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function bindTableActions() {
    tableWrapper.querySelectorAll(".download-pdf").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        downloadPdf(btn.dataset.id, btn.dataset.type);
      });
    });

    tableWrapper.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(btn.dataset.id, btn.dataset.type);
      });
    });
  }

  function renderTable() {
    if (activeSection === "contacts") {
      renderContactTable();
    } else {
      renderRegistrationTable();
    }
    bindTableActions();
  }

  function renderNotifications() {
    const unreadRegistrations = registrations.filter((r) => !r.isRead);
    const unreadContacts = contacts.filter((r) => !r.isRead);
    const unread = [
      ...unreadRegistrations.map((r) => ({ ...r, type: "registrations" })),
      ...unreadContacts.map((r) => ({ ...r, type: "contacts" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (unread.length === 0) {
      notifList.innerHTML = '<div class="notification-empty">No new notifications</div>';
      return;
    }

    notifList.innerHTML = unread
      .map((item) => {
        const name = item.type === "contacts" ? item.name : getFullName(item);
        const icon =
          item.type === "contacts" ? "fa-envelope" : "fa-user-plus";
        const label = item.type === "contacts" ? "Contact request" : "Registration";
        return `
      <div class="notification-item" data-id="${item._id}" data-type="${item.type}">
        <div class="notif-name"><i class="fa-solid ${icon}"></i> ${name}</div>
        <div class="notif-meta">${label} · ${item.email} · ${formatDate(item.createdAt)}</div>
      </div>`;
      })
      .join("");

    notifList.querySelectorAll(".notification-item").forEach((item) => {
      item.addEventListener("click", () => {
        switchSection(item.dataset.type);
        openModal(item.dataset.id, item.dataset.type);
        notifPanel.classList.remove("open");
      });
    });
  }

  async function fetchAllData() {
    const [regRes, contactRes] = await Promise.all([
      api("/api/registrations"),
      api("/api/contacts"),
    ]);
    const regData = await regRes.json();
    const contactData = await contactRes.json();
    registrations = regData.data || [];
    contacts = contactData.data || [];
    updateStats();
    renderTable();
    renderNotifications();
  }

  async function markAsRead(id, type) {
    const items = type === "contacts" ? contacts : registrations;
    const item = items.find((entry) => entry._id === id);
    if (!item || item.isRead) return;

    const endpoint =
      type === "contacts" ? `/api/contacts/${id}/read` : `/api/registrations/${id}/read`;
    await api(endpoint, { method: "PATCH" });
    item.isRead = true;
    updateStats();
    renderTable();
    renderNotifications();
  }

  async function markAllRead() {
    await Promise.all([
      api("/api/registrations/mark-all-read", { method: "PATCH" }),
      api("/api/contacts/mark-all-read", { method: "PATCH" }),
    ]);
    registrations.forEach((r) => (r.isRead = true));
    contacts.forEach((c) => (c.isRead = true));
    updateStats();
    renderTable();
    renderNotifications();
  }

  async function downloadPdf(id, type) {
    const endpoint =
      type === "contacts" ? `/api/contacts/${id}/pdf` : `/api/registrations/${id}/pdf`;
    const res = await api(endpoint);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      type === "contacts" ? `bliss-contact-${id}.pdf` : `bliss-registration-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportAllPdf() {
    const config = sectionConfig[activeSection];
    const res = await api(config.exportUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = config.exportName;
    a.click();
    URL.revokeObjectURL(url);
  }

  function switchSection(section) {
    activeSection = section;
    document.querySelectorAll(".sidebar-nav a").forEach((link) => {
      link.classList.toggle("active", link.dataset.section === section);
    });
    updateSectionUI();
    updateStats();
    renderTable();
  }

  document.querySelectorAll(".sidebar-nav a[data-section]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchSection(link.dataset.section);
    });
  });

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
    await fetchAllData();
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
    if (activeModalId && activeModalType) downloadPdf(activeModalId, activeModalType);
  });

  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) closeModal();
  });

  async function init() {
    await checkAuth();
    updateSectionUI();
    await fetchAllData();
    setInterval(fetchAllData, 30000);
  }

  init();
})();
