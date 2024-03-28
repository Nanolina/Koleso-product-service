import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class OrganizationIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const organizationId = request.headers['organization-id'];

    if (!organizationId) {
      throw new UnauthorizedException('Organization is required');
    }

    return true;
  }
}
