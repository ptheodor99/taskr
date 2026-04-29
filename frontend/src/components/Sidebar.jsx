import { CalendarDays, CheckCircle2, CircleDot, Inbox, Plus, Timer } from 'lucide-react';
import { STATUS_OPTIONS } from '../utils/taskConstants.js';

const statusIcons = {
  Inbox,
  Today: CalendarDays,
  'In Progress': Timer,
  Done: CheckCircle2
};

export function Sidebar({ activeStatus, onStatusChange, stats, onNewTask }) {
  return (
    <aside className="sidebar" aria-label="Task navigation">
      <div className="brand">
        <div className="brand-mark">
          <CircleDot size={20} aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">Local workspace</p>
          <h1>Taskr</h1>
        </div>
      </div>

      <button className="primary-action" type="button" onClick={onNewTask}>
        <Plus size={18} aria-hidden="true" />
        New task
      </button>

      <nav className="status-nav" aria-label="Task status">
        <button
          className={activeStatus === 'All' ? 'nav-item active' : 'nav-item'}
          type="button"
          onClick={() => onStatusChange('All')}
        >
          <Inbox size={17} aria-hidden="true" />
          <span>All</span>
          <strong>{stats.total}</strong>
        </button>
        {STATUS_OPTIONS.map((status) => {
          const Icon = statusIcons[status];
          const statKey = status === 'In Progress' ? 'inProgress' : status.toLowerCase();

          return (
            <button
              className={activeStatus === status ? 'nav-item active' : 'nav-item'}
              type="button"
              key={status}
              onClick={() => onStatusChange(status)}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{status}</span>
              <strong>{stats[statKey] ?? 0}</strong>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
