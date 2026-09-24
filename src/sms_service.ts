import { z } from "zod";
import { sendSms } from "./infrai.js";

const eventSchema = z.object({
  kind: z.enum(["checkout", "fulfillment", "receipt", "order_update"]),
  orderId: z.string().min(1),
  phone: z.string().min(7),
  customerName: z.string().min(1),
  detail: z.string().min(1)
});
export type OrderEvent = z.infer<typeof eventSchema>;
const suppressed = new Set<string>();

export function suppressPhone(phone: string) { suppressed.add(phone); }
export function clearSuppression() { suppressed.clear(); }

function messageFor(event: OrderEvent): string {
  const labels = { checkout: "Checkout started", fulfillment: "Order shipped", receipt: "Receipt", order_update: "Order update" };
  return `${labels[event.kind]} for order ${event.orderId}, ${event.customerName}: ${event.detail}`;
}

export async function handleOrderEvent(input: unknown): Promise<{ status: "sent" | "suppressed"; orderId: string; data?: unknown }> {
  const event = eventSchema.parse(input);
  if (suppressed.has(event.phone)) return { status: "suppressed", orderId: event.orderId };
  const data = await sendSms({ to: event.phone, body: messageFor(event) }, `order-${event.orderId}-${event.kind}`);
  return { status: "sent", orderId: event.orderId, data };
}
