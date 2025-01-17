"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState, useRef } from "react";
import { Pose } from "@/lib/type";

const chartConfig = {
  left: {
    label: "Left",
    color: "hsl(var(--chart-1))",
  },
  right: {
    label: "Right",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function LineChartComponent({
  data,
}: {
  data: {
    head_slope: number;
    body_slope: number;
    r_arm_angle: number;
    l_arm_angle: number;
    r_leg_angle: number;
    l_leg_angle: number;
  };
}) {
  const [chartData, setChartData] = useState<
    { frame: number; left: number; right: number }[]
  >([]);
  const frameRef = useRef(0); // 프레임 번호 추적

  useEffect(() => {
    const newData = {
      frame: frameRef.current++,
      left: data.l_leg_angle,
      right: data.r_leg_angle,
    };

    // 데이터 업데이트: 최근 20개 유지
    setChartData((prev) => {
      const updatedData = [...prev, newData];
      return updatedData.slice(-20); // 마지막 20개만 유지
    });
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leg Angle</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="frame"
              tick={false} // X축 라벨 숨기기
              axisLine={false}
              tickLine={false}
            />
            {/* Y축 추가: 도메인 고정 */}
            <YAxis
              domain={[0, 180]} // Y축 최소값 0, 최대값 100
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={20}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="left"
              type="monotone"
              stroke="var(--color-left)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="right"
              type="monotone"
              stroke="var(--color-right)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
