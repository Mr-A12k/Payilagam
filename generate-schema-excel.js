/**
 * generate-schema-excel.js
 * 
 * Generates a beautifully formatted Excel workbook with:
 *   - One sheet per database group/domain
 *   - Each table shown with all columns, types, constraints, and relationships
 *   - Color-coded by section (PK=gold, FK=blue, required=dark, optional=lighter)
 * 
 * Run: node generate-schema-excel.js
 * Output: TaskPro_Database_Schema.xlsx
 */

const ExcelJS = require('exceljs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// SCHEMA DEFINITION
// All tables, grouped by domain/sheet
// ─────────────────────────────────────────────────────────────

const SCHEMA = [
  // ─── Sheet 1: Auth & User Management ───
  {
    sheetName: '1. Auth & Users',
    sheetColor: '1E40AF', // blue
    tables: [
      {
        tableName: 'roles',
        prismaModel: 'Role',
        description: 'User roles defining access levels (student, mentor, admin)',
        columns: [
          { name: 'role_id',   type: 'INT',     pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,      notes: 'Primary Key' },
          { name: 'role_name', type: 'VARCHAR',  pk: false, nullable: false, default: '',               fk: null,      notes: 'UNIQUE. e.g. student, mentor, admin' },
        ],
      },
      {
        tableName: 'users',
        prismaModel: 'User',
        description: 'Core user accounts — students, mentors, and admins',
        columns: [
          { name: 'user_id',             type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,          notes: 'Primary Key' },
          { name: 'user_name',           type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,          notes: 'UNIQUE. Login username' },
          { name: 'full_name',           type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,          notes: '' },
          { name: 'email',               type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,          notes: 'UNIQUE' },
          { name: 'mobile_number',       type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,          notes: 'UNIQUE' },
          { name: 'password',            type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,          notes: 'Bcrypt hashed' },
          { name: 'profile_url',         type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,          notes: 'Avatar image URL' },
          { name: 'bio',                 type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,          notes: '' },
          { name: 'skills',              type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,          notes: 'JSON array of skills' },
          { name: 'social_links',        type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,          notes: 'JSON object of social links' },
          { name: 'role_id',             type: 'INT',       pk: false, nullable: false, default: '',               fk: 'roles.role_id', notes: 'FK → roles' },
          { name: 'theme',               type: 'VARCHAR',   pk: false, nullable: false, default: 'dark',           fk: null,          notes: '"dark" or "light"' },
          { name: 'is_active',           type: 'BOOLEAN',   pk: false, nullable: false, default: 'true',           fk: null,          notes: 'Soft-delete flag' },
          { name: 'must_change_password',type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null,          notes: 'Force password reset flag' },
          { name: 'last_login_at',       type: 'TIMESTAMP', pk: false, nullable: true,  default: 'NULL',           fk: null,          notes: '' },
          { name: 'created_at',          type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,          notes: '' },
          { name: 'modified_at',         type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,          notes: 'Auto-updated on change' },
        ],
      },
      {
        tableName: 'password_reset_otps',
        prismaModel: 'PasswordResetOTP',
        description: 'Temporary OTP tokens for password reset flow',
        columns: [
          { name: 'id',         type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,            notes: 'Primary Key' },
          { name: 'userId',     type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id', notes: 'UNIQUE FK → users' },
          { name: 'otpHash',    type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'Bcrypt hashed OTP' },
          { name: 'expiresAt',  type: 'TIMESTAMP', pk: false, nullable: false, default: '',               fk: null,            notes: 'OTP expiry time' },
          { name: 'createdAt',  type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
        ],
      },
    ],
  },

  // ─── Sheet 2: Course Management ───
  {
    sheetName: '2. Courses',
    sheetColor: '059669', // green
    tables: [
      {
        tableName: 'categories',
        prismaModel: 'Category',
        description: 'Hierarchical course categories (supports parent-child tree)',
        columns: [
          { name: 'category_id',  type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                    notes: 'Primary Key' },
          { name: 'name',         type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,                    notes: 'UNIQUE' },
          { name: 'slug',         type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,                    notes: 'UNIQUE. URL-friendly name' },
          { name: 'description',  type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,                    notes: '' },
          { name: 'icon',         type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,                    notes: 'Icon identifier' },
          { name: 'parent_id',    type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: 'categories.category_id',notes: 'Self-referencing FK (sub-category)' },
          { name: 'created_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                    notes: '' },
        ],
      },
      {
        tableName: 'courses',
        prismaModel: 'Course',
        description: 'Main course records created by mentors',
        columns: [
          { name: 'course_id',    type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                      notes: 'Primary Key' },
          { name: 'course_name',  type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,                      notes: '' },
          { name: 'course_code',  type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,                      notes: 'UNIQUE' },
          { name: 'description',  type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,                      notes: '' },
          { name: 'thumbnail',    type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,                      notes: 'Thumbnail image URL' },
          { name: 'price',        type: 'FLOAT',     pk: false, nullable: false, default: '0',              fk: null,                      notes: '0 = free' },
          { name: 'level',        type: 'VARCHAR',   pk: false, nullable: false, default: 'beginner',       fk: null,                      notes: 'beginner | intermediate | advanced' },
          { name: 'status',       type: 'VARCHAR',   pk: false, nullable: false, default: 'draft',          fk: null,                      notes: 'draft | published | archived' },
          { name: 'duration',     type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: null,                      notes: 'Estimated minutes' },
          { name: 'total_lessons',type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,                      notes: 'Cached lesson count' },
          { name: 'mentor_id',    type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',           notes: 'FK → users (mentor)' },
          { name: 'category_id',  type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: 'categories.category_id',  notes: 'FK → categories' },
          { name: 'created_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                      notes: '' },
          { name: 'updated_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                      notes: '' },
        ],
      },
      {
        tableName: 'course_modules',
        prismaModel: 'CourseModule',
        description: 'Chapters / modules within a course',
        columns: [
          { name: 'module_id',    type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,              notes: 'Primary Key' },
          { name: 'course_id',    type: 'INT',       pk: false, nullable: false, default: '',               fk: 'courses.course_id', notes: 'FK → courses (CASCADE DELETE)' },
          { name: 'title',        type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,              notes: '' },
          { name: 'description',  type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,              notes: '' },
          { name: 'order_index',  type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,              notes: 'Display order within course' },
          { name: 'created_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,              notes: '' },
          { name: 'updated_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,              notes: '' },
        ],
      },
      {
        tableName: 'lessons',
        prismaModel: 'Lesson',
        description: 'Individual lesson items within a module',
        columns: [
          { name: 'lesson_id',    type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                    notes: 'Primary Key' },
          { name: 'module_id',    type: 'INT',       pk: false, nullable: false, default: '',               fk: 'course_modules.module_id', notes: 'FK → course_modules (CASCADE)' },
          { name: 'title',        type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,                    notes: '' },
          { name: 'type',         type: 'VARCHAR',   pk: false, nullable: false, default: 'video',          fk: null,                    notes: 'video | text | quiz | coding' },
          { name: 'content',      type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,                    notes: 'Text content or video embed URL' },
          { name: 'video_url',    type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,                    notes: 'Video streaming URL' },
          { name: 'duration',     type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: null,                    notes: 'Duration in minutes' },
          { name: 'order_index',  type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,                    notes: 'Display order within module' },
          { name: 'is_free',      type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null,                    notes: 'Free preview lesson flag' },
          { name: 'created_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                    notes: '' },
          { name: 'updated_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                    notes: '' },
        ],
      },
      {
        tableName: 'lesson_progress',
        prismaModel: 'LessonProgress',
        description: 'Tracks each student\'s completion status per lesson',
        columns: [
          { name: 'progress_id',  type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                notes: 'Primary Key' },
          { name: 'student_id',   type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',     notes: 'FK → users (UNIQUE with lesson_id)' },
          { name: 'lesson_id',    type: 'INT',       pk: false, nullable: false, default: '',               fk: 'lessons.lesson_id', notes: 'FK → lessons (CASCADE)' },
          { name: 'completed',    type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null,                notes: '' },
          { name: 'completed_at', type: 'TIMESTAMP', pk: false, nullable: true,  default: 'NULL',           fk: null,                notes: '' },
          { name: 'watch_time',   type: 'INT',       pk: false, nullable: true,  default: '0',              fk: null,                notes: 'Total seconds watched' },
          { name: 'created_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                notes: '' },
          { name: 'updated_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                notes: '' },
        ],
      },
    ],
  },

  // ─── Sheet 3: Enrollment & Reviews ───
  {
    sheetName: '3. Enrollment & Reviews',
    sheetColor: 'D97706', // amber
    tables: [
      {
        tableName: 'enrollments',
        prismaModel: 'Enrollment',
        description: 'Student-Course enrollment records',
        columns: [
          { name: 'enrollment_id', type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                notes: 'Primary Key' },
          { name: 'student_id',    type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',     notes: 'FK → users (UNIQUE with course_id)' },
          { name: 'course_id',     type: 'INT',       pk: false, nullable: false, default: '',               fk: 'courses.course_id', notes: 'FK → courses' },
          { name: 'status',        type: 'VARCHAR',   pk: false, nullable: false, default: 'active',         fk: null,                notes: 'active | completed | dropped' },
          { name: 'progress',      type: 'FLOAT',     pk: false, nullable: false, default: '0',              fk: null,                notes: '0–100 completion percentage' },
          { name: 'enrolled_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                notes: '' },
          { name: 'completed_at',  type: 'TIMESTAMP', pk: false, nullable: true,  default: 'NULL',           fk: null,                notes: '' },
        ],
      },
      {
        tableName: 'course_reviews',
        prismaModel: 'CourseReview',
        description: 'Student ratings and reviews for courses',
        columns: [
          { name: 'review_id',  type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                notes: 'Primary Key' },
          { name: 'course_id',  type: 'INT',       pk: false, nullable: false, default: '',               fk: 'courses.course_id', notes: 'FK → courses (UNIQUE with student_id)' },
          { name: 'student_id', type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',     notes: 'FK → users' },
          { name: 'rating',     type: 'INT',       pk: false, nullable: false, default: '',               fk: null,                notes: '1–5 star rating' },
          { name: 'comment',    type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,                notes: '' },
          { name: 'created_at', type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                notes: '' },
          { name: 'updated_at', type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                notes: '' },
        ],
      },
      {
        tableName: 'live_sessions',
        prismaModel: 'LiveSession',
        description: 'Scheduled or ongoing live streaming sessions by mentors',
        columns: [
          { name: 'session_id',     type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                notes: 'Primary Key' },
          { name: 'course_id',      type: 'INT',       pk: false, nullable: false, default: '',               fk: 'courses.course_id', notes: 'FK → courses (CASCADE)' },
          { name: 'mentor_id',      type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',     notes: 'FK → users (CASCADE)' },
          { name: 'title',          type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,                notes: '' },
          { name: 'stream_url',     type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,                notes: 'RTMP / HLS stream URL' },
          { name: 'stream_key',     type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,                notes: 'Private stream key' },
          { name: 'scheduled_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: '',               fk: null,                notes: '' },
          { name: 'is_live',        type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null,                notes: 'Currently broadcasting?' },
          { name: 'enable_chat',    type: 'BOOLEAN',   pk: false, nullable: false, default: 'true',           fk: null,                notes: '' },
          { name: 'auto_recording', type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null,                notes: '' },
          { name: 'created_at',     type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                notes: '' },
          { name: 'updated_at',     type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                notes: '' },
        ],
      },
    ],
  },

  // ─── Sheet 4: Assignments ───
  {
    sheetName: '4. Assignments',
    sheetColor: '7C3AED', // purple
    tables: [
      {
        tableName: 'assignments',
        prismaModel: 'Assignment',
        description: 'Assignments created by mentors, linked to courses',
        columns: [
          { name: 'assignment_id', type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                      notes: 'Primary Key' },
          { name: 'course_id',     type: 'INT',       pk: false, nullable: false, default: '',               fk: 'courses.course_id',       notes: 'FK → courses (CASCADE)' },
          { name: 'title',         type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,                      notes: '' },
          { name: 'description',   type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,                      notes: '' },
          { name: 'type',          type: 'VARCHAR',   pk: false, nullable: false, default: 'file_upload',    fk: null,                      notes: 'file_upload | coding_challenge | quiz | text' },
          { name: 'due_date',      type: 'TIMESTAMP', pk: false, nullable: true,  default: 'NULL',           fk: null,                      notes: '' },
          { name: 'total_marks',   type: 'INT',       pk: false, nullable: false, default: '100',            fk: null,                      notes: '' },
          { name: 'problem_id',    type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: 'coding_problems.problem_id', notes: 'FK → coding_problems (if type=coding_challenge)' },
          { name: 'created_by',    type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',           notes: 'FK → users (mentor)' },
          { name: 'created_at',    type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                      notes: '' },
          { name: 'updated_at',    type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                      notes: '' },
        ],
      },
      {
        tableName: 'assignment_submissions',
        prismaModel: 'AssignmentSubmission',
        description: 'Student submissions for assignments (file, code, or text)',
        columns: [
          { name: 'submission_id',      type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                        notes: 'Primary Key' },
          { name: 'assignment_id',      type: 'INT',       pk: false, nullable: false, default: '',               fk: 'assignments.assignment_id', notes: 'FK → assignments (CASCADE)' },
          { name: 'student_id',         type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',             notes: 'FK → users' },
          { name: 'submission_file',    type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: 'File upload URL/path' },
          { name: 'submission_text',    type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: 'Text submission' },
          { name: 'language',           type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: 'For code submissions' },
          { name: 'code',               type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: 'For coding assignments' },
          { name: 'execution_time',     type: 'FLOAT',     pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: 'Milliseconds' },
          { name: 'memory_used',        type: 'FLOAT',     pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: 'KB' },
          { name: 'test_cases_passed',  type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: '' },
          { name: 'total_test_cases',   type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: '' },
          { name: 'submitted_at',       type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                        notes: '' },
          { name: 'marks',              type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: 'Grade assigned by mentor' },
          { name: 'feedback',           type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: '' },
          { name: 'status',             type: 'VARCHAR',   pk: false, nullable: false, default: 'submitted',      fk: null,                        notes: 'submitted | reviewed | graded | returned' },
        ],
      },
    ],
  },

  // ─── Sheet 5: Coding Practice ───
  {
    sheetName: '5. Coding Practice',
    sheetColor: 'DC2626', // red
    tables: [
      {
        tableName: 'coding_problems',
        prismaModel: 'CodingProblem',
        description: 'LeetCode-style coding problems with test cases',
        columns: [
          { name: 'problem_id',          type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,            notes: 'Primary Key' },
          { name: 'title',               type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: '' },
          { name: 'slug',                type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'UNIQUE. URL-friendly ID' },
          { name: 'description',         type: 'TEXT',      pk: false, nullable: false, default: '',               fk: null,            notes: 'Markdown-formatted' },
          { name: 'difficulty',          type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'easy | medium | hard' },
          { name: 'constraints',         type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: 'Problem constraints (Markdown)' },
          { name: 'input_format',        type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: '' },
          { name: 'output_format',       type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: '' },
          { name: 'sample_input',        type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: '' },
          { name: 'sample_output',       type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: '' },
          { name: 'explanation',         type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: '' },
          { name: 'supported_languages', type: 'TEXT',      pk: false, nullable: true,  default: '["javascript","python","java","cpp"]', fk: null, notes: 'JSON array' },
          { name: 'starter_code',        type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: 'JSON map of lang → starter code' },
          { name: 'created_by',          type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id', notes: 'FK → users (mentor/admin)' },
          { name: 'is_active',           type: 'BOOLEAN',   pk: false, nullable: false, default: 'true',           fk: null,            notes: 'Soft-delete / publish toggle' },
          { name: 'created_at',          type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
          { name: 'updated_at',          type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
        ],
      },
      {
        tableName: 'test_cases',
        prismaModel: 'TestCase',
        description: 'Input/output test cases for coding problems',
        columns: [
          { name: 'test_case_id',    type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                        notes: 'Primary Key' },
          { name: 'problem_id',      type: 'INT',       pk: false, nullable: false, default: '',               fk: 'coding_problems.problem_id', notes: 'FK → coding_problems (CASCADE)' },
          { name: 'input',           type: 'TEXT',      pk: false, nullable: false, default: '',               fk: null,                        notes: 'stdin input' },
          { name: 'expected_output', type: 'TEXT',      pk: false, nullable: false, default: '',               fk: null,                        notes: 'Expected stdout' },
          { name: 'is_hidden',       type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null,                        notes: 'Hidden from students?' },
          { name: 'order_index',     type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,                        notes: 'Test case run order' },
          { name: 'created_at',      type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                        notes: '' },
        ],
      },
      {
        tableName: 'coding_submissions',
        prismaModel: 'CodingSubmission',
        description: 'Student code submissions for practice problems',
        columns: [
          { name: 'submission_id',    type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                        notes: 'Primary Key' },
          { name: 'problem_id',       type: 'INT',       pk: false, nullable: false, default: '',               fk: 'coding_problems.problem_id', notes: 'FK → coding_problems (CASCADE)' },
          { name: 'student_id',       type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',             notes: 'FK → users' },
          { name: 'language',         type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,                        notes: 'e.g. python, java, javascript' },
          { name: 'code',             type: 'TEXT',      pk: false, nullable: false, default: '',               fk: null,                        notes: 'Submitted source code' },
          { name: 'status',           type: 'VARCHAR',   pk: false, nullable: false, default: 'pending',        fk: null,                        notes: 'pending|running|accepted|wrong_answer|time_limit|runtime_error|compilation_error' },
          { name: 'execution_time',   type: 'FLOAT',     pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: 'ms' },
          { name: 'memory_used',      type: 'FLOAT',     pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: 'KB' },
          { name: 'test_cases_passed',type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,                        notes: '' },
          { name: 'total_test_cases', type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,                        notes: '' },
          { name: 'output',           type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: 'Actual stdout for debugging' },
          { name: 'error_message',    type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,                        notes: '' },
          { name: 'submitted_at',     type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                        notes: '' },
        ],
      },
      {
        tableName: 'problem_tags',
        prismaModel: 'ProblemTag',
        description: 'Tags for categorizing coding problems (e.g. arrays, dp, graphs)',
        columns: [
          { name: 'tag_id', type: 'INT',     pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null, notes: 'Primary Key' },
          { name: 'name',   type: 'VARCHAR', pk: false, nullable: false, default: '',               fk: null, notes: 'UNIQUE. e.g. "dynamic programming"' },
          { name: 'slug',   type: 'VARCHAR', pk: false, nullable: false, default: '',               fk: null, notes: 'UNIQUE. URL-friendly' },
        ],
      },
      {
        tableName: 'problem_tag_map',
        prismaModel: 'ProblemTagMap',
        description: 'Many-to-many junction: Problems ↔ Tags',
        columns: [
          { name: 'problem_id', type: 'INT', pk: true, nullable: false, default: '', fk: 'coding_problems.problem_id', notes: 'Composite PK + FK → coding_problems' },
          { name: 'tag_id',     type: 'INT', pk: true, nullable: false, default: '', fk: 'problem_tags.tag_id',        notes: 'Composite PK + FK → problem_tags' },
        ],
      },
      {
        tableName: 'user_practice_stats',
        prismaModel: 'UserPracticeStats',
        description: 'Gamification: XP, level, streak, and badges per user',
        columns: [
          { name: 'id',              type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,            notes: 'Primary Key' },
          { name: 'userId',          type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id', notes: 'UNIQUE FK → users' },
          { name: 'xp',              type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,            notes: 'Total experience points' },
          { name: 'level',           type: 'INT',       pk: false, nullable: false, default: '1',              fk: null,            notes: '1–6 computed level' },
          { name: 'current_streak',  type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,            notes: 'Current consecutive daily solve streak' },
          { name: 'longest_streak',  type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,            notes: 'All-time best streak' },
          { name: 'last_solved_at',  type: 'TIMESTAMP', pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: 'Timestamp of most recent solve' },
          { name: 'total_solved',    type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,            notes: 'Total distinct problems solved' },
          { name: 'easy_solved',     type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,            notes: '' },
          { name: 'medium_solved',   type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,            notes: '' },
          { name: 'hard_solved',     type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,            notes: '' },
          { name: 'badges',          type: 'TEXT',      pk: false, nullable: false, default: '[]',             fk: null,            notes: 'JSON array of earned badge IDs' },
          { name: 'created_at',      type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
          { name: 'updated_at',      type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
        ],
      },
      {
        tableName: 'daily_challenges',
        prismaModel: 'DailyChallenge',
        description: 'One featured coding challenge per day (gives 2× XP)',
        columns: [
          { name: 'id',         type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                        notes: 'Primary Key' },
          { name: 'problem_id', type: 'INT',       pk: false, nullable: false, default: '',               fk: 'coding_problems.problem_id', notes: 'FK → coding_problems' },
          { name: 'date',       type: 'TIMESTAMP', pk: false, nullable: false, default: '',               fk: null,                        notes: 'UNIQUE. Midnight of the challenge day' },
          { name: 'created_at', type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                        notes: '' },
        ],
      },
      {
        tableName: 'lab_sessions',
        prismaModel: 'LabSession',
        description: 'Online compiler sessions — saved/shared code snippets',
        columns: [
          { name: 'id',          type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,            notes: 'Primary Key' },
          { name: 'user_id',     type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: 'users.user_id', notes: 'NULL for guest sessions' },
          { name: 'language',    type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'python | javascript | java | c | cpp | go | rust | php | typescript' },
          { name: 'code',        type: 'TEXT',      pk: false, nullable: false, default: '',               fk: null,            notes: 'Source code content' },
          { name: 'output',      type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: 'Last run output (stdout/stderr)' },
          { name: 'share_slug',  type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: 'UNIQUE. 10-char hex share link slug' },
          { name: 'created_at',  type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
        ],
      },
    ],
  },

  // ─── Sheet 6: Community ───
  {
    sheetName: '6. Community & Chat',
    sheetColor: 'DB2777', // pink
    tables: [
      {
        tableName: 'discussions',
        prismaModel: 'Discussion',
        description: 'Forum-style discussion threads (optionally linked to a problem)',
        columns: [
          { name: 'discussion_id', type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                        notes: 'Primary Key' },
          { name: 'title',         type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,                        notes: '' },
          { name: 'content',       type: 'TEXT',      pk: false, nullable: false, default: '',               fk: null,                        notes: '' },
          { name: 'author_id',     type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',             notes: 'FK → users' },
          { name: 'problem_id',    type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: 'coding_problems.problem_id', notes: 'Optional FK → coding_problems' },
          { name: 'upvotes',       type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,                        notes: '' },
          { name: 'is_resolved',   type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null,                        notes: '' },
          { name: 'created_at',    type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                        notes: '' },
          { name: 'updated_at',    type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                        notes: '' },
        ],
      },
      {
        tableName: 'discussion_replies',
        prismaModel: 'DiscussionReply',
        description: 'Threaded replies to discussions (supports nested replies)',
        columns: [
          { name: 'reply_id',       type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                            notes: 'Primary Key' },
          { name: 'discussion_id',  type: 'INT',       pk: false, nullable: false, default: '',               fk: 'discussions.discussion_id',     notes: 'FK → discussions (CASCADE)' },
          { name: 'author_id',      type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',                 notes: 'FK → users' },
          { name: 'content',        type: 'TEXT',      pk: false, nullable: false, default: '',               fk: null,                            notes: '' },
          { name: 'upvotes',        type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,                            notes: '' },
          { name: 'parent_reply_id',type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: 'discussion_replies.reply_id',   notes: 'Self-ref FK for nested replies' },
          { name: 'created_at',     type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                            notes: '' },
          { name: 'updated_at',     type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                            notes: '' },
        ],
      },
      {
        tableName: 'conversations',
        prismaModel: 'Conversation',
        description: 'Direct message or group chat containers',
        columns: [
          { name: 'conversation_id', type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null, notes: 'Primary Key' },
          { name: 'is_group',        type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null, notes: 'Group chat or 1-1?' },
          { name: 'title',           type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null, notes: 'Group name (optional for DMs)' },
          { name: 'created_at',      type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null, notes: '' },
          { name: 'updated_at',      type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null, notes: '' },
        ],
      },
      {
        tableName: 'conversation_participants',
        prismaModel: 'ConversationParticipant',
        description: 'Users joined in a conversation (many-to-many)',
        columns: [
          { name: 'id',              type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                                    notes: 'Primary Key' },
          { name: 'conversation_id', type: 'INT',       pk: false, nullable: false, default: '',               fk: 'conversations.conversation_id',         notes: 'UNIQUE with user_id. FK → conversations (CASCADE)' },
          { name: 'user_id',         type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',                         notes: 'FK → users (CASCADE)' },
          { name: 'joined_at',       type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                                    notes: '' },
        ],
      },
      {
        tableName: 'messages',
        prismaModel: 'Message',
        description: 'Chat messages within a conversation',
        columns: [
          { name: 'message_id',      type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                            notes: 'Primary Key' },
          { name: 'conversation_id', type: 'INT',       pk: false, nullable: false, default: '',               fk: 'conversations.conversation_id', notes: 'FK → conversations (CASCADE)' },
          { name: 'sender_id',       type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',                 notes: 'FK → users (CASCADE)' },
          { name: 'content',         type: 'TEXT',      pk: false, nullable: false, default: '',               fk: null,                            notes: 'Message text' },
          { name: 'is_read',         type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null,                            notes: '' },
          { name: 'created_at',      type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                            notes: '' },
        ],
      },
      {
        tableName: 'follows',
        prismaModel: 'Follow',
        description: 'User follow relationships (social network)',
        columns: [
          { name: 'id',           type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,            notes: 'Primary Key' },
          { name: 'follower_id',  type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id', notes: 'UNIQUE with following_id. FK → users (CASCADE)' },
          { name: 'following_id', type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id', notes: 'FK → users (CASCADE)' },
          { name: 'created_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
        ],
      },
      {
        tableName: 'follow_requests',
        prismaModel: 'FollowRequest',
        description: 'Pending follow requests (for private accounts)',
        columns: [
          { name: 'id',           type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,            notes: 'Primary Key' },
          { name: 'requester_id', type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id', notes: 'UNIQUE with target_id. FK → users (CASCADE)' },
          { name: 'target_id',    type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id', notes: 'FK → users (CASCADE)' },
          { name: 'status',       type: 'VARCHAR',   pk: false, nullable: false, default: 'pending',        fk: null,            notes: 'pending | approved | rejected' },
          { name: 'created_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
          { name: 'updated_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
        ],
      },
    ],
  },

  // ─── Sheet 7: System ───
  {
    sheetName: '7. System & Misc',
    sheetColor: '374151', // gray
    tables: [
      {
        tableName: 'notifications',
        prismaModel: 'Notification',
        description: 'In-app notifications pushed to users',
        columns: [
          { name: 'notification_id', type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,            notes: 'Primary Key' },
          { name: 'user_id',         type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id', notes: 'FK → users' },
          { name: 'type',            type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'enrollment | assignment | grade | discussion | system' },
          { name: 'title',           type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: '' },
          { name: 'message',         type: 'TEXT',      pk: false, nullable: false, default: '',               fk: null,            notes: '' },
          { name: 'link',            type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: 'Optional deep-link URL' },
          { name: 'is_read',         type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null,            notes: '' },
          { name: 'created_at',      type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
        ],
      },
      {
        tableName: 'audit_logs',
        prismaModel: 'AuditLog',
        description: 'System audit trail for important events',
        columns: [
          { name: 'log_id',    type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,            notes: 'Primary Key' },
          { name: 'event',     type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'e.g. LOGIN, SUBMIT, DELETE' },
          { name: 'source',    type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'e.g. auth.service, admin.controller' },
          { name: 'status',    type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'Success | Blocked | Error' },
          { name: 'user_id',   type: 'INT',       pk: false, nullable: true,  default: 'NULL',           fk: 'users.user_id', notes: 'Optional FK → users' },
          { name: 'timestamp', type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
        ],
      },
      {
        tableName: 'resources',
        prismaModel: 'Resource',
        description: 'Free downloadable resources (PDFs, ZIPs, videos)',
        columns: [
          { name: 'resource_id',  type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,            notes: 'Primary Key' },
          { name: 'title',        type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: '' },
          { name: 'description',  type: 'TEXT',      pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: '' },
          { name: 'category',     type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'Documents | Code | Videos' },
          { name: 'type',         type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'pdf | zip | video | etc.' },
          { name: 'size_bytes',   type: 'INT',       pk: false, nullable: false, default: '',               fk: null,            notes: 'File size' },
          { name: 'file_url',     type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'Local path or CDN URL' },
          { name: 'downloads',    type: 'INT',       pk: false, nullable: false, default: '0',              fk: null,            notes: 'Download counter' },
          { name: 'uploader_id',  type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id', notes: 'FK → users' },
          { name: 'created_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
        ],
      },
      {
        tableName: 'reports',
        prismaModel: 'Report',
        description: 'User-submitted reports on resources',
        columns: [
          { name: 'report_id',   type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,                    notes: 'Primary Key' },
          { name: 'resource_id', type: 'INT',       pk: false, nullable: false, default: '',               fk: 'resources.resource_id', notes: 'FK → resources' },
          { name: 'reporter_id', type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id',         notes: 'FK → users' },
          { name: 'reason',      type: 'TEXT',      pk: false, nullable: false, default: '',               fk: null,                    notes: '' },
          { name: 'status',      type: 'VARCHAR',   pk: false, nullable: false, default: 'pending',        fk: null,                    notes: 'pending | reviewed | dismissed | actioned' },
          { name: 'created_at',  type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,                    notes: '' },
        ],
      },
      {
        tableName: 'edu_documents',
        prismaModel: 'EduDocument',
        description: 'Educational documents processed for RAG AI assistant',
        columns: [
          { name: 'id',           type: 'INT',       pk: true,  nullable: false, default: 'AUTO_INCREMENT', fk: null,            notes: 'Primary Key' },
          { name: 'title',        type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: '' },
          { name: 'topic',        type: 'VARCHAR',   pk: false, nullable: true,  default: 'NULL',           fk: null,            notes: '' },
          { name: 'file_url',     type: 'VARCHAR',   pk: false, nullable: false, default: '',               fk: null,            notes: 'Path to uploaded document' },
          { name: 'size_bytes',   type: 'INT',       pk: false, nullable: false, default: '',               fk: null,            notes: '' },
          { name: 'is_processed', type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',          fk: null,            notes: 'Vectorized into RAG index?' },
          { name: 'uploader_id',  type: 'INT',       pk: false, nullable: false, default: '',               fk: 'users.user_id', notes: 'FK → users' },
          { name: 'created_at',   type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',          fk: null,            notes: '' },
        ],
      },
      {
        tableName: 'contact_submissions',
        prismaModel: 'ContactSubmission',
        description: 'Public contact form submissions',
        columns: [
          { name: 'id',         type: 'VARCHAR',   pk: true,  nullable: false, default: 'cuid()',  fk: null, notes: 'Primary Key (CUID)' },
          { name: 'full_name',  type: 'VARCHAR',   pk: false, nullable: false, default: '',        fk: null, notes: '' },
          { name: 'email',      type: 'VARCHAR',   pk: false, nullable: false, default: '',        fk: null, notes: '' },
          { name: 'subject',    type: 'VARCHAR',   pk: false, nullable: false, default: '',        fk: null, notes: '' },
          { name: 'message',    type: 'TEXT',      pk: false, nullable: false, default: '',        fk: null, notes: '' },
          { name: 'is_read',    type: 'BOOLEAN',   pk: false, nullable: false, default: 'false',  fk: null, notes: 'Read by admin?' },
          { name: 'created_at', type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',  fk: null, notes: '' },
          { name: 'updated_at', type: 'TIMESTAMP', pk: false, nullable: false, default: 'NOW()',  fk: null, notes: '' },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────────

const COLORS = {
  // Header row
  headerBg:      'FF1E293B', // dark slate
  headerText:    'FFFFFFFF',

  // Table title row
  tableTitleBg:  'FF0F172A', // darker slate
  tableTitleText:'FFFFFFFF',

  // Column header row
  colHeaderBg:   'FF334155',
  colHeaderText: 'FFF1F5F9',

  // PK row
  pkBg:          'FFFFF8E1', // light gold
  pkText:        'FF78350F',

  // FK row
  fkBg:          'FFE0F2FE', // light blue
  fkText:        'FF0C4A6E',

  // Required row
  requiredBg:    'FFF8FAFC', // off-white
  requiredText:  'FF1E293B',

  // Nullable row
  nullableBg:    'FFFFFFFF', // pure white
  nullableText:  'FF475569',

  // Legend
  legendBg:      'FFFFF3CD',

  // Borders
  border:        'FFCBD5E1',
};

// ─────────────────────────────────────────────────────────────
// GENERATOR
// ─────────────────────────────────────────────────────────────

async function generateExcel() {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'TaskPro System';
  workbook.lastModifiedBy = 'Schema Generator';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ── Create TOC sheet ──
  const tocSheet = workbook.addWorksheet('📋 Table of Contents', {
    properties: { tabColor: { argb: 'FF6366F1' } },
  });

  tocSheet.columns = [
    { key: 'sheet',   width: 28 },
    { key: 'table',   width: 32 },
    { key: 'model',   width: 26 },
    { key: 'cols',    width: 10 },
    { key: 'desc',    width: 60 },
  ];

  // TOC Title
  tocSheet.mergeCells('A1:E1');
  const tocTitle = tocSheet.getCell('A1');
  tocTitle.value = '🗄️  TaskPro — Complete Database Schema Reference';
  tocTitle.font = { name: 'Calibri', bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  tocTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
  tocTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  tocSheet.getRow(1).height = 36;

  tocSheet.mergeCells('A2:E2');
  const tocSubtitle = tocSheet.getCell('A2');
  tocSubtitle.value = `Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}  |  Database: PostgreSQL  |  ORM: Prisma`;
  tocSubtitle.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' }, italic: true };
  tocSubtitle.alignment = { horizontal: 'center' };
  tocSheet.getRow(2).height = 20;

  // TOC column headers
  const tocHeaders = ['Sheet', 'Table Name (SQL)', 'Prisma Model', 'Columns', 'Description'];
  const tocHeaderRow = tocSheet.getRow(4);
  tocHeaders.forEach((h, i) => {
    const cell = tocHeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF6366F1' } } };
  });
  tocSheet.getRow(4).height = 22;

  let tocRow = 5;
  let tableCount = 0;

  // ── Process each domain sheet ──
  for (const domain of SCHEMA) {
    const sheet = workbook.addWorksheet(domain.sheetName, {
      properties: { tabColor: { argb: 'FF' + domain.sheetColor } },
      views: [{ showGridLines: true }],
    });

    // Sheet columns
    sheet.columns = [
      { key: 'name',     width: 28 },
      { key: 'type',     width: 14 },
      { key: 'pk',       width: 8  },
      { key: 'nullable', width: 10 },
      { key: 'default',  width: 22 },
      { key: 'fk',       width: 32 },
      { key: 'notes',    width: 50 },
    ];

    // Sheet domain header
    sheet.mergeCells('A1:G1');
    const domainHeader = sheet.getCell('A1');
    domainHeader.value = `${domain.sheetName.replace(/^\d+\. /, '').toUpperCase()}  —  TaskPro Database Schema`;
    domainHeader.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    domainHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + domain.sheetColor } };
    domainHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 32;

    let currentRow = 3;

    for (const table of domain.tables) {
      tableCount++;

      // ── Table Title ──
      sheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const titleCell = sheet.getCell(`A${currentRow}`);
      titleCell.value = `📌  ${table.tableName}   (Prisma: ${table.prismaModel})`;
      titleCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + domain.sheetColor } };
      titleCell.alignment = { vertical: 'middle', indent: 1 };
      sheet.getRow(currentRow).height = 24;
      currentRow++;

      // ── Description ──
      sheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const descCell = sheet.getCell(`A${currentRow}`);
      descCell.value = `ℹ  ${table.description}`;
      descCell.font = { italic: true, size: 10, color: { argb: 'FF475569' } };
      descCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      descCell.alignment = { vertical: 'middle', indent: 2 };
      sheet.getRow(currentRow).height = 18;
      currentRow++;

      // ── Column Headers ──
      const colHeaders = ['Column Name', 'Data Type', 'PK', 'Nullable', 'Default', 'Foreign Key', 'Notes'];
      const headerRow = sheet.getRow(currentRow);
      colHeaders.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true, size: 10, color: { argb: COLORS.colHeaderText } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.colHeaderBg } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top:    { style: 'thin', color: { argb: COLORS.border } },
          bottom: { style: 'thin', color: { argb: COLORS.border } },
          left:   { style: 'thin', color: { argb: COLORS.border } },
          right:  { style: 'thin', color: { argb: COLORS.border } },
        };
      });
      sheet.getRow(currentRow).height = 20;
      currentRow++;

      // ── Column rows ──
      for (const col of table.columns) {
        const row = sheet.getRow(currentRow);
        const isPk = col.pk;
        const isFk = !!col.fk;

        let bgArgb;
        let textArgb;

        if (isPk) {
          bgArgb  = 'FFFFF8E1'; textArgb = 'FF78350F';
        } else if (isFk) {
          bgArgb  = 'FFE0F2FE'; textArgb = 'FF0C4A6E';
        } else if (!col.nullable) {
          bgArgb  = 'FFF8FAFC'; textArgb = 'FF1E293B';
        } else {
          bgArgb  = 'FFFFFFFF'; textArgb = 'FF64748B';
        }

        const rowData = [
          col.name,
          col.type,
          isPk ? '🔑 YES' : '',
          col.nullable ? '✓ NULL' : '✗ NOT NULL',
          col.default || '',
          col.fk || '',
          col.notes || '',
        ];

        rowData.forEach((val, i) => {
          const cell = row.getCell(i + 1);
          cell.value = val;
          cell.font  = { size: 10, color: { argb: textArgb }, bold: isPk };
          cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
          cell.alignment = { vertical: 'middle', wrapText: i === 6 };
          cell.border = {
            top:    { style: 'hair', color: { argb: COLORS.border } },
            bottom: { style: 'hair', color: { argb: COLORS.border } },
            left:   { style: 'thin', color: { argb: COLORS.border } },
            right:  { style: 'thin', color: { argb: COLORS.border } },
          };
        });

        // Monospace font for column name
        row.getCell(1).font = { name: 'Courier New', size: 10, color: { argb: textArgb }, bold: isPk };
        row.getCell(2).font = { name: 'Courier New', size: 10, color: { argb: textArgb } };
        row.getCell(currentRow).height = 18;

        currentRow++;
      }

      // ── Legend for this table ──
      const legendItems = ['🔑 = Primary Key  |  🔵 = Foreign Key  |  ✗ NOT NULL = Required  |  ✓ NULL = Optional'];
      sheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const legendCell = sheet.getCell(`A${currentRow}`);
      legendCell.value = legendItems[0];
      legendCell.font = { size: 9, italic: true, color: { argb: 'FF94A3B8' } };
      legendCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      legendCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(currentRow).height = 16;
      currentRow++;

      // ── Spacer ──
      currentRow += 2;

      // ── Add to TOC ──
      const tocDataRow = tocSheet.getRow(tocRow);
      const sheetLink = domain.sheetName;
      tocDataRow.getCell(1).value = sheetLink;
      tocDataRow.getCell(2).value = table.tableName;
      tocDataRow.getCell(3).value = table.prismaModel;
      tocDataRow.getCell(4).value = table.columns.length;
      tocDataRow.getCell(5).value = table.description;

      // Color the TOC row by domain
      [1, 2, 3, 4, 5].forEach(ci => {
        const cell = tocDataRow.getCell(ci);
        const isEvenRow = (tocRow % 2 === 0);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEvenRow ? 'FFF8FAFC' : 'FFFFFFFF' } };
        cell.font = { size: 10, color: { argb: 'FF1E293B' } };
        cell.border = {
          bottom: { style: 'hair', color: { argb: COLORS.border } },
          right:  { style: 'hair', color: { argb: COLORS.border } },
        };
        cell.alignment = { vertical: 'middle' };
      });
      tocDataRow.getCell(4).alignment = { horizontal: 'center' };
      tocDataRow.height = 18;
      tocRow++;
    }

    // Freeze top row + column A
    sheet.views = [{ state: 'frozen', xSplit: 1, ySplit: 4 }];
  }

  // TOC summary footer
  tocSheet.mergeCells(`A${tocRow + 1}:E${tocRow + 1}`);
  const summary = tocSheet.getCell(`A${tocRow + 1}`);
  summary.value = `Total: ${tableCount} tables  |  Database: PostgreSQL  |  Schema Version: 2.0  |  ORM: Prisma 6.x`;
  summary.font = { bold: true, size: 11, color: { argb: 'FF1E40AF' } };
  summary.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
  summary.alignment = { horizontal: 'center', vertical: 'middle' };
  tocSheet.getRow(tocRow + 1).height = 24;

  // Freeze TOC header
  tocSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 5 }];

  // ── Write file ──
  const outputPath = path.join('D:', 'TaskPro', 'TaskPro_Database_Schema.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`\n✅ Excel schema generated: ${outputPath}`);
  console.log(`   📊 ${tableCount} tables across ${SCHEMA.length} domain sheets + 1 TOC sheet`);
}

generateExcel().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
