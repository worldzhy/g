import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {
  PermissionAction,
  PermissionResource,
  Role,
  TrustedEntityType,
  UserToRole,
} from '@prisma/client';
import {UserJwtService} from '../organization/user/jwt/jwt.service';
import {UserService} from '../organization/user/user.service';
import {PermissionService} from './permission/permission.service';
import {PERMISSION_KEY} from './authorization.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private userService = new UserService();
  private jwtService = new UserJwtService();
  private permissionService = new PermissionService();

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // [step 1] Get required permission.
    const requiredPermission = this.reflector.getAllAndOverride<{
      resource: PermissionResource;
      action: PermissionAction;
    }>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermission) {
      return true;
    }

    // [step 2] Parse JWT.
    const req = context.switchToHttp().getRequest();
    const payload = this.jwtService.parseJWT(req.headers.authorization) as {
      userId: string;
      sub: string;
    };

    // [step 3] Get user with organization and roles.
    const user = await this.userService.findUniqueOrThrow({
      where: {id: payload.userId},
      include: {userToRoles: true},
    });

    // [step 4-1] Get organization permissions.
    if (user.organizationId) {
      const organizationPermissions = await this.permissionService.findMany({
        where: {
          trustedEntityType: TrustedEntityType.ORGANIZATION,
          trustedEntityId: user.organizationId,
        },
      });

      for (let i = 0; i < organizationPermissions.length; i++) {
        const permission = organizationPermissions[i];
        if (
          permission.resource === requiredPermission.resource &&
          permission.action === requiredPermission.action
        ) {
          return true;
        }
      }
    }

    // [step 4-2] Get roles' permissions.
    const roleIds = user['userToRoles'].map((userRole: UserToRole) => {
      return userRole.roleId;
    });
    if (roleIds) {
      const rolePermissions = await this.permissionService.findMany({
        where: {
          trustedEntityType: TrustedEntityType.ROLE,
          trustedEntityId: {in: roleIds},
        },
      });

      for (let i = 0; i < rolePermissions.length; i++) {
        const permission = rolePermissions[i];
        if (
          permission.resource === requiredPermission.resource &&
          permission.action === requiredPermission.action
        ) {
          return true;
        }
      }
    }

    // [step 4-3] Get user's permissions.
    const userPermissions = await this.permissionService.findMany({
      where: {
        trustedEntityType: TrustedEntityType.USER,
        trustedEntityId: user.id,
      },
    });

    for (let i = 0; i < userPermissions.length; i++) {
      const permission = userPermissions[i];
      if (
        permission.resource === requiredPermission.resource &&
        permission.action === requiredPermission.action
      ) {
        return true;
      }
    }

    return false;
  }
}
