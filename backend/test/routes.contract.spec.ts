import http from "node:http";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { routes } from "@emoji-battle/api-contract";

function request(
  server: http.Server,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number }> {
  return new Promise((resolve, reject) => {
    const addr = server.address() as { port: number };
    const payload = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: addr.port,
        path,
        method,
        headers: payload
          ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
          : undefined,
      },
      (res) => {
        res.resume();
        resolve({ status: res.statusCode! });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe("Contract route conformance", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  for (const [name, route] of Object.entries(routes)) {
    it(`${route.method} ${route.path} (${name}) is registered`, async () => {
      // Replace any :param placeholders with a test value
      const path = route.path.replace(/:([^/]+)/g, "dragon");

      const body =
        route.method === "POST"
          ? { attackerId: "dragon", defenderId: "fire" }
          : undefined;

      const res = await request(
        app.getHttpServer(),
        route.method,
        path,
        body,
      );

      // Route must exist — not 404 (missing route) or 405 (wrong method)
      expect([404, 405]).not.toContain(res.status);
    });
  }
});
