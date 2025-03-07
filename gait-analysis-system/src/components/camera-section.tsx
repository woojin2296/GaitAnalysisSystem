"use client";

import React, { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgpu";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { Pose } from "@/lib/type";

export function CameraSection({
  pose,
  setPose,
  data,
}: {
  pose: Pose[];
  setPose: (pose: Pose[]) => void;
  data: {
    head_slope: number;
    body_slope: number;
    r_arm_angle: number;
    l_arm_angle: number;
    r_leg_angle: number;
    l_leg_angle: number;
  };
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const initializeTF = async () => {
      try {
        if (tf.engine().registryFactory["webgpu"]) {
          await tf.setBackend("webgpu");
        } else {
          console.warn("WebGPU is not supported. Falling back to WebGL.");
          await tf.setBackend("webgl");
        }
        await tf.ready();
        console.log(
          `Initialized TensorFlow.js with backend: ${tf.getBackend()}`
        );
      } catch (error) {
        console.error("Error initializing TensorFlow.js:", error);
        await tf.setBackend("webgl");
      }
    };

    const setupCamera = async () => {
      try {
        const video = videoRef.current;
        if (!video) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        video.srcObject = stream;
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.play();
            resolve(null);
            setLoading(false);
          };
        });
      } catch (error) {
        console.error("Error setting up camera:", error);
      }
    };

    const detectPose = async (detector: poseDetection.PoseDetector) => {
      if (videoRef.current && canvasRef.current) {
        const poses = await detector.estimatePoses(videoRef.current);
        const ctx = canvasRef.current.getContext("2d");

        if (ctx && poses.length > 0) {
          setPose(poses[0].keypoints as Pose[]);
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          poses[0].keypoints.forEach(({ x, y, score }) => {
            if (score !== undefined && score > 0.5) {
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = "red";
              ctx.fill();
            }
          });
        }
      }
    };

    const startPoseEstimation = async () => {
      await initializeTF();
      await setupCamera();

      const model = poseDetection.SupportedModels.MoveNet;
      const detector = await poseDetection.createDetector(model, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      });

      const detect = async () => {
        await detectPose(detector);
        requestAnimationFrame(detect); // 프레임 기반으로 추론 실행
      };

      detect();
    };

    startPoseEstimation();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div
        className="col-span-2"
        style={{ position: "relative", width: "640px", height: "480px" }}
      >
        <video
          ref={videoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "scaleX(-1)",
            width: "640px",
            height: "480px",
          }}
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "scaleX(-1)",
          }}
          width="640"
          height="480"
        />
      </div>
      <div>
        {pose.map((p, i) => (
          <div key={i}>
            {p.name}:{" "}
            {p.score > 0.5
              ? `${p.x.toFixed(2)}, ${p.y.toFixed(2)}`
              : "Not Detected"}
          </div>
        ))}
      </div>
      <div>
        <div>Head Slope : {data.head_slope.toFixed(2)}</div>
        <div>Body Slope : {data.body_slope.toFixed(2)}</div>
        <div>Right Arm Angle : {data.r_arm_angle.toFixed(2)}</div>
        <div>Left Arm Angle : {data.l_arm_angle.toFixed(2)}</div>
        <div>Right Leg Angle : {data.r_leg_angle.toFixed(2)}</div>
        <div>Left Leg Angle : {data.l_leg_angle.toFixed(2)}</div>
      </div>
    </div>
  );
}
