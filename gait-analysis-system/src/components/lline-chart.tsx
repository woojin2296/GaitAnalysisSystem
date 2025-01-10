"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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

export function LineChartComponent() {
  const [chartData, setChartData] = useState<
    { frame: number; left: number; right: number }[]
  >([]);
  const frameRef = useRef(0); // 프레임 번호 추적
  const leftValueRef = useRef(50); // 초기 Left 값
  const rightValueRef = useRef(50); // 초기 Right 값

  useEffect(() => {
    const interval = setInterval(() => {
      // 랜덤 변화량 생성
      const leftDelta = Math.random() * 10 - 5; // -5 ~ 5
      const rightDelta = Math.random() * 10 - 5; // -5 ~ 5

      // 새로운 값 계산
      const newLeftValue = Math.max(0, Math.min(100, leftValueRef.current + leftDelta)); // 0 ~ 100 범위 제한
      const newRightValue = Math.max(0, Math.min(100, rightValueRef.current + rightDelta)); // 0 ~ 100 범위 제한

      // 새로운 데이터 생성
      const newData = {
        frame: frameRef.current++,
        left: newLeftValue,
        right: newRightValue,
      };

      // 값 업데이트
      leftValueRef.current = newLeftValue;
      rightValueRef.current = newRightValue;

      // 데이터 업데이트: 최근 20개 유지
      setChartData((prev) => {
        const updatedData = [...prev, newData];
        return updatedData.slice(-20); // 마지막 20개만 유지
      });
    }, 100); // 0.1초마다 실행

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart</CardTitle>
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
              domain={[0, 100]} // Y축 최소값 0, 최대값 100
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