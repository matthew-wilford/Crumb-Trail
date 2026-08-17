const sequelize = require("../config/connection");
const User = require("./User");
const Restaurant = require("./Restaurant");
const Review = require("./Review");

Restaurant.hasMany(Review, {
  foreignKey: "restaurant_id",
  as: "reviews",
  onDelete: "CASCADE",
});
Review.belongsTo(Restaurant, {
  foreignKey: "restaurant_id",
  as: "restaurant",
});

module.exports = { sequelize, User, Restaurant, Review };
