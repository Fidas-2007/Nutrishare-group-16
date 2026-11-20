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
