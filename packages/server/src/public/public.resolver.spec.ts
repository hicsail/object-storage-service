import { Test, TestingModule } from '@nestjs/testing';
import { PublicResolver } from './public.resolver';

describe('PublicResolver', () => {
  let resolver: PublicResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicResolver],
    }).compile();

    resolver = module.get<PublicResolver>(PublicResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
