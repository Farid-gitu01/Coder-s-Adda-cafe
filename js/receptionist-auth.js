// Receptionist-only frontend demo authentication. Never use these client-side checks for real access control.
const RECEPTION_SESSION_KEY = 'codersCupReceptionistSession';
const DEMO_RECEPTIONIST = {
  employeeId: 'EMP001',
  email: 'receptionist@coderscup.com',
  password: 'Demo1234',
  name: 'Aarav Sharma',
  role: 'receptionist'
};

// Persist only receptionist profile metadata; demo passwords are never saved here.
const RECEPTIONIST_PROFILES_KEY = 'codersCupReceptionists';
const defaultReceptionistProfile = {
  employeeId: DEMO_RECEPTIONIST.employeeId,
  email: DEMO_RECEPTIONIST.email,
  name: DEMO_RECEPTIONIST.name,
  mobile: '',
  joiningDate: new Date().toISOString(),
  status: 'Active',
  role: DEMO_RECEPTIONIST.role
};
try {
  const savedProfiles = JSON.parse(localStorage.getItem(RECEPTIONIST_PROFILES_KEY) || 'null');
  const receptionistProfiles = Array.isArray(savedProfiles) ? savedProfiles : [];
  if (!receptionistProfiles.some((profile) => profile.employeeId === DEMO_RECEPTIONIST.employeeId)) {
    receptionistProfiles.unshift(defaultReceptionistProfile);
    localStorage.setItem(RECEPTIONIST_PROFILES_KEY, JSON.stringify(receptionistProfiles));
  }
  window.codersCupReceptionists = receptionistProfiles;
} catch (error) {
  window.codersCupReceptionists = [defaultReceptionistProfile];
}

function showReceptionError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.querySelector(`[data-error-for="${fieldId}"]`);
  if (field) field.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) error.textContent = message;
}
async function hashReceptionistPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
  const toBase64 = (bytes) => btoa(Array.from(new Uint8Array(bytes), (byte) => String.fromCharCode(byte)).join(''));
  return { passwordSalt: toBase64(salt), passwordHash: toBase64(bits) };
}
async function verifyReceptionistPassword(profile, password) {
  if (!profile.passwordHash || !profile.passwordSalt) {
    return profile.employeeId === DEMO_RECEPTIONIST.employeeId && password === DEMO_RECEPTIONIST.password;
  }
  try {
    const salt = Uint8Array.from(atob(profile.passwordSalt), (character) => character.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
    return btoa(Array.from(new Uint8Array(bits), (byte) => String.fromCharCode(byte)).join('')) === profile.passwordHash;
  } catch (error) { return false; }
}
function initializeReceptionLogin() {
  const form = document.getElementById('receptionist-login-form');
  if (!form) return;
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const password = document.getElementById('receptionist-password');
  const toggle = document.getElementById('show-receptionist-password');
  toggle.addEventListener('click', () => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Hide' : 'Show';
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const employeeId = document.getElementById('employee-id').value.trim().toUpperCase();
    const email = document.getElementById('receptionist-email').value.trim().toLowerCase();
    const pass = password.value;
    const feedback = document.getElementById('receptionist-login-feedback');
    feedback.textContent = '';
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    showReceptionError('employee-id', employeeId ? '' : 'Employee ID is required.');
    showReceptionError('receptionist-email', validEmail ? '' : 'Enter a valid email address.');
    showReceptionError('receptionist-password', pass ? '' : 'Password is required.');
    if (!employeeId || !validEmail || !pass) return;

    const storedProfile = window.codersCupReceptionists.find((profile) => profile.employeeId === employeeId && profile.email.toLowerCase() === email);
    const profileActive = storedProfile && storedProfile.status !== 'Inactive';
    const matches = Boolean(profileActive && await verifyReceptionistPassword(storedProfile, pass));
    if (!matches) {
      feedback.textContent = 'The employee ID, email, or password is incorrect.';
      return;
    }

    // Keep the browser demo in one active role at a time.
    localStorage.removeItem('codersCupOwnerSession');
    localStorage.removeItem('codersCupSession');
    localStorage.setItem(RECEPTION_SESSION_KEY, JSON.stringify({ employeeId: storedProfile.employeeId, email: storedProfile.email, name: storedProfile.name, role: DEMO_RECEPTIONIST.role, remember: document.getElementById('remember-receptionist').checked, signedInAt: new Date().toISOString() }));
    window.location.href = 'receptionist-dashboard.html';
  });
}
document.addEventListener('DOMContentLoaded', initializeReceptionLogin);
