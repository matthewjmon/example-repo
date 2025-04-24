// REFERENCES TO HTML ELEMENTS
const cartIcon = document.querySelector("#cart");
const cartModal = document.querySelector("#cart-modal");
const cartItemsContainer = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const clearCartBtn = document.querySelector("#clear-cart");
const closeCartBtn = document.querySelector(".close-btn");
const addToCartBtns = document.querySelectorAll(".product-btn");
const currencySelect = document.querySelector("#currency");

// Load saved cart items from localStorage or start with empty array
let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

// FONT PREFERENCE USING sessionStorage
document.addEventListener("DOMContentLoaded", () => {
  const fontSelect = document.getElementById("font-select");
  const body = document.body;

  // If font was saved earlier, use it
  const savedFont = sessionStorage.getItem("preferredFont");
  if (savedFont) {
    body.style.fontFamily = savedFont;
    fontSelect.value = savedFont;
  }

  // Save and apply font when user changes it
  fontSelect.addEventListener("change", (e) => {
    const selectedFont = e.target.value;
    body.style.fontFamily = selectedFont;
    sessionStorage.setItem("preferredFont", selectedFont);
  });
});

// ADD ITEMS TO CART USING localStorage
addToCartBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const productBox = e.target.closest(".product-box");
    const name = productBox.querySelector(".product-name").textContent;
    const priceInZar = parseFloat(productBox.querySelector(".product-price").dataset.zar);

    // If product already in cart, increase quantity
    const existingItem = cartItems.find((item) => item.name === name);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // Add new item to cart with quantity 1
      cartItems.push({ name, price: priceInZar, quantity: 1 });
    }

    updateCartDisplay(); // Update visual cart
    saveCartToLocalStorage(); // Save updated cart
  });
});

// TOGGLE CART MODAL VISIBILITY
cartIcon.addEventListener("click", () => {
  cartModal.classList.toggle("show"); // Show/hide cart modal
});

closeCartBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // Stop it from affecting outer elements
  cartModal.classList.remove("show");
});

cartModal.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent closing when clicking inside modal
});

// CLEAR CART + DELETE COOKIES
clearCartBtn.addEventListener("click", () => {
  cartItems = []; // Empty the cart array
  updateCartDisplay(); // Update UI to reflect empty cart
  saveCartToLocalStorage(); // Clear cart from localStorage
  deleteCookie("username"); // Remove saved name
  console.log("Cart cleared and username cookie deleted");
});

// Update the cart display on the page
function updateCartDisplay() {
  const cartCount = document.getElementById("cart-count"); // Badge element
  cartItemsContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = "<li>Your cart is empty</li>";
    cartTotal.textContent = "R0";
    cartCount.style.display = "none"; // Hide badge if cart is empty
    return;
  }

  let total = 0;
  let totalItems = 0; // Total quantity of all items
  const savedCurrency = getCookie("currency") || "ZAR";
  const rate = conversionRates[savedCurrency];
  const symbol = currencySymbols[savedCurrency];

  cartItems.forEach((item) => {
    if (isNaN(item.price) || item.price <= 0) {
      console.error("Invalid price for item:", item.name);
      return;
    }

    const convertedPrice = item.price * rate;
    const itemTotal = convertedPrice * item.quantity;

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${item.name} x ${item.quantity}</span><span>${symbol}${itemTotal.toFixed(2)}</span>`;
    cartItemsContainer.appendChild(li);

    total += itemTotal;
    totalItems += item.quantity; // Add item quantity to total count
  });

  cartTotal.textContent = `${symbol}${total.toFixed(2)}`;
  
  // Update the badge with total items
  cartCount.textContent = totalItems;
  cartCount.style.display = "inline-block"; // Show the badge
}


// SAVE CART TO localStorage
function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cartItems));
}

// SHOW EXISTING CART ON PAGE LOAD
window.addEventListener("DOMContentLoaded", () => {
  cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartDisplay();
});

// LOAD SAVED CURRENCY ON PAGE LOAD
window.addEventListener("DOMContentLoaded", () => {
  const savedCurrency = getCookie("currency");
  if (savedCurrency && currencySymbols[savedCurrency]) {
    currencySelect.value = savedCurrency;
    updateCartDisplay(); // Update totals to match saved currency
  }
});

// HANDLE USER NAME WITH COOKIES
// Handle user name with cookies and display a welcome message
document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");

  // Show welcome message if cookie is found
  const savedName = getCookie("username");
  if (savedName) {
    // Set the personalized message in the pop-up banner
    document.getElementById("welcome-message").textContent = `Welcome back, ${savedName}!`;
    // Show the banner
    document.getElementById("welcome-banner").style.display = "block";
    nameInput.value = savedName;
  }

  // Save name while typing
  nameInput.addEventListener("input", () => {
    const username = nameInput.value.trim();
    if (username) {
      setCookie("username", username, 30);
      console.log("Name saved in cookie:", username);
    }
  });
});

// Close the banner when the "Got it!" button is clicked
document.getElementById("close-banner").addEventListener("click", () => {
  document.getElementById("welcome-banner").style.display = "none";
});

// Set a cookie with name, value, and expiry
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Get the value of a cookie by name
function getCookie(name) {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return "";
}

// Delete a cookie by setting its expiry to the past
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Show the banner when service worker is registered
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => {
        console.log("Service Worker registered:", reg.scope);
        // Show the cache banner
        document.getElementById("cache-banner").style.display = "block";
      })
      .catch((err) => {
        console.log("Service Worker registration failed:", err);
      });
  });
}

// Close the cache banner when the user clicks the "Got it!" button
document.getElementById("cache-close").addEventListener("click", () => {
  document.getElementById("cache-banner").style.display = "none";
});


// CURRENCY CONVERSION AND DISPLAY
const conversionRates = {
  ZAR: 1,
  USD: 0.054,
  EUR: 0.050
};

const currencySymbols = {
  ZAR: "R",
  USD: "$",
  EUR: "€"
};

// When user selects a currency, update all prices
currencySelect.addEventListener("change", () => {
  const selectedCurrency = currencySelect.value;
  setCookie("currency", selectedCurrency, 30);

  const rate = conversionRates[selectedCurrency];
  const symbol = currencySymbols[selectedCurrency];

  // Convert and update price labels on products
  const productPrices = document.querySelectorAll(".product-price");
  productPrices.forEach((priceEl) => {
    const basePrice = parseFloat(priceEl.dataset.zar);
    if (isNaN(basePrice)) {
      console.error("Invalid base price for product:", priceEl);
      return;
    }
    const convertedPrice = (basePrice * rate).toFixed(2);
    priceEl.innerText = `${symbol} ${convertedPrice}`;
  });

  updateCartDisplay(); // Refresh cart to reflect new currency
});

  















