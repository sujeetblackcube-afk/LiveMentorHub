import sequelize from '../config/db.js';
// Import models
import Student from './Student.js';
import Teacher from './Teacher.js';
import Parent from './Parent.js';
import SuperAdmin from './SuperAdmin.js';
import Login from './Login.js';
import Class from './Class.js';
import Subject from './Subject.js';
import Course from './Course.js';
import Enrollment from './Enrollment.js';
import Banner from './Banner.js';
import Content from './Content.js';
import ContactUs from './ContactUs.js';
import LiveSession from './Livesession.js';
import NotesMedia from './NotesMedia.js';
import Doubt from './Doubt.js';
import Assignment from './Assignment.js';
import AssignmentSubmission from './AssignmentSubmission.js';
import Questions from './Question.js';
import Tests from './Test.js';
import TestSubmissions from './TestSubmission.js';
import Subscription from './Subscription.js';
import SubscriptionBuyed from './SubscriptionBuyed.js';
import TeacherPayout from './Payout.js';
import Notification from './Notifications.js';
import Syllabus from './Syllabus.js';


// Define associations - Test has many TestSubmissions
TestSubmissions.belongsTo(Tests, { foreignKey: 'testId', as: 'test' });
Tests.hasMany(TestSubmissions, { foreignKey: 'testId' });

// Syllabus belongs to Course
Syllabus.belongsTo(Course, { foreignKey: 'courseCode' });

// Course has one Syllabus
Course.hasOne(Syllabus, { 
  foreignKey: 'courseCode', 
  sourceKey: 'courseCode', 
  as: 'syllabus' 
});

// Student has many Enrollments
Student.hasMany(Enrollment, { foreignKey: 'studentId', sourceKey: 'studentId', as: 'enrollments' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId', targetKey: 'studentId' });

// Sync models function
const syncModels = async () => {
  try {
    // Use false in production! Only use true during development/debugging locally
    await sequelize.sync(); // Removed { alter: true } to stop remote connection crashes!
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

export {
  Student,
  Teacher,
  Parent,
  SuperAdmin,
  Login,
  Class,
  Subject,
  Course,
  Enrollment,
  Banner,
  Content,
  ContactUs,
  LiveSession,
  NotesMedia,
  Doubt,
  Assignment,
  AssignmentSubmission,
  Questions,
  Tests,
  TestSubmissions,
  Subscription,
  SubscriptionBuyed,
  TeacherPayout,
  Notification,
  Syllabus,
  syncModels
};
