-- Database Optimization Script for Production
-- Run this script after initial deployment for better performance

-- ==========================================
-- CREATE ADDITIONAL INDEXES
-- ==========================================

-- Device Passport Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_device_passport_status_created
  ON device_passport(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_device_passport_supplier
  ON device_passport(supplier_id) WHERE supplier_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_device_passport_customer
  ON device_passport(customer_id) WHERE customer_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_device_passport_serial
  ON device_passport(serial_number) WHERE serial_number IS NOT NULL;

-- Lifecycle Event Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lifecycle_event_type_date
  ON lifecycle_event(event_type, event_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lifecycle_event_performed_by
  ON lifecycle_event(performed_by) WHERE performed_by IS NOT NULL;

-- User Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_role_active
  ON "user"(role, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_expert
  ON "user"(expert_id) WHERE expert_id IS NOT NULL;

-- Expert Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_available_status
  ON individual_expert(is_available, registration_status)
  WHERE is_available = true AND registration_status = 'APPROVED';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_location
  ON individual_expert(location_lat, location_lng)
  WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_work_status
  ON individual_expert(work_status) WHERE work_status = 'RUSHING';

-- Service Request Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_request_status_published
  ON service_request(status, published_at DESC)
  WHERE status = 'PUBLISHED';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_request_urgency
  ON service_request(urgency, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_request_location
  ON service_request(location_lat, location_lng)
  WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- Marketplace Product Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_product_org_status
  ON marketplace_product(organization_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_product_category
  ON marketplace_product(category, status) WHERE status = 'PUBLISHED';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_product_featured
  ON marketplace_product(is_featured, published_at DESC)
  WHERE is_featured = true AND status = 'PUBLISHED';

-- Buyer Requirement Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_buyer_requirement_valid
  ON buyer_requirement(status, valid_until)
  WHERE status = 'PUBLISHED' AND valid_until > NOW();

-- Match Result Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_result_supplier_viewed
  ON match_result(supplier_org_id, is_viewed, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_result_buyer_viewed
  ON match_result(buyer_org_id, is_viewed, created_at DESC);

-- Expert Match Result Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_match_expert_viewed
  ON expert_match_result(expert_id, is_viewed, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_match_request_score
  ON expert_match_result(service_request_id, match_score DESC);

-- Inquiry Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inquiry_sender_status
  ON inquiry(sender_org_id, status, last_message_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inquiry_receiver_status
  ON inquiry(receiver_org_id, status, last_message_at DESC);

-- Point Account Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_point_account_level
  ON point_account(credit_level, total_points DESC);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_product_title_search
  ON marketplace_product USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_request_description_search
  ON service_request USING gin(to_tsvector('english', description));

-- ==========================================
-- UPDATE STATISTICS
-- ==========================================

ANALYZE device_passport;
ANALYZE lifecycle_event;
ANALYZE "user";
ANALYZE individual_expert;
ANALYZE service_request;
ANALYZE expert_service_record;
ANALYZE marketplace_product;
ANALYZE buyer_requirement;
ANALYZE match_result;
ANALYZE expert_match_result;
ANALYZE inquiry;

-- ==========================================
-- VACUUM TABLES
-- ==========================================

VACUUM ANALYZE device_passport;
VACUUM ANALYZE lifecycle_event;
VACUUM ANALYZE "user";
VACUUM ANALYZE individual_expert;
VACUUM ANALYZE service_request;

-- ==========================================
-- OPTIMIZE SETTINGS (Run as superuser)
-- ==========================================

-- Increase work_mem for better query performance
-- ALTER SYSTEM SET work_mem = '64MB';

-- Increase shared_buffers (25% of total RAM)
-- ALTER SYSTEM SET shared_buffers = '2GB';

-- Increase effective_cache_size (50% of total RAM)
-- ALTER SYSTEM SET effective_cache_size = '4GB';

-- Improve checkpoint performance
-- ALTER SYSTEM SET checkpoint_completion_target = 0.9;
-- ALTER SYSTEM SET wal_buffers = '16MB';

-- Then reload configuration:
-- SELECT pg_reload_conf();

-- ==========================================
-- PARTITIONING SETUP (Future Optimization)
-- ==========================================

-- For very large tables, consider partitioning by date
-- Example for lifecycle_event table:

-- CREATE TABLE lifecycle_event_2026 PARTITION OF lifecycle_event
--   FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- CREATE TABLE lifecycle_event_2027 PARTITION OF lifecycle_event
--   FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

-- ==========================================
-- MONITORING QUERIES
-- ==========================================

-- Check index usage
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan ASC;

-- Check table sizes
-- SELECT schemaname, tablename,
--        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
-- SELECT calls, total_time, mean_time, query
-- FROM pg_stat_statements
-- ORDER BY mean_time DESC
-- LIMIT 20;
