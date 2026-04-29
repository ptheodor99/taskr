import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { PRIORITY_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from '../utils/taskConstants.js';

export function Toolbar({ filters, onFiltersChange }) {
  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <section className="toolbar" aria-label="Task controls">
      <label className="search-field">
        <Search size={17} aria-hidden="true" />
        <span className="sr-only">Search tasks</span>
        <input
          type="search"
          value={filters.search}
          placeholder="Search tasks"
          onChange={(event) => updateFilter('search', event.target.value)}
        />
      </label>

      <label className="select-field">
        <Filter size={16} aria-hidden="true" />
        <span>Status</span>
        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
          <option value="All">All</option>
          {STATUS_OPTIONS.map((status) => (
            <option value={status} key={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="select-field">
        <Filter size={16} aria-hidden="true" />
        <span>Priority</span>
        <select value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value)}>
          <option value="All">All</option>
          {PRIORITY_OPTIONS.map((priority) => (
            <option value={priority} key={priority}>
              {priority}
            </option>
          ))}
        </select>
      </label>

      <label className="select-field">
        <SlidersHorizontal size={16} aria-hidden="true" />
        <span>Sort</span>
        <select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}>
          {SORT_OPTIONS.map((sort) => (
            <option value={sort.value} key={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
