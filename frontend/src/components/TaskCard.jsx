import { Calendar, Check, Edit3, Trash2 } from 'lucide-react';
import { priorityTone } from '../utils/taskConstants.js';

function formatDate(value) {
  if (!value) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${value}T00:00:00`));
}

export function TaskCard({ task, onEdit, onDelete, onToggleDone }) {
  const isDone = task.status === 'Done';

  return (
    <article className={isDone ? 'task-card done' : 'task-card'}>
      <button
        className={isDone ? 'complete-button active' : 'complete-button'}
        type="button"
        aria-label={isDone ? `Mark ${task.title} not done` : `Mark ${task.title} done`}
        onClick={() => onToggleDone(task, !isDone)}
      >
        {isDone ? <Check size={16} aria-hidden="true" /> : null}
      </button>

      <div className="task-body">
        <div className="task-card-header">
          <div>
            <h3>{task.title}</h3>
            {task.description ? <p>{task.description}</p> : null}
          </div>
          <span className={`priority-pill ${priorityTone[task.priority]}`}>{task.priority}</span>
        </div>

        <div className="task-meta">
          <span>{task.status}</span>
          <span>
            <Calendar size={14} aria-hidden="true" />
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>

      <div className="card-actions">
        <button className="icon-button" type="button" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}>
          <Edit3 size={17} aria-hidden="true" />
        </button>
        <button className="icon-button danger" type="button" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}>
          <Trash2 size={17} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
