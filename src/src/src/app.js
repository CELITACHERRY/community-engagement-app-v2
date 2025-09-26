// Placeholder data (replace with real API later)
const events = [
  { title: "Board Meeting", date: "2025-10-10", location: "District Office" },
  { title: "Parent Night", date: "2025-10-15", location: "Central High" },
];

const el = document.getElementById("events");
document.getElementById("status").textContent = "Sample events loaded (static JSON).";
events.forEach(e => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<h3>${e.title}</h3><p>${e.date} • ${e.location}</p>`;
  el.appendChild(card);
});

