CREATE TABLE "user_positions" (
	"user_id" uuid NOT NULL,
	"last_position" integer NOT NULL,
	"last_updated_date" date NOT NULL,
	CONSTRAINT "user_positions_user_id_pk" PRIMARY KEY("user_id")
);
