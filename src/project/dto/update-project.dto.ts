import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

export class tempUpdateProjectDto extends PartialType(CreateProjectDto) {
  
}

export class UpdateProjectDto extends OmitType(tempUpdateProjectDto, ['pm_id']) {

}


