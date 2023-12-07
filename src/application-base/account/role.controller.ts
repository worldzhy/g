import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Role, Prisma, PermissionAction} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {RoleService} from '@microservices/account/role/role.service';

@ApiTags('Account / Role')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Role)
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Admin',
        },
      },
    },
  })
  async createRole(
    @Body() body: Prisma.RoleUncheckedCreateInput
  ): Promise<Role> {
    return await this.roleService.create({
      data: body,
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Role)
  async getRoles() {
    return await this.roleService.findManyInOnePage();
  }

  @Get(':roleId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Role)
  async getRole(@Param('roleId') roleId: string): Promise<Role> {
    return await this.roleService.findUniqueOrThrow({
      where: {id: roleId},
    });
  }

  @Patch(':roleId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Role)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'InceptionPad Inc',
        },
      },
    },
  })
  async updateRole(
    @Param('roleId') roleId: string,
    @Body()
    body: Prisma.RoleUpdateInput
  ): Promise<Role> {
    return await this.roleService.update({
      where: {id: roleId},
      data: body,
    });
  }

  @Delete(':roleId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Role)
  async deleteRole(@Param('roleId') roleId: string): Promise<Role> {
    return await this.roleService.delete({
      where: {id: roleId},
    });
  }

  /* End */
}
