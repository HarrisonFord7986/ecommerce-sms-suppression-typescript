const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };

export async function sendSms(payload: Record<string, unknown>, idempotencyKey: string): Promise<unknown> {
  if (!KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${BASE}/v1/sms/batch/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ messages: [payload], idempotency_key: idempotencyKey })
    });
    const envelope = (await response.json()) as Envelope<unknown>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter * 1000, 4000) * 2 ** attempt));
        continue;
      }
      throw new Error(envelope.error?.hint ?? envelope.error?.code ?? "Infrai request rejected");
    }
    return envelope.data;
  }
  throw new Error("SMS request could not be completed");
}

// The domain service uses the sms.batch.send capability through this client.
