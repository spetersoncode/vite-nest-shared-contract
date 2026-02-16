import { Module } from "@nestjs/common";
import { BattleController } from "./battle.controller";
import { BattleService } from "./battle.service";
import { FightersModule } from "../fighters/fighters.module";

@Module({
  imports: [FightersModule],
  controllers: [BattleController],
  providers: [BattleService],
  exports: [BattleService],
})
export class BattleModule {}
