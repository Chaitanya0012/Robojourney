export const getSimulatorStateTool = {
  name: "get_simulator_state",
  description:
    "Read the current simulator state including sensors, motors, and positional data for the robotics project.",
  parameters: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    // In a real simulator, this would query live telemetry.
    return {
      motors: {
        left: { rpm: 120, dutyCycle: 0.42 },
        right: { rpm: 118, dutyCycle: 0.41 },
      },
      sensors: {
        imu: { roll: 0.2, pitch: -0.1, yaw: 12.3 },
        line: [0.1, 0.05, -0.02, 0.04],
        distance: { front: 0.45, left: 0.32, right: 0.38 },
      },
      battery: { voltage: 7.3 },
      status: "running",
      timestamp: new Date().toISOString(),
    };
  },
};

export type SimulatorState = Awaited<
  ReturnType<typeof getSimulatorStateTool["handler"]>
>;
