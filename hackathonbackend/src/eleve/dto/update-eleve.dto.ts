import { PartialType } from '@nestjs/swagger'; /* Using swagger PartialType if available, else mapped-types */
import { CreateEleveDto } from './create-eleve.dto';

export class UpdateEleveDto extends PartialType(CreateEleveDto) {}
