"use client";

import React, { useRef, useEffect, useState } from "react";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";
import { Loader } from "lucide-react";

export function CameraSection() {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [posenetModel, setPosenetModel] = useState<posenet.PoseNet | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // 웹캠 설정
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const video = webcamRef.current;

        if (!video) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        video.srcObject = stream;

        video.onloadedmetadata = async () => {
          await video.play();
          setLoading(false);
        };
      } catch (error) {
        console.error("Webcam setup failed:", error);
        setLoading(false); // 실패 시에도 로딩 종료
      }
    };

    setupCamera();
  }, []);

  // // PoseNet 모델 로드
  // useEffect(() => {
  //   const loadPoseNet = async () => {
  //     try {
  //       const model = await posenet.load({
  //         architecture: "MobileNetV1",
  //         outputStride: 16,
  //         inputResolution: { width: 640, height: 480 },
  //         multiplier: 0.75,
  //       });
  //       setPosenetModel(model);
  //     } catch (error) {
  //       console.error("PoseNet model loading failed:", error);
  //     }
  //   };

  //   loadPoseNet();
  // }, []);

  // // PoseNet 추정 및 캔버스 렌더링
  // useEffect(() => {
  //   const detectPose = async () => {
  //     if (
  //       posenetModel &&
  //       webcamRef.current &&
  //       webcamRef.current.readyState === 4 &&
  //       canvasRef.current
  //     ) {
  //       const video = webcamRef.current;
  //       const canvas = canvasRef.current;
  //       const ctx = canvas.getContext("2d");

  //       if (!ctx) {
  //         console.error("Canvas context not found");
  //         return;
  //       }

  //       // 비디오 크기 동기화
  //       canvas.width = video.videoWidth;
  //       canvas.height = video.videoHeight;

  //       const pose = await posenetModel.estimateSinglePose(video, {
  //         flipHorizontal: true,
  //       });

  //       // 캔버스 초기화
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);

  //       // 비디오 그리기
  //       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  //       // 관절 그리기
  //       pose.keypoints.forEach((keypoint) => {
  //         if (keypoint.score > 0.5) {
  //           const { x, y } = keypoint.position;
  //           ctx.beginPath();
  //           ctx.arc(x, y, 5, 0, 2 * Math.PI);
  //           ctx.fillStyle = "red";
  //           ctx.fill();
  //         }
  //       });

  //       console.log("Pose data:", pose);
  //     }
  //   };

  //   let animationFrameId: number;

  //   const loop = () => {
  //     detectPose();
  //     animationFrameId = requestAnimationFrame(loop);
  //   };

  //   loop();

  //   return () => {
  //     cancelAnimationFrame(animationFrameId);
  //   };
  // }, [posenetModel]);

  return (
    <div
      style={{
        position: "relative",
        width: "640px",
        height: "480px",
        backgroundColor: "#000",
      }}
    >
      {loading && (
        <div
          className="flex flex-col items-center"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            color: "#fff",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          <Loader size={40} color="#fff" className="animate-spin" />
          <div>Loading...</div>
        </div>
      )}
      <video
        ref={webcamRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: "scaleX(-1)",
          display: loading ? "none" : "block",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}