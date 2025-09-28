// Load data from Google Sheets using Tabletop.js
window.addEventListener("DOMContentLoaded", init);

function init() {
  const publicSpreadsheetUrl =
    "https://docs.google.com/spreadsheets/d/144ZkvCv6WCZbfy1E8YCDb4dqVgR54lKwfHlD40X2HCI/edit?usp=sharing";

  Tabletop.init({
    key: publicSpreadsheetUrl,
    simpleSheet: true,
    callback: showEvents,
  });
}

function showEvents(data) {
  const el = document.getElementById("events");
  el.innerHTML = ""; // Clear existing content
  document.getElementById(
    "status"
  ).textContent = `Loaded ${data.length} events from Google Sheets`;

  data.forEach((e) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${e.Title}</h3><p>${e.Date} • ${e.Location}</p>`;
    el.appendChild(card);
  });
}
