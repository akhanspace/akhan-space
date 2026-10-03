const submissions = new Map();

const WINDOW_MS = 2 * 60 * 60 * 1000;
const MAX_PER_WINDOW = 25;

function tooMany(ip) {
  const now = Date.now();
  const list = (submissions.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  submissions.set(ip, list);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  submissions.set(ip, list);
  return false;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Unknown server request method" });
  }

  const ip =
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    "unknown";

  if (tooMany(ip)) {
    return json(429, { error: "Too many recent submissions from this IP" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const message = String(payload.message || "").trim();

  if (!name) return json(400, { error: "Field 'Name' is required." });
  if (!email) return json(400, { error: "Field 'Email' is required." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: "Field 'Email' has an invalid email." });
  }
  if (!message) return json(400, { error: "Field 'Message' is required." });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO || "asad@akhan.space";
  const from = process.env.CONTACT_FROM || "Akhan Space <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("RESEND_API_KEY missing");
    return json(500, { error: "Failed to send email" });
  }

  const html = `
    <h2>New Form Submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    <hr>
    <p>Visitor IP address: ${escapeHtml(ip)}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: "Contact Form Submission",
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error", res.status, errText);
      return json(500, { error: "Failed to send email" });
    }

    return json(200, { success: true });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Failed to send email" });
  }
};

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
