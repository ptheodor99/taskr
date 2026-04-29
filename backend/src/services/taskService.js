import { notFoundError } from '../utils/errors.js';
import {
  parseTaskId,
  validateDoneInput,
  validateTaskInput,
  validateTaskQuery
} from '../utils/validators.js';

export function createTaskService(repository) {
  return {
    listTasks(query) {
      return repository.list(validateTaskQuery(query));
    },

    getTask(idValue) {
      const id = parseTaskId(idValue);
      const task = repository.findById(id);

      if (!task) {
        throw notFoundError('Task not found');
      }

      return task;
    },

    createTask(input) {
      return repository.create(validateTaskInput(input));
    },

    updateTask(idValue, input) {
      const id = parseTaskId(idValue);
      const task = repository.update(id, validateTaskInput(input, { partial: true }));

      if (!task) {
        throw notFoundError('Task not found');
      }

      return task;
    },

    setTaskDone(idValue, input) {
      const id = parseTaskId(idValue);
      const task = repository.setDone(id, validateDoneInput(input));

      if (!task) {
        throw notFoundError('Task not found');
      }

      return task;
    },

    deleteTask(idValue) {
      const id = parseTaskId(idValue);
      const deleted = repository.delete(id);

      if (!deleted) {
        throw notFoundError('Task not found');
      }
    },

    getStats() {
      return repository.stats();
    }
  };
}
