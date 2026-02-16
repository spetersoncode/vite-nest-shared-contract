import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { FightersModule } from "./fighters/fighters.module";
import { BattleModule } from "./battle/battle.module";
import { LeaderboardModule } from "./leaderboard/leaderboard.module";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || "info",
        transport:
          process.env.NODE_ENV !== "production"
            ? {
                target: "pino-pretty",
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: "HH:MM:ss.l",
                  ignore: "pid,hostname",
                },
              }
            : undefined,
        serializers: {
          req(req) {
            return {
              method: req.method,
              url: req.url,
            };
          },
          res(res) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
      },
    }),
    FightersModule,
    BattleModule,
    LeaderboardModule,
  ],
})
export class AppModule {}
