const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<db_password>', process.env.PASSWORD);

mongoose.connect(DB).then(() => console.log('database connected'));

app.listen(process.env.PORT, () => {
  console.log('Server listening on port 3000');
});
