export interface Project {
  id: string;
  title: string;
  summary: string;
  difficulty: number;
  estimated_minutes: number;
  tags: string[];
  steps: string[];
  resources: string[];
}

export const projects: Project[] = [
  {
    id: "esp32_wifi_sensor_logger",
    title: "ESP32 Wi-Fi Sensor Logger",
    summary:
      "Use an ESP32 to read a temperature sensor and send the data over Wi-Fi to a simple web page for monitoring.",
    difficulty: 3,
    estimated_minutes: 60,
    tags: ["esp32", "wifi", "sensors"],
    steps: [
      "Wire a temperature sensor such as the DHT11 or DS18B20 to the ESP32 with power, ground, and a data pin.",
      "Install the required Arduino libraries for the sensor and for Wi-Fi connectivity.",
      "Write code that connects to your classroom Wi-Fi using a stored SSID and password.",
      "Read the sensor every few seconds and serve the values on a small web page hosted by the ESP32.",
      "Test the page from a phone or laptop on the same network and adjust refresh timing for stability.",
    ],
    resources: ["https://www.espressif.com/en/products/socs/esp32"],
  },
  {
    id: "arduino_line_follower",
    title: "Arduino Line Follower Robot",
    summary:
      "Build a two-wheel robot using infrared sensors and an Arduino to follow a dark line on a light surface.",
    difficulty: 3,
    estimated_minutes: 90,
    tags: ["arduino", "line follower", "motors"],
    steps: [
      "Mount two infrared line sensors at the front of the chassis, close to the ground but not touching it.",
      "Connect a motor driver such as the L298N to the Arduino, wiring direction pins and enable pins for PWM control.",
      "Write code that reads both sensors, decides if the robot is left or right of the line, and adjusts motor speeds accordingly.",
      "Calibrate sensor thresholds on your specific track by printing values to the serial monitor.",
      "Test at low speed, then gradually increase PWM values once the steering logic is stable.",
    ],
    resources: ["https://www.arduino.cc/en/Guide/HomePage"],
  },
  {
    id: "esp32_remote_car",
    title: "ESP32 Bluetooth Remote Car",
    summary:
      "Create a small car that receives Bluetooth commands from a phone app to drive forward, reverse, and turn.",
    difficulty: 4,
    estimated_minutes: 100,
    tags: ["esp32", "bluetooth", "motors"],
    steps: [
      "Attach an H-bridge motor driver to two DC motors and connect control pins to the ESP32.",
      "Initialize Bluetooth Serial in the sketch and pair the ESP32 with a phone-based terminal app.",
      "Interpret received characters (like F, B, L, R, S) to set motor directions and PWM speeds.",
      "Add safety checks to stop the motors if no command is received for a few seconds.",
      "Test commands indoors, then practice gentle steering to protect the driver and motors.",
    ],
    resources: ["https://randomnerdtutorials.com/esp32-bluetooth-classic-arduino-ide/"]
  },
];
