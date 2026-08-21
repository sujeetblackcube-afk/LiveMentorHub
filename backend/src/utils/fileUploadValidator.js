import multer from 'multer';
import path from 'path';

// ----------------------------------------------------
// 1. FILE TYPE PRESETS & ALLOWED MIME TYPES
// ----------------------------------------------------
export const FILE_PRESETS = {
  // Profile pictures, thumbnails, banners
  IMAGE: {
    name: 'IMAGE',
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    errorMessage: 'Only image files (.jpg, .jpeg, .png, .webp) under 5MB are allowed.',
  },

  // ID proofs, qualification certificates, experience documents
  DOCUMENT: {
    name: 'DOCUMENT',
    extensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    errorMessage: 'Only PDF or image documents (.pdf, .jpg, .jpeg, .png) under 10MB are allowed.',
  },

  // Excel / CSV spreadsheet bulk data
  SPREADSHEET: {
    name: 'SPREADSHEET',
    extensions: ['.xls', '.xlsx', '.csv'],
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
    ],
    maxSizeBytes: 15 * 1024 * 1024, // 15 MB
    errorMessage: 'Only spreadsheet files (.xls, .xlsx, .csv) under 15MB are allowed.',
  },

  // Syllabus documents
  SYLLABUS: {
    name: 'SYLLABUS',
    extensions: ['.pdf', '.doc', '.docx'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSizeBytes: 15 * 1024 * 1024, // 15 MB
    errorMessage: 'Only PDF or Word documents (.pdf, .doc, .docx) under 15MB are allowed.',
  },

  // Notes, homework, study media, assignments (PDF, Office, Zip, Media)
  STUDY_MEDIA: {
    name: 'STUDY_MEDIA',
    extensions: [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.zip', '.mp4', '.mp3', '.jpg', '.jpeg', '.png', '.webp',
    ],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-zip-compressed',
      'video/mp4',
      'audio/mpeg',
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
    maxSizeBytes: 50 * 1024 * 1024, // 50 MB
    errorMessage: 'Only supported study media (PDF, Word, Excel, PowerPoint, Zip, MP4, MP3, Images) under 50MB are allowed.',
  },
};

// ----------------------------------------------------
// 2. REUSABLE FILE FILTER FUNCTION
// ----------------------------------------------------
export const createFileFilter = (presetConfig) => {
  return (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();

    const isExtensionValid = presetConfig.extensions.includes(fileExt);
    const isMimeTypeValid = presetConfig.mimeTypes.includes(mimeType);

    if (isExtensionValid && isMimeTypeValid) {
      return cb(null, true);
    }

    const error = new Error(presetConfig.errorMessage);
    error.statusCode = 400;
    return cb(error, false);
  };
};

// ----------------------------------------------------
// 3. MULTER FACTORY UTILITY
// ----------------------------------------------------
export const createUploadMiddleware = (presetConfig, customOptions = {}) => {
  const storage = customOptions.storage || multer.memoryStorage();

  return multer({
    storage,
    limits: {
      fileSize: customOptions.maxSizeBytes || presetConfig.maxSizeBytes,
    },
    fileFilter: createFileFilter(presetConfig),
  });
};

// ----------------------------------------------------
// 4. PRE-CONFIGURED READY-TO-USE UPLOAD INSTANCES
// ----------------------------------------------------
// For Profile Photos, Course Thumbnails, Banners
export const uploadImage = createUploadMiddleware(FILE_PRESETS.IMAGE);

// For Verification Documents, Certificates, ID Proofs
export const uploadDocument = createUploadMiddleware(FILE_PRESETS.DOCUMENT);

// For Excel / CSV Bulk Data Imports
export const uploadSpreadsheet = createUploadMiddleware(FILE_PRESETS.SPREADSHEET);

// For Syllabus PDF / Word files
export const uploadSyllabus = createUploadMiddleware(FILE_PRESETS.SYLLABUS);

// For Course Notes, Assignments, Homework Media
export const uploadStudyMedia = createUploadMiddleware(FILE_PRESETS.STUDY_MEDIA);

// ----------------------------------------------------
// 5. HELPER VALIDATOR FUNCTION FOR IN-MEMORY BUFFERS
// ----------------------------------------------------
export const validateFileBuffer = (filename, mimeType, bufferSize, presetConfig) => {
  const fileExt = path.extname(filename).toLowerCase();

  if (!presetConfig.extensions.includes(fileExt)) {
    return { isValid: false, error: `Invalid file extension '${fileExt}'. ${presetConfig.errorMessage}` };
  }

  if (mimeType && !presetConfig.mimeTypes.includes(mimeType.toLowerCase())) {
    return { isValid: false, error: `Invalid MIME type '${mimeType}'. ${presetConfig.errorMessage}` };
  }

  if (bufferSize > presetConfig.maxSizeBytes) {
    return { isValid: false, error: `File size exceeds max limit of ${presetConfig.maxSizeBytes / (1024 * 1024)}MB.` };
  }

  return { isValid: true };
};
