import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Supabase Keep-Alive Endpoint (/api/cron/keepalive) as specified in PRD Section 9
app.get('/api/cron/keepalive', async (req: Request, res: Response) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  // Validate CRON_SECRET if set
  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}` && req.query.key !== cronSecret) {
      return res.status(401).json({ ok: false, error: 'Unauthorized: Invalid CRON_SECRET' });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let dbStatus = 'skipped_no_credentials';
  let latencyMs = 0;

  if (supabaseUrl && supabaseKey) {
    if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon') || supabaseKey.includes('your-service-role')) {
      dbStatus = 'skipped_placeholder_credentials (update .env with your real Supabase credentials)';
    } else {
      try {
        const startTime = Date.now();
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from('projects').select('id').limit(1);
        latencyMs = Date.now() - startTime;
        if (error) {
          dbStatus = `query_note: ${error.message}`;
        } else {
          dbStatus = `active (rows: ${data ? data.length : 0})`;
        }
      } catch (err: any) {
        dbStatus = `connection_error: ${err.message}`;
      }
    }
  }

  return res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    message: 'Supabase keep-alive ping processed successfully',
    supabase_status: dbStatus,
    latency_ms: latencyMs,
    environment: process.env.NODE_ENV || 'development'
  });
});

// General health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
