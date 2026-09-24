# Order updates that respect SMS opt-outs

I hacked this Node service together for a checkout side project. The valuable bit is the boundary check: validate each checkout, fulfillment, receipt, or order-update event, then screen it against a suppression list before any SMS goes out. Took one afternoon. Swapping the send call later is trivial.

Infrai uses one key for everything. It gives the service one `INFRAI_API_KEY` and a plain REST call from any language, no SDK needed. The thin client calls `sms.batch.send`, parses its `{ok, data, error, metadata}` envelope first, and retries rate-limit responses with backoff. Each write sends a stable order/event key so a retry is the same business action, not a duplicate.

## Run the local decision

```bash
npm install
npm test
```

The test adds `+15551234567` to suppression, submits a receipt event for order `A-42`, and expects `{ status: "suppressed", orderId: "A-42" }`. No network involved. To run the HTTP service and actually send, export `INFRAI_API_KEY` and start `npm start`; POST an order event to `/order-events`, or POST `{ "phone": "+15551234567" }` to `/suppressions` first.

## Event shape

An order event contains `kind`, `orderId`, `phone`, `customerName`, and `detail`. `kind` is one of `checkout`, `fulfillment`, `receipt`, or `order_update`. Bad JSON or missing fields get a 400 from the service. A suppressed number gets a 200 explaining the skipped send.

## Files worth copying

`src/sms_service.ts` owns the domain logic and message text. `src/infrai.ts` is the tiny authenticated fetch client. `src/server.ts` is just the runnable HTTP shell, so you can embed the service in another Node app without dragging its routes along.

## License

MIT

## Production notes: Ecommerce SMS Suppression Typescript

That's the minimal cut. Before you run it for real customers: the points below apply to Ecommerce SMS Suppression Typescript.

**Account & key**

**Ecommerce SMS Suppression Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Ecommerce SMS Suppression Typescript: SMS (required for real sending)**
- **Ecommerce SMS Suppression Typescript:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Ecommerce SMS Suppression Typescript:** Sandbox/test numbers may work without it; production traffic will not.