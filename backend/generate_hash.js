const bcrypt = require("bcryptjs");
bcrypt.hash('Admin@123', 10, (err, hash) => console.log(hash));
