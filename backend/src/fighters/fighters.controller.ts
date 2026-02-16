import { Controller, Get, Param } from "@nestjs/common";
import { FightersService } from "./fighters.service";

@Controller("fighters")
export class FightersController {
  constructor(private readonly fightersService: FightersService) {}

  @Get()
  findAll() {
    return this.fightersService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.fightersService.findById(id);
  }
}
