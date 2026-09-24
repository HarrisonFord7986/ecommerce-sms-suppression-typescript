import assert from "node:assert/strict";
import { clearSuppression, handleOrderEvent, suppressPhone } from "../src/sms_service.js";

clearSuppression();
const event = { kind: "receipt", orderId: "A-42", phone: "+15551234567", customerName: "Mina", detail: "$19.00 paid" };
suppressPhone(event.phone);
const result = await handleOrderEvent(event);
assert.deepEqual(result, { status: "suppressed", orderId: "A-42" });
console.log("suppressed opted-out receipt: ok");
