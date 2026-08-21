import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import sequelize from '../config/db.config.js';
import config from '../config/config.js';

// 1. Student Models (Consolidated in Student.js)
import Student, {
  StudentAcademicProfile,
  StudentTuitionPreference,
  StudentTechDetail,
  StudentNotification,
  StudentLogin,
  StudentSupportTicket
} from './Student.js';

// 2. Teacher Models (Consolidated in Teacher.js)
import Teacher, {
  TeacherQualification,
  TeacherTeachingPreference,
  TeacherHardwareProfile,
  TeacherCourseAssignment,
  TeacherNotification,
  TeacherLogin,
  TeacherSupportTicket
} from './Teacher.js';

// 3. Parent Models (Consolidated in Parent.js)
import Parent, {
  ParentTechDetail,
  ParentNotification,
  ParentLogin,
  ParentSupportTicket
} from './Parent.js';

// 4. SuperAdmin Models (Consolidated in SuperAdmin.js)
import SuperAdmin, {
  SuperAdminLogin
} from './SuperAdmin.js';

// 5. Course Models (Consolidated in Course.js)
import Course, {
  AcademicCourseDetail,
  NonAcademicCourseDetail
} from './Course.js';

// 6. Financial & Payment Models
import StudentPayment from './StudentPayment.js';
import TeacherSubscription from './TeacherSubscription.js';
import TeacherPayout from './Payout.js';
import Subscription from './Subscription.js';

// 7. Support & Notification Broadcast Models
import { BroadcastNotification } from './Notifications.js';
import { GuestSupportTicket } from './ContactUs.js';

// 8. Core System & Academic Learning Models
import Class from './Class.js';
import Subject from './Subject.js';
import Enrollment from './Enrollment.js';
import Banner from './Banner.js';
import Content from './Content.js';
import LiveSession from './Livesession.js';
import NotesMedia from './NotesMedia.js';
import Doubt from './Doubt.js';
import Assignment from './Assignment.js';
import AssignmentSubmission from './AssignmentSubmission.js';
import Questions from './Question.js';
import Tests from './Test.js';
import TestSubmissions from './TestSubmission.js';
import Syllabus from './Syllabus.js';
import Review from './Review.js';
import { StudentOtp, TeacherOtp, ParentOtp, AdminOtp, InstituteOtp } from './AuthOtp.js';
import { StudentToken, TeacherToken, ParentToken, AdminToken, InstituteToken } from './AuthToken.js';

// Backward compatibility aliases
const Order = StudentPayment;
const SubscriptionBuyed = TeacherSubscription;
const Login = StudentLogin;
const Notification = StudentNotification;
const ContactUs = GuestSupportTicket;

// =========================
// ASSOCIATIONS
// =========================

// Student Associations
Student.hasOne(StudentAcademicProfile, { foreignKey: 'studentId', as: 'academicProfile', onDelete: 'CASCADE' });
StudentAcademicProfile.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });

Student.hasOne(StudentTuitionPreference, { foreignKey: 'studentId', as: 'tuitionPreference', onDelete: 'CASCADE' });
StudentTuitionPreference.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });

Student.hasOne(StudentTechDetail, { foreignKey: 'studentId', as: 'techDetail', onDelete: 'CASCADE' });
StudentTechDetail.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });

Student.hasMany(StudentNotification, { foreignKey: 'studentId', as: 'notifications', onDelete: 'CASCADE' });
StudentNotification.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });

Student.hasMany(StudentLogin, { foreignKey: 'studentId', as: 'logins', onDelete: 'CASCADE' });
StudentLogin.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });

Student.hasMany(StudentSupportTicket, { foreignKey: 'studentId', as: 'supportTickets', onDelete: 'CASCADE' });
StudentSupportTicket.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });

// Teacher Associations
Teacher.hasOne(TeacherQualification, { foreignKey: 'teacherId', as: 'qualification', onDelete: 'CASCADE' });
TeacherQualification.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Teacher.hasOne(TeacherTeachingPreference, { foreignKey: 'teacherId', as: 'teachingPreference', onDelete: 'CASCADE' });
TeacherTeachingPreference.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Teacher.hasOne(TeacherHardwareProfile, { foreignKey: 'teacherId', as: 'hardwareProfile', onDelete: 'CASCADE' });
TeacherHardwareProfile.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Teacher.hasMany(TeacherCourseAssignment, { foreignKey: 'teacherId', as: 'courseAssignments', onDelete: 'CASCADE' });
TeacherCourseAssignment.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });
TeacherCourseAssignment.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });

