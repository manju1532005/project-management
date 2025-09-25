const bcrypt = require("bcrypt");

(async () => {
  const hashed = await bcrypt.hash("admin123", 10);
  console.log(hashed);
})();

