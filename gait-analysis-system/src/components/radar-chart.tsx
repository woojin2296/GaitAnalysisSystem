"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
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
import { useState, useEffect, useRef } from "react";

// 초기 데이터: 신체 부위별 점수
const initialData = [
  { bodyPart: "Head", score: 50 },
  { bodyPart: "L-Hand", score: 50 },
  { bodyPart: "R-Hand", score: 50 },
  { bodyPart: "Torso", score: 50 },
  { bodyPart: "L-Leg", score: 50 },
  { bodyPart: "R-Leg", score: 50 },
];

const targetValues = [70, 60, 75, 80, 65, 85]; // 목표값 설정

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RadarChartComponent() {
  const [chartData, setChartData] = useState(initialData);
  const valueRefs = useRef(initialData.map((data) => data.score)); // 현재 값을 추적

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedData = chartData.map((data, index) => {
        const currentValue = valueRefs.current[index];
        const targetValue = targetValues[index];

        // 선형 보간과 랜덤 노이즈 추가
        const lerpValue = currentValue + (targetValue - currentValue) * 0.1;
        const noise = Math.random() * 2 - 2; // -1 ~ +1의 랜덤 값
        const newValue = Math.max(0, Math.min(100, lerpValue + noise)); // 0 ~ 100 범위 제한

        valueRefs.current[index] = newValue; // Ref에 값 업데이트
        return { ...data, score: newValue }; // 새 값 반환
      });

      setChartData(updatedData); // 상태 업데이트
    }, 100); // 0.1초마다 실행

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Radar Chart</CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="bodyPart" />
            <PolarRadiusAxis
              angle={30} // 기본 각도
              domain={[0, 100]} // Y축 범위 설정
              tick={false} // 눈금선 숨김
            />
            <PolarGrid />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.6}
              animationDuration={100}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}