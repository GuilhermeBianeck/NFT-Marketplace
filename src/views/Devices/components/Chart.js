"use client";
import React, { useMemo, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { CardContent, Typography, Card, Link } from '@mui/material';
import ReactEChart from "echarts-for-react";
// import { LineChart } from '@mui/x-charts';

export default function Chart({ deviceUID, data }) {
  const [isClient, setIsClient] = useState(false)
 
  useEffect(() => {
    setIsClient(true)
  }, [])

  const eChartOptions = useMemo(
    () => ({
      responsive: true,
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        scale: true,
        name: 'Time',
        type: 'time',
        nameLocation: 'middle',
        nameGap: 30,
        splitLine: {
          show: true,
        },
      },
      yAxis: {
        scale: true,
        name: 'Value',
        type: 'value',
        nameLocation: 'middle',
        nameGap: 60,
      },
      toolbox: {
        show: false,
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        borderColor: '#505765',
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: '#505765',
          },
        },
      },
      dataset: {
        dimensions: ['time', 'value'],
        source: data
        .filter(e => !!e.sensor_data.value && e.sensor_data.value > 0)
        .map(e => ({
          time: new Date(e.sensor_data.time).getTime(),
          value: e.sensor_data.value,
        })),
      },
      series: [
        {
          name: 'Value',
          showSymbol: false,
          clip: true,
          lineStyle: {
            width: 2,
            color: '#ff9f43',
          },
          type: 'line',
          smooth: false,
        },
      ],
    }),
    [data],
  );

  return (
    <Box display={'block'} width={1} height={1}>
      <Box
        component={Card}
        width={1}
        height={1}
        display={'flex'}
        flexDirection={'column'}
      >
        <CardContent>
          <Typography variant={'h6'} align={'left'} sx={{ fontWeight: 700 }}>
            Device: {deviceUID || ""}
          </Typography>
          <Box display={'flex'} alignItems={'center'}>
          {isClient &&
              <ReactEChart
                option={eChartOptions}
                showLoading={!data}
                style={{ height: '400px', width: '100%' }}
                suppressHydrationWarning
              />
            }
          </Box>
        </CardContent>
      </Box>
    </Box>
  );
}
