import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ task, isDeleting, onCancel, onConfirm }) {
  if (!task) {
    return null;
  }

  return (
    <div className="dialog-backdrop">
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <AlertTriangle size={26} aria-hidden="true" />
        <h2 id="delete-title">Delete task?</h2>
        <p>{task.title} will be removed permanently.</p>
        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button className="danger-button" type="button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
