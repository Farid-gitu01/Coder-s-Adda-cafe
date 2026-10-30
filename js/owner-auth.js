// Owner demo credentials are configuration only; never saved in localStorage.
const OWNER_DEMO_CONFIG = Object.freeze({
  email: 'owner@coderscup.com',
  password: 'Owner1234',
  role: 'owner',
  name: 'Owner'
});
const OWNER_SESSION_KEY = 'codersCupOwnerSession';

function setOwnerFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.querySelector(`[data-error-for="${fieldId}"]`);
  if (field) field.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) error.textContent = message;
}
function initializeOwnerLogin() {
  const year = document.getElementById('owner-year');
  if (year) year.textContent = new Date().getFullYear();
  try {
    const existing = JSON.parse(localStorage.getItem(OWNER_SESSION_KEY) || 'null');
    const customerSession = JSON.parse(localStorage.getItem('codersCupSession') || 'null');
    const receptionistSession = JSON.parse(localStorage.getItem('codersCupReceptionistSession') || 'null');
    if (existing?.role === OWNER_DEMO_CONFIG.role && existing.email === OWNER_DEMO_CONFIG.email && !customerSession && !receptionistSession) {
      window.location.replace('owner-dashboard.html');
      return;
    }
    if (customerSession || receptionistSession) localStorage.removeItem(OWNER_SESSION_KEY);
  } catch (error) {
    localStorage.removeItem(OWNER_SESSION_KEY);
  }

  const form = document.getElementById('owner-login-form');
  const passwordInput = document.getElementById('owner-password');
  const toggle = document.getElementById('owner-password-toggle');
  toggle.addEventListener('click', () => {
    const reveal = passwordInput.type === 'password';
    passwordInput.type = reveal ? 'text' : 'password';
    toggle.textContent = reveal ? 'Hide' : 'Show';
    toggle.setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} password`);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('owner-email').value.trim().toLowerCase();
    const password = passwordInput.value;
    const feedback = document.getElementById('owner-login-feedback');
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setOwnerFieldError('owner-email', validEmail ? '' : 'Enter a valid email address.');
    setOwnerFieldError('owner-password', password ? '' : 'Password is required.');
    feedback.textContent = '';
    if (!validEmail || !password) return;

    if (email !== OWNER_DEMO_CONFIG.email || password !== OWNER_DEMO_CONFIG.password) {
      feedback.textContent = 'Invalid owner email or password.';
      return;
    }

    // Only role and identity go into the session; the password is never persisted.
    localStorage.removeItem('codersCupSession');
    localStorage.removeItem('codersCupReceptionistSession');
    localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify({ role: OWNER_DEMO_CONFIG.role, email: OWNER_DEMO_CONFIG.email, name: OWNER_DEMO_CONFIG.name, remember: document.getElementById('owner-remember').checked, signedInAt: new Date().toISOString() }));
    window.location.href = 'owner-dashboard.html';
  });
}
document.addEventListener('DOMContentLoaded', initializeOwnerLogin);
