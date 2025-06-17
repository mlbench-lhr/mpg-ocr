const fs = require("fs");
const path = require("path");

const getDBConnectionType = () => {
  try {
    const filePath = path.join(__dirname, "db-config.json");

    if (!fs.existsSync(filePath)) {
      console.error("❌ db-config.json not found.");
      return;
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const config = JSON.parse(raw);

    const dbType = config.dbType;
    console.log("✅ DB Type:", dbType);
    return dbType;
  } catch (err) {
    console.error("❌ Error reading DB config:", err.message);
  }
};

// ✅ Export using CommonJS module.exports
module.exports = { getDBConnectionType };