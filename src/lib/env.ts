export function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? "";
}

export function hasDatabase() {
  const url = getDatabaseUrl();
  return url.includes("neon.tech") && !url.includes("USER:PASSWORD") && !url.includes("your_neon_connection_string");
}

export function hasBlobStore() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
