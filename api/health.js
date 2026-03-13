import pool from "./_db.js"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    await pool.query("SELECT 1")
    res.status(200).json({ status: "ok" })
  } catch {
    res.status(500).json({ status: "error" })
  }
}
