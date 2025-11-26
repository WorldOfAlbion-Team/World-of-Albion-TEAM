// database.js
const { Sequelize, DataTypes } = require("sequelize");

// Render usa DATABASE_URL automáticamente cuando asignas el Environment Group
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Modelo que guardará los canales registrados por servidor
const GuildConfig = sequelize.define("GuildConfig", {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  channelId: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = { sequelize, GuildConfig };
