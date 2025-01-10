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
  { body: "Head", value: 186 },
  { body: "R-Hand", value: 305 },
  { body: "L-Hand", value: 237 },
  { body: "Torso", value: 73 },
  { body: "R-Leg", value: 209 },
  { body: "L-Leg", value: 214 },
];

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function BarChartComponent() {
  const [chartData, setChartData] = useState(initialData);
  const valueRefs = useRef(initialData.map((data) => data.value)); // 현재 값을 추적

  useEffect(() => {
    const interval = setInterval(() => {
      // 데이터 업데이트
      const updatedData = chartData.map((data, index) => {
        const delta = Math.random() * 20 - 10; // 변화량: -10 ~ +10
        const newValue = Math.max(0, Math.min(400, valueRefs.current[index] + delta)); // 0~400 범위 제한
        valueRefs.current[index] = newValue; // Ref에 값 업데이트
        return { ...data, value: newValue }; // 새 값 반환
      });

      setChartData(updatedData); // 상태 업데이트
    }, 100); // 0.1초마다 실행

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 20,
              right: 30,
            }}
          >
            <XAxis
              type="number"
              dataKey="value"
              domain={[0, 400]} // X축 값 범위 고정
              hide={true}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="body"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={38}
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