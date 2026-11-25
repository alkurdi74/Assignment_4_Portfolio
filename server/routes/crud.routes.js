import { Router } from 'express';
import { requireSignin, requireAdmin } from '../controllers/auth.controller.js';
export function crudRoutes(controller, { publicCreate = false, publicRead = false } = {}) {
  const router = Router();
  const read = publicRead ? [] : [requireSignin];
  const admin = [requireSignin, requireAdmin];
  router.route('/').get(...read, controller.list).post(...(publicCreate ? [] : admin), controller.create).delete(...admin, controller.removeAll);
  router.route('/:id').get(...read, controller.read).put(...admin, controller.update).delete(...admin, controller.remove);
  return router;
}
