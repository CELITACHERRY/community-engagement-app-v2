// === CONFIG ===
const spreadsheetId = "144ZkvCv6WCZbfy1E8YCDb4dqVgR54lKwfHlD40X2HCI";
const sheetName = "Events_AI"; // <-- using your AI-normalized tab
const apiKey = "AIzaSyBs5PFdztKFby_lYP34g5rGg0ROoXChqRg"; // Restrict this key in Google Cloud!

// We'll fetch headers + data together
const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
  sheetName
)}!A1:ZZ?key=${apiKey}`;

fetch(url)
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    const rows = data.values || [];
    if (rows.length < 2) {
      document.getElementById("status").textContent = "No events found.";
      return;
    }

    const headers = rows[0].map((h) => (h || "").trim().toLowerCase());
    const items = rows.slice(1).map((r) => rowToObj(headers, r));

    // filter out truly empty rows (no title, no start)
    const events = items.filter((ev) => ev.title || ev.start_iso);

    document.getElementById(
      "status"
    ).textContent = `Loaded ${events.length} events`;

    const container = document.getElementById("events");
    container.innerHTML = ""; // clear existing

    events.forEach((ev) => {
      const {
        title = "",
        description = "",
        start_iso = "",
        end_iso = "",
        venue_name = "",
        address = "",
        city = "",
        state = "",
        is_virtual = "",
        join_url = "",
      } = ev;

      const when = formatWhen(start_iso, end_iso);
      const where = buildLocation({
        venue_name,
        address,
        city,
        state,
        is_virtual,
        join_url,
      });

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${escapeHtml(title)}</h3>
        ${when ? `<p><strong>When:</strong> ${when}</p>` : ""}
        ${where ? `<p><strong>Where:</strong> ${where}</p>` : ""}
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
        ${
          join_url
            ? `<p><a href="${encodeURI(
                join_url
              )}" target="_blank" rel="noopener">Join / More Info</a></p>`
            : ""
        }
      `;
      container.appendChild(card);
    });
  })
  .catch((err) => {
    console.error("Error fetching sheet data", err);
    document.getElementById("status").textContent = "Failed to load events.";
  });

// === Helpers ===
function rowToObj(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = (row[i] ?? "").toString().trim();
  });
  return obj;
}

function formatWhen(startIso, endIso) {
  if (!startIso) return "";
  try {
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : null;

    const dateStr = start.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeStr = start.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    let result = `${dateStr} @ ${timeStr}`;
    if (end) {
      const sameDay = start.toDateString() === end.toDateString();
      const endTime = end.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
      result += sameDay ? ` – ${endTime}` : ` → ${end.toLocaleString()}`;
    }
    return result;
  } catch {
    return startIso; // fallback
  }
}

function buildLocation({
  venue_name,
  address,
  city,
  state,
  is_virtual,
  join_url,
}) {
  const parts = [];
  if (
    is_virtual &&
    (is_virtual.toString().toLowerCase() === "true" || join_url)
  ) {
    parts.push("Virtual");
  }
  if (venue_name) parts.push(venue_name);
  const addrBits = [address, city, state].filter(Boolean).join(", ");
  if (addrBits) parts.push(addrBits);
  return parts.join(" — ");
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
