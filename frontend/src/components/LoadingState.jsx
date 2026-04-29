export function LoadingState() {
  return (
    <div className="task-list" aria-label="Loading tasks">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="task-card skeleton" key={index}>
          <span className="skeleton-dot" />
          <div className="skeleton-lines">
            <span />
            <span />
          </div>
        </div>
      ))}
    </div>
  );
}
