import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IndividualExpert,
  ServiceRequest,
  DevicePassport,
} from '../../database/entities';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(IndividualExpert)
    private readonly expertRepository: Repository<IndividualExpert>,
    @InjectRepository(ServiceRequest)
    private readonly serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(DevicePassport)
    private readonly devicePassportRepository: Repository<DevicePassport>,
  ) {}

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Find nearby experts within radius
   */
  async findNearbyExperts(latitude: number, longitude: number, radius: number) {
    // Find all experts with location data
    const experts = await this.expertRepository
      .createQueryBuilder('expert')
      .leftJoinAndSelect('expert.user', 'user')
      .where('expert.location_lat IS NOT NULL')
      .andWhere('expert.location_lng IS NOT NULL')
      .andWhere('expert.is_available = :available', { available: true })
      .andWhere('expert.registration_status = :status', { status: 'APPROVED' })
      .getMany();

    // Calculate distances and filter
    const nearbyExperts = experts
      .map((expert) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          expert.locationLat!,
          expert.locationLng!,
        );

        return {
          id: expert.id,
          name: expert.personalName,
          distance,
          latitude: expert.locationLat!,
          longitude: expert.locationLng!,
          type: 'expert',
          metadata: {
            expertTypes: expert.expertTypes,
            professionalField: expert.professionalField,
            yearsOfExperience: expert.yearsOfExperience,
            workStatus: expert.workStatus,
            expertCode: expert.expertCode,
          },
        };
      })
      .filter((item) => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return {
      items: nearbyExperts,
      total: nearbyExperts.length,
      radius,
      center: { latitude, longitude },
    };
  }

  /**
   * Find nearby service requests within radius
   */
  async findNearbyServiceRequests(
    latitude: number,
    longitude: number,
    radius: number,
  ) {
    // Find all service requests with location data
    const requests = await this.serviceRequestRepository
      .createQueryBuilder('request')
      .where('request.location_lat IS NOT NULL')
      .andWhere('request.location_lng IS NOT NULL')
      .andWhere('request.status = :status', { status: 'PUBLISHED' })
      .getMany();

    // Calculate distances and filter
    const nearbyRequests = requests
      .map((request) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          request.locationLat!,
          request.locationLng!,
        );

        return {
          id: request.id,
          name: request.description,
          distance,
          latitude: request.locationLat!,
          longitude: request.locationLng!,
          type: 'service-request',
          metadata: {
            serviceType: request.serviceType,
            urgency: request.urgency,
            createdAt: request.createdAt,
            requiredSkills: request.requiredSkills,
            budgetRange: `${request.budgetMin || 0}-${request.budgetMax || 0} ${request.budgetCurrency}`,
          },
        };
      })
      .filter((item) => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return {
      items: nearbyRequests,
      total: nearbyRequests.length,
      radius,
      center: { latitude, longitude },
    };
  }

  /**
   * Find nearby devices within radius
   */
  async findNearbyDevices(
    latitude: number,
    longitude: number,
    radius: number,
  ) {
    // Find all devices with location data
    const devices = await this.devicePassportRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.currentLocation', 'location')
      .where('location.latitude IS NOT NULL')
      .andWhere('location.longitude IS NOT NULL')
      .getMany();

    // Calculate distances and filter
    const nearbyDevices = devices
      .map((device) => {
        if (!device.locationLat || !device.locationLng) return null;

        const distance = this.calculateDistance(
          latitude,
          longitude,
          device.locationLat,
          device.locationLng,
        );

        return {
          id: device.id,
          name: device.deviceName || device.passportCode,
          distance,
          latitude: device.locationLat,
          longitude: device.locationLng,
          type: 'device',
          metadata: {
            passportCode: device.passportCode,
            status: device.status,
            productLine: device.productLine,
            deviceName: device.deviceName,
          },
        };
      })
      .filter((item) => item !== null && item.distance <= radius)
      .sort((a, b) => a!.distance - b!.distance);

    return {
      items: nearbyDevices,
      total: nearbyDevices.length,
      radius,
      center: { latitude, longitude },
    };
  }

  /**
   * Reverse geocode coordinates to address using OpenStreetMap Nominatim
   */
  async reverseGeocode(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=zh-CN`,
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json() as any;

      return {
        address: data.display_name || null,
        city: data.address?.city || data.address?.town || data.address?.village || null,
        state: data.address?.state || null,
        country: data.address?.country || null,
        countryCode: data.address?.country_code?.toUpperCase() || null,
        postalCode: data.address?.postcode || null,
      };
    } catch (error) {
      return {
        address: null,
        error: 'Failed to geocode location',
      };
    }
  }
}
