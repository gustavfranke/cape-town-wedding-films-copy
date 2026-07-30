import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
    const authHeader = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

    // Get the builder's email via Google userinfo (works with the 'email' scope)
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: authHeader });
    if (!userinfoRes.ok) {
      const errBody = await userinfoRes.text();
      return Response.json({ error: `Userinfo fetch failed: ${userinfoRes.status} ${errBody}` }, { status: 500 });
    }
    const userinfo = await userinfoRes.json();
    const toEmail = userinfo.email;
    if (!toEmail) {
      return Response.json({ error: "No email in userinfo response", userinfo }, { status: 500 });
    }

    const body = await req.json();
    const lead = body.lead || {};

    const subject = `New Wedding Lead: ${lead.name || "Unknown"}`;
    const lines = [
      "You have a new wedding inquiry!",
      "",
      `Name:           ${lead.name || "N/A"}`,
      `Email:          ${lead.email || "N/A"}`,
      `Phone:          ${lead.phone || "N/A"}`,
      `Wedding Date:   ${lead.wedding_date || "N/A"}`,
      `Venue:          ${lead.venue || "N/A"}`,
      `Guest Count:    ${lead.guest_count || "N/A"}`,
      `Funnel Variant: ${lead.funnel_variant || "N/A"}`,
      "",
      "Message:",
      lead.message || "N/A",
    ];
    const textBody = lines.join("\n");

    const mimeMessage = `To: ${toEmail}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${textBody}`;
    const encodedMessage = btoa(String.fromCharCode(...new TextEncoder().encode(mimeMessage)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ raw: encodedMessage }),
    });
    const sendResult = await sendRes.json();

    if (!sendRes.ok) {
      return Response.json({ error: sendResult.error?.message || "Gmail send failed" }, { status: 500 });
    }

    return Response.json({ success: true, messageId: sendResult.id, sentTo: toEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});