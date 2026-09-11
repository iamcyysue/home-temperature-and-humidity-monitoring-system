# Home Temperature and Humidity Monitoring System

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![DynamoDB](https://img.shields.io/badge/Amazon%20DynamoDB-4053D6?style=for-the-badge&logo=Amazon%20DynamoDB&logoColor=white)
![Arduino](https://img.shields.io/badge/-Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white)

## IoT Sensor Data Logger: Mobile App to AWS

This project demonstrates an end-to-end Internet of Things (IoT) architecture. It captures sensor data (e.g., from a Bluetooth-enabled microcontroller like an Arduino), processes it through a custom mobile app built with MIT App Inventor, and stores it in the cloud using **AWS (Amazon Web Services)**.

---

## 🏗 Architecture Overview

The system is built using a serverless cloud architecture to ensure scalability and low cost:

System Architecture Diagram

<img width="792" height="182" alt="Home monitoring system drawio (2)" src="https://github.com/user-attachments/assets/1f951290-c3f6-464d-b58a-3e5f808c7b1d" />


1. **Hardware (Arduino Nano 33 BLE Sense):** Utilizes the on-board HTS221 sensor to collect temperature and humidity data, transmitting it to the mobile app via Bluetooth Low Energy (BLE).
2. **Mobile App (MIT App Inventor):** Acts as the bridge. It receives the sensor data and makes an HTTP POST request to the cloud.
3. **AWS API Gateway:** The front door to the cloud backend. It receives the HTTP request from the mobile app.
4. **AWS Lambda:** The serverless compute engine. It processes the incoming JSON data from the API Gateway.
5. **AWS DynamoDB:** The NoSQL database where the sensor data is permanently stored.

### Data Flow
[ Sensor / Arduino ] --(BLE)--> [ MIT App Inventor App ] --(HTTP POST)--> [ AWS API Gateway ] --> [ AWS Lambda ] --> [ AWS DynamoDB ]

**⚙️ Setup Instructions**
1. AWS Backend Setup

	To run this project, you will need an AWS account. Follow these steps to deploy 		the backend:
	  
	DynamoDB:Create a table named SensorData with a partition key deviceId(String).
	  
	Lambda: Create a Node.js or Python Lambda function. Attach an IAM role with
	DynamoDB write access. Copy the code from the backend/ folder of this repository 		into your Lambda function.

	API Gateway:Create an HTTP API. Set up a POST route (e.g., /data) and integrate it
	with your Lambda function. Note your Invoke URL.
			 
2. Mobile App Setup (MIT App Inventor)
   
   1.Go to [MIT App Inventor].
   
   2.Import the .aia project file found in the app/ directory of this repository.
   
   3.Go to the Blocks editor.
   
   4.Locate the Web1.Url block and replace the placeholder URL
		(https://[YOUR_API_URL_HERE]) with your actual AWS API Gateway Invoke URL.

   5.Build the .apk and install it on your Android device.

**🚀 Future Work**
Here are some planned features and improvements for the next iterations of this project:

**Data Visualization Dashboard:** Build a web-based frontend (e.g., React or Vue.js) to fetch data from DynamoDB and display real-time temperature and humidity charts.

**Automated Alerts:** Integrate AWS SNS (Simple Notification Service) to send email or SMS alerts when the temperature or humidity exceeds predefined safety thresholds.

**Direct Cloud Integration:** Upgrade the hardware to a Wi-Fi enabled module (like ESP32) to connect directly to AWS IoT Core via MQTT, removing the need for a mobile app bridge.

**Enhanced Security:** Implement API Keys or AWS Cognito to secure the API Gateway endpoints against unauthorized access.
