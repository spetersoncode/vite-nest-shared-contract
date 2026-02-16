import { vi } from "vitest";
import { getLoggerToken } from "nestjs-pino";

/** Creates a mock PinoLogger provider for a given service class */
export function mockLoggerProvider(target: Function) {
  return {
    provide: getLoggerToken(target.name),
    useValue: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      fatal: vi.fn(),
    },
  };
}
