// Receptionist operations dashboard. This frontend demo shares the browser's existing order, booking, and customer records.
const RECEPTION_SESSION_KEY = 'codersCupReceptionistSession';
const RECEPTION_ORDERS_KEY = 'codersCupOrders';
const RECEPTION_BOOKINGS_KEY = 'codersCupBookings';
const RECEPTION_CUSTOMERS_KEY = 'codersCupCustomers';
const RECEPTION_TABLE_STATUS_KEY = 'codersCupTableStatuses';
const RECEPTION_TABLES = [
  { tableId: 'T1', tableNumber: 1, capacity: 2, tableType: 'Small Table' },
  { tableId: 'T2', tableNumber: 2, capacity: 2, tableType: 'Small Table' },
  { tableId: 'T3', tableNumber: 3, capacity: 2, tableType: 'Small Table' },
  { tableId: 'T4', tableNumber: 4, capacity: 2, tableType: 'Small Table' },
  { tableId: 'T5', tableNumber: 5, capacity: 4, tableType: 'Medium Table' },
  { tableId: 'T6', tableNumber: 6, capacity: 4, tableType: 'Medium Table' },
  { tableId: 'T7', tableNumber: 7, capacity: 4, tableType: 'Medium Table' },
  { tableId: 'T8', tableNumber: 8, capacity: 4, tableType: 'Medium Table' },
  { tableId: 'T9', tableNumber: 9, capacity: 6, tableType: 'Large Table' },
  { tableId: 'T10', tableNumber: 10, capacity: 6, tableType: 'Large Table' }
];
const ORDER_STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
const BOOKING_STATUSES = ['Pending Confirmation', 'Confirmed', 'Cancelled'];
let receptionistSession = null;
let currentReceiptOrder = null;
let knownOrderIds = new Set();

function readStore(key, fallback = []) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    return parsed ?? fallback;
  } catch (error) { return fallback; }
}
function writeStore(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function getOrders() { return readStore(RECEPTION_ORDERS_KEY, []).slice().sort((a, b) => new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0)); }
function getBookings() { return readStore(RECEPTION_BOOKINGS_KEY, []).slice().sort((a, b) => `${a.bookingDate || ''} ${a.bookingTime || ''}`.localeCompare(`${b.bookingDate || ''} ${b.bookingTime || ''}`)); }
function getCustomers() { return readStore(RECEPTION_CUSTOMERS_KEY, []); }
function orderStatus(order) { return order.orderStatus || order.status || 'Completed'; }
function bookingStatus(booking) { return booking.bookingStatus === 'Pending Confirmation' ? 'Pending' : booking.bookingStatus || 'Pending'; }
function statusToken(value) { return String(value || '').toLowerCase().replace(/\s+/g, '-'); }
function displayDate(value) {
  if (!value) return '—';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
function displayDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}
function toast(message, isError = false) {
  const region = document.getElementById('toast-region');
  const item = document.createElement('div');
  item.className = `reception-toast${isError ? ' error' : ''}`;
  item.textContent = message;
  region.appendChild(item);
  window.setTimeout(() => item.remove(), 3500);
}
function setActiveSection(sectionName) {
  const names = ['overview', 'orders', 'bookings', 'tables', 'customers'];
  const target = names.includes(sectionName) ? sectionName : 'overview';
  document.querySelectorAll('.reception-section').forEach((section) => section.classList.toggle('active', section.id === `section-${target}`));
  document.querySelectorAll('.reception-nav-link').forEach((button) => button.classList.toggle('active', button.dataset.section === target));
  const titles = { overview: 'Dashboard Overview', orders: 'Orders Management', bookings: 'Table Bookings', tables: 'Table Management', customers: 'Customer Details' };
  document.getElementById('active-page-title').textContent = titles[target];
  history.replaceState(null, '', `#${target}`);
  document.getElementById('reception-sidebar').classList.remove('open');
  document.getElementById('reception-menu-toggle').setAttribute('aria-expanded', 'false');
}
function setUpClock() {
  const clock = document.getElementById('current-datetime');
  const update = () => { clock.textContent = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date()); };
  update();
  window.setInterval(update, 60000);
}

