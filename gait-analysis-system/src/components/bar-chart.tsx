"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState, useRef } from "react";

const initialData = [
  { body: "Head Slope", value: 0 },
  { body: "Body Slope", value: 0 },
  { body: "Right Arm Angle", value: 0 },
  { body: "Left Arm Angle", value: 0 },
  { body: "Right Leg Angle", value: 0 },
  { body: "Left Leg Angle", value: 0 },
];

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function BarChartComponent({data}: {data : {head_slope: number; body_slope: number; r_arm_angle: number; l_arm_angle: number; r_leg_angle: number; l_leg_angle: number;}}) {
  const [chartData, setChartData] = useState(initialData);

  const stack = 200;
  var stack_count = 0;
  var data_before = initialData;
  useEffect(() => {
    if (data.head_slope == 0) {
      if (stack_count == stack) {
        stack_count = 0;
      }
      else {
        data.head_slope = data_before[0].value;
        stack_count++;
      }
    }
    if (data.body_slope == 0) {
      if (stack_count == stack) {
        stack_count = 0;
      }
      else {
        data.body_slope = data_before[1].value;
        stack_count++;
      }
    }
    if (data.r_arm_angle == 0) {
      if (stack_count == stack) {
        stack_count = 0;
      }
      else {
        data.r_arm_angle = data_before[2].value;
        stack_count++;
      }
    }
    if (data.l_arm_angle == 0) {
      if (stack_count == stack) {
        stack_count = 0;
      }
      else {
        data.l_arm_angle = data_before[3].value;
        stack_count++;
      }
    }
    if (data.r_leg_angle == 0) {
      if (stack_count == stack) {
        stack_count = 0;
      }
      else {
        data.r_leg_angle = data_before[4].value;
        stack_count++;
      }
    }
    if (data.l_leg_angle == 0) {
      if (stack_count == stack) {
        stack_count = 0;
      }
      else {
        data.l_leg_angle = data_before[5].value;
        stack_count++;
      }
    }

    const updatedData = [
      { body: "Head Slope", value: data.head_slope < 0 ? -1 * data.head_slope * 2 : data.head_slope * 2 },
      { body: "Body Slope", value: data.body_slope < 0 ? -1 * data.body_slope * 2 : data.body_slope * 2 },
      { body: "Right Arm Angle", value: data.r_arm_angle },
      { body: "Left Arm Angle", value: data.l_arm_angle },
      { body: "Right Leg Angle", value: data.r_leg_angle },
      { body: "Left Leg Angle", value: data.l_leg_angle },
    ];
    setChartData(updatedData);
    data_before = updatedData;
  }, [data]);

  return (
    <Card>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            className="mt-4"
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 20,
              right: 20,
            }}
          >
            <XAxis
              type="number"
              dataKey="value"
              domain={[0, 180]} // X축 값 범위 고정
              hide={false}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="body"
              type="category"
              tickLine={false}
              tickMargin={40}
              axisLine={false}
              width={108}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}