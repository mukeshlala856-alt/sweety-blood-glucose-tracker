const VALID_TIME_SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

const validateGlucoseValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return 'Please enter a glucose value.';
  }

  const num = Number(value);
  if (!Number.isInteger(num) || num < 40 || num > 600) {
    return 'Value must be between 40 and 600 mg/dl.';
  }

  return null;
};

const validateReadingDate = (dateString) => {
  if (!dateString) {
    return 'Please select a date.';
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return 'Invalid date format. Expected YYYY-MM-DD.';
  }

  const inputDate = new Date(`${dateString}T00:00:00`);
  if (isNaN(inputDate.getTime())) {
    return 'Invalid date.';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate > today) {
    return 'Date cannot be in the future.';
  }

  return null;
};

const validateTimeSlot = (slot) => {
  if (!slot || !VALID_TIME_SLOTS.includes(slot)) {
    return `Invalid time slot. Allowed slots: ${VALID_TIME_SLOTS.join(', ')}`;
  }
  return null;
};

module.exports = {
  VALID_TIME_SLOTS,
  validateGlucoseValue,
  validateReadingDate,
  validateTimeSlot,
};
