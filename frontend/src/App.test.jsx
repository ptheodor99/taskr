import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

const stats = {
  total: 1,
  today: 0,
  inProgress: 1,
  done: 0
};

const sampleTask = {
  id: 1,
  title: 'Write release notes',
  description: 'Summarize the final polish',
  status: 'In Progress',
  priority: 'High',
  dueDate: '2026-05-02',
  completedAt: null,
  createdAt: '2026-04-29T12:00:00.000Z',
  updatedAt: '2026-04-29T12:00:00.000Z'
};

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body ? JSON.stringify(body) : '')
  };
}

function setupFetch({ tasks = [], statsResponse = stats } = {}) {
  const fetchMock = vi.fn(async (url, options = {}) => {
    const method = options.method ?? 'GET';
    const path = String(url);

    if (path.startsWith('/api/tasks/stats') && method === 'GET') {
      return jsonResponse({ data: statsResponse });
    }

    if (path.startsWith('/api/tasks') && method === 'GET') {
      return jsonResponse({ data: tasks });
    }

    if (path === '/api/tasks' && method === 'POST') {
      return jsonResponse({ data: { id: 99, ...JSON.parse(options.body) } }, 201);
    }

    if (/\/api\/tasks\/\d+$/.test(path) && method === 'PUT') {
      return jsonResponse({ data: { ...sampleTask, ...JSON.parse(options.body) } });
    }

    if (/\/api\/tasks\/\d+\/done$/.test(path) && method === 'PATCH') {
      return jsonResponse({ data: { ...sampleTask, status: 'Done', completedAt: '2026-04-29T13:00:00.000Z' } });
    }

    if (/\/api\/tasks\/\d+$/.test(path) && method === 'DELETE') {
      return jsonResponse(null, 204);
    }

    return jsonResponse({ error: { message: 'Not found' } }, 404);
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('renders the empty state after loading', async () => {
    setupFetch({
      tasks: [],
      statsResponse: { total: 0, today: 0, inProgress: 0, done: 0 }
    });

    render(<App />);

    expect(screen.getByLabelText('Loading tasks')).toBeInTheDocument();
    expect(await screen.findByText('No tasks yet')).toBeInTheDocument();
  });

  it('validates the task form before creating', async () => {
    const fetchMock = setupFetch({ tasks: [] });
    const user = userEvent.setup();

    render(<App />);
    await screen.findByText('No tasks yet');

    await user.click(screen.getAllByRole('button', { name: /new task/i })[0]);
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
  });

  it('creates a task through the form', async () => {
    const fetchMock = setupFetch({ tasks: [] });
    const user = userEvent.setup();

    render(<App />);
    await screen.findByText('No tasks yet');

    await user.click(screen.getAllByRole('button', { name: /new task/i })[0]);
    const editor = within(screen.getByLabelText('Task editor'));
    await user.type(editor.getByLabelText(/title/i), 'Draft architecture notes');
    await user.selectOptions(editor.getByLabelText(/priority/i), 'High');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(true);
    });
  });

  it('renders tasks and applies filters', async () => {
    const fetchMock = setupFetch({ tasks: [sampleTask] });
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByText('Write release notes')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/^Status$/i), 'Done');

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('status=Done'))).toBe(true);
    });
  });

  it('supports complete and delete interactions', async () => {
    const fetchMock = setupFetch({ tasks: [sampleTask] });
    const user = userEvent.setup();

    render(<App />);

    await screen.findByText('Write release notes');
    await user.click(screen.getByRole('button', { name: /mark write release notes done/i }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'PATCH')).toBe(true);
    });

    await user.click(screen.getByRole('button', { name: /delete write release notes/i }));

    const dialog = screen.getByRole('dialog', { name: /delete task/i });
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(true);
    });
  });
});
