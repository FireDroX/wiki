import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { TypeormUserRepository } from './persistence/typeorm.user.repository.js';
import { UsersService } from './services/users.service.js';
import { UsersController } from './users.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    { provide: 'UsersRepository', useClass: TypeormUserRepository },
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
