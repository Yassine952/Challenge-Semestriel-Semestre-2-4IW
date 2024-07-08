// server/src/config/database.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('mydatabase', 'admin', 'password', {
  host: 'postgres',
  dialect: 'postgres',
});

export default sequelize;
