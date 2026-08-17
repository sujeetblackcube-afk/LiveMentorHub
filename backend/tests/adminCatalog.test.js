import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import sequelize from '../config/db.config.js';
import ClassModel from '../models/Class.js';
import SubjectModel from '../models/Subject.js';
import CourseModel from '../models/Course.js';
import EnrollmentModel from '../models/Enrollment.js';
import TeacherModel from '../models/Teacher.js';
import StudentModel from '../models/Student.js';
import {
  getClassStats,
  getClassHierarchy,
  getCoursesBySubjectCode,
  getCourseParticipants,
  updateCourseDetails,
} from '../services/adminCatalogService.js';

before(async () => {
  await sequelize.sync({ force: true });

  await ClassModel.create({
    id: 1,
    className: 'Grade 10',
    class_description: 'Secondary school',
    status: 'ACTIVE',
  });

  await SubjectModel.create({
    id: 1,
    subjectName: 'Physics',
    subjectCode: 'PHY01',
    ForClass: 'Grade 10',
    status: 'ACTIVE',
    description: 'Motion and forces',
    language: 'English',
  });

  await CourseModel.create({
    id: 1,
    courseCode: 'COURSE-101',
    courseName: 'Intro to Mechanics',
    courseType: 'academic',
    courseDescription: 'Force and motion basics',
    difficulty: 'Beginner',
    mrp: 100,
    discountedprice: 80,
    status: 'Active',
    totalenrollment: 2,
    courseDuration: 12,
    classname: 'Grade 10',
    subject: 'Physics',
    subjectCode: 'PHY01',
    totalReviews: 0,
    rating: 4.8,
  });

  await CourseModel.create({
    id: 2,
    courseCode: 'COURSE-102',
    courseName: 'Thermodynamics Basics',
    courseType: 'academic',
    courseDescription: 'Heat and energy basics',
    difficulty: 'Intermediate',
    mrp: 120,
    discountedprice: 95,
    status: 'Active',
    totalenrollment: 1,
    courseDuration: 14,
    classname: 'Grade 10',
    subject: 'Physics',
    subjectCode: 'PHY01',
    totalReviews: 0,
    rating: 4.5,
  });

  await StudentModel.create({
    userId: 1,
    name: 'Alice Student',
    email: 'alice@example.com',
    mobile: '9999999999',
    studentId: 'STU-001',
    parentName: 'Parent One',
    parentEmail: 'parent1@example.com',
    parentMobile: '8888888888',
    passwordHash: 'hash',
    address: 'A',
    country: 'India',
    parentId: 'PARENT-001',
  });

  await StudentModel.create({
    userId: 2,
    name: 'Bob Student',
    email: 'bob@example.com',
    mobile: '9898989898',
    studentId: 'STU-002',
    parentName: 'Parent Two',
    parentEmail: 'parent2@example.com',
    parentMobile: '7777777777',
    passwordHash: 'hash2',
    address: 'B',
    country: 'India',
    parentId: 'PARENT-002',
  });

  await TeacherModel.create({
    userId: 1,
    teacherId: 'TCH-001',
    name: 'Dr. Jane',
    email: 'teacher@example.com',
    mobile: '1234567890',
    address: 'C',
    country: 'India',
    passwordHash: 'hash',
    courseCode: ['COURSE-101'],
  });

  await EnrollmentModel.create({
    id: 1,
    enrollmentCode: 'ENR-001',
    studentId: 'STU-001',
    studentName: 'Alice Student',
    studentEmail: 'alice@example.com',
    courseName: 'Intro to Mechanics',
    courseCode: 'COURSE-101',
    coursePrice: 80,
    paymentStatus: 'PAID',
    status: 'APPROVED',
    progress: 40,
  });

  await EnrollmentModel.create({
    id: 2,
    enrollmentCode: 'ENR-002',
    studentId: 'STU-002',
    studentName: 'Bob Student',
    studentEmail: 'bob@example.com',
    courseName: 'Intro to Mechanics',
    courseCode: 'COURSE-101',
    coursePrice: 80,
    paymentStatus: 'PAID',
    status: 'APPROVED',
    progress: 65,
  });
});

test('returns class aggregate stats and hierarchy data', async () => {
  const stats = await getClassStats();

  assert.ok(stats.some((item) => item.className === 'Grade 10' && item.totalSubjects === 1 && item.totalCourses === 2 && item.totalEnrolledStudents === 2));

  const hierarchy = await getClassHierarchy(1);
  assert.equal(hierarchy.classId, 1);
  assert.equal(hierarchy.className, 'Grade 10');
  assert.equal(hierarchy.subjects[0].subjectCode, 'PHY01');
  assert.equal(hierarchy.subjects[0].courses[0].courseCode, 'COURSE-101');
  assert.equal(hierarchy.subjects[0].courses[0].enrolledStudentCount, 2);
});

test('returns subject courses and exact participant payloads', async () => {
  const subjectCourses = await getCoursesBySubjectCode('PHY01');
  assert.ok(subjectCourses.some((course) => course.courseCode === 'COURSE-101' && course.courseName === 'Intro to Mechanics'));

  const participants = await getCourseParticipants('COURSE-101');
  assert.ok(participants.teachers.some((teacher) => teacher.teacherId === 'TCH-001' && teacher.name === 'Dr. Jane'));
  assert.ok(participants.students.some((student) => student.studentId === 'STU-001' && student.name === 'Alice Student' && student.progressPercentage === 40));
});

test('updates course details while ignoring forbidden fields', async () => {
  const updated = await updateCourseDetails('COURSE-101', {
    courseCode: 'SHOULD-IGNORE',
    rating: 2.0,
    courseName: 'Updated Mechanics',
    courseDescription: 'Updated description',
    mrp: 150,
    discountedprice: 120,
    status: 'Inactive',
  });

  assert.equal(updated.courseCode, 'COURSE-101');
  assert.equal(updated.courseName, 'Updated Mechanics');
  assert.equal(updated.courseDescription, 'Updated description');
  assert.equal(String(updated.mrp), '150.00');
  assert.equal(String(updated.discountedprice), '120.00');
  assert.equal(updated.status, 'Inactive');
  assert.equal(updated.rating, 4.8);
});

after(async () => {
  await sequelize.close();
});
