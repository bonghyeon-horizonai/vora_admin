ALTER TABLE "products" ADD COLUMN "paddle_metadata" jsonb;
--> statement-breakpoint
UPDATE "products"
SET
    "paddle_metadata" = jsonb_build_object (
        'productId',
        "paddle_product_id",
        'priceId',
        "paddle_price_id"
    )
WHERE
    "paddle_product_id" IS NOT NULL
    OR "paddle_price_id" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "paddle_product_id";
--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "paddle_price_id";