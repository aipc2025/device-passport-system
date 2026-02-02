#!/usr/bin/env ts-node
/**
 * Simplified RBAC Verification Script
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

class RBACVerifier {
  private results: TestResult[] = [];

  async login(email: string, password: string): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      return response.data.accessToken;
    } catch (error: any) {
      throw new Error(`Login failed for ${email}: ${error.response?.data?.message || error.message}`);
    }
  }

  async testOrganizationIsolation() {
    console.log('\n📋 Test 1: Organization Isolation');
    try {
      const siemensToken = await this.login('qc.wang@siemens.com.cn', 'Password123!');
      const response = await axios.get(`${API_URL}/passports`, {
        headers: { Authorization: `Bearer ${siemensToken}` },
      });

      const devices = response.data;
      const otherOrgDevices = devices.filter(
        (d: any) => d.organizationId !== '00000000-0000-0000-0000-000000000002'
      );

      if (otherOrgDevices.length === 0) {
        this.results.push({
          name: 'Organization Isolation',
          passed: true,
          message: `✅ Siemens QC can only see Siemens devices (${devices.length} total)`,
        });
      } else {
        this.results.push({
          name: 'Organization Isolation',
          passed: false,
          message: `❌ Siemens QC can see ${otherOrgDevices.length} devices from other organizations!`,
        });
      }
    } catch (error: any) {
      this.results.push({
        name: 'Organization Isolation',
        passed: false,
        message: `❌ Error: ${error.message}`,
      });
    }
  }

  async testLogin() {
    console.log('\n📋 Test: User Login');
    try {
      // Test if we can login with test users
      const token = await this.login('admin@luna.medical', 'Password123!');
      if (token) {
        this.results.push({
          name: 'User Login',
          passed: true,
          message: '✅ Successfully logged in with test user',
        });
      }
    } catch (error: any) {
      this.results.push({
        name: 'User Login',
        passed: false,
        message: `❌ Login failed: ${error.message}. Test data may not be loaded.`,
      });
    }
  }

  async runAll() {
    console.log('\n🚀 Starting RBAC Verification Tests\n');
    console.log('API URL:', API_URL);
    console.log('━'.repeat(60));

    try {
      await this.testLogin();
      await this.testOrganizationIsolation();
    } catch (error: any) {
      console.error(`\n❌ Fatal error: ${error.message}`);
    }

    this.printResults();
  }

  printResults() {
    console.log('\n' + '━'.repeat(60));
    console.log('\n📊 Test Results Summary\n');

    const passed = this.results.filter((r) => r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    this.results.forEach((result) => {
      const icon = result.passed ? '✓' : '✗';
      console.log(`${icon} ${result.name}`);
      console.log(`  ${result.message}\n`);
    });

    console.log('━'.repeat(60));

    if (passed === total) {
      console.log(`\n✅ All ${total} tests passed! (${passRate}%)\n`);
    } else {
      console.log(`\n⚠️  ${passed}/${total} tests passed (${passRate}%)\n`);
    }

    process.exit(passed === total ? 0 : 1);
  }
}

const verifier = new RBACVerifier();
verifier.runAll().catch((error) => {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
});
