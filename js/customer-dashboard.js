// Customer dashboard renderer for profile, orders, bookings and wishlist.
const DASHBOARD_USERS_KEY = 'codersCupCustomers';
const DASHBOARD_SESSION_KEY = 'codersCupSession';
const DASHBOARD_ORDERS_KEY = 'codersCupOrders';
const DASHBOARD_BOOKINGS_KEY = 'codersCupBookings';
const DASHBOARD_CART_KEY = 'codersCupCart';

let activeCustomer = null;

function readJson(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (error) { return fallback; }
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
function getWishlistKey(customerId) { return `codersCupWishlist_${customerId}`; }
function getCustomerWishlist() { return readJson(getWishlistKey(activeCustomer.customerId), []); }
function saveCustomerWishlist(items) { localStorage.setItem(getWishlistKey(activeCustomer.customerId), JSON.stringify(items)); }
function getCustomerRecords(key) {
  const session = readJson(DASHBOARD_SESSION_KEY, null);
  return readJson(key, []).filter((record) => {
    if (record.customerId) return record.customerId === session.customerId;
    return String(record.customerEmail || record.email || '').toLowerCase() === String(session.email || '').toLowerCase();
  });
}
function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? dateString : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
function getFoodCatalog() { return window.codersCupFoodData || []; }

function showDashboardSection(sectionId) {
  const validSections = ['overview', 'profile', 'orders', 'bookings', 'wishlist'];
  const targetId = validSections.includes(sectionId) ? sectionId : 'overview';
  document.querySelectorAll('.dashboard-section').forEach((section) => section.classList.toggle('active-section', section.id === targetId));
  document.querySelectorAll('.dashboard-nav-link[data-section]').forEach((link) => link.classList.toggle('active', link.dataset.section === targetId));
  history.replaceState(null, '', `#${targetId}`);
  document.getElementById('dashboard-sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-toggle').setAttribute('aria-expanded', 'false');
}

function renderCustomerProfile() {
  const customer = activeCustomer;
  const name = customer.name || 'Customer';
  const avatar = document.getElementById('sidebar-avatar');
  document.getElementById('sidebar-name').textContent = name;
  document.getElementById('welcome-name').textContent = name.split(' ')[0];
  document.getElementById('profile-display-name').textContent = name;
  document.getElementById('profile-display-email').textContent = customer.email;
  document.getElementById('profile-name-value').textContent = name;
  document.getElementById('profile-email-value').textContent = customer.email;
  document.getElementById('profile-mobile-value').textContent = customer.mobile || '—';
  document.getElementById('profile-created-value').textContent = formatDate((customer.createdAt || '').slice(0, 10));
  document.getElementById('profile-name').value = name;
  document.getElementById('profile-mobile').value = customer.mobile || '';
  document.getElementById('profile-email').value = customer.email;
  document.getElementById('profile-image-url').value = customer.profileImage || '';
  document.getElementById('profile-image').src = customer.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80';
  if (avatar) avatar.textContent = name.trim().charAt(0).toUpperCase() || 'C';
}

function statusClass(status) {
  return String(status || '').toLowerCase().replace(/\s+/g, '-');
}
function getOrders() {
  return getCustomerRecords(DASHBOARD_ORDERS_KEY).sort((a, b) => new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0));
}
function getBookings() {
  return getCustomerRecords(DASHBOARD_BOOKINGS_KEY).sort((a, b) => new Date(a.bookingDate || 0) - new Date(b.bookingDate || 0));
}
function renderEmpty(message) { return `<div class="empty-state">${escapeHTML(message)}</div>`; }

function renderOrders() {
  const orders = getOrders();
  document.getElementById('stat-orders').textContent = orders.length;
  const tableWrap = document.getElementById('orders-table-wrap');
  if (!orders.length) {
    tableWrap.innerHTML = renderEmpty('No orders yet. Your completed checkout orders will appear here.');
    document.getElementById('recent-orders').innerHTML = renderEmpty('Your recent orders will appear here.');
    return;
  }
  tableWrap.innerHTML = `<table class="data-table"><thead><tr><th>Order ID</th><th>Order Date</th><th>Items</th><th>Total</th><th>Order Type</th><th>Status</th><th>Details</th></tr></thead><tbody>${orders.map((order, index) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const itemText = items.length ? items.map((item) => `${item.quantity} × ${item.name}`).join(', ') : 'Order items';
    const status = order.orderStatus || order.status || 'Completed';
    return `<tr><td>${escapeHTML(order.orderId || '—')}</td><td>${escapeHTML(formatDate((order.orderDate || order.createdAt || '').slice(0, 10)))}</td><td>${escapeHTML(itemText)}</td><td>${escapeHTML(order.total || '—')}</td><td>${escapeHTML(order.orderType || 'Dine In')}</td><td><span class="status-chip ${escapeHTML(statusClass(status))}">${escapeHTML(status)}</span></td><td><button class="table-action" type="button" data-order-index="${index}">View Details</button></td></tr>`;
  }).join('')}</tbody></table>`;
  tableWrap.querySelectorAll('[data-order-index]').forEach((button) => button.addEventListener('click', () => showRecordDetails('Order Details', orders[Number(button.dataset.orderIndex)], 'order')));
  document.getElementById('recent-orders').innerHTML = orders.slice(0, 3).map((order) => `<div class="activity-row"><div><strong>${escapeHTML(order.orderId || 'Order')}</strong><small>${escapeHTML(formatDate((order.orderDate || order.createdAt || '').slice(0, 10)))} · ${escapeHTML(order.orderType || 'Dine In')}</small></div><strong>${escapeHTML(order.total || '—')}</strong></div>`).join('');
}

