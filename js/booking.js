// Table booking logic for the Coder's Cup frontend demo.
// This file is structured so the booking flow remains beginner-friendly and reusable.

const BOOKING_STORAGE_KEY = 'codersCupBookings';
const BOOKING_TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM',
  '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
];

const DEFAULT_TABLES = [
  { tableId: 'T1', tableNumber: 1, capacity: 2, tableType: 'Small Table', status: 'available' },
  { tableId: 'T2', tableNumber: 2, capacity: 2, tableType: 'Small Table', status: 'reserved' },
  { tableId: 'T3', tableNumber: 3, capacity: 2, tableType: 'Small Table', status: 'available' },
  { tableId: 'T4', tableNumber: 4, capacity: 2, tableType: 'Small Table', status: 'available' },
  { tableId: 'T5', tableNumber: 5, capacity: 4, tableType: 'Medium Table', status: 'reserved' },
  { tableId: 'T6', tableNumber: 6, capacity: 4, tableType: 'Medium Table', status: 'available' },
  { tableId: 'T7', tableNumber: 7, capacity: 4, tableType: 'Medium Table', status: 'reserved' },
  { tableId: 'T8', tableNumber: 8, capacity: 4, tableType: 'Medium Table', status: 'available' },
  { tableId: 'T9', tableNumber: 9, capacity: 6, tableType: 'Large Table', status: 'available' },
  { tableId: 'T10', tableNumber: 10, capacity: 6, tableType: 'Large Table', status: 'available' }
];

const bookingState = {
  selectedTableNumber: null,
  selectedDate: '',
  selectedTime: '',
  selectedGuests: 0
};

