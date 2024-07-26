import dotenv from 'dotenv';
import express, { json } from 'express';
import { Server } from 'socket.io';
import ViteExpress from 'vite-express';
import { createClient } from './supabase';

dotenv.config();
const port = 5173;

const app = express();
app.use(json());

const server = ViteExpress.listen(app, port, () => console.log(`Server listening at http://localhost:${port}`));
const io = new Server(server);

// Socket IO connection info
io.on('connection', (socket) => {
  console.log('---A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('---User disconnected:', socket.id);
  });
});

app.get('/data', async (req, res) => {
  const supabase = createClient({ req, res });

  const { data: nodes, error: nodesError } = await supabase.from('nodes').select('*');
  const { data: edges, error: edgesError } = await supabase.from('edges').select('*');
  console.log('=== server fetched err?', edgesError, nodesError);
  res.json({
    nodes,
    edges,
  });
});

app.post('/sync', async (req, res) => {
  const supabase = createClient({ req, res });
  const socketId = req.headers['socket-id'];
  const { nodes, edges } = req.body;
  console.log('=== syncing from ', socketId, nodes, edges);
  let nodeError = null,
    edgeError = null;

  if (nodes?.length > 0) {
    const { error } = await supabase.from('nodes').upsert(nodes);
    nodeError = error;
  }

  if (edges?.length > 0) {
    const { error } = await supabase.from('edges').upsert(edges);
    edgeError = error;
  }

  if (nodeError || edgeError) {
    console.log('=== server sync err?', edgeError, nodeError);
    res.status(400).json({ error: nodeError || edgeError });
  } else {
    if (socketId) {
      io.except(socketId).emit('syncUpdate', { nodes, edges });
    }
    res.status(200).json({ message: 'Sync successful' });
  }
});
