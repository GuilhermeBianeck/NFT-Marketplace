import executeQuery from '../../db';

export default async (req, res) => {
  try {
    console.log('req nom', req.query);
    const deviceUid = req.query.deviceUid;
    const [rows, fields] = await executeQuery({
      query: 'SELECT * FROM Device WHERE device_uid = ?',
      values: [deviceUid],
    });

    const formattedRows = rows.map((row) => ({
      ...row,
      sensor_data: JSON.parse(row.sensor_data),
    }));
    console.log('result', result)
    return res.json(formattedRows);
  } catch (error) {
    console.log(error);
    return {};
  }
};
