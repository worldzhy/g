import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {JobApplicationWorkflowNoteService} from './note.service';

import {
  JobApplicationWorkflowNote,
  PermissionAction,
  Prisma,
} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {AccessTokenService} from '@microservices/token/access-token/access-token.service';
import {JobApplicationWorkflowService} from '../workflow.service';
import {UserService} from '@microservices/account/user/user.service';

@ApiTags('Recruitment / Job Application / Workflow Note')
@ApiBearerAuth()
@Controller('recruitment-workflow-notes')
export class JobApplicationWorkflowNoteController {
  constructor(
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly jobApplicationWorkflowService: JobApplicationWorkflowService,
    private readonly jobApplicationWorkflowNoteService: JobApplicationWorkflowNoteService
  ) {}

  @Post('')
  @RequirePermission(
    PermissionAction.Create,
    Prisma.ModelName.JobApplicationWorkflowNote
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          reporterComment: 'This an example task.',
          workflowId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
        },
      },
    },
  })
  async createJobApplicationWorkflowNote(
    @Request() request: Request,
    @Body()
    body: Prisma.JobApplicationWorkflowNoteUncheckedCreateInput
  ): Promise<JobApplicationWorkflowNote> {
    // [step 1] Guard statement.
    if (
      !(await this.jobApplicationWorkflowService.checkExistence(
        body.workflowId
      ))
    ) {
      throw new BadRequestException('Invalid workflowId in the request body.');
    }

    // [step 2] Get user.
    const {userId} = this.accessTokenService.decodeToken(
      this.accessTokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {profile: {select: {fullName: true}}},
    });
    body.reporterUserId = userId;
    body.reporter = user['profile'].fullName;

    // [step 3] Create jobApplicationWorkflowNote.
    return await this.jobApplicationWorkflowNoteService.create({data: body});
  }

  @Get('')
  @RequirePermission(
    PermissionAction.List,
    Prisma.ModelName.JobApplicationWorkflowNote
  )
  async getJobApplicationWorkflowNotes(): Promise<
    JobApplicationWorkflowNote[]
  > {
    return await this.jobApplicationWorkflowNoteService.findMany({});
  }

  @Get(':noteId')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.JobApplicationWorkflowNote
  )
  async getJobApplicationWorkflowNote(
    @Param('noteId') noteId: number
  ): Promise<JobApplicationWorkflowNote | null> {
    return await this.jobApplicationWorkflowNoteService.findUnique({
      where: {id: noteId},
    });
  }

  @Patch(':noteId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflowNote
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          reporterComment: 'This is an updated comment.',
        },
      },
    },
  })
  async updateJobApplicationWorkflowNote(
    @Param('noteId') noteId: number,
    @Body() body: Prisma.JobApplicationWorkflowNoteUpdateInput
  ): Promise<JobApplicationWorkflowNote> {
    return await this.jobApplicationWorkflowNoteService.update({
      where: {id: noteId},
      data: body,
    });
  }

  @Delete(':noteId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.JobApplicationWorkflowNote
  )
  async deleteJobApplicationWorkflowNote(
    @Param('noteId') noteId: number
  ): Promise<JobApplicationWorkflowNote> {
    return await this.jobApplicationWorkflowNoteService.delete({
      where: {id: noteId},
    });
  }

  /* End */
}