Teacher.hasMany(TeacherNotification, { foreignKey: 'teacherId', as: 'notifications', onDelete: 'CASCADE' });
TeacherNotification.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Teacher.hasMany(TeacherLogin, { foreignKey: 'teacherId', as: 'logins', onDelete: 'CASCADE' });
TeacherLogin.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Teacher.hasMany(TeacherSupportTicket, { foreignKey: 'teacherId', as: 'supportTickets', onDelete: 'CASCADE' });
TeacherSupportTicket.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Teacher.hasMany(TeacherSubscription, { foreignKey: 'teacherId', as: 'subscriptions', onDelete: 'CASCADE' });
TeacherSubscription.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Teacher.hasMany(TeacherPayout, { foreignKey: 'teacherId', as: 'payouts', onDelete: 'CASCADE' });
TeacherPayout.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

// Parent Associations
Parent.hasOne(ParentTechDetail, { foreignKey: 'parentId', as: 'techDetail', onDelete: 'CASCADE' });
ParentTechDetail.belongsTo(Parent, { foreignKey: 'parentId', targetKey: 'parentId' });

Parent.hasMany(ParentNotification, { foreignKey: 'parentId', as: 'notifications', onDelete: 'CASCADE' });
ParentNotification.belongsTo(Parent, { foreignKey: 'parentId', targetKey: 'parentId' });

Parent.hasMany(ParentLogin, { foreignKey: 'parentId', as: 'logins', onDelete: 'CASCADE' });
ParentLogin.belongsTo(Parent, { foreignKey: 'parentId', targetKey: 'parentId' });

Parent.hasMany(ParentSupportTicket, { foreignKey: 'parentId', as: 'supportTickets', onDelete: 'CASCADE' });
ParentSupportTicket.belongsTo(Parent, { foreignKey: 'parentId', targetKey: 'parentId' });

Parent.hasMany(Student, { foreignKey: 'parentId', as: 'students', onDelete: 'CASCADE' });
Student.belongsTo(Parent, { foreignKey: 'parentId', targetKey: 'parentId' });

// SuperAdmin Associations
SuperAdmin.hasMany(SuperAdminLogin, { foreignKey: 'userId', as: 'logins', onDelete: 'CASCADE' });
SuperAdminLogin.belongsTo(SuperAdmin, { foreignKey: 'userId', targetKey: 'userId' });

// Class & Subject Associations
Class.hasMany(Subject, { foreignKey: 'forClass', sourceKey: 'className', as: 'subjects' });
Subject.belongsTo(Class, { foreignKey: 'forClass', targetKey: 'className' });

// Course, Academic & Subject Associations
Course.hasOne(AcademicCourseDetail, { foreignKey: 'courseCode', as: 'academicDetail', onDelete: 'CASCADE' });
AcademicCourseDetail.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });
AcademicCourseDetail.belongsTo(Class, { foreignKey: 'className', targetKey: 'className' });
AcademicCourseDetail.belongsTo(Subject, { foreignKey: 'subjectCode', targetKey: 'subjectCode' });

Course.hasOne(NonAcademicCourseDetail, { foreignKey: 'courseCode', as: 'nonAcademicDetail', onDelete: 'CASCADE' });
NonAcademicCourseDetail.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });

Course.hasOne(Syllabus, { foreignKey: 'courseCode', sourceKey: 'courseCode', as: 'syllabus', onDelete: 'CASCADE' });
Syllabus.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });

// Course Content & Learning Module Associations
Course.hasMany(NotesMedia, { foreignKey: 'courseCode', as: 'notesMedia', onDelete: 'CASCADE' });
NotesMedia.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });
NotesMedia.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Course.hasMany(Assignment, { foreignKey: 'courseCode', as: 'assignments', onDelete: 'CASCADE' });
Assignment.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });
Assignment.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignmentId', as: 'submissions', onDelete: 'CASCADE' });
AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignmentId', targetKey: 'id' });
AssignmentSubmission.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });
AssignmentSubmission.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Course.hasMany(Tests, { foreignKey: 'courseCode', as: 'tests', onDelete: 'CASCADE' });
Tests.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });
Tests.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Tests.hasMany(TestSubmissions, { foreignKey: 'testId', as: 'submissions', onDelete: 'CASCADE' });
TestSubmissions.belongsTo(Tests, { foreignKey: 'testId', targetKey: 'id' });
TestSubmissions.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });

