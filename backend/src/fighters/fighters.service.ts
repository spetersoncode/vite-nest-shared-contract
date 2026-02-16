import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { FIGHTER_ROSTER, type Fighter } from "@emoji-battle/contract";

@Injectable()
export class FightersService {
  private fighters: Map<string, Fighter>;

  constructor(
    @InjectPinoLogger(FightersService.name)
    private readonly logger: PinoLogger,
  ) {
    this.fighters = new Map();
    for (const roster of FIGHTER_ROSTER) {
      this.fighters.set(roster.id, {
        ...roster,
        stats: { wins: 0, losses: 0, draws: 0 },
      });
    }
    this.logger.info(
      { count: this.fighters.size },
      "Fighter roster initialized",
    );
  }

  findAll(): Fighter[] {
    this.logger.debug({ count: this.fighters.size }, "Listing all fighters");
    return Array.from(this.fighters.values());
  }

  findById(id: string): Fighter {
    const fighter = this.fighters.get(id);
    if (!fighter) {
      this.logger.warn({ fighterId: id }, "Fighter not found");
      throw new NotFoundException(`Fighter "${id}" not found`);
    }
    return fighter;
  }

  recordWin(id: string): void {
    const f = this.findById(id);
    f.stats.wins++;
  }

  recordLoss(id: string): void {
    const f = this.findById(id);
    f.stats.losses++;
  }

  recordDraw(id: string): void {
    const f = this.findById(id);
    f.stats.draws++;
  }
}
