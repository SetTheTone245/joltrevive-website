const OWNER_EMAIL = "Admin@JoltRevive.com";

interface OwnerNotification {
  subject: string;
  text: string;
}

/**
 * Sends an optional transactional notification through Resend. Delivery is
 * intentionally best-effort: messages and bookings have already been saved
 * before this is called, and a mail-provider issue must not make a customer
 * submission fail.
 */
export async function notifyOwner(notification: OwnerNotification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Jolt Revive <onboarding@resend.dev>",
        to: [OWNER_EMAIL],
        subject: notification.subject,
        text: notification.text,
      }),
    });

    if (!response.ok) {
      console.error("Resend notification failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Resend notification failed:", error);
  }
}
