import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { CreateFeePaymentDto } from './dto/create-fee-payment.dto';
import { VoidFeePaymentDto } from './dto/void-fee-payment.dto';
import { FeeLedgerService } from './fee-ledger.service';
@Controller('fee-ledger')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class FeeLedgerController {
  constructor(private readonly ledger: FeeLedgerService) {}
  @Get('invoices') list(@Query('studentId') studentId?: string) {
    return this.ledger.listInvoices(studentId);
  }
  @Get('invoices/:id/payments') history(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ledger.paymentHistory(id);
  }
  @Post('payments') collect(@Body() dto: CreateFeePaymentDto, @Req() req: any) {
    return this.ledger.collectPayment(dto, req.user.id);
  }
  @Post('payments/:id/void') void(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VoidFeePaymentDto,
    @Req() req: any,
  ) {
    return this.ledger.voidPayment(id, dto.reason, req.user.id);
  }
}
