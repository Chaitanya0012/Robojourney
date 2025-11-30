"use client";

import React from "react";
import { curriculumNodes } from "../lib/articles";

export type ProgressEntry = {
  nodeId: string;
  completed: boolean;
  locked: boolean;
  nextReviewDate?: string;
};

type Props = {
  progress: Record<string, ProgressEntry>;
  onSelect?: (nodeId: string) => void;
};

const titles: Record<string, string> = {
  what_is_electricity: "What is Electricity",
  digital_vs_analog: "Digital vs Analog",
  what_is_a_sensor: "What is a Sensor",
  light_sensors: "Light Sensors",
  motors_basics: "Motors Basics",
  logic_basics: "Logic Basics",
  intro_to_arduino: "Intro to Arduino",
  arduino_gpio: "Arduino GPIO",
  arduino_pwm: "Arduino PWM",
  build_a_line_follower: "Build a Line Follower",
  esp32_intro: "ESP32 Intro",
  esp32_wifi_basics: "ESP32 WiFi",
  esp32_pwm_basics: "ESP32 PWM",
};

export function ProgressMap({ progress, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      {curriculumNodes.map((nodeId, idx) => {
        const status = progress[nodeId];
        const locked = status?.locked ?? idx !== 0 && !progress[curriculumNodes[idx - 1]]?.completed;
        const completed = status?.completed ?? false;
        return (
          <button
            key={nodeId}
            className={`rounded-full px-4 py-3 text-sm shadow transition ${
              completed
                ? "bg-green-200 text-green-900"
                : locked
                  ? "bg-gray-200 text-gray-500"
                  : "bg-blue-200 text-blue-900"
            }`}
            disabled={locked}
            onClick={() => onSelect?.(nodeId)}
            aria-label={`Curriculum node ${titles[nodeId] || nodeId}`}
          >
            <div className="font-semibold">{titles[nodeId] || nodeId}</div>
            <div className="text-xs">{locked ? "Locked" : completed ? "Completed" : "Ready"}</div>
            {status?.nextReviewDate && (
              <div className="text-[10px] text-gray-700">Review: {new Date(status.nextReviewDate).toLocaleDateString()}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
