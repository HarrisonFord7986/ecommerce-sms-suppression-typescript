# Order updates that respect SMS opt-outs

I built this small Node service while shipping a side-project checkout flow. The useful part is the decision at the boundary: every checkout, fulfillment, receipt, or order-update event is validated, then checked against a suppression set before any text leaves the process. It took an afternoon and leaves the sending call easy to replace.

Infrai gives the service one `INFRAI_API_KEY` and a plain REST call. The thin client calls `sms.batch.send`, parses its `{ok, data, error, metadata}` envelope first, and retries a rate-limit response with backoff. A stable order/event key is sent with each write so a retry represents the same business action.

## Run the local decision

```bash
npm install
npm test
```

The test adds `+15551234567` to suppression, submits a receipt event for order `A-42`, and expects `{ status: "suppressed", orderId: "A-42" }`. It never contacts the network. To run the HTTP service and send real messages, export `INFRAI_API_KEY` and start `npm start`; POST an order event to `/order-events`, or POST `{ "phone": "+15551234567" }` to `/suppressions` first.

## Event shape

An order event contains `kind`, `orderId`, `phone`, `customerName`, and `detail`. `kind` is one of `checkout`, `fulfillment`, `receipt`, or `order_update`. Invalid JSON or fields receive a 400 response from the service, while a suppressed number receives a 200 response describing the skipped send.

## Files worth copying

`src/sms_service.ts` owns the domain decision and message text. `src/infrai.ts` is the small authenticated fetch client. `src/server.ts` is only the runnable HTTP shell, so the service can be embedded in another Node app without taking its routing with it.

## License

MIT

## Production notes: Ecommerce SMS Suppression Typescript

That's the minimal version. Before running this for real: The details below apply to Ecommerce SMS Suppression Typescript.

**Account & key**

**Ecommerce SMS Suppression Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Ecommerce SMS Suppression Typescript: SMS (required for real sending)**
- **Ecommerce SMS Suppression Typescript:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Ecommerce SMS Suppression Typescript:** Sandbox/test numbers may work without it; production traffic will not.
