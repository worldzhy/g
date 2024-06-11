import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNumber, IsOptional} from 'class-validator';

export class GoClickReqBaseDto {
  channelName: string;
}

export class GoClickGroupCreateReqDto {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  parentId: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @ApiProperty({
    type: String,
  })
  @IsString()
  name: string;
}

export class GoClickGroupUpdateReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  parentId: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  status: string;
}

export class GoClickLinkCreateReqDto {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  groupId: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @ApiProperty({
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  url: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;
}

export class GoClickLinkUpdateReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  groupId: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  url: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  status: string;
}
