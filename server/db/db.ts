import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: '127.0.0.1',
  username: 'root',
  password: 'password',
  database: 'jeopardyDB',
});

// Define the Game model
const Game = sequelize.define('game', {
  number_of_players: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.STRING,
  },
});

// Define the Player model
const Player = sequelize.define('player', {
  //
  name: {
    type: DataTypes.STRING,
  },
  score: {
    type: DataTypes.INTEGER,
  },
});

// Define the Category model
const Category = sequelize.define('category', {
  category_name: {
    type: DataTypes.STRING,
  },
  double_jeopardy: {
    type: DataTypes.BOOLEAN,
  },
});

// Define the Clue model
const Clue = sequelize.define('clue', {
  clue: {
    type: DataTypes.STRING,
  },
  value: {
    type: DataTypes.INTEGER,
  },
  daily_double: {
    type: DataTypes.BOOLEAN,
  },
  answer: {
    type: DataTypes.STRING,
  },
  has_been_answered: {
    type: DataTypes.BOOLEAN,
  },
});

// Associations
Game.hasMany(Player, { foreignKey: 'game_id' });
Player.belongsTo(Game, { foreignKey: 'game_id' });

Category.belongsTo(Game, { foreignKey: 'game_id' });
Game.hasMany(Category, { foreignKey: 'game_id' });

Category.hasMany(Clue, { foreignKey: 'category_id' });
Clue.belongsTo(Category, { foreignKey: 'category_id' });

sequelize.sync();

// Export models and sequelize instance
export { sequelize, Game, Player, Category, Clue };
