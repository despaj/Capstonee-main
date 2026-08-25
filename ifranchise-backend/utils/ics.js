const pad = (n) => (n < 10 ? "0" + n : n);
const toICSDate = (d) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

function buildICS({ title, start, durationMinutes = 60, location = "", description = "" }) {
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Franchisync//Interview Scheduler//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@franchisync.business`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

module.exports = { buildICS };