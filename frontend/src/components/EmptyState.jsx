import { ClipboardList, Plus } from 'lucide-react';

export function EmptyState({ hasFilters, onNewTask }) {
  return (
    <div className="empty-state">
      <ClipboardList size={34} aria-hidden="true" />
      <h2>{hasFilters ? 'No matching tasks' : 'No tasks yet'}</h2>
      <p>{hasFilters ? 'Adjust the search or filters to widen the view.' : 'Add your first task and give the day a place to land.'}</p>
      <button className="primary-action" type="button" onClick={onNewTask}>
        <Plus size={17} aria-hidden="true" />
        New task
      </button>
    </div>
  );
}
