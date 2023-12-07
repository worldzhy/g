import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, DatatransMission, DatatransMissionState} from '@prisma/client';
import {DatatransMissionService} from './mission.service';
import {DatatransTaskService} from './task/task.service';

@ApiTags('EngineD / Datatrans Mission')
@ApiBearerAuth()
@Controller('datatrans-missions')
export class DatatransMissionController {
  constructor(
    private readonly datatransMissionService: DatatransMissionService,
    private readonly datatransTaskService: DatatransTaskService
  ) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          numberOfRecords: 6,
          numberOfBatches: 1,
          datatransPipelineId: '5842956f-7dce-4c60-928d-575450c96d19',
        },
      },
    },
  })
  async createDatatransMission(
    @Body() body: Prisma.DatatransMissionUncheckedCreateInput
  ): Promise<DatatransMission> {
    return await this.datatransMissionService.create({data: body});
  }

  @Get('')
  async getDatatransMissions(): Promise<DatatransMission[]> {
    return await this.datatransMissionService.findMany({});
  }

  @Get(':missionId')
  async getDatatransMission(
    @Param('missionId') missionId: string
  ): Promise<DatatransMission | null> {
    return await this.datatransMissionService.findUnique({
      where: {id: missionId},
    });
  }

  @Patch(':missionId')
  async updateDatatransMission(
    @Param('missionId') missionId: string,
    @Body() body: Prisma.DatatransMissionUpdateInput
  ): Promise<DatatransMission> {
    return await this.datatransMissionService.update({
      where: {id: missionId},
      data: body,
    });
  }

  @Delete(':missionId')
  async deleteDatatransMission(
    @Param('missionId') missionId: string
  ): Promise<DatatransMission> {
    return await this.datatransMissionService.delete({
      where: {id: missionId},
    });
  }

  @Patch(':missionId/mission2tasks')
  async splitDatatransMission2Tasks(
    @Param('missionId') missionId: string
  ): Promise<DatatransMission> {
    // [step 1] Get mission.
    const mission = await this.datatransMissionService.findUnique({
      where: {id: missionId},
    });
    if (!mission) {
      throw new NotFoundException('Not found the mission.');
    }

    // [step 2] Split mission to tasks.
    const tasks: Prisma.DatatransTaskCreateManyInput[] = [];
    const numberOfRecordsPerBatch = Math.floor(
      mission.numberOfRecords / mission.numberOfBatches
    );
    const numberOfRecordsForLastBatch =
      mission.numberOfRecords % mission.numberOfBatches;

    for (let i = 0; i < mission.numberOfBatches; i++) {
      tasks.push({
        take: numberOfRecordsPerBatch,
        skip: numberOfRecordsPerBatch * i,
        missionId: missionId,
      });
    }

    if (tasks.length > 0) {
      await this.datatransTaskService.createMany({
        data: tasks,
      });
    }
    if (numberOfRecordsForLastBatch > 0) {
      await this.datatransTaskService.create({
        data: {
          take: numberOfRecordsForLastBatch,
          skip: mission.numberOfRecords - numberOfRecordsForLastBatch,
          missionId: missionId,
        },
      });
    }

    // [step 3] Update mission state.
    return await this.datatransMissionService.update({
      where: {id: missionId},
      data: {state: DatatransMissionState.SPLIT},
    });
  }

  /* End */
}
