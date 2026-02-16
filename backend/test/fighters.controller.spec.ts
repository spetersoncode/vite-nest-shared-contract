import { Test, TestingModule } from "@nestjs/testing";
import { FightersController } from "../src/fighters/fighters.controller";
import { FightersService } from "../src/fighters/fighters.service";
import { FighterSchema, FIGHTER_ROSTER } from "@emoji-battle/api-contract";
import * as z from "zod";
import { mockLoggerProvider } from "./helpers";

describe("FightersController", () => {
  let controller: FightersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FightersController],
      providers: [FightersService, mockLoggerProvider(FightersService)],
    }).compile();

    controller = module.get(FightersController);
  });

  it("should return all fighters", () => {
    const fighters = controller.findAll();
    expect(fighters).toHaveLength(FIGHTER_ROSTER.length);
  });

  it("should return fighters that match the shared schema", () => {
    const fighters = controller.findAll();
    const result = z.array(FighterSchema).safeParse(fighters);
    expect(result.success).toBe(true);
  });

  it("should find a fighter by id", () => {
    const fighter = controller.findById("dragon");
    expect(fighter.emoji).toBe("🐉");
    expect(fighter.category).toBe("animal");
  });

  it("should throw for unknown fighter id", () => {
    expect(() => controller.findById("pikachu")).toThrow();
  });
});
