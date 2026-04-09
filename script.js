let cartTotal = 0;
let itemCount = 0;

const totalDisplay = document.getElementById('cart-total');
const countDisplay = document.getElementById('cart-count');
const buttons = document.querySelectorAll('.buy-btn');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const price = parseFloat(button.getAttribute('data-price'));
        const name = button.getAttribute('data-name');

        // Update Logic
        cartTotal += price;
        itemCount++;

        // Update UI
        totalDisplay.textContent = cartTotal.toFixed(2);
        countDisplay.textContent = itemCount;

        alert(`${name} added to cart!`);
    });
});

document.getElementById('checkout-btn').addEventListener('click', () => {
    if (itemCount > 0) {
        alert(`Thank you for your purchase of $${cartTotal.toFixed(2)}!`);
        // Reset cart
        cartTotal = 0;
        itemCount = 0;
        totalDisplay.textContent = "0.00";
        countDisplay.textContent = "0";
    } else {
        alert("Your cart is empty!");
    }
});
