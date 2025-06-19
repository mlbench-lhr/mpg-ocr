import fs from "fs/promises";

/**
 * Converts a file at the given path to a base64 string.
 * @param filePath - The absolute path to the file.
 * @returns Base64-encoded string of the file contents.
 */
export async function convertFileToBase64(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  return fileBuffer.toString("base64");
}
