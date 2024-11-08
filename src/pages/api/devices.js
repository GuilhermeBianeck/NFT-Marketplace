import executeQuery from '../../db';

export default async (req, res) => {
  try {
    console.log('Request received', req.query);

    const deviceUid = req.query.deviceUid;
    if (!deviceUid) {
      return res.status(400).json({ error: 'deviceUid is required' });
    }

    const [rows] = await executeQuery({
      query: 'SELECT * FROM Device WHERE device_uid = ?',
      values: [deviceUid],
    });

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

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