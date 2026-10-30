// Homepage menu preview and testimonial controls; ordering always delegates to the existing menu cart.
function initializeHomeMenu() {
  const categoryHost = document.getElementById('home-menu-categories');
  const grid = document.getElementById('home-menu-grid');
  const search = document.getElementById('home-menu-search');
  if (!categoryHost || !grid || !search) return;

  const categories = window.codersCupMenuCategories || [];
  const foods = window.codersCupFoodData || [];
  let selectedCategory = 'all';
  let searchTerm = '';

  function refreshCartBadge() {
    const badge = document.querySelector('.site-header .cart-count');
    if (!badge) return;
    try {
      const cart = JSON.parse(localStorage.getItem('codersCupCart') || '[]');
      badge.textContent = cart.reduce((total, entry) => total + Number(entry.quantity || 0), 0);
    } catch (error) {
      badge.textContent = '0';
    }
  }

  function makeButton(text, category, itemCount) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-category-button';
    button.classList.toggle('active', category === selectedCategory);
    button.dataset.category = category;
    button.setAttribute('aria-pressed', String(category === selectedCategory));
    const title = document.createElement('strong');
    title.textContent = text;
    const count = document.createElement('span');
    count.textContent = `${itemCount} items`;
    button.append(title, count);
    button.addEventListener('click', () => {
      selectedCategory = category;
      renderCategories();
      renderHomeFood();
    });
    return button;
  }

  function renderCategories() {
    categoryHost.replaceChildren();
    const availableFoods = foods.filter((food) => food.available !== false);
    categoryHost.appendChild(makeButton('All Items', 'all', availableFoods.length));
    categories.forEach((category) => {
      const count = availableFoods.filter((food) => food.category === category.name).length;
      categoryHost.appendChild(makeButton(category.name, category.name, count));
    });
  }

  function makeFoodCard(food) {
    const card = document.createElement('article');
    card.className = 'home-food-card';

    const image = document.createElement('img');
    image.src = food.image;
    image.alt = food.name;
    image.loading = 'lazy';

    const body = document.createElement('div');
    body.className = 'home-food-card-body';
    const type = document.createElement('span');
    type.className = `home-food-type ${food.type === 'non-veg' ? 'non-veg' : 'veg'}`;
    type.textContent = food.type === 'non-veg' ? 'Non-Veg' : 'Veg';
    const title = document.createElement('h4');
    title.textContent = food.name;
    const description = document.createElement('p');
    description.textContent = food.description;
    const footer = document.createElement('div');
    footer.className = 'home-food-meta';
    const price = document.createElement('strong');
    price.textContent = `₹${food.price}`;
    const category = document.createElement('span');
    category.textContent = food.category;
    footer.append(price, category);
    const actions = document.createElement('div');
    actions.className = 'home-food-actions';
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'btn btn-primary';
    addButton.textContent = 'Add to Cart';
    addButton.addEventListener('click', () => {
      if (typeof window.codersCupAddToCart !== 'function') return;
      window.codersCupAddToCart(Number(food.id));
      refreshCartBadge();
      addButton.textContent = 'Added';
      window.setTimeout(() => { addButton.textContent = 'Add to Cart'; }, 1000);
    });
    const detailsLink = document.createElement('a');
    detailsLink.className = 'btn btn-secondary';
    detailsLink.href = `menu.html?item=${encodeURIComponent(food.id)}`;
    detailsLink.textContent = 'View Details';
    actions.append(addButton, detailsLink);
    body.append(type, title, description, footer, actions);
    card.append(image, body);
    return card;
  }

  function renderHomeFood() {
    const filteredFoods = foods.filter((food) => {
      const available = food.available !== false;
      const belongs = selectedCategory === 'all' || food.category === selectedCategory;
      const text = `${food.name} ${food.description} ${food.category}`.toLowerCase();
      return available && belongs && text.includes(searchTerm);
    });
    const title = document.getElementById('home-menu-title');
    const count = document.getElementById('home-menu-count');
    title.textContent = selectedCategory === 'all' ? 'All Menu Items' : selectedCategory;
    count.textContent = `${filteredFoods.length} item${filteredFoods.length === 1 ? '' : 's'}`;
    grid.replaceChildren();
    if (!filteredFoods.length) {
      const empty = document.createElement('p');
      empty.className = 'home-menu-empty';
      empty.textContent = 'No matching dishes. Try another category or search term.';
      grid.appendChild(empty);
      return;
    }
    const fragment = document.createDocumentFragment();
    filteredFoods.forEach((food) => fragment.appendChild(makeFoodCard(food)));
    grid.appendChild(fragment);
  }

  search.addEventListener('input', () => {
    searchTerm = search.value.trim().toLowerCase();
    renderHomeFood();
  });
  refreshCartBadge();
  renderCategories();
  renderHomeFood();
}

function initializeTestimonials() {
  const slider = document.getElementById('testimonial-slider');
  const track = document.getElementById('testimonial-track');
  const dotsHost = document.getElementById('testimonial-dots');
  if (!slider || !track || !dotsHost) return;

  const cards = Array.from(track.querySelectorAll('.testimonial-card'));
  const previous = document.getElementById('testimonial-prev');
  const next = document.getElementById('testimonial-next');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!cards.length) return;

  let activeIndex = 0;
  let timerId = null;
  let startX = null;
  const dots = cards.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'testimonial-dot';
    dot.setAttribute('aria-label', `Show testimonial ${index + 1}`);
    dot.addEventListener('click', () => { showTestimonial(index); restartTimer(); });
    dotsHost.appendChild(dot);
    return dot;
  });

  function showTestimonial(index) {
    activeIndex = (index + cards.length) % cards.length;
    const mobileView = window.matchMedia('(max-width: 767px)').matches;
    cards.forEach((card, cardIndex) => {
      const active = cardIndex === activeIndex;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-hidden', String(mobileView && !active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === activeIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }
  function stopTimer() {
    if (timerId !== null) window.clearInterval(timerId);
    timerId = null;
  }
  function startTimer() {
    stopTimer();
    if (!reducedMotion.matches && !document.hidden) timerId = window.setInterval(() => showTestimonial(activeIndex + 1), 5200);
  }
  function restartTimer() { startTimer(); }

  previous.addEventListener('click', () => { showTestimonial(activeIndex - 1); restartTimer(); });
  next.addEventListener('click', () => { showTestimonial(activeIndex + 1); restartTimer(); });
  slider.addEventListener('mouseenter', stopTimer);
  slider.addEventListener('mouseleave', startTimer);
  slider.addEventListener('focusin', stopTimer);
  slider.addEventListener('focusout', (event) => { if (!slider.contains(event.relatedTarget)) startTimer(); });
  slider.addEventListener('touchstart', (event) => { startX = event.changedTouches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (event) => {
    if (startX === null) return;
    const delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 45) showTestimonial(activeIndex + (delta < 0 ? 1 : -1));
    startX = null;
    restartTimer();
  }, { passive: true });
  reducedMotion.addEventListener?.('change', startTimer);
  window.addEventListener('resize', () => showTestimonial(activeIndex));
  document.addEventListener('visibilitychange', () => document.hidden ? stopTimer() : startTimer());
  showTestimonial(0);
  startTimer();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeHomeMenu();
  initializeTestimonials();
});
