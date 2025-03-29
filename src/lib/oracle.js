import oracledb from "oracledb";

/**
 * Get OracleDB Connection with dynamic credentials
 */
export async function getOracleConnection(userName, password, ipAddress, portNumber, serviceName) {
  try {
    const connection = await oracledb.getConnection({
      user: userName,
      password: password,
      connectString: `${ipAddress}:${portNumber}/${serviceName}`,
    });

    console.log("✅ Connected to OracleDB");
    return connection;
  } catch (error) {
    console.error("❌ OracleDB Connection Failed:", error.message);
    throw error;
  }
}