function renderBookings() {
  const bookings = getBookings();
  document.getElementById('stat-bookings').textContent = bookings.length;
  const tableWrap = document.getElementById('bookings-table-wrap');
  if (!bookings.length) {
    tableWrap.innerHTML = renderEmpty('No table bookings yet. Reservations made with this account will appear here.');
    document.getElementById('upcoming-bookings').innerHTML = renderEmpty('No upcoming bookings.');
    return;
  }
  tableWrap.innerHTML = `<table class="data-table"><thead><tr><th>Booking ID</th><th>Date</th><th>Time</th><th>Table</th><th>Guests</th><th>Status</th><th>Details</th></tr></thead><tbody>${bookings.map((booking, index) => {
    const status = booking.bookingStatus === 'Pending Confirmation' ? 'Pending' : booking.bookingStatus || 'Pending';
    return `<tr><td>${escapeHTML(booking.bookingId || '—')}</td><td>${escapeHTML(formatDate(booking.bookingDate))}</td><td>${escapeHTML(booking.bookingTime || '—')}</td><td>Table ${escapeHTML(booking.tableNumber ?? '—')}</td><td>${escapeHTML(booking.numberOfGuests ?? '—')}</td><td><span class="status-chip ${escapeHTML(statusClass(status))}">${escapeHTML(status)}</span></td><td><button class="table-action" type="button" data-booking-index="${index}">View Details</button></td></tr>`;
  }).join('')}</tbody></table>`;
  tableWrap.querySelectorAll('[data-booking-index]').forEach((button) => button.addEventListener('click', () => showRecordDetails('Booking Details', bookings[Number(button.dataset.bookingIndex)], 'booking')));
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((booking) => booking.bookingDate >= today && booking.bookingStatus !== 'Cancelled').slice(0, 3);
  document.getElementById('upcoming-bookings').innerHTML = upcoming.length ? upcoming.map((booking) => `<div class="activity-row"><div><strong>${escapeHTML(booking.bookingId || `Table ${booking.tableNumber}`)}</strong><small>${escapeHTML(formatDate(booking.bookingDate))} · ${escapeHTML(booking.bookingTime || '')}</small></div><span class="status-chip">Table ${escapeHTML(booking.tableNumber)}</span></div>`).join('') : renderEmpty('No upcoming bookings.');
}

