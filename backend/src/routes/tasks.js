import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';

export function createTasksRouter(taskService) {
  const router = Router();

  router.get('/', asyncHandler((request, response) => {
    response.json({ data: taskService.listTasks(request.query) });
  }));

  router.get('/stats', asyncHandler((request, response) => {
    response.json({ data: taskService.getStats() });
  }));

  router.get('/:id', asyncHandler((request, response) => {
    response.json({ data: taskService.getTask(request.params.id) });
  }));

  router.post('/', asyncHandler((request, response) => {
    response.status(201).json({ data: taskService.createTask(request.body) });
  }));

  router.put('/:id', asyncHandler((request, response) => {
    response.json({ data: taskService.updateTask(request.params.id, request.body) });
  }));

  router.patch('/:id/done', asyncHandler((request, response) => {
    response.json({ data: taskService.setTaskDone(request.params.id, request.body) });
  }));

  router.delete('/:id', asyncHandler((request, response) => {
    taskService.deleteTask(request.params.id);
    response.status(204).send();
  }));

  return router;
}
