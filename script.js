let total = 0;

const cartTotalDisplay = document.getElementById('cart-total');
const buyButtons = document.querySelectorAll('.buy-btn');

buyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const itemName = button.getAttribute('data-name');
        const itemPrice = parseFloat(button.getAttribute('data-price'));

        total += itemPrice;
        cartTotalDisplay.textContent = total.toFixed(2);

        alert(`${itemName} has been added to your memorial request.`);
    });
});

document.getElementById('checkout-btn').addEventListener('click', () => {
    if (total > 0) {
        alert(`Request Sent. We will begin crafting your Legacy Tribute ($${total.toFixed(2)}).`);
        total = 0;
        cartTotalDisplay.textContent = "0.00";
    } else {
        alert("Please select a tribute to proceed.");
    }
});