function showRecordDetails(title, record, kind) {
  const details = kind === 'order'
    ? [['Order ID', record.orderId], ['Date', formatDate((record.orderDate || record.createdAt || '').slice(0, 10))], ['Order Type', record.orderType], ['Payment', record.paymentMethod], ['Status', record.orderStatus || record.status || 'Completed'], ['Total', record.total], ['Items', (record.items || []).map((item) => `${item.quantity} × ${item.name} — ₹${item.price}`).join('; ') || 'Item details unavailable']]
    : [['Booking ID', record.bookingId], ['Date', formatDate(record.bookingDate)], ['Time', record.bookingTime], ['Table', `Table ${record.tableNumber}`], ['Guests', record.numberOfGuests], ['Capacity', record.capacity ? `${record.capacity} seats` : '—'], ['Status', record.bookingStatus === 'Pending Confirmation' ? 'Pending' : record.bookingStatus || 'Pending'], ['Special Requests', record.specialRequests || 'None']];
  document.getElementById('details-title').textContent = title;
  document.getElementById('details-content').innerHTML = details.map(([label, value]) => `<div class="detail-row"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value || '—')}</strong></div>`).join('');
  document.getElementById('details-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeDetails() { document.getElementById('details-modal').classList.add('hidden'); document.body.style.overflow = ''; }

function renderWishlist() {
  const items = getCustomerWishlist();
  const catalog = getFoodCatalog();
  const wishlist = items.map((id) => catalog.find((food) => Number(food.id) === Number(id))).filter(Boolean);
  document.getElementById('stat-wishlist').textContent = wishlist.length;
  const grid = document.getElementById('wishlist-grid');
  if (!wishlist.length) { grid.innerHTML = renderEmpty('Your wishlist is empty. Save favourites from the menu to find them here.'); return; }
  grid.innerHTML = wishlist.map((food) => `<article class="wishlist-card"><img src="${escapeHTML(food.image)}" alt="${escapeHTML(food.name)}" /><div class="wishlist-card-body"><h3>${escapeHTML(food.name)}</h3><strong>₹${Number(food.price).toFixed(0)}</strong><div class="wishlist-actions"><button type="button" class="btn btn-primary" data-wishlist-cart="${food.id}">Add to Cart</button><button type="button" class="btn btn-secondary" data-wishlist-remove="${food.id}">Remove</button></div></div></article>`).join('');
  grid.querySelectorAll('[data-wishlist-remove]').forEach((button) => button.addEventListener('click', () => {
    saveCustomerWishlist(getCustomerWishlist().filter((id) => Number(id) !== Number(button.dataset.wishlistRemove)));
    renderWishlist();
  }));
  grid.querySelectorAll('[data-wishlist-cart]').forEach((button) => button.addEventListener('click', () => {
    const id = Number(button.dataset.wishlistCart);
    const cart = readJson(DASHBOARD_CART_KEY, []);
    const existing = cart.find((entry) => Number(entry.id) === id);
    if (existing) existing.quantity += 1; else cart.push({ id, quantity: 1 });
    localStorage.setItem(DASHBOARD_CART_KEY, JSON.stringify(cart));
    button.textContent = 'Added';
    button.disabled = true;
  }));
}

function editProfile() {
  document.getElementById('profile-readonly').classList.add('hidden');
  document.getElementById('profile-form').classList.remove('hidden');
  document.getElementById('profile-feedback').textContent = '';
}
function cancelProfileEdit() {
  renderCustomerProfile();
  document.getElementById('profile-readonly').classList.remove('hidden');
  document.getElementById('profile-form').classList.add('hidden');
}
function saveProfile(event) {
  event.preventDefault();
  const name = document.getElementById('profile-name').value.trim();
  const mobile = document.getElementById('profile-mobile').value.trim();
  const email = document.getElementById('profile-email').value.trim().toLowerCase();
  const image = document.getElementById('profile-image-url').value.trim();
  const feedback = document.getElementById('profile-feedback');
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^([+]?91|0)?[6-9]\d{9}$/.test(mobile.replace(/[\s-]/g, ''))) { feedback.textContent = 'Enter a name, valid email, and valid Indian mobile number.'; return; }
  if (image && !/^https?:\/\//i.test(image)) { feedback.textContent = 'Profile image must be an http or https URL.'; return; }
  const users = readJson(DASHBOARD_USERS_KEY, []);
  if (users.some((user) => user.email === email && user.customerId !== activeCustomer.customerId)) { feedback.textContent = 'That email is already used by another demo account.'; return; }
  const index = users.findIndex((user) => user.customerId === activeCustomer.customerId);
  if (index < 0) { feedback.textContent = 'Could not find this demo account.'; return; }
  users[index] = { ...users[index], name, mobile, email, profileImage: image };
  localStorage.setItem(DASHBOARD_USERS_KEY, JSON.stringify(users));
  const session = readJson(DASHBOARD_SESSION_KEY, {});
  localStorage.setItem(DASHBOARD_SESSION_KEY, JSON.stringify({ ...session, email }));
  activeCustomer = users[index];
  renderCustomerProfile();
  document.getElementById('profile-readonly').classList.remove('hidden');
  document.getElementById('profile-form').classList.add('hidden');
}

function logout() {
  localStorage.removeItem(DASHBOARD_SESSION_KEY);
  window.location.href = 'index.html';
}
function requireCustomerSession() {
  const session = readJson(DASHBOARD_SESSION_KEY, null);
  if (!session || session.role !== 'customer' || !session.customerId) { window.location.replace('login.html'); return false; }
  activeCustomer = readJson(DASHBOARD_USERS_KEY, []).find((user) => user.customerId === session.customerId) || null;
  if (!activeCustomer) { localStorage.removeItem(DASHBOARD_SESSION_KEY); window.location.replace('login.html'); return false; }
  return true;
}
function setupDashboard() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  if (!requireCustomerSession()) return;
  renderCustomerProfile(); renderOrders(); renderBookings(); renderWishlist();
  document.querySelectorAll('.dashboard-nav-link[data-section], [data-section="orders"], [data-section="bookings"]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); showDashboardSection(link.dataset.section); }));
  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', logout));
  document.getElementById('edit-profile').addEventListener('click', editProfile);
  document.getElementById('cancel-profile').addEventListener('click', cancelProfileEdit);
  document.getElementById('profile-form').addEventListener('submit', saveProfile);
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('dashboard-sidebar');
    const isOpen = sidebar.classList.toggle('mobile-open');
    document.getElementById('sidebar-toggle').setAttribute('aria-expanded', String(isOpen));
  });
  document.getElementById('close-details').addEventListener('click', closeDetails);
  document.getElementById('details-done').addEventListener('click', closeDetails);
  document.getElementById('details-modal').addEventListener('click', (event) => { if (event.target.id === 'details-modal') closeDetails(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDetails(); });
  window.addEventListener('storage', (event) => {
    if (event.key === 'codersCupOrders') renderOrders();
    if (event.key === 'codersCupBookings') renderBookings();
  });
  const section = location.hash.slice(1);
  if (section) showDashboardSection(section);
}
document.addEventListener('DOMContentLoaded', setupDashboard);
