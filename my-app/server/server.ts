import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes';
import { initDatabase } from './db_table';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

// Add this line to serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

initDatabase().then(() => {
  console.log('Database created');
}).catch((error) => {
  console.error('Error creating database:', error);
});



app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