function renderStats() {
  const today = localDateKey();
  const orders = getOrders();
  const bookings = getBookings();
  const todaysOrders = orders.filter((order) => String(order.orderDate || order.createdAt || '').slice(0, 10) === today);
  const todaysBookings = bookings.filter((booking) => booking.bookingDate === today);
  const pendingOrders = orders.filter((order) => orderStatus(order) === 'Pending').length;
  const pendingBookings = bookings.filter((booking) => ['Pending', 'Pending Confirmation'].includes(booking.bookingStatus)).length;
  const unavailable = RECEPTION_TABLES.filter((table) => deriveTableStatus(table).status !== 'available').length;
  const stats = [
    ['◷', todaysOrders.length, "Today's Orders"],
    ['!', pendingOrders, 'Pending Orders'],
    ['▣', todaysBookings.length, "Today's Bookings"],
    ['…', pendingBookings, 'Pending Reservations'],
    ['◉', RECEPTION_TABLES.length - unavailable, 'Available Tables'],
    ['♙', getCustomers().length, 'Total Customers']
  ];
  document.getElementById('stats-grid').innerHTML = stats.map(([icon, value, label]) => `<article class="reception-stat"><span class="reception-stat-icon">${icon}</span><div><strong>${value}</strong><span>${label}</span></div></article>`).join('');
  document.getElementById('notification-count').textContent = String(pendingOrders + pendingBookings);
}
function getCustomerForRecord(record) {
  const customers = getCustomers();
  return customers.find((customer) => (record.customerId && customer.customerId === record.customerId)
    || String(customer.email || '').toLowerCase() === String(record.customerEmail || record.email || '').toLowerCase());
}
function customerName(record) { return record.customerName || getCustomerForRecord(record)?.name || 'Guest'; }
function itemSummary(order) {
  if (!Array.isArray(order.items) || !order.items.length) return 'Order items not recorded';
  return order.items.map((item) => `${item.quantity} × ${item.name}`).join(', ');
}
function paymentStatus(order) { return order.paymentStatus || 'Pending'; }
function formatTableReference(value) {
  if (!value) return '—';
  const reference = String(value).trim();
  return /^table\b/i.test(reference) ? reference : `Table ${reference}`;
}
function parseCurrency(value) {
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}
function formatCurrency(value) { return `₹${Number(value || 0).toFixed(2)}`; }
function getOrderAmounts(order) {
  const itemsSubtotal = (Array.isArray(order.items) ? order.items : []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const subtotal = Number(order.subtotal ?? order.subTotal ?? itemsSubtotal);
  const tax = Number(order.tax ?? order.gst ?? order.taxAmount ?? subtotal * 0.05);
  const delivery = Number(order.delivery ?? order.deliveryCharge ?? (order.items?.length ? 49 : 0));
  const discount = Number(order.discount ?? order.couponDiscount ?? 0);
  const total = parseCurrency(order.total) || Math.max(subtotal + tax + delivery - discount, 0);
  return { subtotal, tax, delivery, discount, total };
}
function emptyTable(message, columns = 1) { return `<div class="empty-table-state" style="min-width:${Math.max(1, columns) * 80}px">${escapeHTML(message)}</div>`; }
function detailsButton(type, id, label = 'View') { return `<button type="button" class="row-action" data-view-record="${escapeHTML(type)}" data-record-id="${escapeHTML(id)}">${label}</button>`; }
function renderRecentOrders() {
  const orders = getOrders().slice(0, 5);
  const target = document.getElementById('recent-orders-table');
  if (!orders.length) { target.innerHTML = emptyTable('No orders recorded yet.', 7); return; }
  target.innerHTML = `<table class="reception-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Type</th><th>Total</th><th>Status</th><th>Details</th></tr></thead><tbody>${orders.map((order) => `<tr><td>${escapeHTML(order.orderId || '—')}</td><td>${escapeHTML(customerName(order))}</td><td>${escapeHTML(displayDate(order.orderDate || order.createdAt))}</td><td>${escapeHTML(order.orderType || 'Dine In')}</td><td>${escapeHTML(order.total || '—')}</td><td><span class="status-badge ${statusToken(orderStatus(order))}">${escapeHTML(orderStatus(order))}</span></td><td>${detailsButton('order', order.orderId)}</td></tr>`).join('')}</tbody></table>`;
}
function renderUpcomingBookings() {
  const today = localDateKey();
  const bookings = getBookings().filter((booking) => booking.bookingDate >= today && booking.bookingStatus !== 'Cancelled').slice(0, 5);
  const target = document.getElementById('upcoming-bookings-table');
  if (!bookings.length) { target.innerHTML = emptyTable('No upcoming reservations.', 7); return; }
  target.innerHTML = `<table class="reception-table"><thead><tr><th>Booking ID</th><th>Customer</th><th>Date</th><th>Time</th><th>Guests</th><th>Table</th><th>Status</th></tr></thead><tbody>${bookings.map((booking) => `<tr><td>${escapeHTML(booking.bookingId || '—')}</td><td>${escapeHTML(customerName(booking))}</td><td>${escapeHTML(displayDate(booking.bookingDate))}</td><td>${escapeHTML(booking.bookingTime || '—')}</td><td>${escapeHTML(booking.numberOfGuests ?? '—')}</td><td>${escapeHTML(booking.tableNumber ?? '—')}</td><td><span class="status-badge ${statusToken(bookingStatus(booking))}">${escapeHTML(bookingStatus(booking))}</span></td></tr>`).join('')}</tbody></table>`;
}

function renderOrderManagement() {
  const search = document.getElementById('order-search').value.trim().toLowerCase();
  const statusFilter = document.getElementById('order-status-filter').value;
  const typeFilter = document.getElementById('order-type-filter').value;
  const paymentFilter = document.getElementById('order-payment-filter').value;
  const dateFilter = document.getElementById('order-date-filter').value;
  const sortOrder = document.getElementById('order-sort-filter').value;
  const allOrders = getOrders();
  renderOrderStatistics(allOrders);
  const orders = allOrders.filter((order) => {
    const matchesText = !search || `${order.orderId || ''} ${customerName(order)}`.toLowerCase().includes(search);
    const matchesStatus = !statusFilter || orderStatus(order) === statusFilter;
    const matchesType = !typeFilter || order.orderType === typeFilter;
    const matchesPayment = !paymentFilter || paymentStatus(order) === paymentFilter;
    const matchesDate = !dateFilter || String(order.orderDate || order.createdAt || '').slice(0, 10) === dateFilter;
    return matchesText && matchesStatus && matchesType && matchesPayment && matchesDate;
  });
  orders.sort((first, second) => {
    const difference = new Date(first.orderDate || first.createdAt || 0) - new Date(second.orderDate || second.createdAt || 0);
    return sortOrder === 'oldest' ? difference : -difference;
  });
  const target = document.getElementById('orders-management-table');
  if (!orders.length) {
    target.innerHTML = emptyTable(allOrders.length ? 'No orders match the selected filters.' : 'No customer orders yet. New orders will appear here.', 10);
    return;
  }
  target.innerHTML = `<table class="reception-table"><thead><tr><th>Order ID</th><th>Customer Name</th><th>Order Type</th><th>Table</th><th>Items</th><th>Total Amount</th><th>Order Date &amp; Time</th><th>Payment Status</th><th>Order Status</th><th>Action</th></tr></thead><tbody>${orders.map((order) => {
    const currentStatus = orderStatus(order);
    const options = getAllowedOrderStatuses(currentStatus).map((status) => `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status}</option>`).join('');
    const tableNumber = order.tableNumber || order.tableReference || '';
    return `<tr><td>${escapeHTML(order.orderId || '—')}</td><td>${escapeHTML(customerName(order))}<span class="table-cell-sub">${escapeHTML(order.mobile || getCustomerForRecord(order)?.mobile || order.customerEmail || '')}</span></td><td>${escapeHTML(order.orderType || 'Dine In')}</td><td>${escapeHTML(formatTableReference(tableNumber))}</td><td><span class="table-cell-sub" title="${escapeHTML(itemSummary(order))}">${escapeHTML(itemSummary(order))}</span></td><td>${escapeHTML(order.total || formatCurrency(getOrderAmounts(order).total))}</td><td>${escapeHTML(displayDateTime(order.orderDate || order.createdAt))}</td><td><span class="status-badge ${statusToken(paymentStatus(order))}">${escapeHTML(paymentStatus(order))}</span></td><td><span class="status-badge ${statusToken(currentStatus)}">${escapeHTML(currentStatus)}</span></td><td><div class="row-actions">${detailsButton('order', order.orderId, 'View Details')}<select aria-label="Update status for ${escapeHTML(order.orderId)}" data-order-status="${escapeHTML(order.orderId)}">${options}</select></div></td></tr>`;
  }).join('')}</tbody></table>`;
  target.querySelectorAll('[data-order-status]').forEach((select) => select.addEventListener('change', () => updateOrderStatus(select.dataset.orderStatus, select.value)));
}
function getAllowedOrderStatuses(currentStatus) {
  const workflow = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];
  const currentIndex = workflow.indexOf(currentStatus);
  if (currentIndex < 0) return [currentStatus];
  const allowed = [currentStatus];
  if (currentIndex < workflow.length - 1) allowed.push(workflow[currentIndex + 1]);
  if (currentIndex < workflow.length - 1) allowed.push('Cancelled');
  return allowed;
}
function renderOrderStatistics(orders = getOrders()) {
  const counts = [
    ['Total Orders', orders.length, 'all'],
    ['Pending Orders', orders.filter((order) => orderStatus(order) === 'Pending').length, 'pending'],
    ['Preparing Orders', orders.filter((order) => orderStatus(order) === 'Preparing').length, 'preparing'],
    ['Ready Orders', orders.filter((order) => orderStatus(order) === 'Ready').length, 'ready'],
    ['Completed Orders', orders.filter((order) => orderStatus(order) === 'Completed').length, 'completed']
  ];
  document.getElementById('order-statistics').innerHTML = counts.map(([label, count, token]) => `<article class="order-stat-card ${token}"><span>${escapeHTML(label)}</span><strong>${count}</strong></article>`).join('');
}
function updateOrderStatus(orderId, nextStatus) {
  if (!ORDER_STATUSES.includes(nextStatus)) return;
  const orders = getOrders();
  const order = orders.find((record) => record.orderId === orderId);
  if (!order) { toast('Order was not found.', true); return; }
  if (!getAllowedOrderStatuses(orderStatus(order)).includes(nextStatus)) {
    toast(`Follow the order workflow to update ${orderId}.`, true);
    renderOrderManagement();
    return;
  }
  if (nextStatus === 'Cancelled' && !window.confirm(`Cancel order ${orderId}?`)) { renderOrderManagement(); return; }
  order.orderStatus = nextStatus;
  order.status = nextStatus;
  writeStore(RECEPTION_ORDERS_KEY, orders);
  toast(`${orderId} updated to ${nextStatus}.`);
  refreshDashboard();
}

