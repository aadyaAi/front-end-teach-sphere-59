
import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Code execution endpoint
app.post('/api/execute', async (req: Request, res: Response) => {
  const { code, language } = req.body;
  try {
    // Here you can implement code execution logic
    res.json({ output: 'Code execution successful', error: null });
  } catch (error) {
    res.status(500).json({ output: '', error: 'Code execution failed' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
