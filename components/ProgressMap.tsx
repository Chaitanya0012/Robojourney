"use client";

import React, { useEffect, useMemo, useState } from "react";
import { curriculumNodes } from "../lib/articles";
import { supabaseClient } from "../lib/supabaseClient";

export type ProgressEntry = {
  nodeId: string;
  completed: boolean;
  locked: boolean;
  nextReviewDate?: string;
};

type Props = {
  progress?: Record<string, ProgressEntry>;
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

export function ProgressMap({ progress: providedProgress, onSelect }: Props) {
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>(() => providedProgress ?? {});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabaseClient.from("progress").select("node_id, completed, locked, next_review_date");
      if (cancelled || !data) return;
      const mapped: Record<string, ProgressEntry> = {};
      data.forEach((row: any) => {
        mapped[row.node_id] = {
          nodeId: row.node_id,
          completed: !!row.completed,
          locked: !!row.locked,
          nextReviewDate: row.next_review_date ?? undefined,
        };
      });
      setProgress((prev) => ({ ...prev, ...mapped }));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [providedProgress]);

  const computed = useMemo(() => {
    const fallback: Record<string, ProgressEntry> = {};
    curriculumNodes.forEach((nodeId, idx) => {
      const prior = fallback[curriculumNodes[idx - 1]] ?? progress[curriculumNodes[idx - 1]];
      const entry = progress[nodeId] ?? { nodeId, completed: false, locked: true };
      const locked = idx === 0 ? false : !!prior?.locked || !prior?.completed;
      fallback[nodeId] = { ...entry, locked };
    });
    return fallback;
  }, [progress]);

  const glowNode = useMemo(() => curriculumNodes.find((id) => !computed[id]?.completed && !computed[id]?.locked), [computed]);

  return (
    <div className="flex flex-wrap gap-4">
      {curriculumNodes.map((nodeId) => {
        const status = computed[nodeId];
        const locked = status?.locked;
        const completed = status?.completed;
        const isNext = glowNode === nodeId;
        return (
          <button
            key={nodeId}
            className={`rounded-full px-4 py-3 text-sm shadow transition ${
              completed
                ? "bg-green-200 text-green-900"
                : locked
                  ? "bg-gray-200 text-gray-500"
                  : "bg-blue-200 text-blue-900"
            } ${isNext ? "animate-glow" : ""}`}
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
