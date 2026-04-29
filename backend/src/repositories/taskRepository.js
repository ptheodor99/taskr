const PRIORITY_ORDER_SQL = `
  CASE priority
    WHEN 'High' THEN 3
    WHEN 'Medium' THEN 2
    WHEN 'Low' THEN 1
    ELSE 0
  END
`;

function now() {
  return new Date().toISOString();
}

function mapTask(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function orderBy(sort) {
  if (sort === 'due') {
    return 'due_date IS NULL ASC, due_date ASC, created_at DESC, id DESC';
  }

  if (sort === 'priority') {
    return `${PRIORITY_ORDER_SQL} DESC, created_at DESC, id DESC`;
  }

  return 'created_at DESC, id DESC';
}

export function createTaskRepository(database) {
  const findByIdStatement = database.prepare('SELECT * FROM tasks WHERE id = ?');

  return {
    list(filters) {
      const where = [];
      const params = {};

      if (filters.status) {
        where.push('status = @status');
        params.status = filters.status;
      }

      if (filters.priority) {
        where.push('priority = @priority');
        params.priority = filters.priority;
      }

      if (filters.search) {
        where.push('(LOWER(title) LIKE @search OR LOWER(description) LIKE @search)');
        params.search = `%${filters.search.toLowerCase()}%`;
      }

      const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
      const statement = database.prepare(`
        SELECT *
        FROM tasks
        ${whereSql}
        ORDER BY ${orderBy(filters.sort)}
      `);

      return statement.all(params).map(mapTask);
    },

    findById(id) {
      return mapTask(findByIdStatement.get(id));
    },

    create(task) {
      const timestamp = now();
      const completedAt = task.status === 'Done' ? timestamp : null;
      const result = database.prepare(`
        INSERT INTO tasks (
          title,
          description,
          status,
          priority,
          due_date,
          completed_at,
          created_at,
          updated_at
        )
        VALUES (
          @title,
          @description,
          @status,
          @priority,
          @dueDate,
          @completedAt,
          @createdAt,
          @updatedAt
        )
      `).run({
        ...task,
        completedAt,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      return this.findById(result.lastInsertRowid);
    },

    update(id, task) {
      const updates = [];
      const params = { id, updatedAt: now() };

      if (task.title !== undefined) {
        updates.push('title = @title');
        params.title = task.title;
      }

      if (task.description !== undefined) {
        updates.push('description = @description');
        params.description = task.description;
      }

      if (task.status !== undefined) {
        updates.push('status = @status');
        updates.push('completed_at = @completedAt');
        params.status = task.status;
        params.completedAt = task.status === 'Done' ? params.updatedAt : null;
      }

      if (task.priority !== undefined) {
        updates.push('priority = @priority');
        params.priority = task.priority;
      }

      if (task.dueDate !== undefined) {
        updates.push('due_date = @dueDate');
        params.dueDate = task.dueDate;
      }

      updates.push('updated_at = @updatedAt');

      const result = database.prepare(`
        UPDATE tasks
        SET ${updates.join(', ')}
        WHERE id = @id
      `).run(params);

      return result.changes === 0 ? null : this.findById(id);
    },

    setDone(id, done) {
      const timestamp = now();
      const result = database.prepare(`
        UPDATE tasks
        SET
          status = @status,
          completed_at = @completedAt,
          updated_at = @updatedAt
        WHERE id = @id
      `).run({
        id,
        status: done ? 'Done' : 'Inbox',
        completedAt: done ? timestamp : null,
        updatedAt: timestamp
      });

      return result.changes === 0 ? null : this.findById(id);
    },

    delete(id) {
      const result = database.prepare('DELETE FROM tasks WHERE id = ?').run(id);
      return result.changes > 0;
    },

    stats() {
      const row = database.prepare(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'Today' THEN 1 ELSE 0 END) AS today,
          SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgress,
          SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) AS done
        FROM tasks
      `).get();

      return {
        total: row.total ?? 0,
        today: row.today ?? 0,
        inProgress: row.inProgress ?? 0,
        done: row.done ?? 0
      };
    }
  };
}
