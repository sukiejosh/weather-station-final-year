# Weather Station Web Project

This project is divided into three main parts:

1. [Weather Station Frontend](./weather-station-project/README.md)
2. [Weather Station Backend](./weather-station-backend/README.md)
3. Weather Station Microcontroller Program (`weather-station-microcontroller-program.ino`)

## Weather Station Frontend

The frontend part of the Weather Station project is built using Vue 3. For more information on how to set up, run, and use this part of the application, please refer to the [Weather Station Frontend README](./weather-station-project/README.md).

## Weather Station Backend

The backend of the Weather Station project is developed in Node.js. To learn how to configure, run, and interact with the backend, please see the [Weather Station Backend README](./weather-station-backend/README.md).

## Weather Station Microcontroller Program

The `weather-station-microcontroller-program.ino` file contains the firmware for the microcontroller used in the Weather Station. This C file is responsible for collecting data from sensors and sending it to the backend. You can find instructions for programming and using the microcontroller in the sections below.

### Prerequisites

To use the Weather Station Microcontroller Program, you'll need the following:

- An Arduino-compatible microcontroller board (e.g., Arduino Uno, ESP8266, or ESP32).
- Appropriate sensors (e.g., temperature, humidity, and pressure sensors).
- The Arduino IDE installed on your computer.

### Getting Started

1. Open the `weather-station-microcontroller-program.ino` file in the Arduino IDE.

2. Make sure to select the correct board and port in the Arduino IDE settings.

3. Install any necessary libraries if your sensors require them. You can do this through the Arduino Library Manager.

4. Customize the program to match your sensor configurations, Wi-Fi credentials, and server information.

5. Upload the program to your microcontroller.

6. Monitor the serial output to ensure that the microcontroller is successfully collecting and sending data.

### Troubleshooting

If you encounter any issues or need further assistance with the microcontroller program, please refer to the [Issues](https://github.com/your-username/your-repo/issues) section of this repository to see if there are solutions or open a new issue if needed.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
