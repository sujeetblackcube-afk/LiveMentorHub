// config/db.js
import pkg from 'sequelize';
const { Sequelize } = pkg;
import config from './config.js';

const sequelizeOptions = {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeout: 60000,
    ssl: config.DB_SSL
      ? {
          require: true,
          rejectUnauthorized: false,
        }
      : false,
  },
};

let sequelize;
if (config.NODE_ENV === 'production') {
  if (config.DATABASE_URL) {
    sequelize = new Sequelize(config.DATABASE_URL, sequelizeOptions);
  } else {
    sequelize = new Sequelize(
      config.DB_NAME,
      config.DB_USER,
      config.DB_PASSWORD,
      {
        ...sequelizeOptions,
        host: config.DB_HOST,
        port: config.DB_PORT,
      }
    );
  }
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '../database.sqlite',
    logging: false,
  });
}

export default sequelize;