function getSavedBookings() {
  try {
    const storedBookings = localStorage.getItem(BOOKING_STORAGE_KEY);
    return storedBookings ? JSON.parse(storedBookings) : [];
  } catch (error) {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function getMinimumBookingDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

function generateBookingId() {
  let bookingId;
  do {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    bookingId = `BKG-${randomNumber}`;
  } while (getSavedBookings().some((booking) => booking.bookingId === bookingId));
  return bookingId;
}

function getTableByNumber(tableNumber) {
  return DEFAULT_TABLES.find((table) => table.tableNumber === tableNumber);
}

function isTableBookedForDateAndTime(tableNumber, bookingDate, bookingTime) {
  const bookings = getSavedBookings();

  return bookings.some((booking) => {
    const matchesTable = Number(booking.tableNumber) === Number(tableNumber);
    const matchesDate = booking.bookingDate === bookingDate;
    const matchesTime = booking.bookingTime === bookingTime;
    return matchesTable && matchesDate && matchesTime;
  });
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorBox = document.querySelector(`[data-error-for="${fieldId}"]`);

  if (field) {
    field.setAttribute('aria-invalid', 'true');
  }

  if (errorBox) {
    errorBox.textContent = message;
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorBox = document.querySelector(`[data-error-for="${fieldId}"]`);

  if (field) {
    field.setAttribute('aria-invalid', 'false');
  }

  if (errorBox) {
    errorBox.textContent = '';
  }
}

function generateTimeSlots() {
  const bookingTime = document.getElementById('booking-time');
  if (!bookingTime) return;

  bookingTime.innerHTML = '<option value="">Select a time</option>';

  BOOKING_TIME_SLOTS.forEach((slot) => {
    const option = document.createElement('option');
    option.value = slot;
    option.textContent = slot;
    bookingTime.appendChild(option);
  });
}

function updateSelectedTableInfo() {
  const infoBox = document.getElementById('selected-table-info');
  if (!infoBox) return;

  if (!bookingState.selectedTableNumber) {
    infoBox.innerHTML = '<strong>No table selected yet.</strong><span>Please choose a table to continue with your booking.</span>';
    return;
  }

  const selectedTable = getTableByNumber(bookingState.selectedTableNumber);
  if (!selectedTable) return;

  infoBox.innerHTML = `
    <strong>Selected Table: Table ${selectedTable.tableNumber}</strong>
    <span>${selectedTable.tableType} · ${selectedTable.capacity} seats</span>
  `;
}

function renderTableLayout() {
  const layout = document.getElementById('table-layout');
  if (!layout) return;

  const guestCount = Number(document.getElementById('guest-count')?.value || 0);
  const selectedDate = document.getElementById('booking-date')?.value || '';
  const selectedTime = document.getElementById('booking-time')?.value || '';
  const demoReservedTables = DEFAULT_TABLES.filter((table) => table.status === 'reserved').map((table) => table.tableNumber);

  layout.innerHTML = DEFAULT_TABLES.map((table) => {
    const isReserved = isTableBookedForDateAndTime(table.tableNumber, selectedDate, selectedTime);
    const isBlockedByGuestCount = guestCount > 0 && table.capacity < guestCount;
    const isSelected = bookingState.selectedTableNumber === table.tableNumber;
    const isDemoReserved = demoReservedTables.includes(table.tableNumber);

    let status = 'available';
    if (isReserved) status = 'reserved';
    if (isDemoReserved && !isSelected) status = 'reserved';
    if (isBlockedByGuestCount && !isSelected) status = 'reserved';
    if (isSelected) status = 'selected';

    const isDisabled = status === 'reserved' || isBlockedByGuestCount;
    const actionText = isReserved || isDemoReserved ? 'Reserved' : isBlockedByGuestCount ? 'Too Small' : isSelected ? 'Selected' : 'Available';

    return `
      <button
        type="button"
        class="table-card ${status}"
        data-table-number="${table.tableNumber}"
        ${isDisabled ? 'disabled' : ''}
        aria-label="Table ${table.tableNumber} ${actionText}"
      >
        <div class="table-card-top">
          <span>Table ${table.tableNumber}</span>
          <span>${table.capacity}-seater</span>
        </div>
        <div class="table-card-figure">🪑</div>
        <div class="table-card-meta">
          <strong>${table.tableType}</strong>
          <span>${table.capacity} guests</span>
        </div>
        <span class="status-pill ${status}">${actionText}</span>
      </button>
    `;
  }).join('');

  layout.querySelectorAll('.table-card:not(:disabled)').forEach((button) => {
    button.addEventListener('click', () => {
      const tableNumber = Number(button.dataset.tableNumber);
      selectTable(tableNumber);
    });
  });

  updateSelectedTableInfo();
}

function selectTable(tableNumber) {
  const guestCount = Number(document.getElementById('guest-count')?.value || 0);
  const bookingDate = document.getElementById('booking-date')?.value || '';
  const bookingTime = document.getElementById('booking-time')?.value || '';
  const selectedTable = getTableByNumber(tableNumber);

  if (!selectedTable) return;

  if (!guestCount) {
    showFieldError('guest-count', 'Please select the number of guests first.');
    return;
  }

  if (!bookingDate) {
    showFieldError('booking-date', 'Please choose a booking date.');
    return;
  }

  if (!bookingTime) {
    showFieldError('booking-time', 'Please select a booking time.');
    return;
  }

  if (selectedTable.capacity < guestCount) {
    showFieldError('preferred-table', 'This table cannot accommodate the selected number of guests.');
    return;
  }

  if (isTableBookedForDateAndTime(tableNumber, bookingDate, bookingTime)) {
    showFieldError('preferred-table', 'This table is already reserved for the chosen date and time.');
    return;
  }

  bookingState.selectedTableNumber = tableNumber;
  bookingState.selectedGuests = guestCount;
  bookingState.selectedDate = bookingDate;
  bookingState.selectedTime = bookingTime;

  clearFieldError('preferred-table');
  document.getElementById('preferred-table').value = `Table ${tableNumber} (${selectedTable.capacity} seats)`;
  renderTableLayout();
  updateBookingSummary();
}

function updateBookingSummary() {
  const nameField = document.getElementById('customer-name');
  const dateField = document.getElementById('booking-date');
  const timeField = document.getElementById('booking-time');
  const guestField = document.getElementById('guest-count');
  const requestField = document.getElementById('special-requests');
  const selectedTable = bookingState.selectedTableNumber ? getTableByNumber(bookingState.selectedTableNumber) : null;

  const summaryName = document.getElementById('summary-name');
  const summaryDate = document.getElementById('summary-date');
  const summaryTime = document.getElementById('summary-time');
  const summaryGuests = document.getElementById('summary-guests');
  const summaryTable = document.getElementById('summary-table');
  const summaryCapacity = document.getElementById('summary-capacity');
  const summaryRequests = document.getElementById('summary-requests');

  if (!summaryName || !summaryDate || !summaryTime || !summaryGuests || !summaryTable || !summaryCapacity || !summaryRequests) {
    return;
  }

  const customerName = nameField && nameField.value.trim() ? nameField.value.trim() : '-';
  const bookingDate = dateField && dateField.value ? dateField.value : '-';
  const bookingTime = timeField && timeField.value ? timeField.value : '-';
  const guestCount = guestField && guestField.value ? `${guestField.value} Guest${Number(guestField.value) > 1 ? 's' : ''}` : '-';
  const tableLabel = selectedTable ? `Table ${selectedTable.tableNumber}` : '-';
  const capacityLabel = selectedTable ? `${selectedTable.capacity} seats` : '-';
  const requestText = requestField && requestField.value.trim() ? requestField.value.trim() : 'No special requests';

  summaryName.textContent = customerName;
  summaryDate.textContent = bookingDate;
  summaryTime.textContent = bookingTime;
  summaryGuests.textContent = guestCount;
  summaryTable.textContent = tableLabel;
  summaryCapacity.textContent = capacityLabel;
  summaryRequests.textContent = requestText;
}

function validateIndianMobile(mobileNumber) {
  const cleanNumber = mobileNumber.replace(/\s+/g, '');
  return /^([+]?91|0)?[6789]\d{9}$/.test(cleanNumber);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateBookingForm() {
  const customerName = document.getElementById('customer-name').value.trim();
  const mobile = document.getElementById('mobile-number').value.trim();
  const email = document.getElementById('email-address').value.trim();
  const bookingDate = document.getElementById('booking-date').value;
  const bookingTime = document.getElementById('booking-time').value;
  const guestCount = Number(document.getElementById('guest-count').value || 0);
  const selectedTable = bookingState.selectedTableNumber ? getTableByNumber(bookingState.selectedTableNumber) : null;

  let isValid = true;

  if (!customerName) {
    showFieldError('customer-name', 'Customer name is required.');
    isValid = false;
  } else {
    clearFieldError('customer-name');
  }

  if (!mobile || !validateIndianMobile(mobile)) {
    showFieldError('mobile-number', 'Enter a valid Indian mobile number.');
    isValid = false;
  } else {
    clearFieldError('mobile-number');
  }

  if (!email || !validateEmail(email)) {
    showFieldError('email-address', 'Enter a valid email address.');
    isValid = false;
  } else {
    clearFieldError('email-address');
  }

  if (!bookingDate) {
    showFieldError('booking-date', 'Please choose a future booking date.');
    isValid = false;
  } else {
    const today = new Date();
    const selected = new Date(bookingDate + 'T00:00:00');
    if (selected <= today) {
      showFieldError('booking-date', 'Booking date must be a future date.');
      isValid = false;
    } else {
      clearFieldError('booking-date');
    }
  }

  if (!bookingTime) {
    showFieldError('booking-time', 'Please select a booking time.');
    isValid = false;
  } else {
    clearFieldError('booking-time');
  }

  if (!guestCount) {
    showFieldError('guest-count', 'Please select the number of guests.');
    isValid = false;
  } else {
    clearFieldError('guest-count');
  }

  if (!selectedTable) {
    showFieldError('preferred-table', 'Please select a table before submitting.');
    isValid = false;
  } else {
    if (selectedTable.capacity < guestCount) {
      showFieldError('preferred-table', 'Selected table capacity is insufficient.');
      isValid = false;
    } else if (isTableBookedForDateAndTime(selectedTable.tableNumber, bookingDate, bookingTime)) {
      showFieldError('preferred-table', 'This table is already reserved for your selected time.');
      isValid = false;
    } else {
      clearFieldError('preferred-table');
    }
  }

  return isValid;
}

function showBookingConfirmation(bookingRecord) {
  const modal = document.getElementById('booking-confirmation');
  if (!modal) return;

  document.getElementById('confirm-booking-id').textContent = bookingRecord.bookingId;
  document.getElementById('confirm-customer-name').textContent = bookingRecord.customerName;
  document.getElementById('confirm-table-number').textContent = `Table ${bookingRecord.tableNumber}`;
  document.getElementById('confirm-booking-date').textContent = bookingRecord.bookingDate;
  document.getElementById('confirm-booking-time').textContent = bookingRecord.bookingTime;
  document.getElementById('confirm-guest-count').textContent = `${bookingRecord.numberOfGuests} Guests`;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeBookingConfirmation() {
  const modal = document.getElementById('booking-confirmation');
  if (!modal) return;

  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function handleBookingSubmit(event) {
  event.preventDefault();

  if (!validateBookingForm()) {
    return;
  }

  const bookingForm = document.getElementById('booking-form');
  const customerName = document.getElementById('customer-name').value.trim();
  const mobile = document.getElementById('mobile-number').value.trim();
  const email = document.getElementById('email-address').value.trim();
  const bookingDate = document.getElementById('booking-date').value;
  const bookingTime = document.getElementById('booking-time').value;
  const numberOfGuests = Number(document.getElementById('guest-count').value);
  const specialRequests = document.getElementById('special-requests').value.trim();
  const selectedTable = getTableByNumber(bookingState.selectedTableNumber);
  const bookingId = generateBookingId();

  const bookingRecord = {
    bookingId,
    customerId: (() => {
      try {
        const session = JSON.parse(localStorage.getItem('codersCupSession') || 'null');
        return session?.role === 'customer' && session.email === email.toLowerCase() ? session.customerId : null;
      } catch (error) { return null; }
    })(),
    customerEmail: email.toLowerCase(),
    customerName,
    mobile,
    email,
    bookingDate,
    bookingTime,
    numberOfGuests,
    tableNumber: selectedTable.tableNumber,
    capacity: selectedTable.capacity,
    specialRequests: specialRequests || 'No special requests',
    bookingStatus: 'Pending Confirmation',
    createdAt: new Date().toISOString()
  };

  const bookings = getSavedBookings();
  bookings.push(bookingRecord);
  saveBookings(bookings);

  showBookingConfirmation(bookingRecord);

  bookingForm.reset();
  bookingState.selectedTableNumber = null;
  bookingState.selectedGuests = 0;
  bookingState.selectedDate = '';
  bookingState.selectedTime = '';

  const preferredTableField = document.getElementById('preferred-table');
  if (preferredTableField) preferredTableField.value = '';

  renderTableLayout();
  updateBookingSummary();
}

function setupBookingPage() {
  const bookingDate = document.getElementById('booking-date');
  const bookingForm = document.getElementById('booking-form');
  const closeButton = document.getElementById('close-confirmation');
  const yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  generateTimeSlots();

  if (bookingDate) {
    bookingDate.min = getMinimumBookingDate();
    bookingDate.value = getTomorrowDate();
    bookingState.selectedDate = bookingDate.value;
  }

  try {
    const session = JSON.parse(localStorage.getItem('codersCupSession') || 'null');
    if (session?.role === 'customer') {
      const users = JSON.parse(localStorage.getItem('codersCupCustomers') || '[]');
      const customer = users.find((user) => user.customerId === session.customerId);
      if (customer) {
        document.getElementById('customer-name').value = customer.name || '';
        document.getElementById('mobile-number').value = customer.mobile || '';
        document.getElementById('email-address').value = customer.email || '';
      }
    }
  } catch (error) {
    // Booking remains available as a guest if localStorage cannot be read.
  }

  ['customer-name', 'mobile-number', 'email-address', 'booking-date', 'booking-time', 'guest-count', 'special-requests'].forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (!input) return;

    input.addEventListener('input', () => {
      if (fieldId === 'booking-date') {
        bookingState.selectedDate = input.value;
      }
      if (fieldId === 'booking-time') {
        bookingState.selectedTime = input.value;
      }
      if (fieldId === 'guest-count') {
        bookingState.selectedGuests = Number(input.value || 0);
      }
      if (bookingState.selectedTableNumber) {
        const selectedTable = getTableByNumber(bookingState.selectedTableNumber);
        const selectedDate = document.getElementById('booking-date').value;
        const selectedTime = document.getElementById('booking-time').value;
        const tooSmall = selectedTable && Number(document.getElementById('guest-count').value || 0) > selectedTable.capacity;
        const newlyReserved = selectedTable && isTableBookedForDateAndTime(selectedTable.tableNumber, selectedDate, selectedTime);
        if (tooSmall || newlyReserved) {
          bookingState.selectedTableNumber = null;
          document.getElementById('preferred-table').value = '';
        }
      }
      renderTableLayout();
      updateBookingSummary();
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }

  const confirmationModal = document.getElementById('booking-confirmation');
  if (confirmationModal) {
    confirmationModal.addEventListener('click', (event) => {
      if (event.target === confirmationModal) {
        closeBookingConfirmation();
      }
    });
  }

  if (closeButton) {
    closeButton.addEventListener('click', closeBookingConfirmation);
  }

  renderTableLayout();
  updateBookingSummary();
}

document.addEventListener('DOMContentLoaded', setupBookingPage);
