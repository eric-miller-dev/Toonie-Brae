const TAX_RATE = 0.07;

const products = {
  legacy: { id: "legacy", name: "Legacy Portrait", price: 55 },
  dossier: { id: "dossier", name: "Dossier & Service Record", price: 45 },
  bundle: { id: "bundle", name: "Memorial Bundle", price: 75 },
  digital: { id: "digital", name: "Digital Dossier", price: 25 },
};

let cart = {};

const productButtons = document.querySelectorAll(".product-card");
const orderSummaryEl = document.getElementById("orderSummary");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearOrderBtn = document.getElementById("clearOrderBtn");
const receiptSection = document.getElementById("orderReceipt");
const receiptContent = document.getElementById("receiptContent");

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

function addToCart(id) {
  if (!products[id]) return;
  if (!cart[id]) {
    cart[id] = { ...products[id], qty: 0 };
  }
  cart[id].qty += 1;
  renderCart();
}

function updateQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) {
    delete cart[id];
  }
  renderCart();
}

function calculateTotals() {
  let subtotal = 0;
  Object.values(cart).forEach((item) => {
    subtotal += item.price * item.qty;
  });
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function renderCart() {
  orderSummaryEl.innerHTML = "";

  const items = Object.values(cart);
  if (!items.length) {
    const p = document.createElement("p");
    p.className = "order-empty";
    p.textContent = "No items yet. Tap a package to begin.";
    orderSummaryEl.appendChild(p);
    checkoutBtn.disabled = true;
    updateTotalsDisplay(0, 0, 0);
    return;
  }

  items.forEach((item) => {
    const line = document.createElement("div");
    line.className = "order-line";

    const main = document.createElement("div");
    main.className = "order-line-main";

    const name = document.createElement("div");
    name.className = "order-line-name";
    name.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "order-line-meta";
    meta.textContent = formatCurrency(item.price) + " each";

    main.appendChild(name);
    main.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "order-line-actions";

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "qty-btn";
    minusBtn.textContent = "−";
    minusBtn.addEventListener("click", () => updateQty(item.id, -1));

    const qtySpan = document.createElement("span");
    qtySpan.className = "qty-value";
    qtySpan.textContent = item.qty;

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "qty-btn";
    plusBtn.textContent = "+";
    plusBtn.addEventListener("click", () => updateQty(item.id, 1));

    const lineTotal = document.createElement("div");
    lineTotal.className = "order-line-total";
    lineTotal.textContent = formatCurrency(item.price * item.qty);

    actions.appendChild(minusBtn);
    actions.appendChild(qtySpan);
    actions.appendChild(plusBtn);
    actions.appendChild(lineTotal);

    line.appendChild(main);
    line.appendChild(actions);

    orderSummaryEl.appendChild(line);
  });

  const { subtotal, tax, total } = calculateTotals();
  updateTotalsDisplay(subtotal, tax, total);
  checkoutBtn.disabled = false;
}

function updateTotalsDisplay(subtotal, tax, total) {
  subtotalEl.textContent = formatCurrency(subtotal);
  taxEl.textContent = formatCurrency(tax);
  totalEl.textContent = formatCurrency(total);
}

productButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-product-id");
    addToCart(id);
  });
});

function validateCheckoutForm() {
  let valid = true;
  const requiredIds = ["petName", "petTitle", "yourName", "email"];

  requiredIds.forEach((id) => {
    const field = document.getElementById(id);
    if (!field) return;
    if (!field.value.trim()) {
      field.classList.add("field-error");
      valid = false;
    } else {
      field.classList.remove("field-error");
    }
  });

  return valid;
}

function buildReceipt(data, totals) {
  const lines = [];

  lines.push("EVERLASTING INNER CIRCLE – ORDER SUMMARY");
  lines.push("----------------------------------------");
  lines.push(`Companion: ${data.petName} (${data.petTitle})`);
  lines.push(`Handler: ${data.yourName} <${data.email}>`);
  lines.push("");

  lines.push("Items:");
  Object.values(cart).forEach((item) => {
    lines.push(
      `  • ${item.name} x${item.qty} – ${formatCurrency(
        item.price * item.qty
      )}`
    );
  });

  lines.push("");
  lines.push(`Subtotal: ${formatCurrency(totals.subtotal)}`);
  lines.push(`Estimated Tax: ${formatCurrency(totals.tax)}`);
  lines.push(`Total: ${formatCurrency(totals.total)}`);

  if (data.notes) {
    lines.push("");
    lines.push("Notes from Handler:");
    lines.push(`  ${data.notes.trim()}`);
  }

  lines.push("");
  lines.push(
    "This summary can be copied into an email or message to finalize payment and scheduling."
  );

  return lines.join("\n");
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!Object.keys(cart).length) {
      alert("Add at least one package to the order before checking out.");
      return;
    }

    const valid = validateCheckoutForm();
    if (!valid) {
      alert(
        "Please fill in pet name, title, your name, and email so we can attach this order to the right Inner Circle."
      );
      return;
    }

    const formData = new FormData(checkoutForm);
    const data = {
      petName: formData.get("petName")?.toString().trim() || "",
      petTitle: formData.get("petTitle")?.toString().trim() || "",
      yourName: formData.get("yourName")?.toString().trim() || "",
      email: formData.get("email")?.toString().trim() || "",
      notes: formData.get("notes")?.toString().trim() || "",
    };

    const totals = calculateTotals();
    const receipt = buildReceipt(data, totals);
    receiptContent.textContent = receipt;
    receiptSection.classList.remove("hidden");

    try {
      localStorage.setItem(
        "everlasting-inner-circle:pos-order",
        JSON.stringify({ cart, data })
      );
    } catch {
      // ignore
    }
  });
}

