import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { TypeormUserRepository } from './persistence/typeorm.user.repository.js';
import { UsersService } from './services/users.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    { provide: 'UsersRepository', useClass: TypeormUserRepository },
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
