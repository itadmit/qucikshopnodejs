-- CreateEnum
CREATE TYPE "public"."PlanType" AS ENUM ('BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'INACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('SIMPLE', 'VARIABLE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."ProductOptionType" AS ENUM ('TEXT', 'COLOR', 'IMAGE', 'BUTTON');

-- CreateEnum
CREATE TYPE "public"."ProductOptionDisplay" AS ENUM ('DROPDOWN', 'RADIO', 'SWATCH');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "public"."CouponAppliesTo" AS ENUM ('ALL', 'SPECIFIC_PRODUCTS', 'SPECIFIC_CATEGORIES');

-- CreateEnum
CREATE TYPE "public"."AutomaticDiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'BOGO', 'BUY_X_GET_Y');

-- CreateEnum
CREATE TYPE "public"."AddressType" AS ENUM ('BILLING', 'SHIPPING');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "public"."FulfillmentStatus" AS ENUM ('UNFULFILLED', 'PARTIALLY_FULFILLED', 'FULFILLED');

-- CreateEnum
CREATE TYPE "public"."PageType" AS ENUM ('HOME', 'CONTENT', 'CATEGORY', 'PRODUCT');

-- CreateEnum
CREATE TYPE "public"."GlobalSettingsType" AS ENUM ('HEADER', 'FOOTER', 'THEME', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('ORDER_RECEIVED', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'LOW_STOCK', 'OUT_OF_STOCK', 'TRIAL_ENDING', 'SUBSCRIPTION_EXPIRED', 'NEW_CUSTOMER', 'SYSTEM_UPDATE', 'SECURITY_ALERT');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."StorePlanType" AS ENUM ('BASIC', 'NO_TRANSACTION');

-- CreateEnum
CREATE TYPE "public"."StoreSubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'INACTIVE', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."StoreRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."CustomFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'RICH_TEXT', 'NUMBER', 'EMAIL', 'URL', 'PHONE', 'DATE', 'CHECKBOX', 'DROPDOWN', 'RADIO', 'FILE');

-- CreateEnum
CREATE TYPE "public"."BundleDiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'TIERED', 'BUNDLE');

-- CreateEnum
CREATE TYPE "public"."DiscountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'USED_UP');

-- CreateEnum
CREATE TYPE "public"."CouponType" AS ENUM ('SINGLE_USE', 'MULTIPLE_USE', 'UNLIMITED');

-- CreateEnum
CREATE TYPE "public"."InfluencerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."PartnerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "public"."PartnerStoreStatus" AS ENUM ('DEVELOPMENT', 'TRANSFERRED', 'ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."PartnerActivityType" AS ENUM ('LOGIN', 'STORE_CREATED', 'STORE_TRANSFERRED', 'STORE_ACTIVATED', 'COMMISSION_EARNED', 'PAYOUT_REQUESTED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "plan_type" "public"."PlanType" NOT NULL DEFAULT 'BASIC',
    "subscription_status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "trial_ends_at" TIMESTAMP(3),
    "subscription_ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "has_completed_onboarding" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stores" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "description" TEXT,
    "template_name" TEXT NOT NULL DEFAULT 'jupiter',
    "template_id" TEXT,
    "template_customizations" JSONB,
    "settings" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "plan_type" "public"."StorePlanType" NOT NULL DEFAULT 'BASIC',
    "subscription_status" "public"."StoreSubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "trial_ends_at" TIMESTAMP(3),
    "subscription_ends_at" TIMESTAMP(3),
    "monthly_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transaction_fee_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.005,
    "order_sequence" INTEGER NOT NULL DEFAULT 0,
    "facebook_pixel_id" TEXT,
    "facebook_access_token" TEXT,
    "google_tag_manager_id" TEXT,
    "google_analytics_id" TEXT,
    "pixel_settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "files" JSONB NOT NULL,
    "config" JSONB NOT NULL,
    "author" TEXT,
    "thumbnail" TEXT,
    "tags" TEXT[],
    "category" TEXT,
    "price" DOUBLE PRECISION DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_pages" (
    "id" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "page_type" "public"."PageType" NOT NULL,
    "structure" JSONB NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_settings" (
    "id" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "type" "public"."GlobalSettingsType" NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."menus" (
    "id" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."store_users" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "public"."StoreRole" NOT NULL DEFAULT 'STAFF',
    "permissions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "invited_by" INTEGER,
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "sku" TEXT,
    "type" "public"."ProductType" NOT NULL DEFAULT 'SIMPLE',
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "price" DOUBLE PRECISION,
    "compare_price" DOUBLE PRECISION,
    "cost_price" DOUBLE PRECISION,
    "track_inventory" BOOLEAN NOT NULL DEFAULT true,
    "inventory_quantity" INTEGER NOT NULL DEFAULT 0,
    "allow_backorder" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION,
    "dimensions" JSONB,
    "requires_shipping" BOOLEAN NOT NULL DEFAULT true,
    "is_digital" BOOLEAN NOT NULL DEFAULT false,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "tags" JSONB,
    "custom_fields" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_options" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ProductOptionType" NOT NULL DEFAULT 'TEXT',
    "display_type" "public"."ProductOptionDisplay" NOT NULL DEFAULT 'DROPDOWN',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_option_values" (
    "id" SERIAL NOT NULL,
    "option_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "color_code" TEXT,
    "image_url" TEXT,
    "pattern_data" JSONB,
    "mixed_color_data" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_fields" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "public"."CustomFieldType" NOT NULL DEFAULT 'TEXT',
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "placeholder" TEXT,
    "help_text" TEXT,
    "default_value" TEXT,
    "options" JSONB,
    "validation" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_variants" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "sku" TEXT,
    "price" DOUBLE PRECISION,
    "compare_price" DOUBLE PRECISION,
    "cost_price" DOUBLE PRECISION,
    "inventory_quantity" INTEGER NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_variant_option_values" (
    "id" SERIAL NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,
    "option_value_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variant_option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bundle_items" (
    "id" SERIAL NOT NULL,
    "bundle_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "variant_id" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "discount_type" "public"."BundleDiscountType",
    "discount_value" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bundle_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "s3_key" TEXT NOT NULL,
    "s3_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_media" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "variant_id" INTEGER,
    "type" "public"."MediaType" NOT NULL DEFAULT 'IMAGE',
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "color_option_value_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "total_spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orders_count" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB,
    "notes" TEXT,
    "accepts_marketing" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_addresses" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "type" "public"."AddressType" NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "company" TEXT,
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "order_number" INTEGER NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "fulfillment_status" "public"."FulfillmentStatus" NOT NULL DEFAULT 'UNFULFILLED',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shipping_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "customer_email" TEXT,
    "customer_phone" TEXT,
    "billing_address" JSONB,
    "shipping_address" JSONB,
    "notes" TEXT,
    "coupon_codes" JSONB,
    "applied_discounts" JSONB,
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "tracking_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "variant_id" INTEGER,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_sku" TEXT,
    "variant_options" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cart_sessions" (
    "id" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "items" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pages" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "type" "public"."PageType" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "template_override" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics_events" (
    "id" BIGSERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB,
    "session_id" TEXT,
    "customer_id" INTEGER,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."billing_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "description" TEXT NOT NULL,
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "billing_period_start" TIMESTAMP(3),
    "billing_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."active_sessions" (
    "id" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "active_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_analytics" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "unique_visitors" INTEGER NOT NULL DEFAULT 0,
    "page_views" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_session_duration" INTEGER NOT NULL DEFAULT 0,
    "bounce_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "top_pages" JSONB NOT NULL DEFAULT '[]',
    "top_products" JSONB NOT NULL DEFAULT '[]',
    "traffic_sources" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hourly_analytics" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hour" INTEGER NOT NULL,
    "active_users" INTEGER NOT NULL DEFAULT 0,
    "page_views" INTEGER NOT NULL DEFAULT 0,
    "new_sessions" INTEGER NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hourly_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_metrics" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "metric_type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."influencers" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "code" TEXT NOT NULL,
    "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "status" "public"."InfluencerStatus" NOT NULL DEFAULT 'PENDING',
    "total_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coupons" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "influencer_id" INTEGER,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."CouponType" NOT NULL DEFAULT 'MULTIPLE_USE',
    "discountType" "public"."DiscountType" NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "minimum_amount" DOUBLE PRECISION,
    "maximum_discount" DOUBLE PRECISION,
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "customer_limit" INTEGER,
    "starts_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "status" "public"."DiscountStatus" NOT NULL DEFAULT 'ACTIVE',
    "applicable_products" JSONB,
    "applicable_categories" JSONB,
    "excluded_products" JSONB,
    "excluded_categories" JSONB,
    "customer_segments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."automatic_discounts" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "influencer_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "public"."DiscountType" NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "minimum_amount" DOUBLE PRECISION,
    "maximum_discount" DOUBLE PRECISION,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "status" "public"."DiscountStatus" NOT NULL DEFAULT 'ACTIVE',
    "applicable_products" JSONB,
    "applicable_categories" JSONB,
    "excluded_products" JSONB,
    "excluded_categories" JSONB,
    "customer_segments" JSONB,
    "buy_quantity" INTEGER,
    "get_quantity" INTEGER,
    "tiered_rules" JSONB,
    "buy_products" JSONB,
    "buy_categories" JSONB,
    "get_products" JSONB,
    "get_categories" JSONB,
    "get_discount_type" TEXT,
    "get_discount_value" DOUBLE PRECISION,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automatic_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coupon_usages" (
    "id" SERIAL NOT NULL,
    "coupon_id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "customer_id" INTEGER,
    "session_id" TEXT,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "order_total" DOUBLE PRECISION NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."influencer_stats" (
    "id" SERIAL NOT NULL,
    "influencer_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coupon_uses" INTEGER NOT NULL DEFAULT 0,
    "new_customers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "influencer_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partners" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "referral_code" TEXT NOT NULL,
    "tier" "public"."PartnerTier" NOT NULL DEFAULT 'BRONZE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "total_stores" INTEGER NOT NULL DEFAULT 0,
    "active_stores" INTEGER NOT NULL DEFAULT 0,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_stores" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "status" "public"."PartnerStoreStatus" NOT NULL DEFAULT 'DEVELOPMENT',
    "referral_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transferred_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "transfer_email" TEXT,

    CONSTRAINT "partner_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_commissions" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "partner_store_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "payout_request_id" INTEGER,

    CONSTRAINT "partner_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_payout_requests" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "bank_details" JSONB,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "notes" TEXT,
    "transaction_id" TEXT,

    CONSTRAINT "partner_payout_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_activities" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "type" "public"."PartnerActivityType" NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html_content" TEXT NOT NULL,
    "text_content" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "variables" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_logs" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sendgrid_message_id" TEXT,
    "error" TEXT,
    "order_id" INTEGER,
    "customer_id" INTEGER,
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "public"."stores"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "stores_domain_key" ON "public"."stores"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "templates_name_key" ON "public"."templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "custom_pages_store_id_page_type_key" ON "public"."custom_pages"("store_id", "page_type");

-- CreateIndex
CREATE UNIQUE INDEX "global_settings_store_id_type_key" ON "public"."global_settings"("store_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "menus_store_id_handle_key" ON "public"."menus"("store_id", "handle");

-- CreateIndex
CREATE UNIQUE INDEX "store_users_store_id_user_id_key" ON "public"."store_users"("store_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_store_id_slug_key" ON "public"."categories"("store_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_store_id_slug_key" ON "public"."products"("store_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_options_product_id_name_key" ON "public"."product_options"("product_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "custom_fields_store_id_name_key" ON "public"."custom_fields"("store_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_option_values_variant_id_option_id_key" ON "public"."product_variant_option_values"("variant_id", "option_id");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_items_bundle_id_product_id_variant_id_key" ON "public"."bundle_items"("bundle_id", "product_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_store_id_email_key" ON "public"."customers"("store_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "orders_store_id_order_number_key" ON "public"."orders"("store_id", "order_number");

-- CreateIndex
CREATE UNIQUE INDEX "pages_store_id_slug_key" ON "public"."pages"("store_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "daily_analytics_store_id_date_key" ON "public"."daily_analytics"("store_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "hourly_analytics_store_id_date_hour_key" ON "public"."hourly_analytics"("store_id", "date", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_code_key" ON "public"."influencers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_store_id_email_key" ON "public"."influencers"("store_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_store_id_code_key" ON "public"."influencers"("store_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "public"."coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_store_id_code_key" ON "public"."coupons"("store_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "influencer_stats_influencer_id_date_key" ON "public"."influencer_stats"("influencer_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "partners_email_key" ON "public"."partners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partners_referral_code_key" ON "public"."partners"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "partner_stores_partner_id_store_id_key" ON "public"."partner_stores"("partner_id", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_store_id_type_key" ON "public"."email_templates"("store_id", "type");

-- AddForeignKey
ALTER TABLE "public"."stores" ADD CONSTRAINT "stores_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stores" ADD CONSTRAINT "stores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_pages" ADD CONSTRAINT "custom_pages_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_settings" ADD CONSTRAINT "global_settings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."menus" ADD CONSTRAINT "menus_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."store_users" ADD CONSTRAINT "store_users_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."store_users" ADD CONSTRAINT "store_users_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."store_users" ADD CONSTRAINT "store_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_options" ADD CONSTRAINT "product_options_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_option_values" ADD CONSTRAINT "product_option_values_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_fields" ADD CONSTRAINT "custom_fields_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variant_option_values" ADD CONSTRAINT "product_variant_option_values_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variant_option_values" ADD CONSTRAINT "product_variant_option_values_option_value_id_fkey" FOREIGN KEY ("option_value_id") REFERENCES "public"."product_option_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variant_option_values" ADD CONSTRAINT "product_variant_option_values_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bundle_items" ADD CONSTRAINT "bundle_items_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bundle_items" ADD CONSTRAINT "bundle_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bundle_items" ADD CONSTRAINT "bundle_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media" ADD CONSTRAINT "media_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_media" ADD CONSTRAINT "product_media_color_option_value_id_fkey" FOREIGN KEY ("color_option_value_id") REFERENCES "public"."product_option_values"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_media" ADD CONSTRAINT "product_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_media" ADD CONSTRAINT "product_media_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_media" ADD CONSTRAINT "product_media_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_sessions" ADD CONSTRAINT "cart_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_sessions" ADD CONSTRAINT "cart_sessions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pages" ADD CONSTRAINT "pages_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analytics_events" ADD CONSTRAINT "analytics_events_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analytics_events" ADD CONSTRAINT "analytics_events_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billing_history" ADD CONSTRAINT "billing_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."active_sessions" ADD CONSTRAINT "active_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."active_sessions" ADD CONSTRAINT "active_sessions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_analytics" ADD CONSTRAINT "daily_analytics_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hourly_analytics" ADD CONSTRAINT "hourly_analytics_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_metrics" ADD CONSTRAINT "performance_metrics_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."influencers" ADD CONSTRAINT "influencers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupons" ADD CONSTRAINT "coupons_influencer_id_fkey" FOREIGN KEY ("influencer_id") REFERENCES "public"."influencers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupons" ADD CONSTRAINT "coupons_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."automatic_discounts" ADD CONSTRAINT "automatic_discounts_influencer_id_fkey" FOREIGN KEY ("influencer_id") REFERENCES "public"."influencers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."automatic_discounts" ADD CONSTRAINT "automatic_discounts_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_usages" ADD CONSTRAINT "coupon_usages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_usages" ADD CONSTRAINT "coupon_usages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."influencer_stats" ADD CONSTRAINT "influencer_stats_influencer_id_fkey" FOREIGN KEY ("influencer_id") REFERENCES "public"."influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_stores" ADD CONSTRAINT "partner_stores_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_stores" ADD CONSTRAINT "partner_stores_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_commissions" ADD CONSTRAINT "partner_commissions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_commissions" ADD CONSTRAINT "partner_commissions_partner_store_id_fkey" FOREIGN KEY ("partner_store_id") REFERENCES "public"."partner_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_commissions" ADD CONSTRAINT "partner_commissions_payout_request_id_fkey" FOREIGN KEY ("payout_request_id") REFERENCES "public"."partner_payout_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_payout_requests" ADD CONSTRAINT "partner_payout_requests_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_activities" ADD CONSTRAINT "partner_activities_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
