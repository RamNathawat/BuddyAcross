CREATE TABLE "buddy_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bio" text,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"skills" text[] NOT NULL,
	"kyc_status" varchar(30) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "buddy_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "kyc_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buddy_id" uuid NOT NULL,
	"aadhaar_front" text NOT NULL,
	"aadhaar_back" text NOT NULL,
	"selfie" text NOT NULL,
	"rejection_reason" text,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" uuid
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"full_name" varchar(100) NOT NULL,
	"role" varchar(20),
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "buddy_profiles" ADD CONSTRAINT "buddy_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_buddy_id_buddy_profiles_id_fk" FOREIGN KEY ("buddy_id") REFERENCES "public"."buddy_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "buddy_profiles_user_id_idx" ON "buddy_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "buddy_profiles_city_idx" ON "buddy_profiles" USING btree ("city");--> statement-breakpoint
CREATE INDEX "buddy_profiles_kyc_status_idx" ON "buddy_profiles" USING btree ("kyc_status");--> statement-breakpoint
CREATE INDEX "kyc_submissions_buddy_id_idx" ON "kyc_submissions" USING btree ("buddy_id");--> statement-breakpoint
CREATE INDEX "kyc_submissions_status_idx" ON "kyc_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");