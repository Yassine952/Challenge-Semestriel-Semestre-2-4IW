// server/src/config/database.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  host: 'postgres',
  dialect: 'postgres',
});

export default sequelize;
