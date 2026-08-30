import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { TypeormUserRepository } from './persistence/typeorm.user.repository.js';
import { UsersService } from './services/users.service.js';
import { AdminUsersController, UsersController } from './users.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, AdminUsersController],
  providers: [
    { provide: 'UsersRepository', useClass: TypeormUserRepository },
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
