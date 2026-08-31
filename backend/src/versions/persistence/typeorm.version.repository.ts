import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageVersion } from '../../pages/entities/page-version.entity.js';
import {
  CreateVersionInput,
  VersionsRepository,
} from './version.repository.js';

@Injectable()
export class TypeormVersionsRepository implements VersionsRepository {
  constructor(
    @InjectRepository(PageVersion)
    private readonly repository: Repository<PageVersion>,
  ) {}

  async create(input: CreateVersionInput): Promise<PageVersion> {
    const version = this.repository.create(input);
    return this.repository.save(version);
  }
}
