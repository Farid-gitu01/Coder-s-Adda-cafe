const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const menuLinks = document.querySelectorAll('.nav-links a');
menuLinks.forEach((link) => {
  link.addEventListener('click', () => {
    header.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Let returning customers open their account directly from shared page headers.
try {
  const session = JSON.parse(localStorage.getItem('codersCupSession') || 'null');
  if (session?.role === 'customer' && session.customerId) {
    document.querySelectorAll('.site-header .nav-actions .btn-ghost').forEach((link) => {
      if (link.textContent.trim().toLowerCase() === 'login') {
        link.href = 'customer-dashboard.html';
        link.textContent = 'My Account';
      }
    });
  }
} catch (error) {
  // Shared navigation remains usable if browser storage is unavailable.
}

// Apply owner-managed cafe contact settings to matching shared page content.
try {
  const cafeSettings = JSON.parse(localStorage.getItem('codersCupSettings') || 'null');
  if (cafeSettings && typeof cafeSettings === 'object') {
    document.querySelectorAll('.brand-text strong').forEach((element) => {
      element.textContent = cafeSettings.cafeName || "Coder's Cup";
    });
    const contactValues = document.querySelectorAll('.site-footer .footer-grid > div:last-child li');
    if (contactValues.length >= 3) {
      if (cafeSettings.address) contactValues[0].textContent = cafeSettings.address;
      if (cafeSettings.contactNumber) contactValues[1].textContent = cafeSettings.contactNumber;
      if (cafeSettings.email) contactValues[2].textContent = cafeSettings.email;
    }
    document.querySelectorAll('.site-footer .footer-brand p').forEach((element) => {
      if (cafeSettings.tagline) element.textContent = cafeSettings.tagline;
    });
  }
} catch (error) {
  // Keep the existing default branding if settings are missing or invalid.
}
