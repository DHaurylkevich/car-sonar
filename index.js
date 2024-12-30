// require("dotenv").config();

// const express = require("express");
// const logger = require("./scr/utils/logger");
// const morgan = require("morgan");
// const AppError = require("./scr/utils/appError");
// const errorHandler = require("./scr/middleware/errorHandler");
// const app = express();

// require("./scr/configs/db");

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(morgan("dev"));

// app.use((req, res, next) => { next(new AppError("Not Found", 404)); });
// app.use(errorHandler);


// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//     logger.info(`Server is running on port ${PORT}`);
// });
