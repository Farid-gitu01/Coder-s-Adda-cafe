// Cart page logic: load saved items, manage quantities, coupons and totals.

const CART_PAGE_KEY = 'codersCupCart';
const DELIVERY_CHARGE = 49;
const GST_RATE = 0.05;
const COUPON_CODES = {
  CAFE10: 0.1,
  WELCOME50: 50
};

const foodCatalog = [
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

let cartItems = loadCart();
let appliedCoupon = '';

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_PAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_PAGE_KEY, JSON.stringify(cartItems));
}

function updateHeaderBadge() {
  const badge = document.getElementById('header-cart-badge');
  if (!badge) return;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
}

function getFoodById(foodId) {
  return (window.codersCupFoodData || foodCatalog).find((food) => food.id === foodId)
    || foodCatalog.find((food) => food.id === foodId);
}

function calculateTotals() {
  const subtotal = cartItems.reduce((sum, entry) => {
    const food = getFoodById(entry.id);
    if (!food) return sum;
    return sum + food.price * entry.quantity;
  }, 0);

  const tax = subtotal * GST_RATE;
  let couponDiscount = 0;

  if (appliedCoupon === 'CAFE10') {
    couponDiscount = subtotal * COUPON_CODES.CAFE10;
  } else if (appliedCoupon === 'WELCOME50') {
    couponDiscount = Math.min(COUPON_CODES.WELCOME50, subtotal);
  }

  const delivery = cartItems.length > 0 ? DELIVERY_CHARGE : 0;
  const total = Math.max(subtotal + tax + delivery - couponDiscount, 0);

  return { subtotal, tax, delivery, couponDiscount, total };
}

function renderCartItems() {
  const cartList = document.getElementById('cart-items');
  const emptyPanel = document.getElementById('empty-cart');
  const topCount = document.getElementById('top-cart-count');

  if (!cartList) return;

  if (cartItems.length === 0) {
    cartList.innerHTML = '';
    emptyPanel.classList.remove('hidden');
    topCount.textContent = '0 items';
    updateHeaderBadge();
    updateSummary(0, 0, 0, 0, 0);
    return;
  }

  emptyPanel.classList.add('hidden');

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  topCount.textContent = `${totalItems} items`;

  cartList.innerHTML = cartItems.map((entry) => {
    const food = getFoodById(entry.id);
    if (!food) return '';

    const itemTotal = food.price * entry.quantity;

    return `
      <article class="cart-item-box">
        <img src="${food.image}" alt="${food.name}" />
        <div class="cart-item-details">
          <h3>${food.name}</h3>
          <p>${food.description}</p>
          <div class="cart-item-meta">
            <span>${food.category}</span>
            <span class="food-tag ${food.type === 'veg' ? 'veg' : 'non-veg'}">${food.type}</span>
            <span>₹${food.price} each</span>
          </div>

          <div class="cart-item-controls">
            <div class="qty-control-box">
              <button type="button" data-action="decrease" data-id="${food.id}">−</button>
              <strong>${entry.quantity}</strong>
              <button type="button" data-action="increase" data-id="${food.id}">+</button>
            </div>
            <button type="button" class="remove-btn" data-action="remove" data-id="${food.id}">Remove</button>
          </div>
        </div>
        <div class="cart-pricing">
          <strong>₹${itemTotal}</strong>
        </div>
      </article>
    `;
  }).join('');

  bindCartActions();
  updateHeaderBadge();
  updateSummary();
}

function updateSummary(subtotalOverride, taxOverride, deliveryOverride, discountOverride, totalOverride) {
  const subtotalEl = document.getElementById('summary-subtotal');
  const deliveryEl = document.getElementById('summary-delivery');
  const taxEl = document.getElementById('summary-tax');
  const discountEl = document.getElementById('summary-discount');
  const totalEl = document.getElementById('summary-total');

  if (!subtotalEl || !deliveryEl || !taxEl || !discountEl || !totalEl) return;

  const totals = typeof subtotalOverride === 'number' ? {
    subtotal: subtotalOverride,
    tax: taxOverride,
    delivery: deliveryOverride,
    couponDiscount: discountOverride,
    total: totalOverride
  } : calculateTotals();

  subtotalEl.textContent = `₹${totals.subtotal}`;
  deliveryEl.textContent = `₹${totals.delivery}`;
  taxEl.textContent = `₹${totals.tax.toFixed(2)}`;
  discountEl.textContent = `-₹${totals.couponDiscount.toFixed(2)}`;
  totalEl.textContent = `₹${totals.total.toFixed(2)}`;
}

function bindCartActions() {
  document.querySelectorAll('[data-action="increase"]').forEach((button) => {
    button.addEventListener('click', () => updateQuantity(Number(button.dataset.id), 1));
  });

  document.querySelectorAll('[data-action="decrease"]').forEach((button) => {
    button.addEventListener('click', () => updateQuantity(Number(button.dataset.id), -1));
  });

  document.querySelectorAll('[data-action="remove"]').forEach((button) => {
    button.addEventListener('click', () => removeFromCart(Number(button.dataset.id)));
  });
}

function updateQuantity(foodId, change) {
  const item = cartItems.find((entry) => entry.id === foodId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cartItems = cartItems.filter((entry) => entry.id !== foodId);
  }

  saveCart();
  renderCartItems();
}

function removeFromCart(foodId) {
  cartItems = cartItems.filter((entry) => entry.id !== foodId);
  saveCart();
  renderCartItems();
}

function applyCoupon() {
  const couponInput = document.getElementById('coupon-input');
  if (!couponInput) return;

  const code = couponInput.value.trim().toUpperCase();

  if (!code) {
    appliedCoupon = '';
    localStorage.removeItem('codersCupCoupon');
    renderCartItems();
    return;
  }

  if (COUPON_CODES[code]) {
    appliedCoupon = code;
    localStorage.setItem('codersCupCoupon', code);
    alert(`Coupon ${code} applied successfully.`);
  } else {
    appliedCoupon = '';
    localStorage.removeItem('codersCupCoupon');
    alert('Invalid coupon code. Try CAFE10 or WELCOME50.');
  }

  couponInput.value = code;
  renderCartItems();
}

function setupCartPage() {
  const applyBtn = document.getElementById('apply-coupon');
  if (applyBtn) {
    applyBtn.addEventListener('click', applyCoupon);
  }

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn && cartItems.length === 0) {
    checkoutBtn.classList.add('disabled');
    checkoutBtn.setAttribute('aria-disabled', 'true');
    checkoutBtn.style.pointerEvents = 'none';
    checkoutBtn.style.opacity = '0.6';
  }

  renderCartItems();
  updateHeaderBadge();

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', setupCartPage);

window.addEventListener('storage', (event) => {
  if (event.key === 'codersCupMenu') {
    cartItems = loadCart();
    renderCartItems();
  }
});