if (clearOrderBtn) {
  clearOrderBtn.addEventListener("click", () => {
    cart = {};
    renderCart();
    checkoutForm.reset();
    receiptSection.classList.add("hidden");
    receiptContent.textContent = "";
    checkoutForm
      .querySelectorAll(".field-error")
      .forEach((el) => el.classList.remove("field-error"));
    try {
      localStorage.removeItem("everlasting-inner-circle:pos-order");
    } catch {
      // ignore
    }
  });
}

// Restore last order (soft persistence)
(function restoreLastOrder() {
  try {
    const raw = localStorage.getItem("everlasting-inner-circle:pos-order");
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.cart && typeof saved.cart === "object") {
      cart = saved.cart;
      renderCart();
    }
    if (saved.data && checkoutForm) {
      const { petName, petTitle, yourName, email, notes } = saved.data;
      if (petName) checkoutForm.petName.value = petName;
      if (petTitle) checkoutForm.petTitle.value = petTitle;
      if (yourName) checkoutForm.yourName.value = yourName;
      if (email) checkoutForm.email.value = email;
      if (notes) checkoutForm.notes.value = notes;
    }
  } catch {
    // ignore
  }
})();

/*
  Device detection utilities
  - Prefer feature detection first (matchMedia, pointer capability, touch events)
  - Only use the userAgent string when you need deep device-specific logic or to apply a precise workaround
  - Export a small helper but do not call it automatically; call it only from code paths that truly require it.
*/

function getDeviceInfoFromUA(ua) {
  // Accept optional ua string for server-side usage or testing; default to navigator.userAgent in browser
  const userAgent = (typeof ua === 'string' && ua) || (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  const uaL = userAgent.toLowerCase();
  const isAndroid = /android/.test(uaL);
  const isIOS = /iphone|ipad|ipod/.test(uaL) || (/macintosh/.test(uaL) && typeof navigator !== 'undefined' && 'standalone' in navigator && navigator.maxTouchPoints > 0);
  const isMobile = /mobile/.test(uaL) || isAndroid || isIOS;
  const isSafari = /safari/.test(uaL) && !/chrome|crios|chromium|android/.test(uaL);
  const isChrome = /chrome|crios|crmo/.test(uaL) && !/edge|opr\//.test(uaL);
  return { isAndroid, isIOS, isMobile, isSafari, isChrome, userAgent };
}

function shouldRunDeviceSpecificLogic() {
  // Example heuristic: prefer feature detection (coarse pointer indicates touch device)
  try {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return true;
  } catch (e) {
    // ignore and fall through
  }
  return false;
}

// Expose utilities for callers; they will only run a UA check when invoked explicitly.
window.getDeviceInfoFromUA = getDeviceInfoFromUA;
window.shouldRunDeviceSpecificLogic = shouldRunDeviceSpecificLogic;

/* Apply a small set of device-specific fixes and enable the mobile hamburger menu behavior.
   This deliberately calls the UA helper only when the heuristic indicates device-specific logic may be required.
*/

function applyDeviceSpecificFixes() {
  if (typeof shouldRunDeviceSpecificLogic !== 'function' || typeof getDeviceInfoFromUA !== 'function') return;
  try {
    if (!shouldRunDeviceSpecificLogic()) {
      // Prefer feature-detection; skip UA parsing when not likely useful
    } else {
      const dev = getDeviceInfoFromUA();
      if (dev.isIOS && dev.isSafari) {
        // Add a class that exposes small CSS adjustments for iOS Safari
        document.documentElement.classList.add('ua-ios-safari');

        // If sticky isn't well-supported, apply a simple fixed-header fallback
        if (typeof CSS === 'undefined' || !CSS.supports || !CSS.supports('position', 'sticky')) {
          const hdr = document.querySelector('.site-header');
          if (hdr) {
            hdr.classList.add('site-header--fixed-fallback');
            // Ensure body has top padding so content doesn't jump under the header
            const h = hdr.getBoundingClientRect().height || 60;
            document.body.style.paddingTop = `${h}px`;
          }
        }
      }
    }
  } catch (e) {
    // defensive: don't break the main app
    console.warn('Device-specific fixes failed', e);
  }
}

// Toggle mobile nav (hamburger) — accessible behavior
function setupHamburgerMenu() {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mainNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      // move focus into the nav for keyboard users
      const firstLink = nav.querySelector('a');
      if (firstLink) firstLink.focus();
      // close when clicking outside
      const closeOnClickOutside = (ev) => {
        if (!nav.contains(ev.target) && ev.target !== btn) {
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          document.removeEventListener('click', closeOnClickOutside);
        }
      };
      setTimeout(() => document.addEventListener('click', closeOnClickOutside), 0);
    }
  });

  // allow Esc to close
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    }
  });
}

// Run setup on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyDeviceSpecificFixes();
    setupHamburgerMenu();
  });
} else {
  applyDeviceSpecificFixes();
  setupHamburgerMenu();
}

