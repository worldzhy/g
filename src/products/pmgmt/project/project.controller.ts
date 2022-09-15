import {Controller, Get, Post, Param, Body, Patch} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ProjectService} from './project.service';
import * as validator from './project.validator';
import {
  Prisma,
  Project,
  ProjectCheckpointType,
  ProjectEnvironmentType,
  ProjectState,
} from '@prisma/client';

@ApiTags('[Product] Project Management / Project')
@ApiBearerAuth()
@Controller('project-management')
export class ProjectController {
  private projectService = new ProjectService();

  @Post('projects')
  @ApiBody({
    description:
      "The 'projectName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Galaxy',
          clientName: 'Henry Zhao',
          clientEmail: 'henry@inceptionpad.com',
        },
      },
    },
  })
  async createProject(
    @Body()
    body: Prisma.ProjectCreateInput
  ) {
    // [step 1] Guard statement.
    if (!body.name || !validator.verifyProjectName(body.name)) {
      return {
        data: null,
        err: {
          message: 'Please provide valid project name in the request body.',
        },
      };
    }

    // [step 2] Create project.
    return await this.projectService.create({
      name: body.name,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      state: ProjectState.DESIGNING,
      checkpoints: {
        createMany: {
          skipDuplicates: true,
          data: Object.values(ProjectCheckpointType).map(checkpointType => {
            return {type: checkpointType};
          }),
        },
      },
      environments: {
        createMany: {
          skipDuplicates: true,
          data: Object.values(ProjectEnvironmentType).map(environmentType => {
            return {type: environmentType};
          }),
        },
      },
    });
  }

  @Get('projects')
  async getProjects(): Promise<Project[]> {
    return await this.projectService.findMany({});
  }

  @Get('projects/:projectId')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getProject(
    @Param('projectId') projectId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.projectService.findUnique({
      where: {id: projectId},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get project failed.'},
      };
    }
  }

  @Patch('projects/:projectId')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description:
      "The 'projectName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Galaxy',
          clientName: 'Henry Zhao',
          clientEmail: 'henry@inceptionpad.com',
        },
      },
    },
  })
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() body: Prisma.ProjectUpdateInput
  ) {
    return await this.projectService.update({
      where: {id: projectId},
      data: body,
    });
  }

  /* End */
}
