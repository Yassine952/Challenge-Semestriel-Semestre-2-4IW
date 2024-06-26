import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { indexRouter } from './routes/index.js';

const server = express();

server.use(cors());
server.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

server.use('/', indexRouter);

server.listen(process.env.PORT || 8000, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${process.env.PORT || 8000}`);
});
