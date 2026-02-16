import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import {
  CATEGORY_ADVANTAGE,
  type BattleResult,
  type Fighter,
} from "@emoji-battle/api-contract";
import { FightersService } from "../fighters/fighters.service";
import { randomUUID } from "node:crypto";

@Injectable()
export class BattleService {
  private history: BattleResult[] = [];

  constructor(
    private readonly fightersService: FightersService,
    @InjectPinoLogger(BattleService.name)
    private readonly logger: PinoLogger,
  ) {}

  fight(attackerId: string, defenderId: string): BattleResult {
    const attacker = this.fightersService.findById(attackerId);
    const defender = this.fightersService.findById(defenderId);

    const winner = this.resolveWinner(attacker, defender);

    // Update stats
    if (winner === "attacker") {
      this.fightersService.recordWin(attackerId);
      this.fightersService.recordLoss(defenderId);
    } else if (winner === "defender") {
      this.fightersService.recordWin(defenderId);
      this.fightersService.recordLoss(attackerId);
    } else {
      this.fightersService.recordDraw(attackerId);
      this.fightersService.recordDraw(defenderId);
    }

    const result: BattleResult = {
      id: randomUUID(),
      attacker: this.fightersService.findById(attackerId),
      defender: this.fightersService.findById(defenderId),
      winner,
      timestamp: new Date().toISOString(),
    };

    this.history.unshift(result);

    this.logger.info(
      {
        battleId: result.id,
        attacker: { id: attacker.id, name: attacker.name, category: attacker.category },
        defender: { id: defender.id, name: defender.name, category: defender.category },
        winner,
        advantage:
          CATEGORY_ADVANTAGE[attacker.category] === defender.category
            ? "attacker"
            : CATEGORY_ADVANTAGE[defender.category] === attacker.category
              ? "defender"
              : "neutral",
        historyLength: this.history.length,
      },
      `${attacker.emoji} ${attacker.name} vs ${defender.emoji} ${defender.name} → ${
        winner === "draw"
          ? "draw"
          : winner === "attacker"
            ? `${attacker.name} wins`
            : `${defender.name} wins`
      }`,
    );

    return result;
  }

  getHistory(): BattleResult[] {
    this.logger.debug({ count: this.history.length }, "Battle history requested");
    return this.history;
  }

  private resolveWinner(
    attacker: Fighter,
    defender: Fighter,
  ): "attacker" | "defender" | "draw" {
    // Category advantage: attacker's category beats defender's category
    if (CATEGORY_ADVANTAGE[attacker.category] === defender.category) {
      // 75% chance for the advantaged side
      return Math.random() < 0.75 ? "attacker" : "defender";
    }

    // Category disadvantage
    if (CATEGORY_ADVANTAGE[defender.category] === attacker.category) {
      return Math.random() < 0.75 ? "defender" : "attacker";
    }

    // Same category: weighted coin flip based on win rates
    const attackerTotal =
      attacker.stats.wins + attacker.stats.losses + attacker.stats.draws;
    const defenderTotal =
      defender.stats.wins + defender.stats.losses + defender.stats.draws;

    let attackerWeight = 0.5;
    if (attackerTotal > 0 && defenderTotal > 0) {
      const attackerWinRate = attacker.stats.wins / attackerTotal;
      const defenderWinRate = defender.stats.wins / defenderTotal;
      // Slight bias toward better fighter, but capped
      attackerWeight = 0.4 + 0.2 * (attackerWinRate / (attackerWinRate + defenderWinRate || 1));
    }

    const roll = Math.random();
    if (roll < attackerWeight * 0.9) return "attacker";
    if (roll < attackerWeight * 0.9 + (1 - attackerWeight) * 0.9) return "defender";
    return "draw";
  }
}
