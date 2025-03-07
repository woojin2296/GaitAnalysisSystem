"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { SerialPort } from "serialport/dist/serialport";

const CANVAS_WIDTH = 211;
const CANVAS_HEIGHT = 642;

let leftAreas = [[]] as { x: number; y: number }[][];
let rightAreas = [[]] as { x: number; y: number }[][];

function getColorByValue(value: number, maxValue: number) {
  const ratio = Math.min(value / maxValue, 1);
  const r = 255;
  const g = Math.floor(255 * (1 - ratio));
  const b = Math.floor(255 * (1 - ratio));
  return { r, g, b };
}

function imageProcesser(data: Uint8ClampedArray) {
  const threshold = 50;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    } else {
      data[i + 3] = 0;
    }
  }
}

function extractSensorArea(data: Uint8ClampedArray) {
  const visited = new Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill(false);
  const area: { x: number; y: number }[][] = [];

  const getIndex = (x: number, y: number) => (y * CANVAS_WIDTH + x) * 4;

  for (let y = 0; y < CANVAS_HEIGHT; y++) {
    for (let x = 0; x < CANVAS_WIDTH; x++) {
      const idx = y * CANVAS_WIDTH + x;
      const i = getIndex(x, y);
      if (
        !visited[idx] &&
        data[i] === 255 &&
        data[i + 1] === 255 &&
        data[i + 2] === 255 &&
        data[i + 3] === 255
      ) {
        visited[idx] = true;
        const queue: [number, number][] = [[x, y]];
        const pixels: [number, number][] = [];
        while (queue.length > 0) {
          const [cx, cy] = queue.shift()!;
          pixels.push([cx, cy]);
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx;
              const ny = cy + dy;
              if (
                nx >= 0 &&
                nx < CANVAS_WIDTH &&
                ny >= 0 &&
                ny < CANVAS_HEIGHT
              ) {
                const nIdx = ny * CANVAS_WIDTH + nx;
                const nI = getIndex(nx, ny);
                if (
                  !visited[nIdx] &&
                  data[nI] === 255 &&
                  data[nI + 1] === 255 &&
                  data[nI + 2] === 255 &&
                  data[nI + 3] === 255
                ) {
                  visited[nIdx] = true;
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }
        // 영역이 너무 작으면 무시
        if (pixels.length > 30) {
          area.push(pixels.map(([x, y]) => ({ x, y })));
        }
      }
    }
  }
  console.log("Detected area count:", area.length);
  return area;
}

function parseSensorLine(line: string) {
  return line
    .split(",")
    .map((v) => parseFloat(v.trim()))
    .filter((num) => !isNaN(num));
}

export function FootSensor() {
  const [sensorData1, setSensorData1] = useState([] as number[]);
  const [sensorData2, setSensorData2] = useState([] as number[]);

  const [serialPort1, setSerialPort1] = useState<SerialPort | null>(null);
  const [serialPort2, setSerialPort2] = useState<SerialPort | null>(null);

  const [serialReader1, setSerialReader1] = useState<ReadableStreamDefaultReader<string> | null>(null);
  const [serialReader2, setSerialReader2] = useState<ReadableStreamDefaultReader<string> | null>(null);

  useEffect(() => {
    loadLeftFootImage();
    loadRightFootImage();
  }, []);

  useEffect(() => {
    drawLeftFootHeatmap();
  }, [sensorData1]);

  useEffect(() => {
    drawRightFootHeatmap();
  }, [sensorData2]);


  function loadLeftFootImage() {
    const canvas = document.querySelector("#leftCanvas") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = "/image.png";

    image.onload = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const data = imageData.data;
      imageProcesser(data);
      ctx.putImageData(imageData, 0, 0);
      
      leftAreas = extractSensorArea(data);
    };

    image.onerror = (err) => {
      console.error("Left image load error:", err);
    };
  }

  function loadRightFootImage() {
    const canvas = document.querySelector("#rightCanvas") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = "/image.png";
    image.onload = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      let data = imageData.data;

      for (let y = 0; y < CANVAS_HEIGHT; y++) {
        for (let x = 0; x < CANVAS_WIDTH / 2; x++) {
          const idx = (y * CANVAS_WIDTH + x) * 4;
          const rIdx = (y * CANVAS_WIDTH + (CANVAS_WIDTH - x - 1)) * 4;
          for (let i = 0; i < 4; i++) {
            const tmp = data[idx + i];
            data[idx + i] = data[rIdx + i];
            data[rIdx + i] = tmp;
          }
        }
      }

      imageProcesser(data);
      ctx.putImageData(imageData, 0, 0);

      rightAreas = extractSensorArea(data);
    };

    image.onerror = (err) => {
      console.error("Right image load error:", err);
    };
  }

  function drawLeftFootHeatmap() {
    const canvas = document.querySelector("#leftCanvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    if (!leftAreas || leftAreas.length === 0) return;
    
    const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imageData.data;
    
    sensorData1.forEach((value, index) => {
      const color = getColorByValue(value, 150);
      
      const area = leftAreas[index];
      if (!area) return;
      
      area.forEach(({x, y}) => {
        const pixelIndex = (y * CANVAS_WIDTH + x) * 4;
        data[pixelIndex] = color.r;
        data[pixelIndex + 1] = color.g;
        data[pixelIndex + 2] = color.b;
        data[pixelIndex + 3] = 255;
      });
    });
    
    ctx.putImageData(imageData, 0, 0);
  }

  function drawRightFootHeatmap() {
    const canvas = document.querySelector("#rightCanvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    if (!rightAreas || rightAreas.length === 0) return;

    const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imageData.data;

    const sensorData = [
      sensorData2[12], 
      sensorData2[8], 
      sensorData2[7], 
      sensorData2[0], 
      sensorData2[13], 
      sensorData2[9], 
      sensorData2[2], 
      sensorData2[3], 
      sensorData2[15], 
      sensorData2[5], 
      sensorData2[1], 
      sensorData2[11], 
      sensorData2[6], 
      sensorData2[4], 
      sensorData2[10], 
      sensorData2[14]
    ];
    sensorData.forEach((value, index) => {
      const color = getColorByValue(value, 150);
      
      const area = rightAreas[index];
      if (!area) return;
      
      area.forEach(({x, y}) => {
        const pixelIndex = (y * CANVAS_WIDTH + x) * 4;
        data[pixelIndex] = color.r;
        data[pixelIndex + 1] = color.g;
        data[pixelIndex + 2] = color.b;
        data[pixelIndex + 3] = 255;
      });
    });

    ctx.putImageData(imageData, 0, 0);
  }

  async function connectSerialPort(index: number) {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      if (index === 0) {
        setSerialPort1(port);
        readSerialData(port, 0);
      } else {
        setSerialPort2(port);
        readSerialData(port, 1);
      }
    } catch (error) {
      console.error("Error opening port:", error);
    }
  }
  
  const readSerialData = async (port: SerialPort, index: number) => {
    const decoder = new TextDecoderStream();
    const readableStream = port.readable?.pipeThrough(decoder);
    const reader = readableStream?.getReader();

    if (reader) {
      if (index === 0) {
        setSerialReader1(reader);
      } else {
        setSerialReader2(reader);
      }
    }

    let buffer = "";
    if (reader) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            buffer += value;
            let lines = buffer.split("\n");
            buffer = lines.pop() || "";

            lines.forEach((line) => {
              if (index === 0) {
                setSensorData1(parseSensorLine(line));
                setSensorData2(parseSensorLine(line));
              } else {
                setSensorData2(parseSensorLine(line));
              }
            });
          }
        }
      } catch (error) {
        console.error("Serial read error:", error);
      } finally {
        reader.releaseLock();
      }
    }
  };

  async function disconnectPort(port: SerialPort, index: number) {
    try {
      const reader = index === 0 ? serialReader1 : serialReader2;
      if (reader) {
        await reader.cancel();
        reader.releaseLock();
        if (index === 0) {
          setSerialReader1(null);
        } else {
          setSerialReader2(null);
        }
      }
      await port.close();
      if (index === 0) {
        setSerialPort1(null);
        setSensorData1([]);
      } else {
        setSerialPort2(null);
        setSensorData2([]);
      }
    } catch (error) {
      console.error("Error closing port:", error);
    }
  }

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Connected Serial Ports</CardTitle>
          <CardDescription>Manage connected ports</CardDescription>
        </CardHeader>
        <Separator className="mb-2" />
        <CardContent className="pb-2">
          <ul className="list-disc">
            <li className="flex flex-col gap-2">
              {serialPort1 ? (
                <div className="flex justify-between items-center">
                  <span>Port 1 (Left Foot Active)</span>
                  <Button onClick={() => disconnectPort(serialPort1, 0)}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>Port 1 (Left Foot deactivated)</span>
                  <Button onClick={() => connectSerialPort(0)}>Connect</Button>
                </div>
              )}
            </li>
            <Separator className="my-2" color="white" />
            <li className="flex flex-col gap-2">
              {serialPort2 ? (
                <div className="flex justify-between items-center">
                  <span>Port 2 (Right Foot Active)</span>
                  <Button onClick={() => disconnectPort(serialPort2, 1)}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>Port 2 (Right Foot deactivated)</span>
                  <Button onClick={() => connectSerialPort(1)}>Connect</Button>
                </div>
              )}
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Foot Sensor Data</CardTitle>
          <CardDescription>Realtime foot sensor data</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-lg">
          <div className="flex-1">Left Foot : {sensorData1.length == 0 ? "Waiting for data..." : sensorData1.join(" ")}</div>
          <div className="flex-1">Right Foot : {sensorData2.length == 0 ? "Waiting for data..." : sensorData2.join(" ")}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Left Foot Visualization</CardTitle>
          <CardDescription>
            Realtime left foot sensor data visualization
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center text-center text-lg font-bold">
          <canvas
            id="leftCanvas"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          ></canvas>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Right Foot Visualization</CardTitle>
          <CardDescription>
            Realtime right foot sensor data visualization
          </CardDescription>
        </CardHeader>
        <CardContent className="flex text-center text-lg font-bold justify-center">
          <canvas
            id="rightCanvas"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          ></canvas>
        </CardContent>
      </Card>
    </div>
  );
}