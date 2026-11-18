import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import booksRouter from './routes/books.js';
import usersRouter from './routes/users.js';
import transactionsRouter from './routes/transactions.js';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(corsOrigin ? { origin: corsOrigin } : {}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/transactions', transactionsRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});