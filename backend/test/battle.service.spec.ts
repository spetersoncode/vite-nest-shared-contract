import { Test, TestingModule } from "@nestjs/testing";
import { BattleService } from "../src/battle/battle.service";
import { FightersService } from "../src/fighters/fighters.service";
import { CATEGORY_ADVANTAGE } from "@emoji-battle/contract";
import { mockLoggerProvider } from "./helpers";

describe("BattleService", () => {
  let battleService: BattleService;
  let fightersService: FightersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattleService,
        FightersService,
        mockLoggerProvider(BattleService),
        mockLoggerProvider(FightersService),
      ],
    }).compile();

    battleService = module.get(BattleService);
    fightersService = module.get(FightersService);
  });

  it("should return a valid battle result", () => {
    const result = battleService.fight("dragon", "fire");
    expect(result.id).toBeDefined();
    expect(result.attacker.id).toBe("dragon");
    expect(result.defender.id).toBe("fire");
    expect(["attacker", "defender", "draw"]).toContain(result.winner);
    expect(result.timestamp).toBeDefined();
  });

  it("should update fighter stats after battle", () => {
    const result = battleService.fight("dragon", "cactus");
    const attacker = fightersService.findById("dragon");
    const defender = fightersService.findById("cactus");

    const attackerTotal =
      attacker.stats.wins + attacker.stats.losses + attacker.stats.draws;
    const defenderTotal =
      defender.stats.wins + defender.stats.losses + defender.stats.draws;

    expect(attackerTotal).toBe(1);
    expect(defenderTotal).toBe(1);

    if (result.winner === "attacker") {
      expect(attacker.stats.wins).toBe(1);
      expect(defender.stats.losses).toBe(1);
    } else if (result.winner === "defender") {
      expect(defender.stats.wins).toBe(1);
      expect(attacker.stats.losses).toBe(1);
    } else {
      expect(attacker.stats.draws).toBe(1);
      expect(defender.stats.draws).toBe(1);
    }
  });

  it("should store battle history", () => {
    battleService.fight("wolf", "rock");
    battleService.fight("shark", "fern");

    const history = battleService.getHistory();
    expect(history).toHaveLength(2);
    // Most recent first
    expect(history[0].attacker.id).toBe("shark");
    expect(history[1].attacker.id).toBe("wolf");
  });

  it("should respect category advantage over many battles", async () => {
    // animal (dragon) beats plant (cactus) — run 200 battles
    let attackerWins = 0;
    for (let i = 0; i < 200; i++) {
      const mod = await Test.createTestingModule({
        providers: [
          BattleService,
          FightersService,
          mockLoggerProvider(BattleService),
          mockLoggerProvider(FightersService),
        ],
      }).compile();
      const fresh = mod.get(BattleService);
      const result = fresh.fight("dragon", "cactus");
      if (result.winner === "attacker") attackerWins++;
    }
    // Animal should beat plant ~75% — allow wide margin for randomness
    expect(attackerWins).toBeGreaterThan(100);
    expect(attackerWins).toBeLessThan(190);
  });

  it("should verify the category triangle is consistent", () => {
    expect(CATEGORY_ADVANTAGE["animal"]).toBe("plant");
    expect(CATEGORY_ADVANTAGE["plant"]).toBe("element");
    expect(CATEGORY_ADVANTAGE["element"]).toBe("animal");
  });
});
