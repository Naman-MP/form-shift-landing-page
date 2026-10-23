(() => {
  'use strict';

  const PRODUCTS = {
    'flex-dragon': {
      name: 'Flex Dragon', type: 'Articulated creature', price: 699, color: '#ff5c35',
      description: 'A tactile, fully articulated desk creature printed in one piece. Pose the spine, curl the tail and give restless hands something satisfying to move.',
      features: ['Printed in one articulated piece', 'No assembly required', 'Approx. 28 cm extended', 'Made to order in your selected colour']
    },
    'halo-stand': {
      name: 'Halo Stand', type: 'Desk setup', price: 1299, color: '#ddd5c5',
      description: 'A sculptural home for your headphones with a wide base, cable channel and soft visual footprint.',
      features: ['Wide, stable base', 'Integrated cable path', 'Fits most over-ear headphones', 'Made to order']
    },
    'orbit-keycap': {
      name: 'Orbit Keycap', type: 'Keyboard object', price: 349, color: '#725cff',
      description: 'A single statement key for the corner of your keyboard. Designed as a miniature object, not just another cap.',
      features: ['MX-compatible stem', 'Hand-finished after printing', 'Best suited for low-frequency keys', 'Colour requests available']
    },
    'grid-dock': {
      name: 'Grid Dock', type: 'Desk setup', price: 999, color: '#c9ff3d',
      description: 'A geometric display dock that keeps your controller visible, reachable and off the desk surface.',
      features: ['Universal cradle geometry', 'Weighted footprint', 'Cable clearance', 'Made to order']
    }
  };

  const money = value => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(value);

  const state = {
    cart: JSON.parse(localStorage.getItem('formshift-cart') || '{}'),
    activeProduct: null,
    heroColor: '#151515'
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function saveCart() {
    localStorage.setItem('formshift-cart', JSON.stringify(state.cart));
    renderCart();
  }

  function cartQuantity() {
    return Object.values(state.cart).reduce((total, quantity) => total + quantity, 0);
  }

  function addProduct(id, quantity = 1) {
    if (!PRODUCTS[id]) return;
    state.cart[id] = (state.cart[id] || 0) + quantity;
    saveCart();
    showToast(`${PRODUCTS[id].name} added to your bag`);
  }

  function removeProduct(id) {
    delete state.cart[id];
    saveCart();
  }

  function renderCart() {
    const items = $('[data-cart-items]');
    const empty = $('[data-cart-empty]');
    const footer = $('[data-cart-footer]');
    const count = cartQuantity();
    $('[data-cart-count]').textContent = count;
    items.innerHTML = '';

    let total = 0;
    Object.entries(state.cart).forEach(([id, quantity]) => {
      const product = PRODUCTS[id];
      if (!product) return;
      total += product.price * quantity;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-thumb" style="--item-color:${product.color}"></div>
        <div><h3>${product.name}</h3><p>${quantity} × ${money(product.price)}</p><button type="button" data-remove="${id}">Remove</button></div>
        <strong>${money(product.price * quantity)}</strong>`;
      items.appendChild(row);
    });

    empty.hidden = count > 0;
    footer.hidden = count === 0;
    $('[data-cart-total]').textContent = money(total);
    $$('[data-remove]', items).forEach(button => button.addEventListener('click', () => removeProduct(button.dataset.remove)));
  }

  function showToast(message) {
    const toast = $('[data-toast]');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }

  const drawer = $('[data-cart-drawer]');
  const scrim = $('[data-scrim]');
  function setCartOpen(open) {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    scrim.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) setTimeout(() => $('[data-cart-close]').focus(), 50);
  }

  function openProduct(id) {
    const product = PRODUCTS[id];
    if (!product) return;
    state.activeProduct = id;
    const dialog = $('[data-product-dialog]');
    $('[data-dialog-type]').textContent = product.type;
    $('[data-dialog-name]').textContent = product.name;
    $('[data-dialog-description]').textContent = product.description;
    $('[data-dialog-price]').textContent = money(product.price);
    $('[data-dialog-features]').innerHTML = product.features.map(feature => `<li>${feature}</li>`).join('');
    $('[data-dialog-visual]').style.background = product.color;
    dialog.showModal();
  }

  function initNavigation() {
    const header = $('[data-header]');
    window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 8), { passive: true });

    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-mobile-menu]');
    toggle.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', menu).forEach(link => link.addEventListener('click', () => {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  function initShop() {
    $$('[data-add]').forEach(button => button.addEventListener('click', () => addProduct(button.dataset.add)));
    $$('[data-product-open]').forEach(button => button.addEventListener('click', () => openProduct(button.dataset.productOpen)));
    $('[data-dialog-add]').addEventListener('click', () => {
      addProduct(state.activeProduct);
      $('[data-product-dialog]').close();
      setCartOpen(true);
    });
    $('[data-dialog-close]').addEventListener('click', () => $('[data-product-dialog]').close());

    $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
      $$('[data-filter]').forEach(item => item.classList.toggle('is-active', item === button));
      const category = button.dataset.filter;
      $$('.product-card').forEach(card => {
        card.hidden = category !== 'all' && card.dataset.category !== category;
      });
    }));

    $$('[data-cart-open]').forEach(button => button.addEventListener('click', () => setCartOpen(true)));
    $$('[data-cart-close]').forEach(button => button.addEventListener('click', () => setCartOpen(false)));
    scrim.addEventListener('click', () => setCartOpen(false));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && drawer.classList.contains('is-open')) setCartOpen(false);
    });
  }

  function initCustomizer() {
    const object = $('[data-morph-object]');
    $$('[data-color]').forEach(button => button.addEventListener('click', () => {
      $$('[data-color]').forEach(item => {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-checked', String(selected));
      });
      object.style.setProperty('--object-color', button.dataset.color);
      $('[data-color-name]').textContent = $('span', button).textContent;
      state.heroColor = button.dataset.color;
      window.setHeroMaterialColor?.(button.dataset.color);
    }));
  }

  function initCheckout() {
    const dialog = $('[data-checkout-dialog]');
    $('[data-checkout]').addEventListener('click', () => {
      setCartOpen(false);
      dialog.showModal();
      $('[data-order-form]').hidden = false;
      $('[data-order-result]').hidden = true;
    });
    $('[data-checkout-close]').addEventListener('click', () => dialog.close());

    $('[data-order-form]').addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const lines = Object.entries(state.cart).map(([id, quantity]) => {
        const product = PRODUCTS[id];
        return `• ${product.name} × ${quantity} — ${money(product.price * quantity)}`;
      });
      const total = Object.entries(state.cart).reduce((sum, [id, quantity]) => sum + PRODUCTS[id].price * quantity, 0);
      const summary = [
        'Hello, I would like to confirm this FORM/SHIFT order:', '', ...lines, '',
        `Subtotal: ${money(total)}`, `Name: ${data.get('name')}`, `Phone: ${data.get('phone')}`,
        `City / PIN: ${data.get('city')}`, `Notes: ${data.get('notes') || 'None'}`,
        '', 'Please confirm colour availability, shipping and final payment details.'
      ].join('\n');
      $('[data-order-summary]').value = summary;
      event.currentTarget.hidden = true;
      $('[data-order-result]').hidden = false;
    });

    $('[data-copy-order]').addEventListener('click', async () => {
      const text = $('[data-order-summary]').value;
      try {
        await navigator.clipboard.writeText(text);
        $('[data-copy-status]').textContent = 'Copied. Paste it into WhatsApp or your preferred messaging app.';
      } catch {
        $('[data-order-summary]').select();
        document.execCommand('copy');
        $('[data-copy-status]').textContent = 'Copied.';
      }
    });
  }

  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(element => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px' });
    $$('.reveal').forEach(element => observer.observe(element));
  }

  function initThreeScene() {
    const canvas = $('#hero-canvas');
    const loading = $('[data-3d-loading]');
    if (!window.THREE) {
      loading.textContent = '3D preview unavailable';
      return;
    }

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 10.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const group = new THREE.Group();
    group.rotation.set(-0.15, -0.45, -0.14);
    scene.add(group);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x151515,
      roughness: 0.27,
      metalness: 0.08,
      clearcoat: 0.72,
      clearcoatRoughness: 0.16
    });

    const jointMaterial = new THREE.MeshPhysicalMaterial({ color: 0xe8e0d3, roughness: 0.4, metalness: 0.02 });
    const segmentGeometry = new THREE.IcosahedronGeometry(1, 2);
    const jointGeometry = new THREE.SphereGeometry(0.26, 22, 16);
    const segments = [];

    for (let i = 0; i < 9; i += 1) {
      const t = i / 8;
      const size = 1.15 - t * 0.52;
      const mesh = new THREE.Mesh(segmentGeometry, material);
      mesh.scale.set(size * 1.04, size * 0.82, size);
      mesh.position.set((i - 4) * 0.72, Math.sin(i * 0.72) * 0.72, Math.cos(i * 0.55) * 0.44);
      mesh.rotation.set(i * 0.18, i * 0.34, i * 0.22);
      group.add(mesh);
      segments.push(mesh);
      if (i < 8) {
        const joint = new THREE.Mesh(jointGeometry, jointMaterial);
        joint.position.copy(mesh.position).lerp(new THREE.Vector3((i - 3) * 0.72, Math.sin((i + 1) * 0.72) * 0.72, Math.cos((i + 1) * 0.55) * 0.44), 0.52);
        group.add(joint);
      }
    }

    const hornGeometry = new THREE.ConeGeometry(0.28, 0.9, 5);
    [-0.42, 0.42].forEach((z, index) => {
      const horn = new THREE.Mesh(hornGeometry, jointMaterial);
      horn.position.set(-3.36, 1.15, z);
      horn.rotation.z = index ? 0.9 : 1.08;
      horn.rotation.x = index ? 0.2 : -0.2;
      group.add(horn);
    });

    const ringGeometry = new THREE.TorusGeometry(2.8, 0.018, 8, 160);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x0b0b0b, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = 1.18;
    ring.scale.x = 1.65;
    scene.add(ring);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 6.8);
    key.position.set(-4, 6, 7);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc9ff3d, 5.5);
    rim.position.set(6, -2, -4);
    scene.add(rim);

    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let dragging = false;
    let previousX = 0;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    }
    resize();
    new ResizeObserver(resize).observe(canvas.parentElement);

    canvas.addEventListener('pointerdown', event => {
      dragging = true;
      previousX = event.clientX;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (dragging) {
        targetY += (event.clientX - previousX) * 0.008;
        previousX = event.clientX;
      }
    });
    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointercancel', () => { dragging = false; });

    $('[data-randomize]').addEventListener('click', () => {
      targetY += Math.PI * (0.65 + Math.random());
      targetX = (Math.random() - 0.5) * 0.9;
      const colors = ['#151515', '#c9ff3d', '#725cff', '#eee9df', '#ff5c35'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      material.color.set(color);
    });

    window.setHeroMaterialColor = color => material.color.set(color);

    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += reducedMotion ? 0 : 0.012;
      if (!dragging && !reducedMotion) targetY += 0.0022;
      group.rotation.y += (targetY + pointerX * 0.13 - group.rotation.y) * 0.045;
      group.rotation.x += (targetX - pointerY * 0.08 - group.rotation.x) * 0.045;
      group.position.y = reducedMotion ? 0 : Math.sin(time) * 0.12;
      segments.forEach((segment, index) => {
        segment.rotation.z += reducedMotion ? 0 : Math.sin(time * 1.3 + index * 0.6) * 0.0008;
      });
      ring.rotation.z += reducedMotion ? 0 : 0.0015;
      renderer.render(scene, camera);
    }
    animate();
    loading.classList.add('is-hidden');
  }

  function init() {
    initNavigation();
    initShop();
    initCustomizer();
    initCheckout();
    initReveal();
    renderCart();
    $('[data-year]').textContent = new Date().getFullYear();
    initThreeScene();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
