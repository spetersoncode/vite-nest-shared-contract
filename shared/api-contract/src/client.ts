import type * as z from "zod";
import { routes, type Routes, type RouteName } from "./routes.js";

// ── Extract path param names at the type level ──────────────────
type ExtractParams<T extends string> =
  T extends `${string}:${infer P}/${infer Rest}`
    ? P | ExtractParams<Rest>
    : T extends `${string}:${infer P}`
      ? P
      : never;

type PathParams<Path extends string> =
  ExtractParams<Path> extends never
    ? void
    : { pathParams: Record<ExtractParams<Path>, string> };

// ── Infer input/output types from route definitions ────────────────
type InferInput<R> = R extends { input: z.ZodTypeAny }
  ? z.infer<R["input"]>
  : void;

type InferOutput<R> = R extends { output: z.ZodTypeAny }
  ? z.infer<R["output"]>
  : unknown;

type InferPath<R> = R extends { path: infer P extends string } ? P : string;

type ApiClient = {
  [K in RouteName]: InferInput<Routes[K]> extends void
    ? PathParams<InferPath<Routes[K]>> extends void
      ? () => Promise<InferOutput<Routes[K]>>
      : (params: PathParams<InferPath<Routes[K]>>) => Promise<
          InferOutput<Routes[K]>
        >
    : PathParams<InferPath<Routes[K]>> extends void
      ? (input: InferInput<Routes[K]>) => Promise<InferOutput<Routes[K]>>
      : (
          input: InferInput<Routes[K]>,
          params: PathParams<InferPath<Routes[K]>>,
        ) => Promise<InferOutput<Routes[K]>>;
};

// ── Build path with params ─────────────────────────────────────────
function buildPath(
  template: string,
  pathParams?: Record<string, string>,
): string {
  if (!pathParams) return template;
  let result = template;
  for (const [key, value] of Object.entries(pathParams)) {
    result = result.replace(`:${key}`, encodeURIComponent(value));
  }
  return result;
}

// ── Client factory ─────────────────────────────────────────────────
export function createApiClient(baseUrl: string): ApiClient {
  const client = {} as Record<string, Function>;

  for (const [name, route] of Object.entries(routes)) {
    client[name] = async (
      inputOrParams?: unknown,
      maybeParams?: { pathParams?: Record<string, string> },
    ) => {
      const hasInput = "input" in route && route.input !== undefined;
      const input = hasInput ? inputOrParams : undefined;
      const params = hasInput
        ? maybeParams
        : (inputOrParams as { pathParams?: Record<string, string> } | undefined);

      const path = buildPath(route.path, params?.pathParams);
      const url = `${baseUrl}${path}`;

      const options: RequestInit = { method: route.method };

      if (input !== undefined) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(input);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`API error ${response.status}: ${body}`);
      }

      const data = await response.json();
      return route.output.parse(data);
    };
  }

  return client as ApiClient;
}
