"use client";

import React, { useEffect, useRef, useState } from "react";

type RobotState = {
  x: number;
  y: number;
  heading: number;
  leftMotorSpeed: number;
  rightMotorSpeed: number;
};

type SensorState = {
  left: number;
  right: number;
};

type Props = {
  onUpdate?: (state: { leftSensor: number; rightSensor: number; position: { x: number; y: number }; mistakes: string[] }) => void;
};

const canvasSize = 320;

export function LineFollowerSimulator({ onUpdate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [robot, setRobot] = useState<RobotState>({ x: 40, y: 160, heading: 0, leftMotorSpeed: 1, rightMotorSpeed: 1 });
  const [sensorOffset, setSensorOffset] = useState(12);
  const [threshold, setThreshold] = useState(0.5);
  const [speedScale, setSpeedScale] = useState(1);
  const [sensors, setSensors] = useState<SensorState>({ left: 0, right: 0 });
  const pathRef = useRef<Path2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const path = new Path2D();
    path.moveTo(20, 160);
    path.lineTo(300, 160);
    path.quadraticCurveTo(320, 160, 300, 200);
    path.lineTo(40, 200);
    path.quadraticCurveTo(20, 200, 40, 120);
    path.lineTo(300, 120);
    pathRef.current = path;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 10;
      if (pathRef.current) {
        ctx.stroke(pathRef.current);
      }

      const sensorPositions = getSensorPositions(robot, sensorOffset);
      const leftValue = readSensor(sensorPositions.left, ctx, threshold);
      const rightValue = readSensor(sensorPositions.right, ctx, threshold);
      setSensors({ left: leftValue, right: rightValue });

      const mistakes: string[] = [];
      const diff = robot.leftMotorSpeed - robot.rightMotorSpeed;
      if (Math.abs(diff) > 0.6) mistakes.push(diff > 0 ? "Robot is drifting right" : "Robot is drifting left");
      if (leftValue < threshold && rightValue < threshold) mistakes.push("Both sensors see dark; stay centered or slow down.");

      if (onUpdate) {
        onUpdate({ leftSensor: leftValue, rightSensor: rightValue, position: { x: robot.x, y: robot.y }, mistakes });
      }

      drawRobot(ctx, robot, sensorPositions);

      const { nextRobot } = stepRobot(robot, leftValue, rightValue, speedScale);
      setRobot(nextRobot);

      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationFrame);
  }, [robot, sensorOffset, threshold, speedScale, onUpdate]);

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center gap-3 text-sm">
        <label className="flex flex-col text-xs">
          Speed Scale
          <input type="range" min={0.2} max={2} step={0.1} value={speedScale} onChange={(e) => setSpeedScale(parseFloat(e.target.value))} />
        </label>
        <label className="flex flex-col text-xs">
          Threshold
          <input type="range" min={0} max={1} step={0.05} value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} />
        </label>
        <label className="flex flex-col text-xs">
          Sensor Offset
          <input type="range" min={6} max={24} step={1} value={sensorOffset} onChange={(e) => setSensorOffset(parseFloat(e.target.value))} />
        </label>
      </div>
      <canvas ref={canvasRef} width={canvasSize} height={canvasSize} className="w-full rounded bg-white shadow-inner" />
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded bg-slate-100 p-2">Left Sensor: {sensors.left.toFixed(2)}</div>
        <div className="rounded bg-slate-100 p-2">Right Sensor: {sensors.right.toFixed(2)}</div>
        <div className="rounded bg-slate-100 p-2">Left Motor: {robot.leftMotorSpeed.toFixed(2)}</div>
        <div className="rounded bg-slate-100 p-2">Right Motor: {robot.rightMotorSpeed.toFixed(2)}</div>
      </div>
    </div>
  );
}

function getSensorPositions(robot: RobotState, offset: number) {
  const dx = Math.cos(robot.heading);
  const dy = Math.sin(robot.heading);
  const leftX = robot.x + dx * 14 - dy * offset;
  const leftY = robot.y + dy * 14 + dx * offset;
  const rightX = robot.x + dx * 14 + dy * offset;
  const rightY = robot.y + dy * 14 - dx * offset;
  return { left: { x: leftX, y: leftY }, right: { x: rightX, y: rightY } };
}

function drawRobot(ctx: CanvasRenderingContext2D, robot: RobotState, sensors: { left: { x: number; y: number }; right: { x: number; y: number } }) {
  ctx.save();
  ctx.translate(robot.x, robot.y);
  ctx.rotate(robot.heading);
  ctx.fillStyle = "#2563eb";
  ctx.fillRect(-12, -10, 24, 20);
  ctx.restore();

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(sensors.left.x, sensors.left.y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(sensors.right.x, sensors.right.y, 3, 0, Math.PI * 2);
  ctx.fill();
}

function readSensor(pos: { x: number; y: number }, ctx: CanvasRenderingContext2D, threshold: number) {
  const pixel = ctx.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
  const brightness = (pixel[0] + pixel[1] + pixel[2]) / (3 * 255);
  return brightness < threshold ? 1 : 0;
}

function stepRobot(robot: RobotState, leftSensor: number, rightSensor: number, speedScale: number) {
  let leftMotor = robot.leftMotorSpeed;
  let rightMotor = robot.rightMotorSpeed;

  if (leftSensor === 1 && rightSensor === 0) {
    leftMotor = 0.6 * speedScale;
    rightMotor = 1.2 * speedScale;
  } else if (rightSensor === 1 && leftSensor === 0) {
    leftMotor = 1.2 * speedScale;
    rightMotor = 0.6 * speedScale;
  } else if (rightSensor === 1 && leftSensor === 1) {
    leftMotor = 1 * speedScale;
    rightMotor = 1 * speedScale;
  } else {
    leftMotor = 0.8 * speedScale;
    rightMotor = 0.8 * speedScale;
  }

  const heading = robot.heading + (rightMotor - leftMotor) * 0.05;
  const x = robot.x + Math.cos(heading) * leftMotor * 2;
  const y = robot.y + Math.sin(heading) * leftMotor * 2;

  const nextRobot = { x, y, heading, leftMotorSpeed: leftMotor, rightMotorSpeed: rightMotor };
  return { nextRobot };
}

export default LineFollowerSimulator;
