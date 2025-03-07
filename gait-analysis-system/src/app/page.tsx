"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { BarChartComponent } from "@/components/bar-chart";
import { CameraSection } from "@/components/camera-section";
import { LineChartComponent } from "@/components/lline-chart";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Pose } from "@/lib/type";
import React, { use, useEffect } from "react";

export default function Page() {
  const POSE = {
    NOSE: 0,
    LEFT_EYE: 1,
    RIGHT_EYE: 2,
    LEFT_EAR: 3,
    RIGHT_EAR: 4,
    LEFT_SHOULDER: 5,
    RIGHT_SHOULDER: 6,
    LEFT_ELBOW: 7,
    RIGHT_ELBOW: 8,
    LEFT_WRIST: 9,
    RIGHT_WRIST: 10,
    LEFT_HIP: 11,
    RIGHT_HIP: 12,
    LEFT_KNEE: 13,
    RIGHT_KNEE: 14,
    LEFT_ANKLE: 15,
    RIGHT_ANKLE: 16,
  };
  function calculateAngle({
    ax,
    ay,
    bx,
    by,
    cx,
    cy,
  }: {
    ax: number;
    ay: number;
    bx: number;
    by: number;
    cx: number;
    cy: number;
  }): number {
    const A = [ax, ay];
    const B = [bx, by];
    const C = [cx, cy];

    // 벡터 BA와 BC를 계산
    const BA = [A[0] - B[0], A[1] - B[1]];
    const BC = [C[0] - B[0], C[1] - B[1]];

    // 벡터의 내적
    const dotProduct = BA[0] * BC[0] + BA[1] * BC[1];

    // 벡터의 크기
    const magnitudeBA = Math.sqrt(BA[0] ** 2 + BA[1] ** 2);
    const magnitudeBC = Math.sqrt(BC[0] ** 2 + BC[1] ** 2);

    // 코사인 값 계산
    const cosTheta = dotProduct / (magnitudeBA * magnitudeBC);

    // 각도 계산 (라디안 -> 도)
    const angleRadians = Math.acos(cosTheta);
    const angleDegrees = (angleRadians * 180) / Math.PI;

    return angleDegrees;
  }

  const [pose, setPose] = React.useState<Pose[]>([]);
  const [data, setData] = React.useState<{
    head_slope: number;
    body_slope: number;
    r_arm_angle: number;
    l_arm_angle: number;
    r_leg_angle: number;
    l_leg_angle: number;
  }>({
    head_slope: 0,
    body_slope: 0,
    r_arm_angle: 0,
    l_arm_angle: 0,
    r_leg_angle: 0,
    l_leg_angle: 0,
  });

  useEffect(() => {
    if (pose.length == 0) return;
    const head_slope =
      pose[POSE.LEFT_EYE].score > 0.5 && pose[POSE.RIGHT_EYE].score > 0.5
        ? ((pose[POSE.LEFT_EYE].y - pose[POSE.RIGHT_EYE].y) /
            (pose[POSE.LEFT_EYE].x - pose[POSE.RIGHT_EYE].x)) *
          (180 / Math.PI)
        : 0;
    const body_slope =
      pose[POSE.LEFT_SHOULDER].score > 0.5 &&
      pose[POSE.RIGHT_SHOULDER].score > 0.5
        ? ((pose[POSE.LEFT_SHOULDER].y - pose[POSE.RIGHT_SHOULDER].y) /
            (pose[POSE.LEFT_SHOULDER].x - pose[POSE.RIGHT_SHOULDER].x)) *
          (180 / Math.PI)
        : 0;
    const r_arm_angle =
      pose[POSE.RIGHT_SHOULDER].score > 0.5 &&
      pose[POSE.RIGHT_ELBOW].score > 0.5 &&
      pose[POSE.RIGHT_WRIST].score > 0.5
        ? calculateAngle({
            ax: pose[POSE.RIGHT_SHOULDER].x,
            ay: pose[POSE.RIGHT_SHOULDER].y,
            bx: pose[POSE.RIGHT_ELBOW].x,
            by: pose[POSE.RIGHT_ELBOW].y,
            cx: pose[POSE.RIGHT_WRIST].x,
            cy: pose[POSE.RIGHT_WRIST].y,
          })
        : 0;
    const l_arm_angle =
      pose[POSE.LEFT_SHOULDER].score > 0.5 &&
      pose[POSE.LEFT_ELBOW].score > 0.5 &&
      pose[POSE.LEFT_WRIST].score > 0.5
        ? calculateAngle({
            ax: pose[POSE.LEFT_SHOULDER].x,
            ay: pose[POSE.LEFT_SHOULDER].y,
            bx: pose[POSE.LEFT_ELBOW].x,
            by: pose[POSE.LEFT_ELBOW].y,
            cx: pose[POSE.LEFT_WRIST].x,
            cy: pose[POSE.LEFT_WRIST].y,
          })
        : 0;
    const r_leg_angle =
      pose[POSE.RIGHT_HIP].score > 0.5 &&
      pose[POSE.RIGHT_KNEE].score > 0.5 &&
      pose[POSE.RIGHT_ANKLE].score > 0.5
        ? calculateAngle({
            ax: pose[POSE.RIGHT_HIP].x,
            ay: pose[POSE.RIGHT_HIP].y,
            bx: pose[POSE.RIGHT_KNEE].x,
            by: pose[POSE.RIGHT_KNEE].y,
            cx: pose[POSE.RIGHT_ANKLE].x,
            cy: pose[POSE.RIGHT_ANKLE].y,
          })
        : 0;
    const l_leg_angle =
      pose[POSE.LEFT_HIP].score > 0.5 &&
      pose[POSE.LEFT_KNEE].score > 0.5 &&
      pose[POSE.LEFT_ANKLE].score > 0.5
        ? calculateAngle({
            ax: pose[POSE.LEFT_HIP].x,
            ay: pose[POSE.LEFT_HIP].y,
            bx: pose[POSE.LEFT_KNEE].x,
            by: pose[POSE.LEFT_KNEE].y,
            cx: pose[POSE.LEFT_ANKLE].x,
            cy: pose[POSE.LEFT_ANKLE].y,
          })
        : 0;

    setData({
      head_slope,
      body_slope,
      r_arm_angle,
      l_arm_angle,
      r_leg_angle,
      l_leg_angle,
    });
  }, [pose]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">데이터 분석</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="grid grid-cols-4 gap-4 p-4">
          <div className="col-span-2 row-span-6 rounded-xl bg-muted/50 flex items-center justify-center">
            <CameraSection pose={pose} setPose={setPose} data={data} />
          </div>

          <div className="col-span-2 row-span-2 rounded-xl bg-muted/50">
            <BarChartComponent data={data} />
          </div>

          <div className="col-span-2 row-span-2 rounded-xl bg-muted/50">
            <LineChartComponent data={data} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
