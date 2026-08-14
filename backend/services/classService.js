import Class from '../models/Class.js';

const normalizeClassData = (className, classDescription, status = 'ACTIVE') => {
  const trimmedClassName = String(className || '').trim();
  const trimmedDescription = String(classDescription || '').trim();

  if (!trimmedClassName) {
    const error = new Error('Class name is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!trimmedDescription) {
    const error = new Error('Class description is required.');
    error.statusCode = 400;
    throw error;
  }

  const allowedStatus = ['ACTIVE', 'INACTIVE'];
  const normalizedStatus = String(status || 'ACTIVE').trim().toUpperCase();

  if (!allowedStatus.includes(normalizedStatus)) {
    const error = new Error('Status must be ACTIVE or INACTIVE.');
    error.statusCode = 400;
    throw error;
  }

  return {
    className: trimmedClassName,
    class_description: trimmedDescription,
    status: normalizedStatus,
  };
};

export const createClassRecord = async ({ className, class_description, status }) => {
  const payload = normalizeClassData(className, class_description, status);

  const existingClass = await Class.findOne({
    where: { className: payload.className },
  });

  if (existingClass) {
    const error = new Error('A class with this name already exists.');
    error.statusCode = 409;
    throw error;
  }

  return Class.create(payload);
};
