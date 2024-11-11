"use client";
import React, { useMemo, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { CardContent, Typography, Card, Grid, MenuItem, Select, FormControl, InputLabel, TextField, Button } from '@mui/material';
import ReactEChart from "echarts-for-react";

function encodeBase64(str) {
  // Encode in Base64 and make it URL-safe
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-')  // Replace `+` with `-`
    .replace(/\//g, '_')  // Replace `/` with `_`
    .replace(/=+$/, '');  // Remove any trailing `=`
}

// Function to calculate the AQI as an integer
function calculateAQI(conc, pollutant) {
  let C_low, C_high, I_low, I_high;
  if (pollutant === 0) { // PM2.5
    if (conc <= 12.0) {
      C_low = 0.0; C_high = 12.0; I_low = 0; I_high = 50;
    } else if (conc <= 35.4) {
      C_low = 12.1; C_high = 35.4; I_low = 51; I_high = 100;
    } else if (conc <= 55.4) {
      C_low = 35.5; C_high = 55.4; I_low = 101; I_high = 150;
    } else if (conc <= 150.4) {
      C_low = 55.5; C_high = 150.4; I_low = 151; I_high = 200;
    } else if (conc <= 250.4) {
      C_low = 150.5; C_high = 250.4; I_low = 201; I_high = 300;
    } else {
      C_low = 250.5; C_high = 500.4; I_low = 301; I_high = 500;
    }
  } else { // PM10
    if (conc <= 54) {
      C_low = 0.0; C_high = 54; I_low = 0; I_high = 50;
    } else if (conc <= 154) {
      C_low = 55; C_high = 154; I_low = 51; I_high = 100;
    } else if (conc <= 254) {
      C_low = 155; C_high = 254; I_low = 101; I_high = 150;
    } else if (conc <= 354) {
      C_low = 255; C_high = 354; I_low = 151; I_high = 200;
    } else if (conc <= 424) {
      C_low = 355; C_high = 424; I_low = 201; I_high = 300;
    } else {
      C_low = 425; C_high = 604; I_low = 301; I_high = 500;
    }
  }
  return Math.round(((I_high - I_low) / (C_high - C_low)) * (conc - C_low) + I_low);
}

function calculateWildfireRisk(temperature, humidity) {
  if (temperature >= 30 && humidity <= 30) {
    return "High";
  } else if (temperature >= 25 && humidity <= 50) {
    return "Moderate";
  } else {
    return "Low";
  }
}

function getAQIColor(aqi) {
  if (aqi <= 50) return "#00E400";          // Good (Green)
  if (aqi <= 100) return "#FFFF00";         // Moderate (Yellow)
  if (aqi <= 150) return "#FF7E00";         // Unhealthy for Sensitive Groups (Orange)
  if (aqi <= 200) return "#FF0000";         // Unhealthy (Red)
  if (aqi <= 300) return "#8F3F97";         // Very Unhealthy (Purple)
  return "#7E0023";                         // Hazardous (Maroon)
}

export default function Chart({ deviceUID, data }) {
  const [isClient, setIsClient] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [alertParameter, setAlertParameter] = useState("");
  const [alertCondition, setAlertCondition] = useState(">");
  const [alertValue, setAlertValue] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log("Received data:", data);
    console.log("Device UID:", deviceUID);
  }, [data, deviceUID]);

  const latestData = data?.length ? data[data.length - 1].sensor_data : null;
  const availableMetrics = latestData ? Object.keys(latestData).filter(key => key !== "time") : [];

  useEffect(() => {
    if (!selectedMetric && availableMetrics.length > 0) {
      setSelectedMetric(availableMetrics[0]);
    }
  }, [availableMetrics, selectedMetric]);

  const eChartOptions = useMemo(() => {
    if (!data || data.length === 0 || !selectedMetric || !latestData) {
      return {};
    }

    return {
      responsive: true,
      grid: { left: '10%', right: '10%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        scale: true,
        name: 'Time',
        type: 'time',
        nameLocation: 'middle',
        nameGap: 30,
        splitLine: { show: true },
      },
      yAxis: {
        scale: true,
        name: selectedMetric,
        type: 'value',
        nameLocation: 'middle',
        nameGap: 60,
      },
      tooltip: {
        trigger: 'axis',
        borderColor: '#505765',
        axisPointer: { type: 'cross', animation: false, label: { backgroundColor: '#505765' } },
      },
      dataset: {
        dimensions: ['time', 'value'],
        source: data.map((e) => ({
          time: new Date(e.sensor_data.time).getTime(),
          value: e.sensor_data[selectedMetric],
        })),
      },
      series: [
        {
          name: selectedMetric,
          type: 'line',
          smooth: false,
          lineStyle: { width: 2, color: '#ff9f43' },
          showSymbol: false,
          clip: true,
        },
      ],
    };
  }, [data, selectedMetric, latestData]);

  const pm25Aqi = latestData ? calculateAQI(latestData["PM2.5"], 0) : null;
  const pm10Aqi = latestData ? calculateAQI(latestData["PM10"], 1) : null;
  const overallAqi = Math.max(pm25Aqi || 0, pm10Aqi || 0);
  const aqiColor = getAQIColor(overallAqi);
  const wildfireRisk = latestData ? calculateWildfireRisk(latestData.Temp, latestData.Hum) : "Unknown";

  const generateAlertURL = () => {
    const alertString = `device_uid=${deviceUID} ${alertParameter}${alertCondition}${alertValue}`;
    const encodedString = encodeBase64(alertString);
    return `https://t.me/BiomaBot?start=${encodedString}`;
  };
  return (
    <Box display={'block'} width={1} height={1}>
      <Box component={Card} width={1} height={1} display={'flex'} flexDirection={'column'}>
        <CardContent>
          <Typography variant={'h6'} align={'left'} sx={{ fontWeight: 700 }}>
            Device: {deviceUID || ""}
          </Typography>
  
          {latestData && (
            <Box sx={{ backgroundColor: '#e0f7fa', padding: 2, borderRadius: 2, marginBottom: 2 }}>
              <Typography variant={'h6'} sx={{ fontWeight: 700, marginBottom: 1 }}>Environment Status</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1">AQI:</Typography>
                  <Box sx={{ backgroundColor: aqiColor, color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {overallAqi}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">Wildfire Risk:</Typography>
                  <Box sx={{ backgroundColor: wildfireRisk === "High" ? "#FF0000" : wildfireRisk === "Moderate" ? "#FFFF00" : "#00E400", color: 'black', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {wildfireRisk}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
  
          {latestData && (
            <Box sx={{ backgroundColor: '#f5f5f5', padding: 2, borderRadius: 2, marginBottom: 2 }}>
              <Grid container spacing={2}>
                {availableMetrics.map(metric => (
                  <Grid item xs={4} key={metric}>
                    <Typography variant="body1">{metric}:</Typography>
                    <Typography variant="h6">{latestData[metric]}</Typography>
                  </Grid>
                ))}
                <Grid item xs={4}>
                  <Typography variant="body1">Last Updated:</Typography>
                  <Typography variant="h6">{latestData.time}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
  
          {/* Custom Box containing Select Metric and Chart */}
          <Box sx={{ padding: 2, backgroundColor: '#fafafa', borderRadius: 2, marginBottom: 3 }}>
            <FormControl size="small" fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Select Metric</InputLabel>
              <Select
                value={selectedMetric || ""}
                label="Select Metric"
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                {availableMetrics.map(metric => (
                  <MenuItem key={metric} value={metric}>
                    {metric}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <Box display={'flex'} alignItems={'center'}>
              {isClient && data && data.length > 0 ? (
                <ReactEChart
                  option={eChartOptions}
                  showLoading={!data}
                  style={{ height: '400px', width: '100%' }}
                  suppressHydrationWarning
                />
              ) : (
                <Typography variant="body2">No data available to display.</Typography>
              )}
            </Box>
          </Box>
  
          <Box sx={{ marginTop: 3 }}>
            <Typography variant={'h6'}>Set Alert</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Parameter</InputLabel>
                  <Select
                    value={alertParameter}
                    label="Parameter"
                    onChange={(e) => setAlertParameter(e.target.value)}
                  >
                    {availableMetrics.map(metric => (
                      <MenuItem key={metric} value={metric}>{metric}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={alertCondition}
                    label="Condition"
                    onChange={(e) => setAlertCondition(e.target.value)}
                  >
                    <MenuItem value=">">Above</MenuItem>
                    <MenuItem value="<">Below</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Value"
                  type="number"
                  fullWidth
                  value={alertValue}
                  onChange={(e) => setAlertValue(e.target.value)}
                />
              </Grid>
            </Grid>
            <Box sx={{ marginTop: 2 }}>
              <Button
                variant="contained"
                color="primary"
                href={generateAlertURL()}
                target="_blank"
              >
                Set Alert
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Box>
    </Box>
  );
}