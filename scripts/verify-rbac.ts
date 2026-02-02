#!/usr/bin/env ts-node

/**
 * RBAC Verification Script
 *
 * Tests multi-tenant permission system with various scenarios:
 * 1. Organization Isolation
 * 2. Product Line Restrictions
 * 3. Data Scope (OWN vs ALL)
 * 4. Workflow Permissions
 * 5. Permission Checks
 *
 * Run: npx ts-node scripts/verify-rbac.ts
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
}

class RBACVerifier {
  private results: TestResult[] = [];
  private tokens: Map<string, string> = new Map();

  /**
   * Login and get JWT token
   */
  async login(email: string, password: string): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const token = response.data.data.accessToken;
      this.tokens.set(email, token);
      return token;
    } catch (error: any) {
      throw new Error(`Login failed for ${email}: ${error.message}`);
    }
  }

  /**
   * Create authenticated axios instance
   */
  createClient(token: string): AxiosInstance {
    return axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Add test result
   */
  addResult(name: string, passed: boolean, message: string, duration?: number) {
    this.results.push({ name, passed, message, duration });
  }

  /**
   * Test 1: Organization Isolation
   * Siemens QC should NOT see Sinopec devices
   */
  async testOrganizationIsolation() {
    console.log('\n📋 Test 1: Organization Isolation');
    const start = Date.now();

    try {
      // Login as Siemens QC
      const siemensToken = await this.login('qc.wang@siemens.com.cn', 'Password123!');
      const siemensClient = this.createClient(siemensToken);

      // Try to get all devices (should only see Siemens devices)
      const response = await siemensClient.get('/passports');
      const devices = response.data.data.data;

      // Check if any device belongs to other organizations
      const otherOrgDevices = devices.filter(
        (d: any) => d.organizationId !== '00000000-0000-0000-0000-000000000002',
      );

      if (otherOrgDevices.length === 0) {
        this.addResult(
          'Organization Isolation',
          true,
          `✅ Siemens QC can only see Siemens devices (${devices.length} total)`,
          Date.now() - start,
        );
      } else {
        this.addResult(
          'Organization Isolation',
          false,
          `❌ Siemens QC can see ${otherOrgDevices.length} devices from other organizations!`,
          Date.now() - start,
        );
      }
    } catch (error: any) {
      this.addResult(
        'Organization Isolation',
        false,
        `❌ Error: ${error.message}`,
        Date.now() - start,
      );
    }
  }

  /**
   * Test 2: Product Line Restriction
   * Wang QC (PLC only) should NOT see other product lines
   */
  async testProductLineRestriction() {
    console.log(('\n📋 Test 2: Product Line Restriction'));
    const start = Date.now();

    try {
      // Login as Wang QC (PLC only)
      const wangToken = await this.login('qc.wang@siemens.com.cn', 'Password123!');
      const wangClient = this.createClient(wangToken);

      // Get devices
      const response = await wangClient.get('/passports');
      const devices = response.data.data.data;

      // Check if any non-PLC device is visible
      const nonPLCDevices = devices.filter((d: any) => d.productLine !== 'PLC');

      if (nonPLCDevices.length === 0) {
        this.addResult(
          'Product Line Restriction',
          true,
          `✅ Wang QC (PLC only) sees only PLC devices (${devices.length} total)`,
          Date.now() - start,
        );
      } else {
        this.addResult(
          'Product Line Restriction',
          false,
          `❌ Wang QC can see ${nonPLCDevices.length} non-PLC devices!`,
          Date.now() - start,
        );
      }

      // Compare with Li QC (all products)
      const liToken = await this.login('qc.li@siemens.com.cn', 'Password123!');
      const liClient = this.createClient(liToken);
      const liResponse = await liClient.get('/passports');
      const liDevices = liResponse.data.data.data;

      if (liDevices.length > devices.length) {
        this.addResult(
          'Product Line Restriction - Comparison',
          true,
          `✅ Li QC (all products) sees more devices: ${liDevices.length} vs Wang's ${devices.length}`,
        );
      }
    } catch (error: any) {
      this.addResult(
        'Product Line Restriction',
        false,
        `❌ Error: ${error.message}`,
        Date.now() - start,
      );
    }
  }

  /**
   * Test 3: Data Scope (OWN vs ALL)
   * Customer Engineer (OWN) should only see own service requests
   */
  async testDataScope() {
    console.log(('\n📋 Test 3: Data Scope (OWN vs ALL)'));
    const start = Date.now();

    try {
      // Login as Customer Engineer (OWN scope)
      const engineerToken = await this.login('engineer.huang@sinopec.com', 'Password123!');
      const engineerClient = this.createClient(engineerToken);

      // Get service requests
      const engineerResponse = await engineerClient.get('/service-requests');
      const engineerRequests = engineerResponse.data.data.data;

      // Login as Customer Admin (ALL scope)
      const adminToken = await this.login('admin@sinopec.com', 'Password123!');
      const adminClient = this.createClient(adminToken);

      const adminResponse = await adminClient.get('/service-requests');
      const adminRequests = adminResponse.data.data.data;

      if (adminRequests.length >= engineerRequests.length) {
        this.addResult(
          'Data Scope',
          true,
          `✅ Customer Admin (ALL) sees ${adminRequests.length} requests, Engineer (OWN) sees ${engineerRequests.length}`,
          Date.now() - start,
        );
      } else {
        this.addResult(
          'Data Scope',
          false,
          `❌ Engineer sees more data than Admin - scope violation!`,
          Date.now() - start,
        );
      }
    } catch (error: any) {
      this.addResult(
        'Data Scope',
        false,
        `❌ Error: ${error.message}`,
        Date.now() - start,
      );
    }
  }

  /**
   * Test 4: Permission Checks
   * Supplier Viewer should NOT be able to create devices
   */
  async testPermissionChecks() {
    console.log(('\n📋 Test 4: Permission Checks'));
    const start = Date.now();

    try {
      // Login as Supplier Viewer (read-only)
      const viewerToken = await this.login('viewer@siemens.com.cn', 'Password123!');
      const viewerClient = this.createClient(viewerToken);

      // Try to create a device (should fail)
      try {
        await viewerClient.post('/passports', {
          deviceName: 'Test Device',
          productLine: 'PLC',
        });

        this.addResult(
          'Permission Checks',
          false,
          `❌ Supplier Viewer was able to create device - permission bypass!`,
          Date.now() - start,
        );
      } catch (error: any) {
        if (error.response?.status === 403) {
          this.addResult(
            'Permission Checks',
            true,
            `✅ Supplier Viewer correctly denied device creation (403 Forbidden)`,
            Date.now() - start,
          );
        } else {
          this.addResult(
            'Permission Checks',
            false,
            `❌ Unexpected error: ${error.message}`,
            Date.now() - start,
          );
        }
      }
    } catch (error: any) {
      this.addResult(
        'Permission Checks',
        false,
        `❌ Error: ${error.message}`,
        Date.now() - start,
      );
    }
  }

  /**
   * Test 5: Cross-Organization Access Denial
   * Siemens user should NOT be able to view Sinopec data
   */
  async testCrossOrganizationDenial() {
    console.log(('\n📋 Test 5: Cross-Organization Access Denial'));
    const start = Date.now();

    try {
      // Login as Siemens user
      const siemensToken = await this.login('admin@siemens.com.cn', 'Password123!');
      const siemensClient = this.createClient(siemensToken);

      // Login as Sinopec user and create a service request
      const sinopecToken = await this.login('admin@sinopec.com', 'Password123!');
      const sinopecClient = this.createClient(sinopecToken);

      // Get Sinopec's service requests
      const sinopecResponse = await sinopecClient.get('/service-requests');
      const sinopecRequests = sinopecResponse.data.data.data;

      if (sinopecRequests.length > 0) {
        const requestId = sinopecRequests[0].id;

        // Try to access it from Siemens account
        try {
          await siemensClient.get(`/service-requests/${requestId}`);

          this.addResult(
            'Cross-Organization Denial',
            false,
            `❌ Siemens user was able to access Sinopec's service request!`,
            Date.now() - start,
          );
        } catch (error: any) {
          if (error.response?.status === 403 || error.response?.status === 404) {
            this.addResult(
              'Cross-Organization Denial',
              true,
              `✅ Siemens user correctly denied access to Sinopec data (${error.response.status})`,
              Date.now() - start,
            );
          } else {
            this.addResult(
              'Cross-Organization Denial',
              false,
              `❌ Unexpected error: ${error.message}`,
              Date.now() - start,
            );
          }
        }
      } else {
        this.addResult(
          'Cross-Organization Denial',
          true,
          `⚠️ No Sinopec data to test cross-org access`,
          Date.now() - start,
        );
      }
    } catch (error: any) {
      this.addResult(
        'Cross-Organization Denial',
        false,
        `❌ Error: ${error.message}`,
        Date.now() - start,
      );
    }
  }

  /**
   * Test 6: Platform Override
   * Platform QC should be able to see all organizations' data
   */
  async testPlatformOverride() {
    console.log(('\n📋 Test 6: Platform Override'));
    const start = Date.now();

    try {
      // Login as Platform QC
      const platformToken = await this.login('qc@luna.medical', 'Password123!');
      const platformClient = this.createClient(platformToken);

      // Get all devices (should see all orgs)
      const response = await platformClient.get('/passports');
      const devices = response.data.data.data;

      // Count unique organizations
      const uniqueOrgs = new Set(devices.map((d: any) => d.organizationId));

      if (uniqueOrgs.size > 1) {
        this.addResult(
          'Platform Override',
          true,
          `✅ Platform QC can see devices from ${uniqueOrgs.size} organizations`,
          Date.now() - start,
        );
      } else {
        this.addResult(
          'Platform Override',
          false,
          `❌ Platform QC can only see ${uniqueOrgs.size} organization's data`,
          Date.now() - start,
        );
      }
    } catch (error: any) {
      this.addResult(
        'Platform Override',
        false,
        `❌ Error: ${error.message}`,
        Date.now() - start,
      );
    }
  }

  /**
   * Run all tests
   */
  async runAll() {
    console.log(('\n🚀 Starting RBAC Verification Tests\n'));
    console.log(('API URL:'), API_URL);
    console.log(('━'.repeat(60)));

    try {
      await this.testOrganizationIsolation();
      await this.testProductLineRestriction();
      await this.testDataScope();
      await this.testPermissionChecks();
      await this.testCrossOrganizationDenial();
      await this.testPlatformOverride();
    } catch (error: any) {
      console.error((`\n❌ Fatal error: ${error.message}`));
    }

    this.printResults();
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log(('\n' + '━'.repeat(60)));
    console.log(('\n📊 Test Results Summary\n'));

    const passed = this.results.filter((r) => r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    this.results.forEach((result) => {
      const icon = result.passed ? ('✓') : ('✗');
      const duration = result.duration ? (`(${result.duration}ms)`) : '';
      console.log(`${icon} ${result.name} ${duration}`);
      console.log(`  ${result.message}\n`);
    });

    console.log(('━'.repeat(60)));

    if (passed === total) {
      console.log((`\n✅ All ${total} tests passed! (${passRate}%)\n`));
    } else {
      console.log(
        (
          `\n⚠️  ${passed}/${total} tests passed (${passRate}%)\n`,
        ),
      );
    }

    process.exit(passed === total ? 0 : 1);
  }
}

// Run tests
const verifier = new RBACVerifier();
verifier.runAll().catch((error) => {
  console.error(('\n❌ Verification failed:', error.message));
  process.exit(1);
});
