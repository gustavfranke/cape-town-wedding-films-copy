import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
    const authHeader = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

    // Get the builder's email (used as From address)
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: authHeader });
    const userinfo = await userinfoRes.json();
    const fromEmail = userinfo.email;

    const body = await req.json();
    const lead = body.lead || {};
    const toEmail = lead.email;

    if (!toEmail) {
      return Response.json({ error: "Lead has no email address" }, { status: 400 });
    }

    const firstName = (lead.name || "there").split(" ")[0];
    const subject = `Thank you for your enquiry, ${firstName}!`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#0a0a0a;padding:30px 40px;text-align:center;border-bottom:1px solid #222;">
          <h1 style="margin:0;color:#d4af37;font-size:24px;font-weight:normal;letter-spacing:1px;">Cape Town Wedding Films</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#fafafa;font-size:18px;line-height:1.6;">Dear ${firstName},</p>
          <p style="color:#ccc;font-size:15px;line-height:1.7;">Thank you so much for your enquiry. We are genuinely honoured that you are considering us to capture your wedding day.</p>
          <p style="color:#ccc;font-size:15px;line-height:1.7;">We will be in touch within 24 hours to discuss your vision, check our availability, and answer any questions you may have.</p>
          <p style="color:#ccc;font-size:15px;line-height:1.7;">In the meantime, if you would like to reach us sooner, feel free to reply directly to this email.</p>
          <p style="color:#ccc;font-size:15px;line-height:1.7;">With warm regards,<br/><span style="color:#d4af37;">The Cape Town Wedding Films Team</span></p>
        </td></tr>
        <tr><td style="padding:20px 40px 30px;text-align:center;border-top:1px solid #222;">
          <p style="color:#555;font-size:12px;margin:0;">Cape Town Wedding Films &middot; Cape Town, South Africa</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const textBody = `Dear ${firstName},\n\nThank you so much for your enquiry. We are genuinely honoured that you are considering us to capture your wedding day.\n\nWe will be in touch within 24 hours to discuss your vision, check our availability, and answer any questions you may have.\n\nIn the meantime, if you would like to reach us sooner, feel free to reply directly to this email.\n\nWith warm regards,\nThe Cape Town Wedding Films Team`;

    const mimeMessage =
      `To: ${toEmail}\r\n` +
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=\r\n` +
      `From: Cape Town Wedding Films <${fromEmail}>\r\n` +
      `Reply-To: ${fromEmail}\r\n` +
      `Content-Type: text/html; charset=UTF-8\r\n` +
      `MIME-Version: 1.0\r\n` +
      `\r\n` +
      `${htmlBody}`;

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