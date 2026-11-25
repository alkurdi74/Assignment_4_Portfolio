import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../config/config.js';
import contacts from './routes/contact.routes.js';
import projects from './routes/project.routes.js';
import educations from './routes/education.routes.js';
import users from './routes/user.routes.js';
import auth from './routes/auth.routes.js';
const app = express();
const clientBuild = fileURLToPath(new URL('../client/dist/', import.meta.url));
app.use(helmet());
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/contacts', contacts);
app.use('/api/projects', projects);
app.use('/api/qualifications', educations);
app.use('/api/educations', educations);
app.use('/api/users', users);
app.use('/auth', auth);
app.use('/api/auth', auth);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
// In production Render serves the built React app from the same origin as the API.
if (process.env.NODE_ENV === 'production') {
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Route not found.' }));
  app.use(express.static(clientBuild));
  app.get('/{*path}', (_req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
} else {
  app.get('/', (_req, res) => res.json({ message: 'Welcome to My Portfolio application.' }));
}
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((err, _req, res, _next) => {
  if (err.code === 11000) return res.status(409).json({ error: 'Email already exists.' });
  if (err.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(' ') });
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid field value.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  const status = err.status || 500;
  if (status >= 500) console.error(err.message);
  res.status(status).json({ error: status >= 500 ? 'Internal server error.' : err.message });
});
export default app;
