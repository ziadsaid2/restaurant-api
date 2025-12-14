import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateBookingDto {
  // enum for status 
    @IsOptional()
    @IsString()
    @Matches(/^(Pending|Accepted|In Progress|Delivered|Rejected)$/, { 
      message: 'Status must be one of: Pending, Accepted, In Progress, Delivered, Rejected' 
    })
    status?: string; 
}
  