const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_1hKxPn3pdYTf@ep-fancy-meadow-aonqk6gd.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, landing_page } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const query = `
      INSERT INTO leads (name, email, landing_page) 
      VALUES ($1, $2, $3)
      RETURNING id, name, email, landing_page, created_at;
    `;
    const values = [name, email, landing_page];
    
    const result = await pool.query(query, values);
    
    return res.status(200).json({ success: true, lead: result.rows[0] });
  } catch (error) {
    console.error('Error inserting lead:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
