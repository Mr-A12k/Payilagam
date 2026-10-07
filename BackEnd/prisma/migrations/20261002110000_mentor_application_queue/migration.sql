CREATE INDEX "mentor_applications_status_created_at_id_idx" ON "mentor_applications"("status", "created_at", "id");
CREATE INDEX "mentor_applications_user_id_status_idx" ON "mentor_applications"("user_id", "status");
