import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';

// 1. Core Student Identity Model
const Student = sequelize.define(
  "Student",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'user_id',
    },

    studentId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      field: 'student_id',
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
      unique: true,
      allowNull: false,
      field: 'mobile',
    },

    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: true,
      field: 'gender',
    },

    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'profile_image',
    },

    address: {
      type: DataTypes.STRING,
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

    parentId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'parent_id',
    },

    status: {
      type: DataTypes.ENUM("APPROVED", "SUSPENDED", "TERMINATED"),
      defaultValue: "APPROVED",
      allowNull: false,
      field: 'status',
    },

    role: {
      type: DataTypes.STRING(20),
      defaultValue: "student",
      allowNull: false,
      field: 'role',
    },
  },
  {
    tableName: "students",
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
      { fields: ['parent_id'] },
      { fields: ['status'] },
    ],
  }
);

// 2. Student Academic Profile Sub-Model
const StudentAcademicProfile = sequelize.define(
  "StudentAcademicProfile",
  {
    studentId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Student,
        key: 'student_id',
      },
      field: 'student_id',
    },
    schoolName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'school_name',
    },
    board: {
      type: DataTypes.ENUM("CBSE", "ICSE", "State Board", "IB", "Other"),
      allowNull: true,
      field: 'board',
    },
    classGrade: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'class_grade',
    },
    guardianRelationship: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'guardian_relationship',
    },
    lastExamPercentage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'last_exam_percentage',
    },
    areasOfImprovement: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'areas_of_improvement',
    },
    specialLearningNeeds: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'special_learning_needs',
    },
  },
  {
    tableName: "student_academic_profiles",
    timestamps: true,
    indexes: [
      { fields: ['student_id'] },
      { fields: ['board'] },
      { fields: ['class_grade'] },
    ],
  }
);

// 3. Student Tuition Preference Sub-Model
const StudentTuitionPreference = sequelize.define(
  "StudentTuitionPreference",
  {
    studentId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Student,
        key: 'student_id',
      },
      field: 'student_id',
    },
    subjectsRequired: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'subjects_required',
    },
    tuitionType: {
      type: DataTypes.ENUM("Individual", "Batch"),
      allowNull: true,
      field: 'tuition_type',
    },
    preferredTiming: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'preferred_timing',
    },
    preferredDays: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'preferred_days',
    },
  },
  {
    tableName: "student_tuition_preferences",
    timestamps: true,
    indexes: [
      { fields: ['student_id'] },
      { fields: ['tuition_type'] },
      { name: 'student_tuition_subjects_gin', using: 'gin', fields: ['subjects_required'] }
    ],
  }
);

// 4. Student Tech Detail Sub-Model
const StudentTechDetail = sequelize.define(
  "StudentTechDetail",
  {
    studentId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Student,
        key: 'student_id',
      },
      field: 'student_id',
    },
    deviceAvailable: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'device_available',
    },
    internetConnectivity: {
      type: DataTypes.ENUM("Stable", "Moderate", "Poor"),
      allowNull: true,
      field: 'internet_connectivity',
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
    activeToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'active_token',
    },
    isLoggedIn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_logged_in',
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
  },
  {
    tableName: "student_tech_details",
    timestamps: true,
    indexes: [
      { fields: ['student_id'] },
      { fields: ['player_id'] },
      { fields: ['device_type'] },
    ],
  }
);

// 5. Student Notifications Sub-Model
const StudentNotification = sequelize.define('StudentNotification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Student,
      key: 'student_id',
    },
    field: 'student_id',
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
  tableName: 'student_notifications',
  timestamps: true,
  indexes: [
    { fields: ['student_id', 'is_read'] },
    { fields: ['type'] }
  ]
});

// 6. Student Login History Sub-Model
const StudentLogin = sequelize.define('StudentLogin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Student,
      key: 'student_id',
    },
    field: 'student_id',
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
  tableName: 'student_logins',
  timestamps: true,
  indexes: [
    { fields: ['student_id', 'attempt_time'] }
  ]
});

// 7. Student Support Ticket Sub-Model
const StudentSupportTicket = sequelize.define('StudentSupportTicket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Student,
      key: 'student_id',
    },
    field: 'student_id',
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
  tableName: 'student_support_tickets',
  timestamps: true,
  indexes: [
    { fields: ['student_id'] },
    { fields: ['status'] }
  ]
});

export {
  StudentAcademicProfile,
  StudentTuitionPreference,
  StudentTechDetail,
  StudentNotification,
  StudentLogin,
  StudentSupportTicket
};

export default Student;