// Checkout page logic: validate customer forms, compute final totals and show confirmation modal.

const CHECKOUT_CART_KEY = 'codersCupCart';
const GST_RATE = 0.05;
const DELIVERY_CHARGE = 49;
const COUPON_CODES = {
  CAFE10: 0.1,
  WELCOME50: 50
};

const checkoutFoodCatalog = [
  { id: 1, name: 'Classic Cappuccino', category: 'Hot & Cold Coffee', description: 'Smooth espresso with rich milk foam.', price: 179, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8 },
  { id: 2, name: 'Hazelnut Latte', category: 'Hot & Cold Coffee', description: 'Silky milk with roasted hazelnut aroma.', price: 220, image: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9 },
  { id: 3, name: 'Cold Brew', category: 'Hot & Cold Coffee', description: 'Slow-steeped and refreshingly bold.', price: 210, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7 },
  { id: 4, name: 'Mocha Gold', category: 'Hot & Cold Coffee', description: 'Chocolate coffee with cocoa cream finish.', price: 240, image: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9 },
  { id: 5, name: 'Americano', category: 'Hot & Cold Coffee', description: 'Crisp, clean espresso with hot water.', price: 160, image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6 },
  { id: 6, name: 'Caramel Latte', category: 'Hot & Cold Coffee', description: 'Creamy caramel sweetness with espresso.', price: 230, image: 'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8 },
  { id: 11, name: 'Masala Chai', category: 'Tea & Refreshments', description: 'Warming chai with signature Indian spices.', price: 120, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7 },
  { id: 21, name: 'Classic Chocolate Shake', category: 'Milkshakes & Smoothies', description: 'Creamy chocolate shake with deep cocoa flavor.', price: 260, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9 },
  { id: 31, name: 'Veg Club Sandwich', category: 'Sandwiches', description: 'Layered with veggies and toasted bread.', price: 220, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7 },
  { id: 41, name: 'Classic Veg Burger', category: 'Burgers', description: 'Crispy veg patty with signature sauce.', price: 180, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7 },
  { id: 51, name: 'Margherita Pizza', category: 'Pizza', description: 'Classic tomato, mozzarella and basil.', price: 260, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8 },
  { id: 61, name: 'Alfredo Pasta', category: 'Pasta & Noodles', description: 'Creamy white sauce pasta with herbs.', price: 260, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8 },
  { id: 71, name: 'Loaded Fries', category: 'Fries & Quick Bites', description: 'Golden fries with cheese and herbs.', price: 180, image: 'https://images.unsplash.com/photo-1576101672265-86bf7b858f8f?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8 },
  { id: 81, name: 'Chocolate Fudge Cake', category: 'Cakes & Desserts', description: 'Rich chocolate cake with ganache finish.', price: 260, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9 },
  { id: 91, name: 'Classic Waffle', category: 'Waffles & Pancakes', description: 'Golden waffle crisp outside and fluffy inside.', price: 220, image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7 }
];

function loadCart() {
  try {
    const saved = localStorage.getItem(CHECKOUT_CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function getFoodById(foodId) {
  return (window.codersCupFoodData || checkoutFoodCatalog).find((item) => item.id === foodId)
    || checkoutFoodCatalog.find((item) => item.id === foodId);
}

function calculateTotals() {
  const cart = loadCart();
  const subtotal = cart.reduce((sum, entry) => {
    const food = getFoodById(entry.id);
    if (!food) return sum;
    return sum + food.price * entry.quantity;
  }, 0);

  const gst = subtotal * GST_RATE;
  const delivery = cart.length > 0 ? DELIVERY_CHARGE : 0;

  // Demo coupons based on frontend rules.
  let discount = 0;
  const couponCode = localStorage.getItem('codersCupCoupon') || '';
  if (couponCode === 'CAFE10') discount = subtotal * COUPON_CODES.CAFE10;
  if (couponCode === 'WELCOME50') discount = Math.min(COUPON_CODES.WELCOME50, subtotal);

  const finalTotal = Math.max(subtotal + gst + delivery - discount, 0);
  return { subtotal, gst, delivery, discount, total: finalTotal };
}

function renderCheckoutSummary() {
  const cart = loadCart();
  const checkoutItems = document.getElementById('checkout-items');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const taxEl = document.getElementById('checkout-tax');
  const deliveryEl = document.getElementById('checkout-delivery');
  const discountEl = document.getElementById('checkout-discount');
  const totalEl = document.getElementById('checkout-total');
  const badgeEl = document.getElementById('header-cart-badge');

  if (!checkoutItems || !subtotalEl || !taxEl || !deliveryEl || !discountEl || !totalEl) return;

  if (cart.length === 0) {
    checkoutItems.innerHTML = '<p class="empty-summary">Your cart is empty. Add items to continue.</p>';
    subtotalEl.textContent = '₹0';
    taxEl.textContent = '₹0';
    deliveryEl.textContent = '₹0';
    discountEl.textContent = '-₹0';
    totalEl.textContent = '₹0';
    if (badgeEl) badgeEl.textContent = '0';
    return;
  }

  const totals = calculateTotals();
  let totalItems = 0;

  checkoutItems.innerHTML = cart.map((entry) => {
    const food = getFoodById(entry.id);
    if (!food) return '';
    totalItems += entry.quantity;
    return `
      <div class="checkout-item">
        <div>
          <strong>${food.name}</strong>
          <small>Qty: ${entry.quantity}</small>
        </div>
        <strong>₹${food.price * entry.quantity}</strong>
      </div>
    `;
  }).join('');

  subtotalEl.textContent = `₹${totals.subtotal}`;
  taxEl.textContent = `₹${totals.gst.toFixed(2)}`;
  deliveryEl.textContent = `₹${totals.delivery}`;
  discountEl.textContent = `-₹${totals.discount.toFixed(2)}`;
  totalEl.textContent = `₹${totals.total.toFixed(2)}`;

  if (badgeEl) badgeEl.textContent = totalItems;
}

function setupOrderTypeToggle() {
  const dineFields = document.getElementById('dinein-fields');
  const takeawayFields = document.getElementById('takeaway-fields');
  const orderTypeInputs = document.querySelectorAll('input[name="order-type"]');

  orderTypeInputs.forEach((radio) => {
    radio.addEventListener('change', () => {
      const selectedValue = radio.value;
      if (selectedValue === 'Dine In') {
        dineFields.classList.remove('hidden');
        takeawayFields.classList.add('hidden');
      } else {
        dineFields.classList.add('hidden');
        takeawayFields.classList.remove('hidden');
      }
    });
  });
}

function setupPaymentToggle() {
  const cashFields = document.getElementById('cash-fields');
  const upiFields = document.getElementById('upi-fields');
  const cardFields = document.getElementById('card-fields');
  const paymentInputs = document.querySelectorAll('input[name="payment-method"]');

  paymentInputs.forEach((radio) => {
    radio.addEventListener('change', () => {
      cashFields.classList.add('hidden');
      upiFields.classList.add('hidden');
      cardFields.classList.add('hidden');

      if (radio.value === 'Cash') cashFields.classList.remove('hidden');
      if (radio.value === 'UPI') upiFields.classList.remove('hidden');
      if (radio.value === 'Card') cardFields.classList.remove('hidden');
    });
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateIndianMobile(number) {
  return /^([+]?91|0)?[6789]\d{9}$/.test(number.replace(/\s+/g, ''));
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  const errorBox = document.querySelector(`[data-error-for="${fieldId}"]`);
  if (errorBox) errorBox.textContent = message;
  field.setAttribute('aria-invalid', 'true');
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  const errorBox = document.querySelector(`[data-error-for="${fieldId}"]`);
  if (errorBox) errorBox.textContent = '';
  field.setAttribute('aria-invalid', 'false');
}

function validateForm() {
  const name = document.getElementById('customer-name').value.trim();
  const mobile = document.getElementById('mobile-number').value.trim();
  const email = document.getElementById('email-address').value.trim();
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;

  let isValid = true;

  if (!name) {
    showFieldError('customer-name', 'Name is required.');
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

  if (!paymentMethod) {
    isValid = false;
  }

  return isValid;
}

function generateOrderId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CC-${random}`;
}

function showConfirmation(orderData) {
  const modal = document.getElementById('confirmation-modal');
  if (!modal) return;

  document.getElementById('confirm-order-id').textContent = orderData.orderId;
  document.getElementById('confirm-customer-name').textContent = orderData.customerName;
  document.getElementById('confirm-order-type').textContent = orderData.orderType;
  document.getElementById('confirm-payment').textContent = orderData.paymentMethod;
  document.getElementById('confirm-total').textContent = orderData.total;
  document.getElementById('confirm-time').textContent = new Date().toLocaleString();

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function handleOrderSubmission(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const cart = loadCart();
  if (!cart.length) {
    alert('Your cart is empty. Please add items before placing the order.');
    return;
  }

  const name = document.getElementById('customer-name').value.trim();
  const mobile = document.getElementById('mobile-number').value.trim();
  const email = document.getElementById('email-address').value.trim().toLowerCase();
  const orderType = document.querySelector('input[name="order-type"]:checked')?.value || 'Dine In';
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'Cash';
  const tableNumber = orderType === 'Dine In' ? document.getElementById('table-number')?.value.trim() || '' : '';
  const totals = calculateTotals();

  const orderData = {
    orderId: generateOrderId(),
    customerId: (() => {
      const session = JSON.parse(localStorage.getItem('codersCupSession') || 'null');
      return session?.role === 'customer' && session.email === email
        ? session.customerId
        : null;
    })(),
    customerEmail: email,
    customerName: name,
    mobile,
    orderType,
    tableNumber,
    paymentMethod,
    paymentStatus: 'Pending',
    total: `₹${totals.total.toFixed(2)}`,
    subtotal: Number(totals.subtotal.toFixed(2)),
    tax: Number(totals.gst.toFixed(2)),
    delivery: Number(totals.delivery.toFixed(2)),
    discount: Number(totals.discount.toFixed(2)),
    orderDate: new Date().toISOString(),
    orderStatus: 'Pending',
    items: cart.map((entry) => {
      const food = getFoodById(entry.id);
      return { id: entry.id, name: food ? food.name : `Menu item ${entry.id}`, price: food ? food.price : 0, quantity: entry.quantity };
    })
  };

  const savedOrders = (() => {
    try { return JSON.parse(localStorage.getItem('codersCupOrders') || '[]'); } catch (error) { return []; }
  })();
  savedOrders.push(orderData);
  localStorage.setItem('codersCupOrders', JSON.stringify(savedOrders));

  showConfirmation(orderData);
  localStorage.removeItem(CHECKOUT_CART_KEY);
  localStorage.removeItem('codersCupCoupon');

  const badge = document.getElementById('header-cart-badge');
  if (badge) badge.textContent = '0';
}

function setupCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', handleOrderSubmission);
  }

  const modal = document.getElementById('confirmation-modal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const session = (() => {
    try { return JSON.parse(localStorage.getItem('codersCupSession') || 'null'); } catch (error) { return null; }
  })();
  if (session?.role === 'customer') {
    try {
      const users = JSON.parse(localStorage.getItem('codersCupCustomers') || '[]');
      const customer = users.find((user) => user.customerId === session.customerId);
      if (customer) {
        document.getElementById('customer-name').value = customer.name || '';
        document.getElementById('mobile-number').value = customer.mobile || '';
        document.getElementById('email-address').value = customer.email || '';
      }
    } catch (error) {
      // Keep checkout usable if browser storage is unavailable or malformed.
    }
  }

  setupOrderTypeToggle();
  setupPaymentToggle();
  renderCheckoutSummary();
}

document.addEventListener('DOMContentLoaded', setupCheckoutForm);

window.addEventListener('storage', (event) => {
  if (event.key === 'codersCupMenu') renderCheckoutSummary();
});
