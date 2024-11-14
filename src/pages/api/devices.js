import executeQuery from '../../db';

export default async (req, res) => {
  try {
    console.log('Request received', req.query);

    const deviceUid = req.query.deviceUid;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null; // No limit if not specified

    if (!deviceUid) {
      return res.status(400).json({ error: 'deviceUid is required' });
    }

    // Base query without the limit clause
    let query = `
      SELECT * FROM Device 
      WHERE device_uid = ?
    `;

    // Append the dynamic limit condition if a limit is specified
    const values = [deviceUid, deviceUid];
    if (limit) {
      query += ` AND id >= (SELECT MAX(id) FROM Device WHERE device_uid = ?) - ?`;
      values.push(deviceUid, limit);
    }

    const [rows] = await executeQuery({
      query,
      values,
    });

    const formattedRows = rows.map((row) => ({
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