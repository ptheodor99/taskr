export const STATUS_OPTIONS = ['Inbox', 'Today', 'In Progress', 'Done'];
export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'due', label: 'Due date' },
  { value: 'priority', label: 'Priority' }
];

export const DEFAULT_FILTERS = {
  search: '',
  status: 'All',
  priority: 'All',
  sort: 'newest'
};

export const EMPTY_TASK = {
  title: '',
  description: '',
  status: 'Inbox',
  priority: 'Medium',
  dueDate: ''
};

export const priorityTone = {
  Low: 'tone-low',
  Medium: 'tone-medium',
  High: 'tone-high'
};
