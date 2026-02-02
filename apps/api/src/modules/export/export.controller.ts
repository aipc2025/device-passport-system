import { Controller, Get, Query, Res, UseGuards, ParseArrayPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards';
import { ExportService } from './export.service';

@ApiTags('Export')
@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('passports/excel')
  @ApiOperation({ summary: 'Export device passports to Excel' })
  @ApiQuery({ name: 'ids', required: false, type: [String] })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async exportPassportsToExcel(
    @Query('ids', new ParseArrayPipe({ optional: true })) ids?: string[],
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const buffer = await this.exportService.exportPassportsToExcel({
      ids,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    res!.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=device-passports-${Date.now()}.xlsx`,
      'Content-Length': buffer.length,
    });

    res!.send(buffer);
  }

  @Get('passports/csv')
  @ApiOperation({ summary: 'Export device passports to CSV' })
  @ApiQuery({ name: 'ids', required: false, type: [String] })
  async exportPassportsToCSV(
    @Query('ids', new ParseArrayPipe({ optional: true })) ids?: string[],
    @Res() res?: Response,
  ) {
    const csv = await this.exportService.exportPassportsToCSV({ ids });

    res!.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=device-passports-${Date.now()}.csv`,
    });

    res!.send(csv);
  }

  @Get('lifecycle/excel')
  @ApiOperation({ summary: 'Export lifecycle events to Excel' })
  @ApiQuery({ name: 'passportId', required: true, type: String })
  async exportLifecycleToExcel(
    @Query('passportId') passportId: string,
    @Res() res?: Response,
  ) {
    const buffer = await this.exportService.exportLifecycleToExcel(passportId);

    res!.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=lifecycle-events-${passportId}-${Date.now()}.xlsx`,
      'Content-Length': buffer.length,
    });

    res!.send(buffer);
  }

  @Get('qr-codes/batch')
  @ApiOperation({ summary: 'Export QR codes in batch as PDF' })
  @ApiQuery({ name: 'ids', required: true, type: [String] })
  async exportQRCodesBatch(
    @Query('ids', new ParseArrayPipe({ items: String })) ids: string[],
    @Res() res?: Response,
  ) {
    const buffer = await this.exportService.exportQRCodesBatchPDF(ids);

    res!.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=qr-codes-batch-${Date.now()}.pdf`,
      'Content-Length': buffer.length,
    });

    res!.send(buffer);
  }

  @Get('service-orders/excel')
  @ApiOperation({ summary: 'Export service orders to Excel' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async exportServiceOrdersToExcel(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const buffer = await this.exportService.exportServiceOrdersToExcel({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    });

    res!.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=service-orders-${Date.now()}.xlsx`,
      'Content-Length': buffer.length,
    });

    res!.send(buffer);
  }
}
