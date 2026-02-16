import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import type * as z from "zod";

@Injectable()
export class ZodValidationPipe<T extends z.ZodTypeAny>
  implements PipeTransform
{
  constructor(private schema: T) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }
    return result.data;
  }
}
