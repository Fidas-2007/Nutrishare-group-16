const STORAGE_KEY = "nutrishare_demo_donations";
const form = document.getElementById("donationForm");
const list = document.getElementById("donationList");
const search = document.getElementById("searchInput");
const message = document.getElementById("formMessage");

function getDonations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function renderDonations() {
  const query = search.value.trim().toLowerCase();
  const donations = getDonations().filter(item =>
    [item.food, item.location, item.category].join(" ").toLowerCase().includes(query)
  );
  list.innerHTML = "";
  if (!donations.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = query ? "No donations match your search." : "No demo donations yet. Add one using the form below.";
    list.appendChild(empty);
    return;
  }
  donations.forEach(item => {
    const card = document.createElement("article");
    card.className = "donation-card";
    const title = document.createElement("h3");
    title.textContent = item.food;
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.category;
    const quantity = document.createElement("p");
    quantity.textContent = "Quantity: " + item.quantity;
    const location = document.createElement("p");
    location.textContent = "Pickup: " + item.location;
    const expiry = document.createElement("p");
    expiry.textContent = "Best before: " + new Date(item.expiry).toLocaleString();
    card.append(title, tag, quantity, location, expiry);
    if (item.details) {
      const details = document.createElement("p");
      details.textContent = item.details;
      card.appendChild(details);
    }
    list.appendChild(card);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  const donation = Object.fromEntries(data.entries());
  if (new Date(donation.expiry).getTime() <= Date.now()) {
    message.textContent = "Please choose a future expiry time.";
    return;
  }
  const donations = getDonations();
  donations.unshift(donation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
  form.reset();
  message.textContent = "Demo donation added in this browser.";
  renderDonations();
});

search.addEventListener("input", renderDonations);
renderDonations();

const ACCOUNT_STORAGE_KEY = "nutrishare_demo_accounts";
const ACCOUNT_SESSION_KEY = "nutrishare_demo_logged_in";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const signedInPanel = document.getElementById("signedInPanel");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

function getAccounts() {
    try {
        return JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function showAccountTab(tab) {
    const showLogin = tab === "login";

    loginForm.hidden = !showLogin;
    registerForm.hidden = showLogin;
    signedInPanel.hidden = true;

    loginTab.classList.toggle("active", showLogin);
    registerTab.classList.toggle("active", !showLogin);
}

loginTab.addEventListener("click", () => {
    showAccountTab("login");
});

registerTab.addEventListener("click", () => {
    showAccountTab("register");
});

// REGISTER
registerForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const data = new FormData(registerForm);
    const email = String(data.get("email")).trim().toLowerCase();
    const password = String(data.get("password"));

    if (password.length < 6) {
        registerMessage.textContent =
            "Password must contain at least 6 characters.";
        return;
    }

    const accounts = getAccounts();

    if (accounts.some(account => account.email === email)) {
        registerMessage.textContent =
            "This email is already registered. Please log in.";
        return;
    }

    accounts.push({
        email: email,
        password: password
    });

    localStorage.setItem(
        ACCOUNT_STORAGE_KEY,
        JSON.stringify(accounts)
    );

    localStorage.setItem(ACCOUNT_SESSION_KEY, email);

    registerForm.reset();
    registerMessage.textContent = "Registration successful!";

    updateAccountView();
});

// LOGIN
loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const data = new FormData(loginForm);
    const email = String(data.get("email")).trim().toLowerCase();
    const password = String(data.get("password"));

    const account = getAccounts().find(function(item) {
        return item.email === email &&
               item.password === password;
    });

    if (!account) {
        loginMessage.textContent =
            "Incorrect email or password. Please register first if you are new.";
        return;
    }

    localStorage.setItem(ACCOUNT_SESSION_KEY, email);

    loginForm.reset();
    loginMessage.textContent = "Login successful!";

    updateAccountView();
});

// UPDATE LOGIN SCREEN
function updateAccountView() {
    const email = localStorage.getItem(ACCOUNT_SESSION_KEY);

    const accountExists = email &&
        getAccounts().some(account => account.email === email);

    if (accountExists) {
        loginForm.hidden = true;
        registerForm.hidden = true;
        signedInPanel.hidden = false;

        document.getElementById("signedInEmail").textContent =
            "Logged in as: " + email;

    } else {
        localStorage.removeItem(ACCOUNT_SESSION_KEY);
        signedInPanel.hidden = true;
        showAccountTab("login");
    }
}

// LOGOUT
document.getElementById("logoutButton")
    .addEventListener("click", function() {

        localStorage.removeItem(ACCOUNT_SESSION_KEY);
        updateAccountView();
    });


updateAccountView();

// DEMO ONLY: passwords are stored in browser storage.
// Do not use this method for real user accounts.
