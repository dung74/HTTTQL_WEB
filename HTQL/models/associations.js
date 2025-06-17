import db from "./index.js";

// 1 team has many member is user
db.users.belongsTo(db.teams, {
  foreignKey: "team_id",
});
db.teams.hasMany(db.users, {
  foreignKey: "team_id",
});

// user can be manager of team
db.users.hasOne(db.teams, {
  foreignKey: "manager_id",
});
db.teams.belongsTo(db.users, {
  foreignKey: "manager_id",
});

// 1 team has 1 manager
// db.teams.belongsTo(db.managers, {
//   foreignKey: "manager_id",
// });
// db.managers.hasOne(db.teams, {
//   foreignKey: "manager_id",
// });

// 1 user 1 manager
// db.users.hasOne(db.managers, {
//   foreignKey: "user_id",
// });

// db.managers.belongsTo(db.users, {
//   foreignKey: "user_id",
// });

// order create by only 1 user
db.users.hasMany(db.orders, {
  foreignKey: "user_id",
});
db.orders.belongsTo(db.users, {
  foreignKey: "user_id",
});

// order by 1 distributor
db.orders.belongsTo(db.distributors, {
  foreignKey: "distributor_id",
});
db.distributors.hasMany(db.orders, {
  foreignKey: "distributor_id",
});

// order only 1 product in 1 time
db.orders.belongsTo(db.products, {
  foreignKey: "product_id",
});
db.products.hasMany(db.orders, {
  foreignKey: "product_id",
});

// customer 1-n order
db.orders.belongsTo(db.customers, {
  foreignKey: "customer_id",
});
db.customers.hasMany(db.orders, {
  foreignKey: "customer_id",
});
