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

