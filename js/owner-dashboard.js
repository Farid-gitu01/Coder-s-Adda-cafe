// Owner dashboard reads and updates the same browser-local records used by customer and receptionist flows.
const OWNER_DASHBOARD_SESSION_KEY = 'codersCupOwnerSession';
const OWNER_ORDERS_KEY = 'codersCupOrders';
const OWNER_BOOKINGS_KEY = 'codersCupBookings';
const OWNER_CUSTOMERS_KEY = 'codersCupCustomers';
const OWNER_TABLE_STATUSES_KEY = 'codersCupTableStatuses';
const OWNER_RECEPTIONISTS_KEY = 'codersCupReceptionists';
const OWNER_MENU_KEY = 'codersCupMenu';
const OWNER_SETTINGS_KEY = 'codersCupSettings';
const OWNER_TABLES = [
  { tableNumber: 1, capacity: 2, tableType: 'Small Table' }, { tableNumber: 2, capacity: 2, tableType: 'Small Table' },
  { tableNumber: 3, capacity: 2, tableType: 'Small Table' }, { tableNumber: 4, capacity: 2, tableType: 'Small Table' },
  { tableNumber: 5, capacity: 4, tableType: 'Medium Table' }, { tableNumber: 6, capacity: 4, tableType: 'Medium Table' },
  { tableNumber: 7, capacity: 4, tableType: 'Medium Table' }, { tableNumber: 8, capacity: 4, tableType: 'Medium Table' },
  { tableNumber: 9, capacity: 6, tableType: 'Large Table' }, { tableNumber: 10, capacity: 6, tableType: 'Large Table' }
];
let ownerLastKnownOrders = new Set();
let ownerEditingMenuId = null;

