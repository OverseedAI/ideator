import { Router, type Router as RouterType } from "express";
import * as taskController from "../../controllers/taskController";
import { validate } from "../../middleware/validation";
import { authenticate } from "../../middleware/auth";

const router: RouterType = Router({ mergeParams: true }); // mergeParams to access :ideaId from parent router

// Get all tasks for an idea
router.get("/", authenticate, validate(taskController.ideaIdSchema), taskController.getIdeaTasks);

// Create a new task
router.post(
  "/",
  authenticate,
  validate(taskController.ideaIdSchema),
  validate(taskController.createTaskSchema),
  taskController.createTask
);

// Bulk create tasks
router.post(
  "/bulk",
  authenticate,
  validate(taskController.ideaIdSchema),
  validate(taskController.bulkCreateTasksSchema),
  taskController.bulkCreateTasks
);

// Update a task
router.put(
  "/:taskId",
  authenticate,
  validate(taskController.ideaIdSchema),
  validate(taskController.taskIdSchema),
  validate(taskController.updateTaskSchema),
  taskController.updateTask
);

// Delete a task
router.delete(
  "/:taskId",
  authenticate,
  validate(taskController.ideaIdSchema),
  validate(taskController.taskIdSchema),
  taskController.deleteTask
);

export default router;