function parseTimeMinutes(timeText) {
  const match = String(timeText || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  return hours * 60 + Number(match[2]);
}
function bookingsOverlap(first, second) {
  if (first.bookingDate !== second.bookingDate || Number(first.tableNumber) !== Number(second.tableNumber)) return false;
  const firstTime = parseTimeMinutes(first.bookingTime);
  const secondTime = parseTimeMinutes(second.bookingTime);
  return firstTime !== null && secondTime !== null && Math.abs(firstTime - secondTime) < 90;
}
function hasConfirmedConflict(targetBooking) {
  return getBookings().some((booking) => booking.bookingId !== targetBooking.bookingId
    && booking.bookingStatus === 'Confirmed' && bookingsOverlap(targetBooking, booking));
}
function populateTableFilter() {
  const filter = document.getElementById('booking-table-filter');
  if (!filter) return;
  const current = filter.value;
  filter.innerHTML = '<option value="">All tables</option>' + RECEPTION_TABLES.map((table) => `<option value="${table.tableNumber}">Table ${table.tableNumber}</option>`).join('');
  filter.value = current;
}
function renderBookingManagement() {
  const search = document.getElementById('booking-search').value.trim().toLowerCase();
  const dateFilter = document.getElementById('booking-date-filter').value;
  const statusFilter = document.getElementById('booking-status-filter').value;
  const tableFilter = document.getElementById('booking-table-filter').value;
  const bookings = getBookings().filter((booking) => {
    const matchesText = !search || `${booking.bookingId || ''} ${customerName(booking)}`.toLowerCase().includes(search);
    const matchesDate = !dateFilter || booking.bookingDate === dateFilter;
    const matchesStatus = !statusFilter || booking.bookingStatus === statusFilter || (statusFilter === 'Pending Confirmation' && booking.bookingStatus === 'Pending');
    const matchesTable = !tableFilter || Number(booking.tableNumber) === Number(tableFilter);
    return matchesText && matchesDate && matchesStatus && matchesTable;
  });
  const target = document.getElementById('bookings-management-table');
  if (!bookings.length) { target.innerHTML = emptyTable('No reservations match the selected filters.', 9); return; }
  target.innerHTML = `<table class="reception-table"><thead><tr><th>Booking ID</th><th>Customer</th><th>Mobile</th><th>Date</th><th>Time</th><th>Guests</th><th>Table</th><th>Status</th><th>Actions</th></tr></thead><tbody>${bookings.map((booking) => {
    const status = bookingStatus(booking);
    const canConfirm = status === 'Pending';
    const actions = `${detailsButton('booking', booking.bookingId)}${canConfirm ? `<button type="button" class="row-action" data-booking-action="confirm" data-booking-id="${escapeHTML(booking.bookingId)}">Confirm</button>` : ''}${status !== 'Cancelled' ? `<button type="button" class="row-action" data-booking-action="cancel" data-booking-id="${escapeHTML(booking.bookingId)}">Cancel</button>` : ''}`;
    return `<tr><td>${escapeHTML(booking.bookingId || '—')}</td><td>${escapeHTML(customerName(booking))}</td><td>${escapeHTML(booking.mobile || getCustomerForRecord(booking)?.mobile || '—')}</td><td>${escapeHTML(displayDate(booking.bookingDate))}</td><td>${escapeHTML(booking.bookingTime || '—')}</td><td>${escapeHTML(booking.numberOfGuests ?? '—')}</td><td>${escapeHTML(booking.tableNumber ?? '—')}</td><td><span class="status-badge ${statusToken(status)}">${escapeHTML(status)}</span></td><td><div class="row-actions">${actions}</div></td></tr>`;
  }).join('')}</tbody></table>`;
  target.querySelectorAll('[data-booking-action]').forEach((button) => button.addEventListener('click', () => updateBookingStatus(button.dataset.bookingId, button.dataset.bookingAction)));
}
function updateBookingStatus(bookingId, action) {
  const bookings = getBookings();
  const booking = bookings.find((record) => record.bookingId === bookingId);
  if (!booking) { toast('Reservation was not found.', true); return; }
  if (action === 'confirm') {
    if (hasConfirmedConflict(booking)) { toast('Cannot confirm: this table has an overlapping confirmed reservation.', true); return; }
    if (!window.confirm(`Confirm reservation ${bookingId} for Table ${booking.tableNumber}?`)) return;
    booking.bookingStatus = 'Confirmed';
  } else {
    if (!window.confirm(`Cancel reservation ${bookingId}?`)) return;
    booking.bookingStatus = 'Cancelled';
  }
  writeStore(RECEPTION_BOOKINGS_KEY, bookings);
  toast(`${bookingId} ${action === 'confirm' ? 'confirmed' : 'cancelled'}.`);
  refreshDashboard();
}

function getCurrentActiveBookings() {
  const today = localDateKey();
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  return getBookings().filter((booking) => {
    if (booking.bookingDate !== today || booking.bookingStatus !== 'Confirmed') return false;
    const start = parseTimeMinutes(booking.bookingTime);
    return start !== null && now >= start && now < start + 90;
  });
}
function getUpcomingConfirmedBooking(tableNumber) {
  const today = localDateKey();
  return getBookings().find((booking) => Number(booking.tableNumber) === Number(tableNumber)
    && booking.bookingStatus === 'Confirmed' && booking.bookingDate >= today);
}
function getTableStatuses() { return readStore(RECEPTION_TABLE_STATUS_KEY, {}); }
function deriveTableStatus(table) {
  const active = getCurrentActiveBookings().find((booking) => Number(booking.tableNumber) === table.tableNumber);
  const manual = getTableStatuses()[table.tableNumber];
  if (active) return { status: 'occupied', booking: active, locked: true };
  if (manual === 'cleaning') return { status: 'cleaning', booking: null, locked: false };
  if (manual === 'occupied') return { status: 'occupied', booking: null, locked: false };
  const upcoming = getUpcomingConfirmedBooking(table.tableNumber);
  if (upcoming && upcoming.bookingDate === localDateKey()) return { status: 'reserved', booking: upcoming, locked: false };
  return { status: 'available', booking: upcoming || null, locked: false };
}
function renderTableManagement() {
  const target = document.getElementById('table-management-grid');
  const statuses = getTableStatuses();
  target.innerHTML = RECEPTION_TABLES.map((table) => {
    const state = deriveTableStatus(table);
    const bookingDetails = state.booking
      ? `${state.booking.bookingDate === localDateKey() ? 'Today' : displayDate(state.booking.bookingDate)} · ${state.booking.bookingTime} · ${escapeHTML(customerName(state.booking))}`
      : 'No confirmed reservation attached.';
    const disabled = state.locked ? 'disabled' : '';
    const statusChoices = state.status === 'reserved' ? ['reserved', 'available', 'occupied', 'cleaning'] : ['available', 'occupied', 'cleaning'];
    const options = statusChoices.map((status) => `<option value="${status}" ${status === state.status ? 'selected' : ''} ${status === 'reserved' || (state.locked && status !== 'occupied') ? 'disabled' : ''}>${status.charAt(0).toUpperCase() + status.slice(1)}</option>`).join('');
    return `<article class="managed-table-card"><div class="managed-table-head"><h3>Table ${table.tableNumber}</h3><span class="status-badge ${state.status}">${state.status}</span></div><p>${table.tableType} · ${table.capacity} seats</p><div class="managed-table-booking">${bookingDetails}</div><div class="managed-table-controls"><select aria-label="Set Table ${table.tableNumber} status" data-table-status="${table.tableNumber}" ${disabled}>${options}</select><button type="button" data-table-details="${table.tableNumber}" ${state.booking ? '' : 'disabled'}>Booking</button></div></article>`;
  }).join('');
  target.querySelectorAll('[data-table-status]').forEach((select) => select.addEventListener('change', () => updateTableStatus(Number(select.dataset.tableStatus), select.value)));
  target.querySelectorAll('[data-table-details]').forEach((button) => button.addEventListener('click', () => {
    const booking = getUpcomingConfirmedBooking(Number(button.dataset.tableDetails)) || getCurrentActiveBookings().find((item) => Number(item.tableNumber) === Number(button.dataset.tableDetails));
    if (booking) showRecordDetails('booking', booking);
  }));
}
function updateTableStatus(tableNumber, status) {
  if (!['available', 'occupied', 'cleaning'].includes(status)) return;
  const active = getCurrentActiveBookings().find((booking) => Number(booking.tableNumber) === tableNumber);
  if (active && status !== 'occupied') { toast('This table is occupied by an active confirmed booking.', true); renderTableManagement(); return; }
  if (!active && getUpcomingConfirmedBooking(tableNumber)?.bookingDate === localDateKey() && status !== 'reserved' && status !== 'occupied') {
    toast('This table has a confirmed reservation today.', true); renderTableManagement(); return;
  }
  if (!window.confirm(`Set Table ${tableNumber} to ${status}?`)) { renderTableManagement(); return; }
  const statuses = getTableStatuses();
  if (status === 'available') delete statuses[tableNumber]; else statuses[tableNumber] = status;
  writeStore(RECEPTION_TABLE_STATUS_KEY, statuses);
  toast(`Table ${tableNumber} marked ${status}.`);
  refreshDashboard();
}

function renderCustomers() {
  const query = document.getElementById('customer-search').value.trim().toLowerCase();
  const filter = document.getElementById('customer-filter').value;
  const orders = getOrders();
  const bookings = getBookings();
  const customers = getCustomers().map((customer) => {
    const customerOrders = orders.filter((order) => order.customerId === customer.customerId || String(order.customerEmail || '').toLowerCase() === String(customer.email).toLowerCase());
    const customerBookings = bookings.filter((booking) => booking.customerId === customer.customerId || String(booking.customerEmail || booking.email || '').toLowerCase() === String(customer.email).toLowerCase());
    return { ...customer, customerOrders, customerBookings };
  }).filter((customer) => {
    const matchesText = !query || `${customer.customerId} ${customer.name} ${customer.email} ${customer.mobile}`.toLowerCase().includes(query);
    const matchesType = !filter || (filter === 'orders' ? customer.customerOrders.length > 0 : customer.customerBookings.length > 0);
    return matchesText && matchesType;
  });
  const target = document.getElementById('customers-management-table');
  if (!customers.length) { target.innerHTML = emptyTable('No registered customers match this search.', 8); return; }
  target.innerHTML = `<table class="reception-table"><thead><tr><th>Customer ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Orders</th><th>Bookings</th><th>Registered</th><th>Details</th></tr></thead><tbody>${customers.map((customer) => `<tr><td>${escapeHTML(customer.customerId || '—')}</td><td>${escapeHTML(customer.name || '—')}</td><td>${escapeHTML(customer.email || '—')}</td><td>${escapeHTML(customer.mobile || '—')}</td><td>${customer.customerOrders.length}</td><td>${customer.customerBookings.length}</td><td>${escapeHTML(displayDate(customer.createdAt))}</td><td><button type="button" class="row-action" data-customer-id="${escapeHTML(customer.customerId)}">View Details</button></td></tr>`).join('')}</tbody></table>`;
  target.querySelectorAll('[data-customer-id]').forEach((button) => button.addEventListener('click', () => {
    const customer = customers.find((record) => record.customerId === button.dataset.customerId);
    if (customer) showCustomerDetails(customer);
  }));
}
function showCustomerDetails(customer) {
  currentReceiptOrder = null;
  const rows = [
    ['Customer ID', customer.customerId], ['Name', customer.name], ['Email', customer.email], ['Mobile', customer.mobile],
    ['Registered', displayDate(customer.createdAt)],
    ['Order history', customer.customerOrders.map((order) => `${order.orderId} (${order.total || '—'})`).join(', ') || 'No orders'],
    ['Booking history', customer.customerBookings.map((booking) => `${booking.bookingId} · ${displayDate(booking.bookingDate)} · Table ${booking.tableNumber}`).join('; ') || 'No bookings']
  ];
  openModal('Customer Details', rows);
}

function showRecordDetails(type, record) {
  if (!record) { toast('Record not found.', true); return; }
  let rows;
  let extraHTML = '';
  if (type === 'order') {
    const customer = getCustomerForRecord(record);
    const amounts = getOrderAmounts(record);
    const items = Array.isArray(record.items) ? record.items : [];
    const tableNumber = record.tableNumber || record.tableReference || '';
    rows = [
      ['Order ID', record.orderId], ['Customer', customerName(record)],
      ['Mobile', record.mobile || customer?.mobile], ['Email', record.customerEmail || customer?.email],
      ['Order Type', record.orderType || 'Dine In'], ['Table Number', tableNumber ? formatTableReference(tableNumber) : 'Not applicable'],
      ['Order Date & Time', displayDateTime(record.orderDate || record.createdAt)],
      ['Payment Method', record.paymentMethod], ['Payment Status', paymentStatus(record)], ['Order Status', orderStatus(record)],
      ['Subtotal', formatCurrency(amounts.subtotal)], ['Tax', formatCurrency(amounts.tax)],
      ['Additional Charges', formatCurrency(amounts.delivery)], ['Discount', `-${formatCurrency(amounts.discount)}`], ['Final Total', formatCurrency(amounts.total)]
    ];
    extraHTML = `<div class="order-detail-items"><h3>Food Items</h3>${items.length ? `<div class="order-detail-item-head"><span>Item</span><span>Qty</span><span>Unit Price</span><span>Line Total</span></div>${items.map((item) => `<div class="order-detail-item"><strong>${escapeHTML(item.name || 'Menu item')}</strong><span>${Number(item.quantity || 0)}</span><span>${formatCurrency(item.price)}</span><span>${formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}</span></div>`).join('')}` : '<p class="empty-table-state">Item details were not saved with this legacy order.</p>'}</div>`;
    currentReceiptOrder = record;
  } else {
    rows = [['Booking ID', record.bookingId], ['Customer', customerName(record)], ['Mobile', record.mobile || getCustomerForRecord(record)?.mobile], ['Email', record.email || record.customerEmail], ['Date', displayDate(record.bookingDate)], ['Time', record.bookingTime], ['Guests', record.numberOfGuests], ['Table', `Table ${record.tableNumber}`], ['Capacity', record.capacity ? `${record.capacity} seats` : '—'], ['Status', bookingStatus(record)], ['Special requests', record.specialRequests]];
    currentReceiptOrder = null;
  }
  openModal(type === 'order' ? 'Order Details' : 'Booking Details', rows, extraHTML);
}
function openModal(title, rows, extraHTML = '') {
  document.getElementById('reception-modal-title').textContent = title;
  document.getElementById('reception-modal-content').innerHTML = `${rows.map(([label, value]) => `<div class="modal-record-row"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value || '—')}</strong></div>`).join('')}${extraHTML}`;
  document.getElementById('print-order-receipt').classList.toggle('hidden', !currentReceiptOrder);
  document.getElementById('reception-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal() { document.getElementById('reception-modal').classList.add('hidden'); document.body.style.overflow = ''; }
function refreshDashboard() {
  renderStats(); renderRecentOrders(); renderUpcomingBookings(); renderOrderManagement(); renderBookingManagement(); renderTableManagement(); renderCustomers();
}
function requireReceptionist() {
  const session = readStore(RECEPTION_SESSION_KEY, null);
  if (!session || session.role !== 'receptionist' || session.employeeId !== 'EMP001') {
    window.location.replace('receptionist-login.html');
    return false;
  }
  receptionistSession = session;
  return true;
}
function receptionistLogout() {
  localStorage.removeItem(RECEPTION_SESSION_KEY);
  window.location.href = 'receptionist-login.html';
}
function printOrderReceipt(order) {
  if (!order) return;
  const amounts = getOrderAmounts(order);
  const customer = getCustomerForRecord(order);
  const items = Array.isArray(order.items) ? order.items : [];
  const rows = items.map((item) => `<tr><td>${escapeHTML(item.name || 'Menu item')}<br><small>${Number(item.quantity || 0)} × ${formatCurrency(item.price)}</small></td><td>${formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}</td></tr>`).join('');
  const tableNumber = order.tableNumber || order.tableReference;
  const receiptWindow = window.open('', '_blank', 'width=420,height=720');
  if (!receiptWindow) { toast('Allow pop-ups to print the receipt.', true); return; }
  receiptWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${escapeHTML(order.orderId)}</title><style>
    *{box-sizing:border-box}body{margin:0;padding:24px;color:#17120e;background:#fff;font:14px/1.45 Arial,sans-serif}.receipt{width:320px;max-width:100%;margin:0 auto}.brand{text-align:center;border-bottom:1px dashed #777;padding-bottom:14px}.brand h1{font-size:22px;margin:0 0 3px}.brand p{margin:0;font-size:11px}.meta{padding:12px 0;border-bottom:1px dashed #777}.meta p{display:flex;justify-content:space-between;gap:12px;margin:4px 0}.meta span:first-child{color:#555}.items{width:100%;border-collapse:collapse;padding:10px 0}.items td{padding:8px 0;border-bottom:1px dotted #bbb;vertical-align:top}.items td:last-child{text-align:right;white-space:nowrap}.items small{color:#555}.totals{padding:10px 0;border-bottom:1px dashed #777}.totals p{display:flex;justify-content:space-between;margin:5px 0}.totals .final{padding-top:8px;border-top:1px solid #222;font-size:17px;font-weight:bold}.foot{text-align:center;padding-top:14px;font-size:11px}@media print{body{padding:0}.receipt{width:100%;max-width:320px}}
    </style></head><body><main class="receipt"><header class="brand"><h1>Coder's Cup</h1><p>Good Food • Great Vibes • Better Code</p></header><section class="meta"><p><span>Order ID</span><strong>${escapeHTML(order.orderId)}</strong></p><p><span>Customer</span><strong>${escapeHTML(customerName(order))}</strong></p><p><span>Order type</span><strong>${escapeHTML(order.orderType || 'Dine In')}</strong></p>${tableNumber ? `<p><span>Table</span><strong>${escapeHTML(formatTableReference(tableNumber))}</strong></p>` : ''}<p><span>Date</span><strong>${escapeHTML(displayDateTime(order.orderDate || order.createdAt))}</strong></p></section><table class="items"><tbody>${rows || '<tr><td>Order item details unavailable</td><td></td></tr>'}</tbody></table><section class="totals"><p><span>Subtotal</span><span>${formatCurrency(amounts.subtotal)}</span></p><p><span>Tax</span><span>${formatCurrency(amounts.tax)}</span></p><p><span>Additional charges</span><span>${formatCurrency(amounts.delivery)}</span></p>${amounts.discount ? `<p><span>Discount</span><span>-${formatCurrency(amounts.discount)}</span></p>` : ''}<p class="final"><span>Final amount</span><span>${formatCurrency(amounts.total)}</span></p></section><section class="meta"><p><span>Payment method</span><strong>${escapeHTML(order.paymentMethod || '—')}</strong></p><p><span>Payment status</span><strong>${escapeHTML(paymentStatus(order))}</strong></p><p><span>Order status</span><strong>${escapeHTML(orderStatus(order))}</strong></p></section><footer class="foot">Thank you for visiting Coder's Cup!</footer></main><script>window.onload=()=>{window.focus();window.print();};<\/script></body></html>`);
  receiptWindow.document.close();
}
function setupReceptionDashboard() {
  if (!requireReceptionist()) return;
  document.getElementById('staff-name').textContent = receptionistSession.name || 'Receptionist';
  document.getElementById('staff-employee-id').textContent = `${receptionistSession.employeeId} · Reception`;
  document.getElementById('topbar-staff-name').textContent = receptionistSession.name || 'Receptionist';
  setUpClock(); populateTableFilter(); refreshDashboard();
  document.querySelectorAll('.reception-nav-link').forEach((button) => button.addEventListener('click', () => setActiveSection(button.dataset.section)));
  document.querySelectorAll('[data-goto-section]').forEach((button) => button.addEventListener('click', () => setActiveSection(button.dataset.gotoSection)));
  document.querySelectorAll('[data-reception-logout]').forEach((button) => button.addEventListener('click', () => {
    if (window.confirm('Log out of the receptionist dashboard?')) receptionistLogout();
  }));
  document.getElementById('reception-menu-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('reception-sidebar');
    const open = sidebar.classList.toggle('open');
    document.getElementById('reception-menu-toggle').setAttribute('aria-expanded', String(open));
  });
  document.getElementById('order-search').addEventListener('input', renderOrderManagement);
  ['order-status-filter', 'order-type-filter', 'order-payment-filter', 'order-date-filter', 'order-sort-filter'].forEach((id) => {
    const control = document.getElementById(id);
    control.addEventListener('input', renderOrderManagement);
    control.addEventListener('change', renderOrderManagement);
  });
  ['booking-search', 'booking-date-filter', 'booking-status-filter', 'booking-table-filter'].forEach((id) => document.getElementById(id).addEventListener('input', renderBookingManagement));
  ['customer-search', 'customer-filter'].forEach((id) => document.getElementById(id).addEventListener('input', renderCustomers));
  document.body.addEventListener('click', (event) => {
    const detailButton = event.target.closest('[data-view-record]');
    if (!detailButton) return;
    const { viewRecord, recordId } = detailButton.dataset;
    const records = viewRecord === 'order' ? getOrders() : getBookings();
    showRecordDetails(viewRecord, records.find((record) => record.orderId === recordId || record.bookingId === recordId));
  });
  document.getElementById('reception-modal-close').addEventListener('click', closeModal);
  document.getElementById('reception-modal-done').addEventListener('click', closeModal);
  document.getElementById('print-order-receipt').addEventListener('click', () => printOrderReceipt(currentReceiptOrder));
  document.getElementById('reception-modal').addEventListener('click', (event) => { if (event.target.id === 'reception-modal') closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
  if (location.hash) setActiveSection(location.hash.slice(1).replace('section-', ''));
  window.addEventListener('storage', (event) => {
    if ([RECEPTION_ORDERS_KEY, RECEPTION_BOOKINGS_KEY, RECEPTION_CUSTOMERS_KEY, RECEPTION_TABLE_STATUS_KEY].includes(event.key)) {
      refreshDashboard();
      if (event.key === RECEPTION_ORDERS_KEY) notifyNewOrders();
    }
  });
  knownOrderIds = new Set(getOrders().map((order) => order.orderId));
  window.setInterval(() => {
    refreshDashboard();
    notifyNewOrders();
  }, 10000);
}

function notifyNewOrders() {
  const currentOrders = getOrders();
  const currentIds = new Set(currentOrders.map((order) => order.orderId));
  currentOrders.filter((order) => order.orderId && !knownOrderIds.has(order.orderId)).forEach((order) => toast(`New order received: ${order.orderId} · ${customerName(order)}`));
  knownOrderIds = currentIds;
}
document.addEventListener('DOMContentLoaded', setupReceptionDashboard);
