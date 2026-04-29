import { validationError } from './errors.js';

export const TASK_STATUSES = ['Inbox', 'Today', 'In Progress', 'Done'];
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'];
export const TASK_SORTS = ['newest', 'due', 'priority'];

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseTaskId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw validationError('Task id must be a positive integer');
  }

  return id;
}

function normalizeText(value, field, { required = false, maxLength }) {
  if (value === undefined || value === null) {
    if (required) {
      throw validationError(`${field} is required`);
    }

    return undefined;
  }

  if (typeof value !== 'string') {
    throw validationError(`${field} must be a string`);
  }

  const normalized = value.trim();

  if (required && normalized.length === 0) {
    throw validationError(`${field} is required`);
  }

  if (normalized.length > maxLength) {
    throw validationError(`${field} must be ${maxLength} characters or fewer`);
  }

  return normalized;
}

function normalizeEnum(value, field, allowedValues, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (!allowedValues.includes(value)) {
    throw validationError(`${field} must be one of: ${allowedValues.join(', ')}`);
  }

  return value;
}

function normalizeDueDate(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw validationError('dueDate must use YYYY-MM-DD format');
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw validationError('dueDate must be a valid calendar date');
  }

  return value;
}

export function validateTaskInput(input, { partial = false } = {}) {
  if (!isPlainObject(input)) {
    throw validationError('Request body must be a JSON object');
  }

  const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
  const unknownFields = Object.keys(input).filter((field) => !allowedFields.includes(field));

  if (unknownFields.length > 0) {
    throw validationError('Request body contains unknown fields', { fields: unknownFields });
  }

  const normalized = {};

  const title = normalizeText(input.title, 'title', {
    required: !partial,
    maxLength: MAX_TITLE_LENGTH
  });

  if (title !== undefined) {
    normalized.title = title;
  }

  const description = normalizeText(input.description, 'description', {
    required: false,
    maxLength: MAX_DESCRIPTION_LENGTH
  });

  if (description !== undefined) {
    normalized.description = description;
  } else if (!partial) {
    normalized.description = '';
  }

  const status = normalizeEnum(input.status, 'status', TASK_STATUSES, partial ? undefined : 'Inbox');
  if (status !== undefined) {
    normalized.status = status;
  }

  const priority = normalizeEnum(input.priority, 'priority', TASK_PRIORITIES, partial ? undefined : 'Medium');
  if (priority !== undefined) {
    normalized.priority = priority;
  }

  const dueDate = normalizeDueDate(input.dueDate);
  if (dueDate !== undefined) {
    normalized.dueDate = dueDate;
  } else if (!partial) {
    normalized.dueDate = null;
  }

  if (partial && Object.keys(normalized).length === 0) {
    throw validationError('At least one task field is required');
  }

  return normalized;
}

export function validateTaskQuery(query) {
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const status = query.status ? normalizeEnum(query.status, 'status', TASK_STATUSES, undefined) : undefined;
  const priority = query.priority ? normalizeEnum(query.priority, 'priority', TASK_PRIORITIES, undefined) : undefined;
  const sort = query.sort ? normalizeEnum(query.sort, 'sort', TASK_SORTS, 'newest') : 'newest';

  if (search.length > 100) {
    throw validationError('search must be 100 characters or fewer');
  }

  return {
    search,
    status,
    priority,
    sort
  };
}

export function validateDoneInput(input) {
  if (!isPlainObject(input)) {
    throw validationError('Request body must be a JSON object');
  }

  if (typeof input.done !== 'boolean') {
    throw validationError('done must be a boolean');
  }

  return input.done;
}
