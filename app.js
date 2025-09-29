const spreadsheetId = "144ZkvCv6WCZbfy1E8YCDb4dqVgR54lKwfHlD40X2HCI";
const range = "Events!A2:F"; // Adjust range if your sheet name is different
const apiKey = "AIzaSyBs5PFdztKFby_lYP34g5rGg0ROoXChqRg"; // Replace with your actual API key

const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

fetch(url)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const values = data.values;
    if (!values || values.length === 0) {
      document.getElementById("status").textContent = "No events found.";
      return;
    }

    document.getElementById(
      "status"
    ).textContent = `Loaded ${values.length} events`;

    const container = document.getElementById("events");
    values.forEach((row) => {
      const [Title, Date, Location, Time, Description, Link] = row;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${Title}</h3>
        <p><strong>Date:</strong> ${Date}</p>
        <p><strong>Time:</strong> ${Time}</p>
        <p><strong>Location:</strong> ${Location}</p>
        <p>${Description}</p>
        ${Link ? `<p><a href="${Link}" target="_blank">More Info</a></p>` : ""}
      `;

      container.appendChild(card);
    });
  })
  .catch((err) => {
    console.error("Error fetching sheet data", err);
    document.getElementById("status").textContent = "Failed to load events.";
  });