Course.hasMany(LiveSession, { foreignKey: 'courseCode', as: 'liveSessions', onDelete: 'CASCADE' });
LiveSession.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });
LiveSession.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Course.hasMany(Doubt, { foreignKey: 'courseCode', as: 'doubts', onDelete: 'CASCADE' });
Doubt.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });
Doubt.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });
Doubt.belongsTo(Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

Course.hasMany(Review, { foreignKey: 'courseCode', sourceKey: 'courseCode', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode', as: 'course' });
Student.hasMany(Review, { foreignKey: 'studentId', sourceKey: 'studentId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId', as: 'student' });

// Enrollment & Payment Associations
Student.hasMany(Enrollment, { foreignKey: 'studentId', sourceKey: 'studentId', as: 'enrollments', onDelete: 'CASCADE' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });

Enrollment.hasMany(StudentPayment, { foreignKey: 'enrollmentCode', as: 'payments', onDelete: 'CASCADE' });
StudentPayment.belongsTo(Enrollment, { foreignKey: 'enrollmentCode', targetKey: 'enrollmentCode' });
StudentPayment.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });
StudentPayment.belongsTo(Course, { foreignKey: 'courseCode', targetKey: 'courseCode' });

// =========================
// SMART SYNC & HASH HELPER
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HASH_FILE = path.join(__dirname, '.models_hash.json');

const getModelsHash = () => {
  try {
    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.js') && f !== 'index.js')
      .sort();

    let combinedContent = '';
    for (const file of files) {
      const filePath = path.join(__dirname, file);
      const stat = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      combinedContent += `${file}:${stat.mtimeMs}:${content.length}:${content}`;
    }

    return crypto.createHash('md5').update(combinedContent).digest('hex');
  } catch (err) {
    return null;
  }
};

const syncModels = async () => {
  try {
    const dbSyncSetting = (config.DB_SYNC || 'auto').toString().toLowerCase();

    if (dbSyncSetting === 'false') {
      console.log('ℹ️ Database sync skipped (DB_SYNC=false in .env)');
      return;
    }

    const currentHash = getModelsHash();
    let lastSavedHash = null;

    if (fs.existsSync(HASH_FILE)) {
      try {
        const hashData = JSON.parse(fs.readFileSync(HASH_FILE, 'utf8'));
        lastSavedHash = hashData.hash;
      } catch (e) {
        lastSavedHash = null;
      }
    }

    const modelsChanged = !lastSavedHash || lastSavedHash !== currentHash;

    if (dbSyncSetting === 'auto' && !modelsChanged && !config.DB_SYNC_FORCE && !config.DB_SYNC_ALTER) {
      console.log('ℹ️ Models folder unchanged. Skipping database sync (DB_SYNC=auto).');
      return;
    }

    if (dbSyncSetting === 'auto' && modelsChanged) {
      console.log('🔄 Model changes detected in models folder. Synchronizing database...');
    } else {
      console.log('🔄 Synchronizing database models...');
    }

    const options = {};
    if (config.DB_SYNC_FORCE) {
      options.force = true;
    } else if (config.DB_SYNC_ALTER) {
      options.alter = true;
    }

    await sequelize.sync(options);

    if (currentHash) {
      fs.writeFileSync(HASH_FILE, JSON.stringify({ hash: currentHash, syncedAt: new Date().toISOString() }, null, 2));
    }

    console.log(`✅ Database connected and models synced successfully! ${config.DB_SYNC_FORCE ? '(FORCE RESET)' : config.DB_SYNC_ALTER ? '(ALTER SCHEMAS)' : ''}`);
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

export {
  Student,
  StudentAcademicProfile,
  StudentTuitionPreference,
  StudentTechDetail,
  StudentNotification,
  StudentLogin,
  StudentSupportTicket,
  Teacher,
  TeacherQualification,
  TeacherTeachingPreference,
  TeacherHardwareProfile,
  TeacherCourseAssignment,
  TeacherNotification,
  TeacherLogin,
  TeacherSupportTicket,
  Parent,
  ParentTechDetail,
  ParentNotification,
  ParentLogin,
  ParentSupportTicket,
  SuperAdmin,
  SuperAdminLogin,
  AcademicCourseDetail,
  NonAcademicCourseDetail,
  StudentPayment,
  TeacherSubscription,
  TeacherPayout,
  Subscription,
  Order,
  SubscriptionBuyed,
  Login,
  Notification,
  ContactUs,
  BroadcastNotification,
  GuestSupportTicket,
  Class,
  Subject,
  Course,
  Enrollment,
  Banner,
  Content,
  LiveSession,
  NotesMedia,
  Doubt,
  Assignment,
  AssignmentSubmission,
  Questions,
  Tests,
  TestSubmissions,
  Syllabus,
  Review,
  StudentOtp,
  TeacherOtp,
  ParentOtp,
  AdminOtp,
  InstituteOtp,
  StudentToken,
  TeacherToken,
  ParentToken,
  AdminToken,
  InstituteToken,
  syncModels
};