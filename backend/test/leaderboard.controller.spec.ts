import { Test, TestingModule } from "@nestjs/testing";
import { LeaderboardController } from "../src/leaderboard/leaderboard.controller";
import { LeaderboardService } from "../src/leaderboard/leaderboard.service";
import { FightersService } from "../src/fighters/fighters.service";
import { BattleService } from "../src/battle/battle.service";
import { LeaderboardEntrySchema } from "@emoji-battle/contract";
import * as z from "zod";
import { mockLoggerProvider } from "./helpers";

describe("LeaderboardController", () => {
  let controller: LeaderboardController;
  let battleService: BattleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardController],
      providers: [
        LeaderboardService,
        FightersService,
        BattleService,
        mockLoggerProvider(LeaderboardService),
        mockLoggerProvider(FightersService),
        mockLoggerProvider(BattleService),
      ],
    }).compile();

    controller = module.get(LeaderboardController);
    battleService = module.get(BattleService);
  });

  it("should return leaderboard matching shared schema", () => {
    const leaderboard = controller.getLeaderboard();
    const result = z.array(LeaderboardEntrySchema).safeParse(leaderboard);
    expect(result.success).toBe(true);
  });

  it("should return all fighters in leaderboard", () => {
    const leaderboard = controller.getLeaderboard();
    expect(leaderboard.length).toBe(12);
  });

  it("should sort by win rate after battles", () => {
    // Run some battles to create differentiation
    for (let i = 0; i < 10; i++) {
      battleService.fight("dragon", "cactus");
    }

    const leaderboard = controller.getLeaderboard();
    // Verify sorted: each entry's winRate >= next entry's winRate
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].winRate).toBeGreaterThanOrEqual(
        leaderboard[i + 1].winRate,
      );
    }
  });
});
