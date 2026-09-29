// --- 1. Product & Service Data with Inventory ---
const products = [
    { id: "SRV-201", name: "Prenatal Breastfeeding Prep", desc: "An educational session before birth to set expectations.", price: 95.00, stock: 99 },
    { id: "SRV-202", name: "Initial In-Home Lactation Consultation", desc: "A comprehensive 90-minute in-home assessment.", price: 150.00, stock: 99 },
    { id: "SRV-203", name: "Telehealth Follow-Up", desc: "A 45-minute virtual session to troubleshoot ongoing challenges.", price: 75.00, stock: 99 },
    { id: "SRV-204", name: "Return-to-Work Pumping Strategy", desc: "Customized scheduling and pump flange fitting.", price: 85.00, stock: 99 },
    { id: "SRV-205", name: "Weaning Guidance", desc: "Gentle, step-by-step support for mothers ready to transition.", price: 65.00, stock: 99 },
    { id: "ACC-101", name: "Spectra S1 Plus Electric Breast Pump", desc: "Hospital-grade, rechargeable electric pump.", price: 199.99, stock: 5 },
    { id: "ACC-102", name: "Haakaa Manual Breast Pump", desc: "Silicone manual pump to catch letdown.", price: 12.94, stock: 15 },
    { id: "ACC-103", name: "Organic Botanical Nipple Balm", desc: "2oz jar of organic, baby-safe soothing balm.", price: 14.99, stock: 8 },
    { id: "ACC-104", name: "Washable Nursing Pads (8-Pack)", desc: "Reusable, ultra-absorbent bamboo nursing pads.", price: 12.50, stock: 20 },
    { id: "ACC-105", name: "Boppy Nursing Pillow", desc: "Ergonomic support pillow for comfortable feeding.", price: 40.00, stock: 12 },
    { id: "ACC-106", name: "Lactation Support Tea", desc: "Herbal blend to promote healthy milk production.", price: 15.00, stock: 30 },
    { id: "ACC-107", name: "LaVie Lactation Massager", desc: "Relieves clogged ducts and improves milk flow.", price: 30.00, stock: 3 },
    { id: "ACC-108", name: "Breastmilk Storage Bags", desc: "100-count, pre-sterilized leak-proof bags.", price: 16.99, stock: 50 },
    { id: "ACC-109", name: "Silverette Nursing Cups", desc: "Silver nursing cups to protect and soothe.", price: 59.00, stock: 4 },
    { id: "ACC-110", name: "Dr. Brown's Bottle Sterilizer", desc: "Steam sterilizer for bottles and pump parts.", price: 74.99, stock: 6 }
];

let baseTotal = 0.00; 
let cart = JSON.parse(localStorage.getItem('nurtureSmartCart')) || {};

function saveCart() {
    localStorage.setItem('nurtureSmartCart', JSON.stringify(cart));
}

function getAvailableStock(productId) {
    const product = products.find(p => p.id === productId);
    const inCartQty = cart[productId] || 0;
    return product.stock - inCartQty;
}

// --- 2. Shop Page Rendering & Inventory Logic ---
function loadShop() {
    const container = document.getElementById('product-container');
    if (!container) return; 
    
    container.innerHTML = '';
    
    products.forEach(product => {
        const availableStock = getAvailableStock(product.id);
        const isOutOfStock = availableStock <= 0;
        
        const btnText = isOutOfStock ? "Out of Stock" : "Add to Cart";
        const btnClass = isOutOfStock ? "cta-button disabled-btn" : "cta-button";
        const tooltip = isOutOfStock ? 'title="Out of Stock"' : `title="Add ${product.name} to cart"`;
        const disabled = isOutOfStock ? "disabled" : "";

        const card = document.createElement('div');
        card.className = 'product-card';
        card.id = product.id; // Links the ID for navigation
        
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p><strong>Description:</strong> ${product.desc}</p>
            <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
            <p class="stock-info">Available Stock: ${availableStock}</p>
            <button type="button" class="${btnClass}" ${tooltip} ${disabled} onclick="addToCart('${product.id}')">${btnText}</button>
        `;
        container.appendChild(card);
    });

    renderCartSidebar();
}

function addToCart(productId) {
    const availableStock = getAvailableStock(productId);
    if (availableStock > 0) {
        cart[productId] = (cart[productId] || 0) + 1;
        saveCart();
        
        const product = products.find(p => p.id === productId);
        showNotification(`${product.name} added to cart!`);
        loadShop(); 
    }
}

function showNotification(message) {
    let existing = document.getElementById('cart-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'cart-notification';
    notification.className = 'toast-notification';
    notification.innerText = message;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentElement) notification.remove();
    }, 3000);
}

// --- 3. Smart Cart Operations ---
function adjustQuantity(productId, delta) {
    const currentQty = cart[productId] || 0;
    const newQty = currentQty + delta;
    const product = products.find(p => p.id === productId);
    
    if (newQty > product.stock) {
        alert("Cannot add more. Out of stock.");
        return;
    }

    if (newQty <= 0) {
        delete cart[productId]; 
    } else {
        cart[productId] = newQty;
    }
    
    saveCart();
    
    if (document.getElementById('product-container')) loadShop();
    if (document.getElementById('checkout-items-container')) {
        renderCheckoutCart();
        loadCartTotal();
    }
}

function clearCart() {
    cart = {};
    saveCart();
    if (document.getElementById('product-container')) loadShop();
    if (document.getElementById('checkout-items-container')) {
        renderCheckoutCart();
        loadCartTotal();
    }
}

function renderCartSidebar() {
    const cartContainer = document.getElementById('sidebar-cart-items');
    const totalEl = document.getElementById('sidebar-total');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    let total = 0;
    let itemIds = Object.keys(cart);

    if (itemIds.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        totalEl.innerText = "0.00";
        return;
    }

    itemIds.forEach(id => {
        const product = products.find(p => p.id === id);
        const qty = cart[id];
        const itemTotal = product.price * qty;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <strong>${product.name}</strong><br>
            $${product.price.toFixed(2)} x ${qty} = $${itemTotal.toFixed(2)}
            <div class="cart-controls">
                <button onclick="adjustQuantity('${id}', -1)">-</button>
                <button onclick="adjustQuantity('${id}', 1)">+</button>
                <button onclick="adjustQuantity('${id}', -${qty})">Remove</button>
            </div>
        `;
        cartContainer.appendChild(div);
    });

    totalEl.innerText = total.toFixed(2);
}