function ownerReadStore(key, fallback = []) {
  try { const parsed = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); return parsed ?? fallback; } catch (error) { return fallback; }
}
function ownerWriteStore(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function ownerEscape(value) { return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }
function ownerOrders() { const rows = ownerReadStore(OWNER_ORDERS_KEY, []); return Array.isArray(rows) ? rows.slice().sort((a, b) => new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0)) : []; }
function ownerBookings() { const rows = ownerReadStore(OWNER_BOOKINGS_KEY, []); return Array.isArray(rows) ? rows.slice().sort((a, b) => new Date(`${b.bookingDate || '1970-01-01'}T${ownerTo24HourTime(b.bookingTime) || '00:00'}:00`) - new Date(`${a.bookingDate || '1970-01-01'}T${ownerTo24HourTime(a.bookingTime) || '00:00'}:00`)) : []; }
function ownerCustomers() { const rows = ownerReadStore(OWNER_CUSTOMERS_KEY, []); return Array.isArray(rows) ? rows : []; }
function ownerReceptionists() { const rows = ownerReadStore(OWNER_RECEPTIONISTS_KEY, []); return Array.isArray(rows) ? rows : []; }
function ownerMenu() { const rows = ownerReadStore(OWNER_MENU_KEY, window.codersCupFoodData || []); return Array.isArray(rows) ? rows : []; }
function ownerOrderStatus(order) { return String(order.orderStatus || order.status || 'Completed').trim(); }
function ownerBookingStatus(booking) { return booking.bookingStatus === 'Pending Confirmation' ? 'Pending' : booking.bookingStatus || 'Pending'; }
function ownerStatusClass(status) { return String(status || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
function ownerDateTime(value) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date); }
function ownerDate(value) { if (!value) return '—'; const date = new Date(`${String(value).slice(0, 10)}T00:00:00`); return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date); }
function ownerMoney(value) { const amount = Number(String(value ?? '').replace(/[^\d.-]/g, '')); return Number.isFinite(amount) ? amount : 0; }
function ownerAmount(order) {
  if (order.total !== undefined && order.total !== null && order.total !== '') return ownerMoney(order.total);
  const itemSubtotal = (Array.isArray(order.items) ? order.items : []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const subtotal = Number(order.subtotal ?? order.subTotal ?? itemSubtotal);
  return Math.max(subtotal + Number(order.tax ?? order.gst ?? order.taxAmount ?? 0) + Number(order.delivery ?? order.deliveryCharge ?? 0) - Number(order.discount ?? order.couponDiscount ?? 0), 0);
}
function ownerCustomerForRecord(record) {
  const email = String(record.customerEmail || record.email || '').toLowerCase();
  return ownerCustomers().find((item) => (record.customerId && item.customerId === record.customerId) || String(item.email || '').toLowerCase() === email);
}
function ownerCustomerName(record) { return record.customerName || ownerCustomerForRecord(record)?.name || 'Guest'; }
function ownerToday(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function ownerTo24HourTime(timeText) {
  const match = String(timeText || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '';
  let hours = Number(match[1]) % 12; if (match[3].toUpperCase() === 'PM') hours += 12;
  return `${String(hours).padStart(2, '0')}:${match[2]}`;
}
function ownerTimeMinutes(timeText) { const value = ownerTo24HourTime(timeText); if (!value) return null; const [hours, minutes] = value.split(':').map(Number); return hours * 60 + minutes; }
function ownerActiveBookings() {
  const today = ownerToday(); const now = new Date().getHours() * 60 + new Date().getMinutes();
  return ownerBookings().filter((booking) => booking.bookingDate === today && booking.bookingStatus === 'Confirmed' && ownerTimeMinutes(booking.bookingTime) !== null && now >= ownerTimeMinutes(booking.bookingTime) && now < ownerTimeMinutes(booking.bookingTime) + 90);
}
function ownerConfirmedForTable(tableNumber) { return ownerBookings().find((booking) => Number(booking.tableNumber) === tableNumber && booking.bookingStatus === 'Confirmed' && booking.bookingDate === ownerToday()); }
function ownerUpcomingForTable(tableNumber) { return ownerBookings().find((booking) => Number(booking.tableNumber) === tableNumber && booking.bookingStatus === 'Confirmed' && booking.bookingDate >= ownerToday()); }
function ownerTableStatus(table) {
  const active = ownerActiveBookings().find((booking) => Number(booking.tableNumber) === table.tableNumber);
  if (active) return { status: 'occupied', booking: active };
  const manualStatuses = ownerReadStore(OWNER_TABLE_STATUSES_KEY, {}) || {}; const manual = manualStatuses[table.tableNumber];
  if (manual === 'cleaning' || manual === 'occupied') return { status: manual, booking: null };
  const reserved = ownerConfirmedForTable(table.tableNumber);
  return reserved ? { status: 'reserved', booking: reserved } : { status: 'available', booking: ownerUpcomingForTable(table.tableNumber) || null };
}
function ownerEmpty(message) { return `<div class="owner-empty">${ownerEscape(message)}</div>`; }
function ownerBuildTable(headings, rows, message) {
  if (!rows.length) return ownerEmpty(message);
  return `<table class="owner-table"><thead><tr>${headings.map((item) => `<th>${ownerEscape(item)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function ownerToast(message, kind = 'success') {
  const toast = document.createElement('div'); toast.className = `owner-toast ${kind}`; toast.textContent = message;
  document.getElementById('owner-toast-region').appendChild(toast); window.setTimeout(() => toast.remove(), 3200);
}
function ownerShowDialog(title, bodyHTML) {
  document.getElementById('owner-dialog-title').textContent = title; document.getElementById('owner-dialog-body').innerHTML = bodyHTML;
  document.getElementById('owner-dialog').classList.remove('hidden'); document.body.style.overflow = 'hidden';
}
function ownerCloseDialog() { document.getElementById('owner-dialog').classList.add('hidden'); document.body.style.overflow = ''; ownerEditingMenuId = null; }
function ownerSetSection(name) {
  const sections = ['overview', 'orders', 'bookings', 'customers', 'receptionists', 'menu', 'tables', 'reports', 'settings'];
  const target = sections.includes(name) ? name : 'overview';
  document.querySelectorAll('.owner-section').forEach((section) => section.classList.toggle('active', section.id === `owner-section-${target}`));
  document.querySelectorAll('.owner-nav-link').forEach((button) => button.classList.toggle('active', button.dataset.ownerSection === target));
  const titles = { overview: 'Overview', orders: 'Orders', bookings: 'Bookings', customers: 'Customers', receptionists: 'Receptionists', menu: 'Menu Management', tables: 'Tables', reports: 'Reports', settings: 'Settings' };
  document.getElementById('owner-page-title').textContent = titles[target]; history.replaceState(null, '', `#${target}`);
  document.getElementById('owner-sidebar').classList.remove('open'); document.getElementById('owner-menu-toggle').setAttribute('aria-expanded', 'false');
}
function ownerRenderStats() {
  const orders = ownerOrders(); const bookings = ownerBookings(); const tableStates = OWNER_TABLES.map(ownerTableStatus);
  const revenue = orders.filter((order) => ownerOrderStatus(order).toLowerCase() === 'completed').reduce((sum, order) => sum + ownerAmount(order), 0);
  const staff = ownerReceptionists().filter((person) => person.status !== 'Inactive');
  const stats = [['₹', `₹${revenue.toFixed(2)}`, 'Total Revenue'], ['▤', orders.length, 'Total Orders'], ['♙', ownerCustomers().length, 'Total Customers'], ['▣', bookings.length, 'Total Bookings'], ['♧', staff.length, 'Active Receptionists'], ['◉', tableStates.filter((state) => state.status === 'available').length, 'Available Tables']];
  document.getElementById('owner-stat-cards').innerHTML = stats.map(([icon, value, label]) => `<article class="owner-stat-card"><span class="owner-stat-icon">${ownerEscape(icon)}</span><div><strong>${ownerEscape(value)}</strong><span>${ownerEscape(label)}</span></div></article>`).join('');
  document.getElementById('owner-notification-count').textContent = String(orders.filter((order) => ['pending', 'accepted'].includes(ownerOrderStatus(order).toLowerCase())).length + bookings.filter((booking) => ['pending', 'pending confirmation'].includes(String(booking.bookingStatus || '').toLowerCase())).length);
}
function ownerRenderOperations() {
  const counts = { available: 0, reserved: 0, occupied: 0, cleaning: 0 }; OWNER_TABLES.forEach((table) => counts[ownerTableStatus(table).status]++);
  document.getElementById('owner-operations-overview').innerHTML = [['Total Tables', OWNER_TABLES.length], ['Available Tables', counts.available], ['Reserved Tables', counts.reserved], ['Occupied Tables', counts.occupied], ['Cleaning Tables', counts.cleaning]].map(([label, count]) => `<div class="operation-count"><strong>${count}</strong><span>${label}</span></div>`).join('');
}
function ownerOrderTableRows(orders, full = false) {
  const headings = full ? ['Order ID', 'Customer Name', 'Order Type', 'Table', 'Order Items', 'Total Amount', 'Payment Method', 'Payment Status', 'Order Status', 'Order Date', 'Details'] : ['Order ID', 'Customer Name', 'Order Type', 'Amount', 'Order Status', 'Date'];
  const rows = orders.map((order) => {
    const base = [ownerEscape(order.orderId || '—'), ownerEscape(ownerCustomerName(order)), ownerEscape(order.orderType || 'Dine In')];
    if (full) {
      const table = order.tableNumber || order.tableReference || ''; const items = (order.items || []).map((item) => `${item.quantity} × ${item.name}`).join(', ') || 'Item details unavailable';
      base.push(ownerEscape(table ? (/^table/i.test(String(table)) ? table : `Table ${table}`) : '—'), ownerEscape(items), `₹${ownerAmount(order).toFixed(2)}`, ownerEscape(order.paymentMethod || '—'), ownerEscape(order.paymentStatus || 'Pending'));
    } else base.push(`₹${ownerAmount(order).toFixed(2)}`);
    base.push(`<span class="owner-status ${ownerStatusClass(ownerOrderStatus(order))}">${ownerEscape(ownerOrderStatus(order) || 'Unknown')}</span>`, ownerEscape(ownerDateTime(order.orderDate || order.createdAt)));
    if (full) base.push(`<button type="button" class="owner-row-action" data-owner-order-details="${ownerEscape(order.orderId)}">Details / Receipt</button>`);
    return base;
  });
  return ownerBuildTable(headings, rows, 'No customer orders have been saved yet.');
}
function ownerBookingTableRows(bookings) {
  const headings = ['Booking ID', 'Customer Name', 'Contact Number', 'Guests', 'Table Number', 'Booking Date', 'Booking Time', 'Booking Status', 'Actions'];
  const rows = bookings.map((booking) => {
    const status = ownerBookingStatus(booking);
    const actions = `<div class="owner-row-actions"><button type="button" class="owner-row-action" data-owner-booking-details="${ownerEscape(booking.bookingId)}">Details</button>${status === 'Pending' ? `<button type="button" class="owner-row-action" data-owner-booking-update="Confirmed" data-owner-booking-id="${ownerEscape(booking.bookingId)}">Confirm</button>` : ''}${status === 'Confirmed' ? `<button type="button" class="owner-row-action" data-owner-booking-update="Completed" data-owner-booking-id="${ownerEscape(booking.bookingId)}">Complete</button>` : ''}${!['Cancelled', 'Completed'].includes(status) ? `<button type="button" class="owner-row-action danger" data-owner-booking-update="Cancelled" data-owner-booking-id="${ownerEscape(booking.bookingId)}">Cancel</button>` : ''}</div>`;
    return [ownerEscape(booking.bookingId || '—'), ownerEscape(ownerCustomerName(booking)), ownerEscape(booking.mobile || ownerCustomerForRecord(booking)?.mobile || booking.email || '—'), ownerEscape(booking.numberOfGuests ?? '—'), ownerEscape(booking.tableNumber ?? '—'), ownerEscape(ownerDate(booking.bookingDate)), ownerEscape(booking.bookingTime || '—'), `<span class="owner-status ${ownerStatusClass(status)}">${ownerEscape(status)}</span>`, actions];
  });
  return ownerBuildTable(headings, rows, 'No table bookings have been saved yet.');
}
function ownerRenderRecent() { const orders = ownerOrders().slice(0, 5).map((order) => [ownerEscape(order.orderId || '—'), ownerEscape(ownerCustomerName(order)), ownerEscape(order.orderType || 'Dine In'), `₹${ownerAmount(order).toFixed(2)}`, `<span class="owner-status ${ownerStatusClass(ownerOrderStatus(order))}">${ownerEscape(ownerOrderStatus(order) || 'Unknown')}</span>`, ownerEscape(ownerDateTime(order.orderDate || order.createdAt))]); document.getElementById('owner-recent-orders').innerHTML = ownerBuildTable(['Order ID', 'Customer Name', 'Order Type', 'Amount', 'Order Status', 'Date'], orders, 'No customer orders have been saved yet.'); document.getElementById('owner-recent-bookings').innerHTML = ownerBuildTable(['Booking ID', 'Customer', 'Guests', 'Table', 'Date', 'Time', 'Status'], ownerBookings().slice(0, 5).map((booking) => [ownerEscape(booking.bookingId || '—'), ownerEscape(ownerCustomerName(booking)), ownerEscape(booking.numberOfGuests ?? '—'), ownerEscape(booking.tableNumber ?? '—'), ownerEscape(ownerDate(booking.bookingDate)), ownerEscape(booking.bookingTime || '—'), `<span class="owner-status ${ownerStatusClass(ownerBookingStatus(booking))}">${ownerEscape(ownerBookingStatus(booking))}</span>`]), 'No bookings have been saved yet.'); }
function ownerRenderOrders() {
  const query = document.getElementById('owner-order-search').value.trim().toLowerCase(); const status = document.getElementById('owner-order-status').value; const payment = document.getElementById('owner-order-payment').value; const type = document.getElementById('owner-order-type').value; const direction = document.getElementById('owner-order-sort').value;
  const records = ownerOrders().filter((order) => (!query || `${order.orderId || ''} ${ownerCustomerName(order)}`.toLowerCase().includes(query)) && (!status || ownerOrderStatus(order) === status) && (!payment || (order.paymentStatus || 'Pending') === payment) && (!type || order.orderType === type));
  records.sort((a, b) => (new Date(a.orderDate || a.createdAt || 0) - new Date(b.orderDate || b.createdAt || 0)) * (direction === 'oldest' ? 1 : -1));
  document.getElementById('owner-orders-table').innerHTML = ownerOrderTableRows(records, true);
}
function ownerRenderBookings() {
  const query = document.getElementById('owner-booking-search').value.trim().toLowerCase(); const date = document.getElementById('owner-booking-date').value; const status = document.getElementById('owner-booking-status').value;
  const records = ownerBookings().filter((booking) => (!query || `${booking.bookingId || ''} ${ownerCustomerName(booking)} ${booking.email || booking.customerEmail || ''}`.toLowerCase().includes(query)) && (!date || booking.bookingDate === date) && (!status || booking.bookingStatus === status || (status === 'Pending Confirmation' && booking.bookingStatus === 'Pending')));
  document.getElementById('owner-bookings-table').innerHTML = ownerBookingTableRows(records);
}
function ownerBookingConflict(targetBooking) {
  const targetTime = ownerTimeMinutes(targetBooking.bookingTime);
  return ownerBookings().some((booking) => booking.bookingId !== targetBooking.bookingId && booking.bookingStatus === 'Confirmed' && booking.bookingDate === targetBooking.bookingDate && Number(booking.tableNumber) === Number(targetBooking.tableNumber) && targetTime !== null && ownerTimeMinutes(booking.bookingTime) !== null && Math.abs(targetTime - ownerTimeMinutes(booking.bookingTime)) < 90);
}
function ownerUpdateBooking(bookingId, status) {
  const bookings = ownerReadStore(OWNER_BOOKINGS_KEY, []); const booking = bookings.find((item) => item.bookingId === bookingId); if (!booking) return;
  if (status === 'Confirmed' && ownerBookingConflict(booking)) { ownerToast('Overlapping confirmed booking exists for this table.', 'error'); return; }
  if (!window.confirm(`${status === 'Cancelled' ? 'Cancel' : status === 'Completed' ? 'Complete' : 'Confirm'} booking ${bookingId}?`)) return;
  booking.bookingStatus = status; ownerWriteStore(OWNER_BOOKINGS_KEY, bookings); ownerRefresh(); ownerToast(`Booking updated to ${status}.`);
}
function ownerShowBookingDetails(booking) {
  const customer = ownerCustomerForRecord(booking); const rows = [['Booking ID', booking.bookingId], ['Customer', ownerCustomerName(booking)], ['Contact', booking.mobile || customer?.mobile], ['Email', booking.email || booking.customerEmail || customer?.email], ['Date', ownerDate(booking.bookingDate)], ['Time', booking.bookingTime], ['Guests', booking.numberOfGuests], ['Table', booking.tableNumber], ['Capacity', booking.capacity ? `${booking.capacity} seats` : '—'], ['Status', ownerBookingStatus(booking)], ['Special requests', booking.specialRequests || 'None']];
  ownerShowDialog('Booking Details', `<div class="owner-detail-list">${rows.map(([label, value]) => `<div><span>${ownerEscape(label)}</span><strong>${ownerEscape(value || '—')}</strong></div>`).join('')}</div>`);
}
function ownerRenderCustomers() {
  const query = document.getElementById('owner-customer-search').value.trim().toLowerCase(); const orders = ownerOrders(); const bookings = ownerBookings();
  const customers = ownerCustomers().map((customer) => {
    const customerOrders = orders.filter((order) => order.customerId === customer.customerId || String(order.customerEmail || '').toLowerCase() === String(customer.email).toLowerCase());
    const customerBookings = bookings.filter((booking) => booking.customerId === customer.customerId || String(booking.customerEmail || booking.email || '').toLowerCase() === String(customer.email).toLowerCase());
    const spending = customerOrders.filter((order) => ownerOrderStatus(order).toLowerCase() === 'completed').reduce((sum, order) => sum + ownerAmount(order), 0);
    return { ...customer, customerOrders, customerBookings, spending };
  }).filter((customer) => `${customer.customerId} ${customer.name} ${customer.email} ${customer.mobile}`.toLowerCase().includes(query));
  const rows = customers.map((customer) => [ownerEscape(customer.customerId || '—'), ownerEscape(customer.name || '—'), ownerEscape(customer.email || '—'), ownerEscape(customer.mobile || '—'), ownerEscape(ownerDate(customer.createdAt)), String(customer.customerOrders.length), String(customer.customerBookings.length), `₹${customer.spending.toFixed(2)}`, `<button type="button" class="owner-row-action" data-owner-customer-details="${ownerEscape(customer.customerId)}">View Profile</button>`]);
  document.getElementById('owner-customers-table').innerHTML = ownerBuildTable(['Customer ID', 'Full Name', 'Email', 'Phone', 'Registration Date', 'Orders', 'Bookings', 'Total Spending', 'Profile'], rows, 'No registered customers match this search.');
}
function ownerShowCustomerDetails(customer) {
  const profile = [['Customer ID', customer.customerId], ['Name', customer.name], ['Email', customer.email], ['Phone', customer.mobile], ['Registration Date', ownerDate(customer.createdAt)]];
  const orders = customer.orders.map((order) => `${order.orderId} · ${ownerDateTime(order.orderDate || order.createdAt)} · ₹${ownerAmount(order).toFixed(2)} · ${ownerOrderStatus(order)}`).join('<br>') || 'No orders';
  const bookings = customer.bookings.map((booking) => `${booking.bookingId} · ${ownerDate(booking.bookingDate)} · ${booking.bookingTime || ''} · Table ${booking.tableNumber} · ${ownerBookingStatus(booking)}`).join('<br>') || 'No bookings';
  ownerShowDialog('Customer Profile', `<div class="owner-detail-list">${profile.map(([label, value]) => `<div><span>${ownerEscape(label)}</span><strong>${ownerEscape(value || '—')}</strong></div>`).join('')}</div><h3>Order History</h3><div class="owner-history-list">${orders}</div><h3>Booking History</h3><div class="owner-history-list">${bookings}</div>`);
}
function ownerRenderReceptionists() {
  const query = document.getElementById('owner-receptionist-search').value.trim().toLowerCase();
  const staff = ownerReceptionists().filter((person) => `${person.employeeId} ${person.name} ${person.email}`.toLowerCase().includes(query));
  const rows = staff.map((person) => [ownerEscape(person.employeeId), ownerEscape(person.name), ownerEscape(person.email), ownerEscape(person.mobile || '—'), ownerEscape(ownerDate(person.joiningDate)), `<span class="owner-status ${ownerStatusClass(person.status || 'Active')}">${ownerEscape(person.status || 'Active')}</span>`, `<div class="owner-row-actions"><button type="button" class="owner-row-action" data-receptionist-edit="${ownerEscape(person.employeeId)}">Edit</button><button type="button" class="owner-row-action" data-receptionist-toggle="${ownerEscape(person.employeeId)}">${person.status === 'Inactive' ? 'Activate' : 'Deactivate'}</button></div>`]);
  document.getElementById('owner-receptionists-table').innerHTML = ownerBuildTable(['Employee ID', 'Full Name', 'Email', 'Phone', 'Joining Date', 'Account Status', 'Actions'], rows, 'No receptionist profiles found.');
}
function ownerReceptionistForm(profile = null) {
  const editingId = profile?.employeeId || '';
  ownerShowDialog(editingId ? 'Edit Receptionist' : 'Add Receptionist', `<p class="owner-form-note">Demo passwords are PBKDF2-hashed in this browser and never displayed or stored as plain text. Real staff account creation requires backend authentication.</p><form id="owner-staff-form" class="owner-management-form"><label>Full Name<input name="name" required value="${ownerEscape(profile?.name || '')}"></label><label>Email Address<input name="email" type="email" required value="${ownerEscape(profile?.email || '')}"></label><label>Phone Number<input name="mobile" type="tel" value="${ownerEscape(profile?.mobile || '')}"></label><label>Joining Date<input name="joiningDate" type="date" value="${ownerEscape((profile?.joiningDate || new Date().toISOString()).slice(0, 10))}"></label><label>Temporary Password<input name="password" type="password" minlength="8" ${editingId ? '' : 'required'} autocomplete="new-password" placeholder="${editingId ? 'Leave blank to keep current password' : 'At least 8 characters'}"></label><p class="owner-feedback" id="staff-feedback"></p><button class="btn btn-primary" type="submit">${editingId ? 'Save Changes' : 'Create Profile'}</button></form>`);
  document.getElementById('owner-staff-form').addEventListener('submit', (event) => ownerSaveReceptionist(event, editingId));
}
async function ownerHashStaffPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
  const encode = (bytes) => btoa(Array.from(new Uint8Array(bytes), (byte) => String.fromCharCode(byte)).join(''));
  return { passwordSalt: encode(salt), passwordHash: encode(bits) };
}
async function ownerSaveReceptionist(event, editingId) {
  event.preventDefault(); const data = new FormData(event.currentTarget); const staff = ownerReceptionists(); const name = String(data.get('name')).trim(); const email = String(data.get('email')).trim().toLowerCase();
  const password = String(data.get('password') || '');
  if (staff.some((person) => String(person.email).toLowerCase() === email && person.employeeId !== editingId)) { document.getElementById('staff-feedback').textContent = 'Email is already assigned to another receptionist.'; return; }
  if ((!editingId || password) && password.length < 8) { document.getElementById('staff-feedback').textContent = 'Password must be at least 8 characters.'; return; }
  if (!crypto?.subtle && (!editingId || password)) { document.getElementById('staff-feedback').textContent = 'Secure browser cryptography is unavailable; use a modern browser on localhost or HTTPS.'; return; }
  let credentials = null;
  if (password) { try { credentials = await ownerHashStaffPassword(password); } catch (error) { document.getElementById('staff-feedback').textContent = 'Could not hash the password in this browser.'; return; } }
  if (editingId) { const profile = staff.find((person) => person.employeeId === editingId); if (!profile) return; Object.assign(profile, { name, email, mobile: String(data.get('mobile')).trim(), joiningDate: String(data.get('joiningDate')) || profile.joiningDate, ...(credentials || {}) }); }
  else {
    let next = staff.reduce((max, person) => Math.max(max, Number(String(person.employeeId).replace(/\D/g, '')) || 0), 0) + 1; let employeeId = `EMP${String(next).padStart(3, '0')}`;
    while (staff.some((person) => person.employeeId === employeeId)) { next += 1; employeeId = `EMP${String(next).padStart(3, '0')}`; }
    staff.push({ employeeId, name, email, mobile: String(data.get('mobile')).trim(), joiningDate: String(data.get('joiningDate')) || new Date().toISOString(), status: 'Active', role: 'receptionist', ...credentials });
  }
  ownerWriteStore(OWNER_RECEPTIONISTS_KEY, staff); window.codersCupReceptionists = staff; ownerCloseDialog(); ownerRefresh(); ownerToast('Receptionist profile saved.');
}
function ownerToggleReceptionist(employeeId) {
  const staff = ownerReceptionists(); const person = staff.find((entry) => entry.employeeId === employeeId); if (!person) return;
  const status = person.status === 'Inactive' ? 'Active' : 'Inactive'; if (!window.confirm(`${status === 'Inactive' ? 'Deactivate' : 'Activate'} ${person.name}?`)) return;
  person.status = status; ownerWriteStore(OWNER_RECEPTIONISTS_KEY, staff); window.codersCupReceptionists = staff;
  const activeSession = ownerReadStore('codersCupReceptionistSession', null); if (status === 'Inactive' && activeSession?.employeeId === employeeId) localStorage.removeItem('codersCupReceptionistSession');
  ownerRefresh(); ownerToast(`Receptionist ${status.toLowerCase()}.`);
}
function ownerCategories() { return Array.isArray(window.codersCupMenuCategories) ? window.codersCupMenuCategories : []; }
function ownerSetupMenu() {
  const categories = ownerCategories(); document.getElementById('owner-menu-category').innerHTML = '<option value="">All categories</option>' + categories.map((item) => `<option value="${ownerEscape(item.name)}">${ownerEscape(item.name)}</option>`).join('');
  if (!localStorage.getItem(OWNER_MENU_KEY)) ownerWriteStore(OWNER_MENU_KEY, window.codersCupFoodData || []);
}
function ownerRenderMenu() {
  const query = document.getElementById('owner-menu-search').value.trim().toLowerCase(); const category = document.getElementById('owner-menu-category').value; const type = document.getElementById('owner-menu-type').value;
  const menu = ownerMenu().filter((item) => (!query || `${item.name} ${item.description}`.toLowerCase().includes(query)) && (!category || item.category === category) && (!type || item.type === type));
  const rows = menu.map((item) => [ownerEscape(item.id), ownerEscape(item.name), ownerEscape(item.category), ownerEscape(item.type), `₹${Number(item.price).toFixed(2)}`, `<span class="owner-status ${item.available === false ? 'cancelled' : 'available'}">${item.available === false ? 'Unavailable' : 'Available'}</span>`, `<div class="owner-row-actions"><button type="button" class="owner-row-action" data-menu-edit="${item.id}">Edit</button><button type="button" class="owner-row-action" data-menu-toggle="${item.id}">${item.available === false ? 'Enable' : 'Disable'}</button><button type="button" class="owner-row-action danger" data-menu-delete="${item.id}">Delete</button></div>`]);
  document.getElementById('owner-menu-table').innerHTML = ownerBuildTable(['Item ID', 'Item Name', 'Category', 'Type', 'Price', 'Availability', 'Actions'], rows, 'No menu items match these filters.');
  document.getElementById('owner-menu-categories').innerHTML = ownerCategories().map((entry) => `<span>${ownerEscape(entry.name)} <b>${ownerMenu().filter((item) => item.category === entry.name).length}</b></span>`).join('');
}
function ownerMenuForm(item = null) {
  ownerEditingMenuId = item ? item.id : null; const categories = ownerCategories().map((entry) => `<option value="${ownerEscape(entry.name)}" ${entry.name === item?.category ? 'selected' : ''}>${ownerEscape(entry.name)}</option>`).join('');
  ownerShowDialog(item ? 'Edit Food Item' : 'Add Food Item', `<form id="owner-menu-form" class="owner-management-form"><label>Item Name<input name="name" required value="${ownerEscape(item?.name || '')}"></label><label>Category<select name="category" required>${categories}</select></label><label>Description<textarea name="description" rows="3" required>${ownerEscape(item?.description || '')}</textarea></label><label>Price (₹)<input name="price" type="number" min="1" step="1" required value="${ownerEscape(item?.price ?? '')}"></label><label>Image URL<input name="image" type="url" required value="${ownerEscape(item?.image || '')}"></label><label>Type<select name="type"><option value="veg" ${item?.type !== 'non-veg' ? 'selected' : ''}>Veg</option><option value="non-veg" ${item?.type === 'non-veg' ? 'selected' : ''}>Non-Veg</option></select></label><button class="btn btn-primary" type="submit">${item ? 'Save Changes' : 'Add Item'}</button></form>`);
  document.getElementById('owner-menu-form').addEventListener('submit', ownerSaveMenuItem);
}
function ownerSaveMenuItem(event) {
  event.preventDefault(); const data = new FormData(event.currentTarget); const menu = ownerMenu(); const name = String(data.get('name')).trim();
  if (menu.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== ownerEditingMenuId)) { ownerToast('An item with that name already exists.', 'error'); return; }
  const fields = { name, category: String(data.get('category')), description: String(data.get('description')).trim(), price: Number(data.get('price')), image: String(data.get('image')).trim(), type: String(data.get('type')) };
  if (ownerEditingMenuId !== null) { const existing = menu.find((item) => item.id === ownerEditingMenuId); if (!existing) return; Object.assign(existing, fields); }
  else menu.push({ id: menu.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1, rating: 4.5, popularity: 0, available: true, ...fields });
  ownerWriteStore(OWNER_MENU_KEY, menu); window.codersCupFoodData.splice(0, window.codersCupFoodData.length, ...menu); ownerCloseDialog(); ownerRenderMenu(); ownerToast('Menu item saved.');
}
function ownerToggleMenu(id) {
  const menu = ownerMenu(); const item = menu.find((entry) => Number(entry.id) === Number(id)); if (!item) return;
  item.available = item.available === false; ownerWriteStore(OWNER_MENU_KEY, menu); window.codersCupFoodData.splice(0, window.codersCupFoodData.length, ...menu); ownerRenderMenu(); ownerToast(`${item.name} ${item.available ? 'enabled' : 'disabled'}.`);
}
function ownerDeleteMenu(id) {
  const menu = ownerMenu(); const item = menu.find((entry) => Number(entry.id) === Number(id)); if (!item) return;
  if (!window.confirm(`Delete ${item.name}? Historical orders remain unchanged.`)) return;
  const updated = menu.filter((entry) => Number(entry.id) !== Number(id)); ownerWriteStore(OWNER_MENU_KEY, updated); window.codersCupFoodData.splice(0, window.codersCupFoodData.length, ...updated); ownerRenderMenu(); ownerToast('Menu item deleted.');
}
function ownerShowOrder(order) {
  const customer = ownerCustomerForRecord(order); const amounts = { subtotal: Number(order.subtotal ?? (order.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)), tax: Number(order.tax ?? order.gst ?? 0), charges: Number(order.delivery ?? order.deliveryCharge ?? 0), total: ownerAmount(order) };
  const rows = [['Order ID', order.orderId], ['Customer', ownerCustomerName(order)], ['Phone', order.mobile || customer?.mobile], ['Email', order.customerEmail || customer?.email], ['Type', order.orderType], ['Table', order.tableNumber || order.tableReference || '—'], ['Date', ownerDateTime(order.orderDate || order.createdAt)], ['Payment', order.paymentMethod], ['Payment Status', order.paymentStatus || 'Pending'], ['Order Status', ownerOrderStatus(order)], ['Subtotal', `₹${amounts.subtotal.toFixed(2)}`], ['Tax', `₹${amounts.tax.toFixed(2)}`], ['Additional Charges', `₹${amounts.charges.toFixed(2)}`], ['Final Total', `₹${amounts.total.toFixed(2)}`]];
  const items = (order.items || []).map((item) => `<div class="owner-detail-line"><span>${ownerEscape(item.name)} · ${Number(item.quantity || 0)} × ₹${Number(item.price || 0).toFixed(2)}</span><strong>₹${(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</strong></div>`).join('') || '<p>Legacy order item detail unavailable.</p>';
  ownerShowDialog('Order Details', `<div class="owner-detail-list">${rows.map(([label, value]) => `<div><span>${ownerEscape(label)}</span><strong>${ownerEscape(value || '—')}</strong></div>`).join('')}</div><h3>Food Items</h3><div class="owner-history-list">${items}</div><button id="owner-print-receipt" type="button" class="btn btn-primary">Print Receipt</button>`);
  document.getElementById('owner-print-receipt').addEventListener('click', () => ownerPrintReceipt(order));
}
function ownerPrintReceipt(order) {
  const printWindow = window.open('', '_blank', 'width=420,height=700'); if (!printWindow) { ownerToast('Allow pop-ups to print the receipt.', 'error'); return; }
  const lines = (order.items || []).map((item) => `<tr><td>${ownerEscape(item.name)}<small>${item.quantity} × ₹${Number(item.price || 0).toFixed(2)}</small></td><td>₹${(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</td></tr>`).join('');
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${ownerEscape(order.orderId)}</title><style>body{width:320px;margin:20px auto;color:#222;font:14px/1.5 Arial}.brand{text-align:center;border-bottom:1px dashed #888;padding-bottom:12px}.brand h1{margin:0}.meta,.totals{padding:10px 0;border-bottom:1px dashed #888}.meta p,.totals p{display:flex;justify-content:space-between;margin:4px 0;gap:8px}.items{width:100%;border-collapse:collapse}.items td{padding:8px 0;border-bottom:1px dotted #bbb}.items td:last-child{text-align:right;white-space:nowrap}.items small{display:block;color:#666}.total{font-weight:bold;font-size:17px;border-top:1px solid #222;padding-top:8px}@media print{body{margin:0 auto}}</style></head><body><header class="brand"><h1>Coder's Cup</h1><p>Good Food • Great Vibes • Better Code</p></header><section class="meta"><p><span>Order ID</span><strong>${ownerEscape(order.orderId)}</strong></p><p><span>Customer</span><strong>${ownerEscape(ownerCustomerName(order))}</strong></p><p><span>Order Type</span><strong>${ownerEscape(order.orderType || 'Dine In')}</strong></p><p><span>Date</span><strong>${ownerEscape(ownerDateTime(order.orderDate || order.createdAt))}</strong></p></section><table class="items"><tbody>${lines || '<tr><td>No item details</td></tr>'}</tbody></table><section class="totals"><p><span>Subtotal</span><span>₹${Number(order.subtotal || 0).toFixed(2)}</span></p><p><span>Tax</span><span>₹${Number(order.tax || order.gst || 0).toFixed(2)}</span></p><p><span>Charges</span><span>₹${Number(order.delivery || order.deliveryCharge || 0).toFixed(2)}</span></p><p class="total"><span>Total</span><span>₹${ownerAmount(order).toFixed(2)}</span></p><p><span>Payment</span><span>${ownerEscape(order.paymentMethod || '—')} · ${ownerEscape(order.paymentStatus || 'Pending')}</span></p></section><script>window.onload=()=>window.print();<\/script></body></html>`); printWindow.document.close();
}
function ownerRenderTables() {
  const filter = document.getElementById('owner-table-filter').value; const rows = OWNER_TABLES.map((table) => ({ table, state: ownerTableStatus(table) }));
  const counts = { available: 0, reserved: 0, occupied: 0, cleaning: 0 }; rows.forEach(({ state }) => counts[state.status]++);
  document.getElementById('owner-table-counts').innerHTML = `<span>${OWNER_TABLES.length} total</span><span>${counts.available} available</span><span>${counts.reserved} reserved</span><span>${counts.occupied} occupied</span><span>${counts.cleaning} cleaning</span>`;
  document.getElementById('owner-table-grid').innerHTML = rows.filter(({ state }) => !filter || state.status === filter).map(({ table, state }) => {
    const activeOrder = ownerOrders().find((order) => /^dine\s*in$/i.test(order.orderType || '') && !['completed', 'cancelled'].includes(ownerOrderStatus(order).toLowerCase()) && Number(String(order.tableNumber || '').replace(/\D/g, '')) === table.tableNumber);
    const locked = Boolean(activeOrder || (state.booking && ['reserved', 'occupied'].includes(state.status)));
    const options = ['available', 'occupied', 'cleaning'].map((status) => `<option value="${status}" ${status === state.status ? 'selected' : ''} ${locked && status === 'available' ? 'disabled' : ''}>${status}</option>`).join('');
    const reservation = state.booking ? `${ownerDate(state.booking.bookingDate)} · ${state.booking.bookingTime || '—'} · ${ownerCustomerName(state.booking)}` : 'No reservation';
    return `<article class="owner-table-card"><header><h3>Table ${table.tableNumber}</h3><span class="owner-status ${state.status}">${state.status}</span></header><p>${table.tableType} · ${table.capacity} seats</p><p>${ownerEscape(reservation)}${activeOrder ? `<br>Active order ${ownerEscape(activeOrder.orderId)}` : ''}</p><div class="owner-table-controls"><select data-owner-table-status="${table.tableNumber}" aria-label="Table ${table.tableNumber} status">${options}</select>${state.booking ? `<button class="owner-row-action" data-table-booking="${ownerEscape(state.booking.bookingId)}">Booking Details</button>` : ''}</div></article>`;
  }).join('') || ownerEmpty('No tables match this status.');
  document.querySelectorAll('[data-owner-table-status]').forEach((select) => select.addEventListener('change', () => ownerUpdateTableStatus(Number(select.dataset.ownerTableStatus), select.value)));
  document.querySelectorAll('[data-table-booking]').forEach((button) => button.addEventListener('click', () => { const booking = ownerBookings().find((item) => item.bookingId === button.dataset.tableBooking); if (booking) ownerShowBookingDetails(booking); }));
}
function ownerUpdateTableStatus(tableNumber, status) {
  const activeBooking = ownerActiveBookings().some((booking) => Number(booking.tableNumber) === tableNumber); const confirmedToday = Boolean(ownerConfirmedForTable(tableNumber));
  const activeOrder = ownerOrders().some((order) => /^dine\s*in$/i.test(order.orderType || '') && !['completed', 'cancelled'].includes(ownerOrderStatus(order).toLowerCase()) && Number(String(order.tableNumber || '').replace(/\D/g, '')) === tableNumber);
  if (status === 'available' && (activeBooking || confirmedToday || activeOrder)) { ownerToast('This table is needed by an active booking or dine-in order.', 'error'); ownerRenderTables(); return; }
  if (!window.confirm(`Set Table ${tableNumber} to ${status}?`)) { ownerRenderTables(); return; }
  const tableStatuses = ownerReadStore(OWNER_TABLE_STATUSES_KEY, {}) || {}; if (status === 'available') delete tableStatuses[tableNumber]; else tableStatuses[tableNumber] = status;
  ownerWriteStore(OWNER_TABLE_STATUSES_KEY, tableStatuses); ownerRenderTables(); ownerRenderOperations(); ownerRenderStats(); ownerToast(`Table ${tableNumber} updated.`);
}
function ownerRenderReports() {
  const range = document.getElementById('report-date-range').value; const allOrders = ownerOrders();
  const inRange = (value) => { if (range === 'all') return true; const date = new Date(value || 0); if (Number.isNaN(date.getTime())) return false; date.setHours(0, 0, 0, 0); const today = new Date(); today.setHours(0, 0, 0, 0); const start = new Date(today); start.setDate(start.getDate() - (range === 'today' ? 0 : Number(range) - 1)); return date >= start && date <= today; };
  const orders = allOrders.filter((order) => inRange(order.orderDate || order.createdAt)); const revenue = (items) => items.filter((order) => ownerOrderStatus(order).toLowerCase() === 'completed').reduce((sum, order) => sum + ownerAmount(order), 0);
  const todayRevenue = revenue(allOrders.filter((order) => String(order.orderDate || order.createdAt || '').slice(0, 10) === ownerToday())); const weekStart = new Date(); weekStart.setHours(0, 0, 0, 0); weekStart.setDate(weekStart.getDate() - 6); const weekRevenue = revenue(allOrders.filter((order) => new Date(order.orderDate || order.createdAt || 0) >= weekStart)); const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0); const monthRevenue = revenue(allOrders.filter((order) => new Date(order.orderDate || order.createdAt || 0) >= monthStart));
  const bookings = ownerBookings().filter((booking) => inRange(`${booking.bookingDate || ''}T00:00:00`)); const customers = ownerCustomers(); const newCustomers = customers.filter((customer) => inRange(customer.createdAt)).length;
  const returning = customers.filter((customer) => allOrders.filter((order) => order.customerId === customer.customerId || String(order.customerEmail || '').toLowerCase() === String(customer.email).toLowerCase()).length > 1).length;
  const makeMetric = (label, value, money = false) => `<article><span>${ownerEscape(label)}</span><strong>${money ? `₹${value.toFixed(2)}` : value}</strong></article>`;
  document.getElementById('owner-report-metrics').innerHTML = [makeMetric('Selected Range Revenue', revenue(orders), true), makeMetric("Today's Revenue", todayRevenue, true), makeMetric('This Week Revenue', weekRevenue, true), makeMetric('This Month Revenue', monthRevenue, true), makeMetric('Total Orders', orders.length), makeMetric('Completed Orders', orders.filter((o) => ownerOrderStatus(o) === 'Completed').length), makeMetric('Pending Orders', orders.filter((o) => ['Pending', 'Accepted'].includes(ownerOrderStatus(o))).length), makeMetric('Cancelled Orders', orders.filter((o) => ownerOrderStatus(o) === 'Cancelled').length), makeMetric('Dine In Orders', orders.filter((o) => /^dine\s*in$/i.test(o.orderType || '')).length), makeMetric('Takeaway Orders', orders.filter((o) => /^takeaway$/i.test(o.orderType || '')).length), makeMetric('Registered Customers', customers.length), makeMetric('New Customers', newCustomers), makeMetric('Returning Customers', returning), makeMetric('Total Bookings', bookings.length), makeMetric('Confirmed Bookings', bookings.filter((b) => b.bookingStatus === 'Confirmed').length), makeMetric('Pending Bookings', bookings.filter((b) => ['Pending Confirmation', 'Pending'].includes(b.bookingStatus)).length), makeMetric('Cancelled Bookings', bookings.filter((b) => b.bookingStatus === 'Cancelled').length)].join('');
  const daily = []; const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 6);
  for (let i = 0; i < 7; i++) { const date = new Date(start); date.setDate(start.getDate() + i); const key = ownerToday(date); daily.push({ label: new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date), value: revenue(orders.filter((order) => String(order.orderDate || order.createdAt || '').slice(0, 10) === key)) }); }
  ownerRenderBars('revenue-chart', daily, true); ownerRenderBars('order-chart', ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((status) => ({ label: status, value: orders.filter((order) => ownerOrderStatus(order) === status).length })), false);
  const top = customers.map((customer) => ({ customer, spend: revenue(orders.filter((order) => order.customerId === customer.customerId || String(order.customerEmail || '').toLowerCase() === String(customer.email).toLowerCase())) })).sort((a, b) => b.spend - a.spend).slice(0, 5).filter((entry) => entry.spend > 0);
  document.getElementById('top-customers-report').innerHTML = top.length ? top.map((entry) => `<div class="report-list-row"><span>${ownerEscape(entry.customer.name)}</span><strong>₹${entry.spend.toFixed(2)}</strong></div>`).join('') : ownerEmpty('No completed customer spending in this period.');
  const popular = new Map(); orders.filter((order) => ownerOrderStatus(order).toLowerCase() === 'completed').forEach((order) => (order.items || []).forEach((item) => { const key = item.id ?? item.name; const row = popular.get(key) || { name: item.name || `Item ${key}`, quantity: 0 }; row.quantity += Number(item.quantity || 0); popular.set(key, row); }));
  const topItems = Array.from(popular.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5); document.getElementById('popular-items-report').innerHTML = topItems.length ? topItems.map((item) => `<div class="report-list-row"><span>${ownerEscape(item.name)}</span><strong>${item.quantity} sold</strong></div>`).join('') : ownerEmpty('No completed item sales in this period.');
}
function ownerRenderBars(id, entries, currency) {
  const max = Math.max(...entries.map((entry) => entry.value), 0);
  document.getElementById(id).innerHTML = max ? entries.map((entry) => `<div class="owner-bar-row"><span>${ownerEscape(entry.label)}</span><div><i style="width:${Math.max(4, entry.value / max * 100)}%"></i></div><strong>${currency ? `₹${Number(entry.value).toFixed(0)}` : entry.value}</strong></div>`).join('') : ownerEmpty('No data available for this period.');
}
function ownerLoadSettings() {
  const defaults = { cafeName: "Coder's Cup", tagline: 'Good Food • Great Vibes • Better Code', contactNumber: '+91 98765 43210', email: 'hello@coderscup.com', address: '12 Coffee Lane', openingTime: '07:00', closingTime: '22:00' }; const settings = { ...defaults, ...(ownerReadStore(OWNER_SETTINGS_KEY, {}) || {}) };
  [['setting-cafe-name', 'cafeName'], ['setting-tagline', 'tagline'], ['setting-contact', 'contactNumber'], ['setting-email', 'email'], ['setting-address', 'address'], ['setting-open', 'openingTime'], ['setting-close', 'closingTime']].forEach(([id, key]) => { document.getElementById(id).value = settings[key]; });
}
function ownerSaveSettings(event) {
  event.preventDefault(); const val = (id) => document.getElementById(id).value.trim();
  ownerWriteStore(OWNER_SETTINGS_KEY, { cafeName: val('setting-cafe-name'), tagline: val('setting-tagline'), contactNumber: val('setting-contact'), email: val('setting-email'), address: val('setting-address'), openingTime: val('setting-open'), closingTime: val('setting-close') });
  document.getElementById('settings-feedback').textContent = 'Cafe settings saved in this browser.'; ownerToast('Cafe settings saved.');
}
function ownerRefresh() { ownerRenderStats(); ownerRenderOperations(); ownerRenderRecent(); ownerRenderOrders(); ownerRenderBookings(); ownerRenderCustomers(); ownerRenderReceptionists(); ownerRenderMenu(); ownerRenderTables(); ownerRenderReports(); ownerLoadSettings(); }
function ownerCheckSession() {
  const session = ownerReadStore(OWNER_DASHBOARD_SESSION_KEY, null);
  if (!session || session.role !== 'owner' || session.email !== 'owner@coderscup.com' || ownerReadStore('codersCupSession', null) || ownerReadStore('codersCupReceptionistSession', null)) { localStorage.removeItem(OWNER_DASHBOARD_SESSION_KEY); window.location.replace('owner-login.html'); return false; }
  return true;
}
function ownerLogout() { localStorage.removeItem(OWNER_DASHBOARD_SESSION_KEY); window.location.replace('owner-login.html'); }
function ownerSetup() {
  if (!ownerCheckSession()) return;
  document.getElementById('owner-shell').classList.remove('hidden'); document.getElementById('owner-current-date').textContent = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  ownerSetupMenu(); ownerRefresh(); ownerLastKnownOrders = new Set(ownerOrders().map((order) => order.orderId));
  document.querySelectorAll('[data-owner-section]').forEach((button) => button.addEventListener('click', () => ownerSetSection(button.dataset.ownerSection)));
  document.querySelectorAll('[data-owner-go]').forEach((button) => button.addEventListener('click', () => ownerSetSection(button.dataset.ownerGo)));
  document.querySelectorAll('[data-owner-logout]').forEach((button) => button.addEventListener('click', ownerLogout));
  document.getElementById('owner-menu-toggle').addEventListener('click', () => { const sidebar = document.getElementById('owner-sidebar'); const open = sidebar.classList.toggle('open'); document.getElementById('owner-menu-toggle').setAttribute('aria-expanded', String(open)); });
  document.getElementById('owner-order-search').addEventListener('input', ownerRenderOrders); ['owner-order-status', 'owner-order-payment', 'owner-order-type', 'owner-order-sort'].forEach((id) => document.getElementById(id).addEventListener('change', ownerRenderOrders));
  document.getElementById('owner-booking-search').addEventListener('input', ownerRenderBookings); ['owner-booking-date', 'owner-booking-status'].forEach((id) => document.getElementById(id).addEventListener('change', ownerRenderBookings));
  document.getElementById('owner-customer-search').addEventListener('input', ownerRenderCustomers); document.getElementById('owner-receptionist-search').addEventListener('input', ownerRenderReceptionists); document.getElementById('add-receptionist').addEventListener('click', () => ownerReceptionistForm());
  document.getElementById('owner-menu-search').addEventListener('input', ownerRenderMenu); ['owner-menu-category', 'owner-menu-type'].forEach((id) => document.getElementById(id).addEventListener('change', ownerRenderMenu)); document.getElementById('add-menu-item').addEventListener('click', () => ownerMenuForm());
  document.getElementById('owner-table-filter').addEventListener('change', ownerRenderTables); document.getElementById('report-date-range').addEventListener('change', ownerRenderReports); document.getElementById('owner-settings-form').addEventListener('submit', ownerSaveSettings);
  document.getElementById('owner-dialog-close').addEventListener('click', ownerCloseDialog); document.getElementById('owner-dialog').addEventListener('click', (event) => { if (event.target.id === 'owner-dialog') ownerCloseDialog(); }); document.addEventListener('keydown', (event) => { if (event.key === 'Escape') ownerCloseDialog(); });
  document.body.addEventListener('click', ownerHandleClick);
  const keys = [OWNER_ORDERS_KEY, OWNER_BOOKINGS_KEY, OWNER_CUSTOMERS_KEY, OWNER_TABLE_STATUSES_KEY, OWNER_RECEPTIONISTS_KEY, OWNER_MENU_KEY, OWNER_SETTINGS_KEY];
  window.addEventListener('storage', (event) => { if (event.key === OWNER_DASHBOARD_SESSION_KEY) { if (!ownerCheckSession()) return; } if (keys.includes(event.key)) { if (event.key === OWNER_ORDERS_KEY) ownerNotifyOrders(); ownerRefresh(); } });
  window.setInterval(() => { if (!ownerCheckSession()) return; ownerNotifyOrders(); ownerRefresh(); }, 10000);
  if (location.hash) ownerSetSection(location.hash.slice(1));
}
function ownerNotifyOrders() {
  const orders = ownerOrders(); const ids = new Set(orders.map((order) => order.orderId));
  orders.filter((order) => order.orderId && !ownerLastKnownOrders.has(order.orderId)).forEach((order) => ownerToast(`New order ${order.orderId} received.`)); ownerLastKnownOrders = ids;
}
function ownerHandleClick(event) {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.ownerOrderDetails) { const order = ownerOrders().find((item) => item.orderId === button.dataset.ownerOrderDetails); if (order) ownerShowOrder(order); }
  if (button.dataset.ownerBookingDetails) { const booking = ownerBookings().find((item) => item.bookingId === button.dataset.ownerBookingDetails); if (booking) ownerShowBookingDetails(booking); }
  if (button.dataset.ownerBookingUpdate) ownerUpdateBooking(button.dataset.ownerBookingId, button.dataset.ownerBookingUpdate);
  if (button.dataset.ownerCustomerDetails) {
    const customer = ownerCustomers().find((item) => item.customerId === button.dataset.ownerCustomerDetails); if (!customer) return;
    const orders = ownerOrders().filter((item) => item.customerId === customer.customerId || String(item.customerEmail || '').toLowerCase() === String(customer.email).toLowerCase());
    const bookings = ownerBookings().filter((item) => item.customerId === customer.customerId || String(item.customerEmail || item.email || '').toLowerCase() === String(customer.email).toLowerCase());
    ownerShowCustomerDetails({ ...customer, orders, bookings });
  }
  if (button.dataset.receptionistEdit) ownerReceptionistForm(ownerReceptionists().find((item) => item.employeeId === button.dataset.receptionistEdit));
  if (button.dataset.receptionistToggle) ownerToggleReceptionist(button.dataset.receptionistToggle);
  if (button.dataset.menuEdit) ownerMenuForm(ownerMenu().find((item) => Number(item.id) === Number(button.dataset.menuEdit)));
  if (button.dataset.menuToggle) ownerToggleMenu(button.dataset.menuToggle);
  if (button.dataset.menuDelete) ownerDeleteMenu(button.dataset.menuDelete);
}
document.addEventListener('DOMContentLoaded', ownerSetup);
