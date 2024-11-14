import executeQuery from '../../db';

export default async (req, res) => {
  try {
    console.log('Request received', req.query);

    const deviceUid = req.query.deviceUid;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null; // No limit if not specified

    if (!deviceUid) {
      return res.status(400).json({ error: 'deviceUid is required' });
    }

    // Construct the base query to get the last `limit` records in descending order
    let query = `
      SELECT * FROM Device 
      WHERE device_uid = ?
      ORDER BY id DESC
    `;

    // Append the LIMIT clause only if a limit is specified
    const values = [deviceUid];
    if (limit) {
      query += ` LIMIT ?`;
      values.push(limit);
    }

    const [rows] = await executeQuery({
      query,
      values,
    });

    // Reverse rows to get them in ascending order
    const formattedRows = rows.reverse().map((row) => ({
      ...row,
      sensor_data: JSON.parse(row.sensor_data),
    }));

    console.log('Query successful', formattedRows);
    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};