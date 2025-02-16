const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('💥 Uncaught Exception! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<db_password>', process.env.PASSWORD);

mongoose
  .connect(DB)
  .then(() => console.log('database connected'))
  .catch((err) => console.log(err.message, err.stack));

const server = app.listen(process.env.PORT, () => {
  console.log('Server listening on port 3000');
});

process.on('unhandledRejection', (err) => {
  console.log('🔥 Unhandled Rejection! Shutting down...');
  console.log(err.name, err.message);
  console.error(err.stack);
  server.close(() => {
    console.log('Server closed');
    process.exit(1);
  });
});
