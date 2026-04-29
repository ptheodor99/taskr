const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function readJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function request(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });
  const body = await readJson(response);

  if (!response.ok) {
    throw new ApiError(body?.error?.message ?? 'Request failed', response.status, body?.error?.details);
  }

  return body?.data ?? null;
}

function taskQuery(filters) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim());
  }

  if (filters.status && filters.status !== 'All') {
    params.set('status', filters.status);
  }

  if (filters.priority && filters.priority !== 'All') {
    params.set('priority', filters.priority);
  }

  if (filters.sort) {
    params.set('sort', filters.sort);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export function listTasks(filters) {
  return request(`/api/tasks${taskQuery(filters)}`);
}

export function getTaskStats() {
  return request('/api/tasks/stats');
}

export function createTask(task) {
  return request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task)
  });
}

export function updateTask(id, task) {
  return request(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task)
  });
}

export function markTaskDone(id, done) {
  return request(`/api/tasks/${id}/done`, {
    method: 'PATCH',
    body: JSON.stringify({ done })
  });
}

export function deleteTask(id) {
  return request(`/api/tasks/${id}`, {
    method: 'DELETE'
  });
}
