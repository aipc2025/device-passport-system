import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import * as ExcelJS from 'exceljs';
import * as QRCode from 'qrcode';
import {
  DevicePassport,
  LifecycleEvent,
  ServiceOrder,
} from '../../database/entities';

interface ExportPassportOptions {
  ids?: string[];
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

interface ExportServiceOrderOptions {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(DevicePassport)
    private readonly passportRepository: Repository<DevicePassport>,
    @InjectRepository(LifecycleEvent)
    private readonly lifecycleRepository: Repository<LifecycleEvent>,
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
  ) {}

  /**
   * Export device passports to Excel
   */
  async exportPassportsToExcel(options: ExportPassportOptions): Promise<Buffer> {
    // Build query
    const where: any = {};
    if (options.ids && options.ids.length > 0) {
      where.id = In(options.ids);
    }
    if (options.status) {
      where.status = options.status;
    }
    if (options.startDate && options.endDate) {
      where.createdAt = Between(options.startDate, options.endDate);
    }

    // Fetch data
    const passports = await this.passportRepository.find({
      where,
      relations: ['manufacturer', 'supplier', 'customer', 'currentLocation'],
      order: { createdAt: 'DESC' },
    });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('设备护照');

    // Define columns
    worksheet.columns = [
      { header: '护照码', key: 'passportCode', width: 25 },
      { header: '产品线', key: 'productLine', width: 15 },
      { header: '产品名称', key: 'productName', width: 20 },
      { header: '型号', key: 'model', width: 20 },
      { header: '序列号', key: 'serialNumber', width: 20 },
      { header: '状态', key: 'status', width: 15 },
      { header: '制造商', key: 'manufacturer', width: 20 },
      { header: '供应商', key: 'supplier', width: 20 },
      { header: '客户', key: 'customer', width: 20 },
      { header: '当前位置', key: 'currentLocation', width: 30 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    passports.forEach((passport) => {
      worksheet.addRow({
        passportCode: passport.passportCode,
        productLine: passport.productLine,
        productName: passport.deviceName,
        model: passport.deviceModel,
        serialNumber: passport.serialNumber,
        status: passport.status,
        manufacturer: passport.manufacturer || '',
        supplier: passport.supplierId || '',
        customer: passport.customerId || '',
        currentLocation: passport.currentLocation || '',
        createdAt: passport.createdAt,
      });
    });

    // Auto-filter
    worksheet.autoFilter = {
      from: 'A1',
      to: `K${passports.length + 1}`,
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export device passports to CSV
   */
  async exportPassportsToCSV(options: ExportPassportOptions): Promise<string> {
    const where: any = {};
    if (options.ids && options.ids.length > 0) {
      where.id = In(options.ids);
    }

    const passports = await this.passportRepository.find({
      where,
      relations: ['manufacturer', 'supplier', 'customer'],
      order: { createdAt: 'DESC' },
    });

    // Build CSV
    const headers = [
      '护照码',
      '产品线',
      '产品名称',
      '型号',
      '序列号',
      '状态',
      '制造商',
      '供应商',
      '客户',
      '创建时间',
    ];

    const rows = passports.map((p) => [
      p.passportCode,
      p.productLine,
      p.productName || '',
      p.model || '',
      p.serialNumber || '',
      p.status,
      p.manufacturer?.name || '',
      p.supplier?.name || '',
      p.customer?.name || '',
      p.createdAt.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    return '\uFEFF' + csv;
  }

  /**
   * Export lifecycle events to Excel
   */
  async exportLifecycleToExcel(passportId: string): Promise<Buffer> {
    const events = await this.lifecycleRepository.find({
      where: { passportId },
      relations: ['performedBy', 'location'],
      order: { eventDate: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('生命周期事件');

    worksheet.columns = [
      { header: '事件类型', key: 'eventType', width: 20 },
      { header: '事件日期', key: 'eventDate', width: 20 },
      { header: '描述', key: 'description', width: 40 },
      { header: '执行人', key: 'performedBy', width: 20 },
      { header: '位置', key: 'location', width: 30 },
      { header: '附加数据', key: 'metadata', width: 30 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    events.forEach((event) => {
      worksheet.addRow({
        eventType: event.eventType,
        eventDate: event.eventDate,
        description: event.description || '',
        performedBy: event.performedBy?.email || '',
        location: event.location?.address || '',
        metadata: event.metadata ? JSON.stringify(event.metadata) : '',
      });
    });

    worksheet.autoFilter = {
      from: 'A1',
      to: `F${events.length + 1}`,
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export QR codes in batch as PDF
   */
  async exportQRCodesBatchPDF(ids: string[]): Promise<Buffer> {
    const passports = await this.passportRepository.find({
      where: { id: In(ids) },
      select: ['id', 'passportCode', 'productName', 'model'],
    });

    // Generate QR codes
    const qrCodes = await Promise.all(
      passports.map(async (passport) => {
        const url = `${process.env.APP_URL}/scan/${passport.passportCode}`;
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: 'H',
        });

        return {
          code: passport.passportCode,
          name: passport.productName || passport.model || '',
          qrDataUrl,
        };
      })
    );

    // Create PDF workbook (using ExcelJS temporarily, should use PDFKit for real PDF)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('QR Codes');

    worksheet.columns = [
      { header: '护照码', key: 'code', width: 25 },
      { header: '产品名称', key: 'name', width: 30 },
      { header: 'QR码', key: 'qr', width: 40 },
    ];

    qrCodes.forEach((item, index) => {
      const row = worksheet.addRow({
        code: item.code,
        name: item.name,
        qr: '', // QR code will be added as image
      });

      // Add QR code image
      const imageId = workbook.addImage({
        base64: item.qrDataUrl,
        extension: 'png',
      });

      worksheet.addImage(imageId, {
        tl: { col: 2, row: index + 1 },
        ext: { width: 150, height: 150 },
      });

      row.height = 120;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export service orders to Excel
   */
  async exportServiceOrdersToExcel(
    options: ExportServiceOrderOptions,
  ): Promise<Buffer> {
    const where: any = {};

    if (options.startDate && options.endDate) {
      where.createdAt = Between(options.startDate, options.endDate);
    }
    if (options.status) {
      where.status = options.status;
    }

    const orders = await this.serviceOrderRepository.find({
      where,
      relations: ['passport', 'assignedTo', 'createdBy'],
      order: { createdAt: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('服务订单');

    worksheet.columns = [
      { header: '订单号', key: 'orderNumber', width: 20 },
      { header: '服务类型', key: 'serviceType', width: 15 },
      { header: '设备护照码', key: 'passportCode', width: 25 },
      { header: '状态', key: 'status', width: 15 },
      { header: '优先级', key: 'priority', width: 10 },
      { header: '分配给', key: 'assignedTo', width: 20 },
      { header: '创建人', key: 'createdBy', width: 20 },
      { header: '计划日期', key: 'scheduledDate', width: 20 },
      { header: '完成日期', key: 'completedAt', width: 20 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    orders.forEach((order) => {
      worksheet.addRow({
        orderNumber: order.orderNumber,
        serviceType: order.serviceType,
        passportCode: order.passport?.passportCode || '',
        status: order.status,
        priority: order.priority || '',
        assignedTo: order.assignedTo?.email || '',
        createdBy: order.createdBy?.email || '',
        scheduledDate: order.scheduledDate || '',
        completedAt: order.completedAt || '',
        createdAt: order.createdAt,
      });
    });

    worksheet.autoFilter = {
      from: 'A1',
      to: `J${orders.length + 1}`,
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
