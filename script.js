let total = 0;
const modal = document.getElementById("payment-modal");
const checkoutBtn = document.getElementById("checkout-btn");
const cartTotalDisplay = document.getElementById('cart-total');
const modalTotalDisplay = document.getElementById('modal-total');
const closeBtn = document.querySelector(".close-modal");

// Add items to cart
document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', () => {
        total += parseFloat(button.getAttribute('data-price'));
        cartTotalDisplay.textContent = total.toFixed(2);
        alert("Added to memorial request.");
    });
});

// Open Payment Modal
checkoutBtn.addEventListener('click', () => {
    if (total > 0) {
        modalTotalDisplay.textContent = `$${total.toFixed(2)}`;
        modal.style.display = "block";
    } else {
        alert("Please select a tribute to proceed.");
    }
});

// Close Modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

// Handle Payment Submission
document.getElementById('payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate Processing
    const btn = document.getElementById('pay-now-btn');
    btn.disabled = true;
    btn.textContent = "Processing...";

    setTimeout(() => {
        alert("Payment Successful! Everlasting Inner Circle has received your tribute request.");
        total = 0;
        cartTotalDisplay.textContent = "0.00";
        modal.style.display = "none";
        btn.disabled = false;
        btn.textContent = "Pay & Complete Order";
        document.getElementById('payment-form').reset();
    }, 2000);
});
