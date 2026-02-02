import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { DeviceStatus } from '@device-passport/shared';
import { PermissionService } from './permission.service';

/**
 * Workflow Transition Definition
 * Defines allowed state transitions with required permissions and conditions
 */
interface WorkflowTransition {
  fromStatus: DeviceStatus;
  toStatus: DeviceStatus;
  requiredPermission: string;
  description: string;
  conditions?: {
    requireQCApproval?: boolean;
    requirePackageComplete?: boolean;
    requireTrackingNumber?: boolean;
  };
}

/**
 * Workflow Service
 *
 * Manages device lifecycle state transitions with permission checks and business logic validation.
 * Implements the workflow: QC → Package → Shipping → Delivery
 *
 * Based on RBAC-SOLUTION.md requirements:
 * - Packer cannot package until QC approves
 * - Shipper cannot ship until packer completes
 * - Each transition requires specific permissions
 */
@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  // Define all allowed workflow transitions
  private readonly transitions: WorkflowTransition[] = [
    // QC Workflow
    {
      fromStatus: DeviceStatus.IN_QC,
      toStatus: DeviceStatus.QC_PASSED,
      requiredPermission: 'qc.approve',
      description: 'QC Inspector approves quality check',
    },
    {
      fromStatus: DeviceStatus.IN_QC,
      toStatus: DeviceStatus.QC_FAILED,
      requiredPermission: 'qc.reject',
      description: 'QC Inspector rejects quality check',
    },

    // QC Failed → Retry
    {
      fromStatus: DeviceStatus.QC_FAILED,
      toStatus: DeviceStatus.IN_QC,
      requiredPermission: 'qc.inspect',
      description: 'Re-submit for quality check',
    },

    // Package Workflow
    {
      fromStatus: DeviceStatus.QC_PASSED,
      toStatus: DeviceStatus.PACKAGED,
      requiredPermission: 'workflow.package-to-ship',
      description: 'Packer completes packaging',
      conditions: {
        requireQCApproval: true,
      },
    },

    // Shipping Workflow
    {
      fromStatus: DeviceStatus.PACKAGED,
      toStatus: DeviceStatus.IN_TRANSIT,
      requiredPermission: 'workflow.ship-to-transit',
      description: 'Shipper dispatches package',
      conditions: {
        requirePackageComplete: true,
        requireTrackingNumber: true,
      },
    },

    // Delivery Workflow
    {
      fromStatus: DeviceStatus.IN_TRANSIT,
      toStatus: DeviceStatus.DELIVERED,
      requiredPermission: 'shipping.confirm',
      description: 'Customer confirms delivery',
    },

    // Service Workflow
    {
      fromStatus: DeviceStatus.DELIVERED,
      toStatus: DeviceStatus.IN_SERVICE,
      requiredPermission: 'device.activate',
      description: 'Device put into service',
    },

    // Maintenance Workflow
    {
      fromStatus: DeviceStatus.IN_SERVICE,
      toStatus: DeviceStatus.MAINTENANCE,
      requiredPermission: 'device.update',
      description: 'Device requires maintenance',
    },
    {
      fromStatus: DeviceStatus.MAINTENANCE,
      toStatus: DeviceStatus.IN_SERVICE,
      requiredPermission: 'device.update',
      description: 'Maintenance completed',
    },

    // Retirement
    {
      fromStatus: DeviceStatus.IN_SERVICE,
      toStatus: DeviceStatus.RETIRED,
      requiredPermission: 'device.retire',
      description: 'Device retired from service',
    },
  ];

  constructor(private permissionService: PermissionService) {}

  /**
   * Check if a status transition is allowed
   */
  async canTransition(
    userId: string,
    currentStatus: DeviceStatus,
    targetStatus: DeviceStatus,
    deviceData?: {
      qcApproved?: boolean;
      packageComplete?: boolean;
      trackingNumber?: string;
    },
  ): Promise<{
    allowed: boolean;
    reason?: string;
    requiredPermission?: string;
  }> {
    // Find the transition rule
    const transition = this.transitions.find(
      (t) => t.fromStatus === currentStatus && t.toStatus === targetStatus,
    );

    if (!transition) {
      return {
        allowed: false,
        reason: `No workflow transition defined from ${currentStatus} to ${targetStatus}`,
      };
    }

    // Check if user has required permission
    const hasPermission = await this.permissionService.checkPermission(
      userId,
      transition.requiredPermission,
    );

    if (!hasPermission) {
      return {
        allowed: false,
        reason: `Missing required permission: ${transition.requiredPermission}`,
        requiredPermission: transition.requiredPermission,
      };
    }

    // Check business logic conditions
    if (transition.conditions) {
      const { requireQCApproval, requirePackageComplete, requireTrackingNumber } =
        transition.conditions;

      if (requireQCApproval && !deviceData?.qcApproved) {
        return {
          allowed: false,
          reason: 'QC approval is required before packaging',
        };
      }

      if (requirePackageComplete && !deviceData?.packageComplete) {
        return {
          allowed: false,
          reason: 'Packaging must be completed before shipping',
        };
      }

      if (requireTrackingNumber && !deviceData?.trackingNumber) {
        return {
          allowed: false,
          reason: 'Tracking number is required for shipping',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Perform a status transition with validation
   * Throws exception if transition is not allowed
   */
  async transition(
    userId: string,
    currentStatus: DeviceStatus,
    targetStatus: DeviceStatus,
    deviceData?: {
      qcApproved?: boolean;
      packageComplete?: boolean;
      trackingNumber?: string;
    },
  ): Promise<void> {
    const result = await this.canTransition(
      userId,
      currentStatus,
      targetStatus,
      deviceData,
    );

    if (!result.allowed) {
      if (result.requiredPermission) {
        throw new ForbiddenException(result.reason);
      } else {
        throw new BadRequestException(result.reason);
      }
    }

    this.logger.log(
      `User ${userId} transitioned device from ${currentStatus} to ${targetStatus}`,
    );
  }

  /**
   * Get all possible next states from current state for a user
   */
  async getAvailableTransitions(
    userId: string,
    currentStatus: DeviceStatus,
  ): Promise<
    Array<{
      toStatus: DeviceStatus;
      description: string;
      hasPermission: boolean;
      requiredPermission: string;
    }>
  > {
    const availableTransitions = this.transitions.filter(
      (t) => t.fromStatus === currentStatus,
    );

    const result = [];
    for (const transition of availableTransitions) {
      const hasPermission = await this.permissionService.checkPermission(
        userId,
        transition.requiredPermission,
      );

      result.push({
        toStatus: transition.toStatus,
        description: transition.description,
        hasPermission,
        requiredPermission: transition.requiredPermission,
      });
    }

    return result;
  }

  /**
   * Get the complete workflow path for a device type
   */
  getWorkflowPath(startStatus: DeviceStatus, endStatus: DeviceStatus): DeviceStatus[] {
    // BFS to find the shortest path
    const queue: DeviceStatus[][] = [[startStatus]];
    const visited = new Set<DeviceStatus>([startStatus]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];

      if (current === endStatus) {
        return path;
      }

      const nextTransitions = this.transitions.filter((t) => t.fromStatus === current);

      for (const transition of nextTransitions) {
        if (!visited.has(transition.toStatus)) {
          visited.add(transition.toStatus);
          queue.push([...path, transition.toStatus]);
        }
      }
    }

    return []; // No path found
  }

  /**
   * Validate workflow for a specific role
   * Returns which transitions this role can perform
   */
  async getRoleWorkflowCapabilities(
    userId: string,
  ): Promise<{
    canApproveQC: boolean;
    canPackage: boolean;
    canShip: boolean;
    canDeliver: boolean;
  }> {
    const [canApproveQC, canPackage, canShip, canDeliver] = await Promise.all([
      this.permissionService.checkPermission(userId, 'qc.approve'),
      this.permissionService.checkPermission(userId, 'workflow.package-to-ship'),
      this.permissionService.checkPermission(userId, 'workflow.ship-to-transit'),
      this.permissionService.checkPermission(userId, 'shipping.confirm'),
    ]);

    return {
      canApproveQC,
      canPackage,
      canShip,
      canDeliver,
    };
  }
}
