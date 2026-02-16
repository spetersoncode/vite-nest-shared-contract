import { Controller, Post, Get, Body, UsePipes } from "@nestjs/common";
import { BattleService } from "./battle.service";
import { BattleRequestSchema } from "@emoji-battle/api-contract";
import { ZodValidationPipe } from "../validation/zod.pipe";
import type { BattleRequest } from "@emoji-battle/api-contract";

@Controller("battle")
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(BattleRequestSchema))
  fight(@Body() body: BattleRequest) {
    return this.battleService.fight(body.attackerId, body.defenderId);
  }

  @Get("history")
  history() {
    return this.battleService.getHistory();
  }
}
