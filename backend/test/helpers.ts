import { getLoggerToken } from "nestjs-pino";

/** Creates a mock PinoLogger provider for a given service class */
export function mockLoggerProvider(target: Function) {
  return {
    provide: getLoggerToken(target.name),
    useValue: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
    },
  };
}
