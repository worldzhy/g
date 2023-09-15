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
import {PermissionAction, Prisma, UserProfile} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {UserProfileService} from '@microservices/account/user/user-profile.service';

@ApiTags('Account / User / Profile')
@ApiBearerAuth()
@Controller('user-profiles')
export class UserProfileController {
  constructor(private userProfileService: UserProfileService) {}

  @Get('genders')
  listUserProfileGenders(): string[] {
    return ['Male', 'Female', 'Non-binary'];
  }

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.UserProfile)
  @ApiBody({
    description: 'Create a user profile.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          userId: '924da395-1921-45fe-b7f5-1198ed78ac24',
          prefix: 'Ms',
          firstName: 'Mary',
          middleName: 'Rose',
          lastName: 'Johnson',
          suffix: 'PhD',
          dateOfBirth: new Date(),
          gender: 'Male',
          websites: {facebook: 'https://www.facebook.com/grace'},
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
        },
      },
    },
  })
  async createUserProfile(
    @Body() body: Prisma.UserProfileUncheckedCreateInput
  ): Promise<UserProfile> {
    return await this.userProfileService.create({data: body});
  }

  @Get(':profileId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.UserProfile)
  async getUserProfile(
    @Param('profileId') profileId: string
  ): Promise<UserProfile | null> {
    return await this.userProfileService.findUnique({where: {id: profileId}});
  }

  @Patch(':profileId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.UserProfile)
  @ApiBody({
    description: 'Update a specific user profile.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          prefix: 'Mr',
          firstName: 'Robert',
          middleName: 'William',
          lastName: 'Smith',
          suffix: 'PhD',
          dateOfBirth: '2019-05-27',
          gender: 'Female',
          hasPCP: true,
          address: '456 White Finch St. North Augusta, SC 29860',
          zipcode: '21000',
          geoJSON: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [125.6, 10.1],
            },
            properties: {
              name: 'Dinagat Islands',
            },
          },
          websites: {facebook: 'https://www.facebook.com/grace'},
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
        },
      },
    },
  })
  async updateUserProfile(
    @Param('profileId') profileId: string,
    @Body() body: Prisma.UserProfileUpdateInput
  ): Promise<UserProfile> {
    return await this.userProfileService.update({
      where: {id: profileId},
      data: body,
    });
  }

  @Delete(':profileId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.UserProfile)
  async deleteUserProfile(
    @Param('profileId') profileId: string
  ): Promise<UserProfile> {
    return await this.userProfileService.delete({
      where: {id: profileId},
    });
  }

  /* End */
}
