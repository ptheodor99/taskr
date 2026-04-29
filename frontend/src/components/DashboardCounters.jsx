import { CalendarCheck, CheckCircle2, ListTodo, Timer } from 'lucide-react';

const counters = [
  { key: 'total', label: 'Total', icon: ListTodo },
  { key: 'today', label: 'Today', icon: CalendarCheck },
  { key: 'inProgress', label: 'In progress', icon: Timer },
  { key: 'done', label: 'Done', icon: CheckCircle2 }
];

export function DashboardCounters({ stats }) {
  return (
    <section className="counter-grid" aria-label="Dashboard counters">
      {counters.map(({ key, label, icon: Icon }) => (
        <div className="counter-tile" key={key}>
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
          <strong>{stats[key] ?? 0}</strong>
        </div>
      ))}
    </section>
  );
}
