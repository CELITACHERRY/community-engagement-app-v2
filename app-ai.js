// === CONFIG ===
const spreadsheetId = "144ZkvCv6WCZbfy1E8YCDb4dqVgR54lKwfHlD40X2HCI";
const sheetName = "Events_AI"; // AI-normalized tab
const apiKey = "AIzaSyBs5PFdztKFby_lYP34g5rGg0ROoXChqRg"; // Restrict to Sheets API + your domain

const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
  sheetName
)}!A1:ZZ?key=${apiKey}`;

fetch(url)
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    const rows = data.values || [];
    if (rows.length < 2) {
      document.getElementById("status").textContent = "No events found.";
      return;
    }

    // Map rows to objects by header
    const headers = rows[0].map((h) => (h || "").trim().toLowerCase());
    const items = rows.slice(1).map((r) => rowToObj(headers, r));

    // Keep events that have a start date and are today or later
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const upcoming = items
      .filter((ev) => ev.start_iso) // must have a start
      .filter((ev) => new Date(ev.start_iso) >= startOfToday)
      .sort((a, b) => new Date(a.start_iso) - new Date(b.start_iso));

    document.getElementById(
      "status"
    ).textContent = `Loaded ${upcoming.length} upcoming event(s)`;

    const container = document.getElementById("events");
    container.innerHTML = "";

    upcoming.forEach(renderCard);
  })
  .catch((err) => {
    console.error("Error fetching sheet data", err);
    document.getElementById("status").textContent = "Failed to load events.";
  });

// === Render helpers ===
function renderCard(ev) {
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
  document.getElementById("events").appendChild(card);
}

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

    let out = `${dateStr} @ ${timeStr}`;
    if (end) {
      const sameDay = start.toDateString() === end.toDateString();
      const endTime = end.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
      out += sameDay ? ` – ${endTime}` : ` → ${end.toLocaleString()}`;
    }
    return out;
  } catch {
    return startIso;
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
  )
    parts.push("Virtual");
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
