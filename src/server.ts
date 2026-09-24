import { createServer } from "node:http";
import { handleOrderEvent, suppressPhone } from "./sms_service.js";

const server = createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/suppressions") {
    let raw = ""; for await (const chunk of request) raw += chunk;
    try { const body = JSON.parse(raw) as { phone?: string }; if (!body.phone) throw new Error("phone is required"); suppressPhone(body.phone); response.writeHead(204).end(); }
    catch (error) { response.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: (error as Error).message })); }
    return;
  }
  if (request.method === "POST" && request.url === "/order-events") {
    let raw = ""; for await (const chunk of request) raw += chunk;
    try { const result = await handleOrderEvent(JSON.parse(raw)); response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(result)); }
    catch (error) { response.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: (error as Error).message })); }
    return;
  }
  response.writeHead(404).end();
});
server.listen(Number(process.env.PORT ?? 3000), () => console.log("order SMS service listening"));
