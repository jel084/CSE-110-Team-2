import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes';
import { initDatabase } from './db_table';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

initDatabase().then(() => {
  console.log('Database created');
}).catch((error) => {
  console.error('Error creating database:', error);
});

app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