// --- 4. Checkout Logic ---
function renderCheckoutCart() {
    const container = document.getElementById('checkout-items-container');
    if (!container) return;

    container.innerHTML = ''; 
    let itemIds = Object.keys(cart);

    if (itemIds.length === 0) {
        container.innerHTML = '<p>Your cart is empty. Please visit the shop to add items.</p>';
        document.getElementById('checkout-form').style.display = 'none'; 
        return;
    }
    
    document.getElementById('checkout-form').style.display = 'block';

    itemIds.forEach(id => {
        const product = products.find(p => p.id === id);
        const qty = cart[id];

        const itemRow = document.createElement('div');
        itemRow.style.display = 'flex';
        itemRow.style.justifyContent = 'space-between';
        itemRow.style.alignItems = 'center';
        itemRow.style.borderBottom = '1px solid #eee';
        itemRow.style.padding = '10px 0';

        itemRow.innerHTML = `
            <span><strong>${product.name}</strong> (Qty: ${qty}) - $${(product.price * qty).toFixed(2)}</span>
            <div>
                <button type="button" class="tiny-btn" onclick="adjustQuantity('${id}', -1)">-</button>
                <button type="button" class="tiny-btn" onclick="adjustQuantity('${id}', 1)">+</button>
                <button type="button" class="tiny-btn danger" onclick="adjustQuantity('${id}', -${qty})">Remove</button>
            </div>
        `;
        container.appendChild(itemRow);
    });
}

function loadCartTotal() {
    const totalDisplay = document.getElementById('order-total');
    if (!totalDisplay) return; 

    baseTotal = 0;
    Object.keys(cart).forEach(id => {
        const product = products.find(p => p.id === id);
        baseTotal += product.price * cart[id];
    });
    
    totalDisplay.innerText = baseTotal.toFixed(2);
}

function validateCheckout(event) {
    event.preventDefault();
    let itemIds = Object.keys(cart);
    
    if (itemIds.length === 0) {
        alert("Your cart is empty. Please add items before checking out.");
        return false;
    }

    const shipName = document.getElementById('ship-name').value.trim();
    const cardNum = document.getElementById('card-num').value.trim();
    const cardCvv = document.getElementById('card-cvv').value.trim();

    let errors = [];
    const ccRegex = /^[0-9]{13,19}$/;
    if (!ccRegex.test(cardNum.replace(/[\s\-]/g, ''))) errors.push("Invalid Credit Card: 13-19 digits required.");
    if (!/^[0-9]{3,4}$/.test(cardCvv)) errors.push("Invalid Security Code: 3-4 digits required.");

    if (errors.length > 0) {
        alert("Checkout Errors:\n" + errors.join("\n"));
        return false;
    }
    
    document.getElementById('checkout-form').style.display = 'none';
    document.querySelector('.coupon-section').style.display = 'none';
    document.getElementById('checkout-items-container').innerHTML = `
        <div class="success-message">
            <h3 style="color: green;">Order Confirmed!</h3>
            <p>Thank you, ${shipName}. Your order has been placed successfully.</p>
            <p>A receipt and tracking information will be sent to your email.</p>
        </div>
    `;
    
    cart = {};
    saveCart();
    loadCartTotal();
    
    return true;
}

// --- 5. Coupon Logic ---
function applyCoupon() {
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const msg = document.getElementById('coupon-message');
    const totalDisplay = document.getElementById('order-total');

    if (baseTotal === 0) {
        msg.innerText = "Add items to your cart first.";
        msg.style.color = "red";
        return;
    }

    if (code === 'NURTURE20') {
        totalDisplay.innerText = (baseTotal * 0.80).toFixed(2);
        msg.innerText = "Success: 20% discount applied!";
        msg.style.color = "green";
    } else {
        totalDisplay.innerText = baseTotal.toFixed(2);
        msg.innerText = "Invalid coupon code.";
        msg.style.color = "red";
    }
}

function validateContact(event) {
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    let errors = [];

    if (email === "") errors.push("Email Address is required.");
    if (message === "") errors.push("Message is required.");

    if (errors.length > 0) {
        alert("Contact Form Errors:\n" + errors.join("\n"));
        event.preventDefault(); 
        return false;
    }
    alert("Message sent successfully!");
    return true;
}

// --- 6. Initialization (Fixed Highlight Bug Here) ---
window.onload = () => {
    // If we are on the Shop page, load the shop grid first
    if (document.getElementById('product-container')) {
        loadShop();
        
        // After loading the grid, check the URL to see if we need to scroll/highlight
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1); 
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetElement.classList.add('highlight-blue');
                    
                    // Remove the highlight class after 5 seconds
                    setTimeout(() => {
                        targetElement.classList.remove('highlight-blue');
                    }, 5000);
                }, 150); 
            }
        }
    }
    
    // If we are on the Checkout page, load the cart details
    if (document.getElementById('checkout-items-container')) {
        renderCheckoutCart();
        loadCartTotal();
    }
};