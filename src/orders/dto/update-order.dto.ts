import { IsOptional, IsString, Matches } from 'class-validator';
// enum for status for order
export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @Matches(/^(Pending|Accepted|In Progress|Delivered|Rejected)$/, { 
    message: 'Status must be one of: Pending, Accepted, In Progress, Delivered, Rejected' 
  })
  status?: string; 
}
