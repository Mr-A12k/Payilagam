ALTER TABLE "messages" ADD COLUMN "reply_to_id" INTEGER;
ALTER TABLE "channel_messages" ADD COLUMN "reply_to_id" INTEGER;
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_fkey"
  FOREIGN KEY ("reply_to_id") REFERENCES "messages"("message_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "channel_messages" ADD CONSTRAINT "channel_messages_reply_to_id_fkey"
  FOREIGN KEY ("reply_to_id") REFERENCES "channel_messages"("message_id") ON DELETE SET NULL ON UPDATE CASCADE;
