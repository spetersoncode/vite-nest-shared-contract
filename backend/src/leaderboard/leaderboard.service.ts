import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { FightersService } from "../fighters/fighters.service";
import type { LeaderboardEntry } from "@emoji-battle/api-contract";

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly fightersService: FightersService,
    @InjectPinoLogger(LeaderboardService.name)
    private readonly logger: PinoLogger,
  ) {}

  getLeaderboard(): LeaderboardEntry[] {
    const fighters = this.fightersService.findAll();

    const entries = fighters
      .map((fighter) => {
        const totalBattles =
          fighter.stats.wins + fighter.stats.losses + fighter.stats.draws;
        const winRate = totalBattles > 0 ? fighter.stats.wins / totalBattles : 0;
        return { fighter, winRate, totalBattles };
      })
      .sort((a, b) => {
        // Sort by win rate desc, then total battles desc
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.totalBattles - a.totalBattles;
      });

    const activeFighters = entries.filter((e) => e.totalBattles > 0);
    this.logger.info(
      {
        totalFighters: entries.length,
        activeFighters: activeFighters.length,
        topFighter: activeFighters[0]
          ? {
              name: activeFighters[0].fighter.name,
              winRate: Math.round(activeFighters[0].winRate * 100),
              battles: activeFighters[0].totalBattles,
            }
          : null,
      },
      "Leaderboard requested",
    );

    return entries;
  }
}
