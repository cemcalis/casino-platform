import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '@casino/auth';
import { ReportsService } from './reports.service';

@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('finance')
  @Roles('ADMIN')
  getFinanceReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.reportsService.getFinanceReport(fromDate, toDate);
  }
}
