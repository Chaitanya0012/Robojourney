export const getSimulatorStateTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "get_simulator_state",
      description:
        "Retrieve the latest simulator state including robot pose, sensor readings, and controller status for debugging.",
      parameters: {
        type: "object",
        properties: {
          detail_level: {
            type: "string",
            description: "Optional level of detail: summary or full",
          },
        },
      },
    },
  },
  handler: async (args: Record<string, unknown>) => {
    const detail = typeof args.detail_level === "string" ? args.detail_level : "summary";
    const mockState = {
      timestamp: new Date().toISOString(),
      pose: { x: 1.2, y: 0.5, heading_deg: 45 },
      sensors: {
        lineSensors: [0.12, 0.08, 0.15, 0.1],
        imu: { roll: 0.02, pitch: -0.01, yaw_rate: 0.12 },
        distance: { front: 0.35, left: 0.42, right: 0.4 },
      },
      controller: {
        mode: "line_follow",
        target_speed_mps: 0.4,
        pid: { kp: 0.9, ki: 0.03, kd: 0.08 },
      },
      note: "This is a stubbed simulator state. Replace with real simulator integration as needed.",
    };

    if (detail === "full") {
      mockState.controller = {
        ...mockState.controller,
        telemetry: Array.from({ length: 10 }).map((_, idx) => ({
          t: idx * 0.02,
          error: Math.sin(idx / 2) * 0.05,
          control: 0.2 + idx * 0.01,
        })),
      } as typeof mockState.controller & { telemetry: { t: number; error: number; control: number }[] };
    }

    return mockState;
  },
};

export type GetSimulatorStateTool = typeof getSimulatorStateTool;
