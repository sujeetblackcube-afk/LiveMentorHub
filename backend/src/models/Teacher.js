import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Course from './Course.js';

// 1. Core Teacher Identity Model
const Teacher = sequelize.define(
  "Teacher",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'user_id',
    },

    teacherId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      field: 'teacher_id',
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name',
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      field: 'email',
    },

    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'mobile',
    },

    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'whatsapp_number',
    },

    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: true,
      field: 'gender',
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'age',
    },

    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'date_of_birth',
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'address',
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'country',
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      field: 'latitude',
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      field: 'longitude',
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "APPROVED",
        "SUSPENDED",
        "TERMINATED"
      ),
      defaultValue: "PENDING",
      allowNull: false,
      field: 'status',
    },

    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: true,
      field: 'rating',
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified',
    },

    role: {
      type: DataTypes.STRING(20),
      defaultValue: "teacher",
      allowNull: false,
      field: 'role',
    },

    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'total_reviews',
    },
  },
  {
    tableName: "teachers",
    timestamps: true,
    getterMethods: {
      lattitude() { return this.latitude; },
    },
    setterMethods: {
      lattitude(val) { this.setDataValue('latitude', val); },
    },
    indexes: [
      { fields: ['user_id'] },
      { fields: ['email'] },
      { fields: ['mobile'] },
      { fields: ['status'] },
      { fields: ['is_verified'] },
    ],
  }
);

// 2. Teacher Qualification Sub-Model
const TeacherQualification = sequelize.define(
  "TeacherQualification",
  {
    teacherId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Teacher,
        key: 'teacher_id',
      },
      field: 'teacher_id',
    },
    qualification: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'qualification',
    },
    specializations: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'specializations',
    },
    totalTeachingExperience: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "In Years",
      field: 'total_teaching_experience',
    },
    relevantExperience: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'relevant_experience',
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'profile_image',
    },
    idProofDocument: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'id_proof_document',
    },
    qualificationCertificates: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'qualification_certificates',
    },
    experienceCertificates: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'experience_certificates',
    },
  },
  {
    tableName: "teacher_qualifications",
    timestamps: true,
    indexes: [
      { fields: ['teacher_id'] },
    ],
  }
);

// 3. Teacher Teaching Preference Sub-Model
const TeacherTeachingPreference = sequelize.define(
  "TeacherTeachingPreference",
  {
    teacherId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Teacher,
        key: 'teacher_id',
      },
      field: 'teacher_id',
    },
    subjectsCanTeach: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'subjects_can_teach',
    },
    classesCanTeach: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'classes_can_teach',
    },
    preferredCurriculum: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'preferred_curriculum',
    },
    languagesCanTeach: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'languages_can_teach',
    },
    teachingMode: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'teaching_mode',
    },
    batchSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'batch_size',
    },
    teachingPlatforms: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'teaching_platforms',
    },
    availability: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'availability',
    },
    individualClassFeesPerHour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'individual_class_fees_per_hour',
    },
    batchClassFeesPerStudentMonth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'batch_class_fees_per_student_month',
    },
    preferredPaymentModes: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'preferred_payment_modes',
    },
    preferredStudentLocation: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'preferred_student_location',
    },
  },
  {
    tableName: "teacher_teaching_preferences",
    timestamps: true,
    indexes: [
      { fields: ['teacher_id'] },
      { name: 'teacher_subjects_gin', using: 'gin', fields: ['subjects_can_teach'] },
      { name: 'teacher_classes_gin', using: 'gin', fields: ['classes_can_teach'] }
    ],
  }
);

// 4. Teacher Hardware Profile Sub-Model
const TeacherHardwareProfile = sequelize.define(
  "TeacherHardwareProfile",
  {
    teacherId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Teacher,
        key: 'teacher_id',
      },
      field: 'teacher_id',
    },
    internetConnectivity: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'internet_connectivity',
    },
    hasLaptopDesktop: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_laptop_desktop',
    },
    hasWebcam: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_webcam',
    },
    hasDigitalWritingPad: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_digital_writing_pad',
    },
    hasHeadset: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_headset',
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'otp',
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'otp_expires_at',
    },
    otpVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'otp_verified',
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash',
    },
    playerId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'player_id',
    },
    deviceType: {
      type: DataTypes.ENUM("android", "ios", "web"),
      allowNull: true,
      field: 'device_type',
    },
  },
  {
    tableName: "teacher_hardware_profiles",
    timestamps: true,
    indexes: [
      { fields: ['teacher_id'] },
      { fields: ['player_id'] },
      { fields: ['device_type'] },
    ],
  }
);

// 5. Teacher Course Assignment Junction Model
const TeacherCourseAssignment = sequelize.define(
  "TeacherCourseAssignment",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    teacherId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Teacher,
        key: 'teacher_id',
      },
      field: 'teacher_id',
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Course,
        key: 'course_code',
      },
      field: 'course_code',
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'assigned_at',
    },
  },
  {
    tableName: "teacher_course_assignments",
    timestamps: true,
    indexes: [
      { unique: true, fields: ['teacher_id', 'course_code'] },
      { fields: ['course_code'] }
    ],
  }
);

// 6. Teacher Notifications Sub-Model
const TeacherNotification = sequelize.define('TeacherNotification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  teacherId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Teacher,
      key: 'teacher_id',
    },
    field: 'teacher_id',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'title',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message',
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'GENERAL',
    field: 'type',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read',
  }
}, {
  tableName: 'teacher_notifications',
  timestamps: true,
  indexes: [
    { fields: ['teacher_id', 'is_read'] },
    { fields: ['type'] }
  ]
});

// 7. Teacher Login History Sub-Model
const TeacherLogin = sequelize.define('TeacherLogin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  teacherId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Teacher,
      key: 'teacher_id',
    },
    field: 'teacher_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'email',
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mobile',
  },
  deviceType: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: true,
    field: 'device_type',
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address',
  },
  attemptTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'attempt_time',
  },
  status: {
    type: DataTypes.ENUM('SUCCESS', 'FAILED'),
    allowNull: false,
    field: 'status',
  }
}, {
  tableName: 'teacher_logins',
  timestamps: true,
  indexes: [
    { fields: ['teacher_id', 'attempt_time'] }
  ]
});

// 8. Teacher Support Ticket Sub-Model
const TeacherSupportTicket = sequelize.define('TeacherSupportTicket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  teacherId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Teacher,
      key: 'teacher_id',
    },
    field: 'teacher_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'email',
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mobile',
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'subject',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'RESOLVED'),
    defaultValue: 'PENDING',
    field: 'status',
  }
}, {
  tableName: 'teacher_support_tickets',
  timestamps: true,
  indexes: [
    { fields: ['teacher_id'] },
    { fields: ['status'] }
  ]
});

export {
  TeacherQualification,
  TeacherTeachingPreference,
  TeacherHardwareProfile,
  TeacherCourseAssignment,
  TeacherNotification,
  TeacherLogin,
  TeacherSupportTicket
};

export default Teacher;