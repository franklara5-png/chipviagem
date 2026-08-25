-- Hermes stats: rastreamento de visitas para agregação de IPs/visitantes.
-- Cada visita é um INSERT (sem upsert); a agregação "1 IP = 1 linha" acontece
-- só na leitura (GROUP BY ip), em /api/hermes/stats.
CREATE TABLE IF NOT EXISTS "site_visits" (
	"id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
	"ip" text,
	"path" text,
	"referrer" text,
	"user_agent" text,
	"country" text,
	"region" text,
	"city" text,
	"visited_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_site_visits_visited_at" ON "site_visits" USING btree ("visited_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_site_visits_ip" ON "site_visits" USING btree ("ip");
