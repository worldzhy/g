import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Tag, Prisma} from '@prisma/client';
import {TagService} from '@microservices/tag/tag.service';

@ApiTags('Tag')
@ApiBearerAuth()
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'well-experienced',
          group: 'Coach',
        },
      },
    },
  })
  async createTag(@Body() body: Prisma.TagUncheckedCreateInput): Promise<Tag> {
    return await this.tagService.create({
      data: body,
    });
  }

  @Get('')
  async getTags(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.TagWhereInput | undefined;
    const whereConditions: object[] = [];
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        whereConditions.push({name: {contains: name, mode: 'insensitive'}});
      }
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    return await this.tagService.findManyInManyPages({page, pageSize}, {where});
  }

  @Get('class-installments')
  async getClassInstallments() {
    return await this.tagService.findManyInOnePage({
      where: {group: {name: {contains: 'installment', mode: 'insensitive'}}},
    });
  }

  @Get(':tagId')
  async getTag(@Param('tagId') tagId: number): Promise<Tag> {
    return await this.tagService.findUniqueOrThrow({
      where: {id: tagId},
    });
  }

  @Patch(':tagId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'non-experienced',
          group: 'Coach',
        },
      },
    },
  })
  async updateTag(
    @Param('tagId') tagId: number,
    @Body()
    body: Prisma.TagUpdateInput
  ): Promise<Tag> {
    return await this.tagService.update({
      where: {id: tagId},
      data: body,
    });
  }

  @Delete(':tagId')
  async deleteTag(@Param('tagId') tagId: number): Promise<Tag> {
    return await this.tagService.delete({
      where: {id: tagId},
    });
  }

  /* End */
}
