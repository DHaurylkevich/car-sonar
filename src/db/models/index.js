import { sequelize } from "../index.js";
import { DataTypes } from "sequelize";
import Brands from "./brands.js";
import FuelTypes from "./fuelTypes.js";
import Generations from "./generations.js";
import Requests from "./requests.js";
import Users from "./users.js";
import UsersRequests from "./usersRequests.js";
import Cars from "./cars.js";

const db = {
    Brands: Brands(sequelize, DataTypes),
    FuelTypes: FuelTypes(sequelize, DataTypes),
    Generations: Generations(sequelize, DataTypes),
    Requests: Requests(sequelize, DataTypes),
    Users: Users(sequelize, DataTypes),
    UsersRequests: UsersRequests(sequelize, DataTypes),
    Cars: Cars(sequelize, DataTypes),
};

Object.values(db).forEach((model) => {
    if (model.associate) {
        model.associate(db);
    }
});

db.sequelize = sequelize;

export default db;