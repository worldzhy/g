import {Module} from '@nestjs/common';
import {CandidateController} from './candidate.controller';
import {CandidateService} from './candidate.service';
import {CandidateProfileModule} from './profile/profile.module';
import {CandidateCertificationModule} from './certification/certification.module';
import {CandidateTrainingModule} from './training/training.module';

@Module({
  imports: [
    CandidateProfileModule,
    CandidateCertificationModule,
    CandidateTrainingModule,
  ],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
