import React from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const FormField = ({
  label,
  name,
  formik,
  multiline = false,
  rows,
  type,
  label2,
  ...rest
}) => (
  <>
    <Typography
      variant="subtitle2"
      sx={{ marginBottom: 1 }}
      fontWeight={700}
    >
      {label2 || label}
    </Typography>
    <TextField
      placeholder={label}
      variant="outlined"
      name={name}
      fullWidth
      multiline={multiline}
      rows={rows}
      type={type}
      onChange={formik.handleChange}
      value={formik.values?.[name]}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      {...rest}
    />
  </>
);

export default FormField;
