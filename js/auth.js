// Customer account demo. Passwords are PBKDF2-hashed in-browser; localStorage is still not secure authentication.
const USERS_KEY = 'codersCupCustomers';
const SESSION_KEY = 'codersCupSession';
const ITERATIONS = 120000;

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch (error) { return []; }
}
function writeUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function normalizeEmail(email) { return email.trim().toLowerCase(); }
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidIndianMobile(mobile) { return /^([+]?91|0)?[6-9]\d{9}$/.test(mobile.replace(/[\s-]/g, '')); }
function makeId(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.querySelector(`[data-error-for="${fieldId}"]`);
  if (field) field.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) error.textContent = message;
}
function setFeedback(message, kind = '') {
  const feedback = document.getElementById('auth-feedback');
  if (feedback) { feedback.textContent = message; feedback.className = `form-feedback ${kind}`.trim(); }
}

// Derive a password verifier using Web Crypto rather than keeping a plain-text password in storage.
async function hashPassword(password, saltValue) {
  const salt = saltValue ? Uint8Array.from(atob(saltValue), (char) => char.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);
  const hashBytes = new Uint8Array(bits);
  const toBase64 = (bytes) => btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
  return { salt: toBase64(salt), passwordHash: toBase64(hashBytes) };
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (error) { return null; }
}
function saveSession(user, remember) {
  // Keep the browser demo in one active role at a time.
  localStorage.removeItem('codersCupOwnerSession');
  localStorage.removeItem('codersCupReceptionistSession');
  const session = { customerId: user.customerId, email: user.email, role: 'customer', remember, signedInAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function setupPasswordToggles() {
  document.querySelectorAll('[data-password-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.passwordTarget);
      if (!target) return;
      const reveal = target.type === 'password';
      target.type = reveal ? 'text' : 'password';
      button.textContent = reveal ? 'Hide' : 'Show';
      button.setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} password`);
    });
  });
}

async function handleRegistration(event) {
  event.preventDefault();
  setFeedback('');
  const name = document.getElementById('register-name').value.trim();
  const email = normalizeEmail(document.getElementById('register-email').value);
  const mobile = document.getElementById('register-mobile').value.trim();
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('confirm-password').value;
  const terms = document.getElementById('terms').checked;
  let valid = true;
  [['register-name', name ? '' : 'Please enter your full name.'], ['register-email', isValidEmail(email) ? '' : 'Enter a valid email address.'], ['register-mobile', isValidIndianMobile(mobile) ? '' : 'Enter a valid Indian mobile number.'], ['register-password', password.length >= 8 ? '' : 'Password must be at least 8 characters.'], ['confirm-password', password && password === confirm ? '' : 'Passwords do not match.'], ['terms', terms ? '' : 'Please accept the terms to continue.']].forEach(([id, message]) => { setError(id, message); if (message) valid = false; });
  if (!valid) return;
  if (!crypto?.subtle) { setFeedback('Secure browser cryptography is unavailable. Use a modern browser on localhost or HTTPS.', 'error'); return; }
  const users = readUsers();
  if (users.some((user) => user.email === email)) { setError('register-email', 'An account with this email already exists.'); return; }
  try {
    const credentials = await hashPassword(password);
    const user = { customerId: makeId('CUS'), name, email, mobile, ...credentials, profileImage: '', createdAt: new Date().toISOString(), role: 'customer' };
    users.push(user);
    writeUsers(users);
    saveSession(user, true);
    window.location.href = 'customer-dashboard.html';
  } catch (error) { setFeedback('Could not create the demo account in this browser.', 'error'); }
}

async function handleLogin(event) {
  event.preventDefault();
  setFeedback('');
  const email = normalizeEmail(document.getElementById('login-email').value);
  const password = document.getElementById('login-password').value;
  let valid = true;
  if (!isValidEmail(email)) { setError('login-email', 'Enter a valid email address.'); valid = false; } else setError('login-email', '');
  if (!password) { setError('login-password', 'Enter your password.'); valid = false; } else setError('login-password', '');
  if (!valid) return;
  const user = readUsers().find((entry) => entry.email === email);
  if (!user || !user.salt || !user.passwordHash) { setFeedback('No matching demo account was found. Register first.', 'error'); return; }
  try {
    const candidate = await hashPassword(password, user.salt);
    if (candidate.passwordHash !== user.passwordHash) { setFeedback('Email or password is incorrect.', 'error'); return; }
    saveSession(user, document.getElementById('remember-me').checked);
    window.location.href = 'customer-dashboard.html';
  } catch (error) { setFeedback('Login could not be completed in this browser.', 'error'); }
}

function handleForgotPassword(event) {
  event.preventDefault();
  const email = normalizeEmail(document.getElementById('forgot-email').value);
  if (!isValidEmail(email)) { setError('forgot-email', 'Enter a valid email address.'); setFeedback(''); return; }
  setError('forgot-email', '');
  const exists = readUsers().some((user) => user.email === email);
  setFeedback(exists ? 'Demo request received. In a real service, a secure reset link would be sent; this demo sends no email and does not change your password.' : 'If an account exists for this address, a real service would provide next steps. This demo sends no email and does not change passwords.', 'success');
}

function setupAuthPage() {
  setupPasswordToggles();
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const forgotForm = document.getElementById('forgot-form');
  if (registerForm) registerForm.addEventListener('submit', handleRegistration);
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (forgotForm) forgotForm.addEventListener('submit', handleForgotPassword);
}
document.addEventListener('DOMContentLoaded', setupAuthPage);
