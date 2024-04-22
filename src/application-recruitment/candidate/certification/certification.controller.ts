import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {CandidateCertificationService} from './certification.service';

import {CandidateCertification, PermissionAction, Prisma} from '@prisma/client';
import {CandidateService} from '../candidate.service';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';

@ApiTags('[Application] Recruitment / Candidate / Certification')
@ApiBearerAuth()
@Controller('recruitment-candidate-certifications')
export class CandidateCertificationController {
  constructor(
    private candidateCertificationService: CandidateCertificationService,
    private candidateService: CandidateService
  ) {}

  //* Create
  @Post('')
  @RequirePermission(
    PermissionAction.Create,
    Prisma.ModelName.CandidateCertification
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'XCertification',
          candidateId: 'e58e87c6-94b5-4da8-91d7-8373b029c12e',
        },
      },
    },
  })
  async createCandidateCertification(
    @Body()
    body: Prisma.CandidateCertificationUncheckedCreateInput
  ): Promise<CandidateCertification> {
    // [step 1] Guard statement.
    if (!(await this.candidateService.checkExistence(body.candidateId))) {
      throw new BadRequestException('Invalid candidateId in the request body.');
    }

    return await this.candidateCertificationService.create({data: body});
  }

  //* Get many
  @Get('')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.CandidateCertification
  )
  async getCandidateCertifications(): Promise<CandidateCertification[]> {
    return await this.candidateCertificationService.findMany({});
  }

  //* Get
  @Get(':certificationId')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.CandidateCertification
  )
  @ApiParam({
    name: 'certificationId',
    schema: {type: 'string'},
    description: 'The id of the candidateCertification.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getCandidateCertification(
    @Param('certificationId') certificationId: string
  ): Promise<CandidateCertification | null> {
    return await this.candidateCertificationService.findUnique({
      where: {id: parseInt(certificationId)},
    });
  }

  //* Update
  @Patch(':certificationId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.CandidateCertification
  )
  @ApiParam({
    name: 'certificationId',
    schema: {type: 'string'},
    description: 'The id of the candidateCertification.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          description: 'This is an updated description.',
        },
      },
    },
  })
  async updateCandidateCertification(
    @Param('certificationId') certificationId: string,
    @Body() body: Prisma.CandidateCertificationUpdateInput
  ): Promise<CandidateCertification> {
    return await this.candidateCertificationService.update({
      where: {id: parseInt(certificationId)},
      data: body,
    });
  }

  //* Delete
  @Delete(':certificationId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.CandidateCertification
  )
  @ApiParam({
    name: 'certificationId',
    schema: {type: 'string'},
    description: 'The id of the candidateCertification.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteCandidateCertification(
    @Param('certificationId') certificationId: string
  ): Promise<CandidateCertification> {
    return await this.candidateCertificationService.delete({
      where: {id: parseInt(certificationId)},
    });
  }

  /* End */
}
