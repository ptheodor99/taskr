import { closeDatabase, getDatabase } from '../src/db/connection.js';
import { initDatabase } from '../src/db/migrate.js';
import { createTaskRepository } from '../src/repositories/taskRepository.js';

const database = getDatabase();
initDatabase(database);

const force = process.argv.includes('--force');

if (force) {
  database.prepare('DELETE FROM tasks').run();
}

const existing = database.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;

if (existing > 0) {
  console.log(`Seed skipped. Database already has ${existing} tasks. Use -- --force to replace them.`);
  closeDatabase();
  process.exit(0);
}

const repository = createTaskRepository(database);

const seedTasks = [
  {
    title: 'Plan the week',
    description: 'Review active projects and choose the highest leverage tasks.',
    status: 'Today',
    priority: 'High',
    dueDate: new Date().toISOString().slice(0, 10)
  },
  {
    title: 'Polish onboarding notes',
    description: 'Turn rough notes into a concise checklist for future setup.',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: null
  },
  {
    title: 'Clean up inbox',
    description: 'Process quick captures and assign status, priority, or due date.',
    status: 'Inbox',
    priority: 'Low',
    dueDate: null
  },
  {
    title: 'Archive completed planning task',
    description: 'Example completed task for the dashboard counter.',
    status: 'Done',
    priority: 'Medium',
    dueDate: null
  }
];

database.transaction(() => {
  for (const task of seedTasks) {
    repository.create(task);
  }
})();

closeDatabase();
console.log(`Seeded ${seedTasks.length} tasks.`);
