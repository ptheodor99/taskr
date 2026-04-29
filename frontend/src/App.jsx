import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createTask,
  deleteTask,
  getTaskStats,
  listTasks,
  markTaskDone,
  updateTask
} from './api/tasksApi.js';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import { DashboardCounters } from './components/DashboardCounters.jsx';
import { EmptyState } from './components/EmptyState.jsx';
import { ErrorBanner } from './components/ErrorBanner.jsx';
import { LoadingState } from './components/LoadingState.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { TaskCard } from './components/TaskCard.jsx';
import { TaskForm } from './components/TaskForm.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import { DEFAULT_FILTERS } from './utils/taskConstants.js';

const EMPTY_STATS = {
  total: 0,
  today: 0,
  inProgress: 0,
  done: 0
};

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [taskPendingDelete, setTaskPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasFilters = useMemo(() => {
    return Boolean(filters.search || filters.status !== 'All' || filters.priority !== 'All');
  }, [filters]);

  const loadData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      const [nextTasks, nextStats] = await Promise.all([
        listTasks(filters),
        getTaskStats()
      ]);
      setTasks(nextTasks);
      setStats(nextStats);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openNewTask = () => {
    setEditingTask(null);
    setIsEditorOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setEditingTask(null);
    setIsEditorOpen(false);
  };

  const handleSaveTask = async (payload) => {
    setIsSaving(true);

    try {
      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }

      closeEditor();
      await loadData({ silent: true });
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDone = async (task, done) => {
    try {
      await markTaskDone(task.id, done);
      await loadData({ silent: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskPendingDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteTask(taskPendingDelete.id);
      setTaskPendingDelete(null);
      await loadData({ silent: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = (status) => {
    setFilters((current) => ({ ...current, status }));
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeStatus={filters.status}
        onStatusChange={handleStatusChange}
        onNewTask={openNewTask}
        stats={stats}
      />

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Quick task management</p>
            <h2>Today's command center</h2>
          </div>
          <p className="header-copy">A focused place for the work in front of you.</p>
        </header>

        <DashboardCounters stats={stats} />
        <Toolbar filters={filters} onFiltersChange={setFilters} />
        <ErrorBanner message={error} onRetry={() => loadData()} />

        {isLoading && tasks.length === 0 ? (
          <LoadingState />
        ) : tasks.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onNewTask={openNewTask} />
        ) : (
          <section className={isLoading ? 'task-list muted' : 'task-list'} aria-label="Tasks">
            {tasks.map((task) => (
              <TaskCard
                task={task}
                key={task.id}
                onEdit={openEditTask}
                onDelete={setTaskPendingDelete}
                onToggleDone={handleToggleDone}
              />
            ))}
          </section>
        )}
      </main>

      <aside className={isEditorOpen ? 'editor-panel open' : 'editor-panel'} aria-label="Task editor">
        {isEditorOpen ? (
          <TaskForm
            task={editingTask}
            isSubmitting={isSaving}
            onCancel={closeEditor}
            onSubmit={handleSaveTask}
          />
        ) : (
          <div className="editor-placeholder">
            <p className="eyebrow">Ready</p>
            <h2>Select a task or create a new one.</h2>
          </div>
        )}
      </aside>

      <ConfirmDialog
        task={taskPendingDelete}
        isDeleting={isDeleting}
        onCancel={() => setTaskPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
