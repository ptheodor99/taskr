import { AlertCircle, RotateCw } from 'lucide-react';

export function ErrorBanner({ message, onRetry }) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-banner" role="alert">
      <AlertCircle size={18} aria-hidden="true" />
      <span>{message}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          <RotateCw size={15} aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </div>
  );
}
