-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM (
  'PUBLIC',
  'CUSTOMER',
  'ENGINEER',
  'QC_INSPECTOR',
  'OPERATOR',
  'ADMIN'
);

CREATE TYPE device_status AS ENUM (
  'CREATED',
  'PROCURED',
  'IN_QC',
  'QC_PASSED',
  'QC_FAILED',
  'IN_ASSEMBLY',
  'IN_TESTING',
  'TEST_PASSED',
  'TEST_FAILED',
  'PACKAGED',
  'IN_TRANSIT',
  'DELIVERED',
  'IN_SERVICE',
  'MAINTENANCE',
  'RETIRED'
);

CREATE TYPE product_line AS ENUM (
  'PLC',
  'MOT',
  'SEN',
  'CTL',
  'ROB',
  'HMI',
  'INV',
  'VLV',
  'PCB',
  'OTH'
);

CREATE TYPE service_order_status AS ENUM (
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE service_type AS ENUM (
  'INSTALLATION',
  'REPAIR',
  'MAINTENANCE',
  'INSPECTION',
  'UPGRADE',
  'CONSULTATION'
);

-- Grant privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO passport_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO passport_user;
