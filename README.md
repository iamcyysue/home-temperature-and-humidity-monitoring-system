# IoT Sensor Data Logger: Mobile App to AWS

This project demonstrates an end-to-end Internet of Things (IoT) architecture. It captures sensor data (e.g., from a Bluetooth-enabled microcontroller like an Arduino), processes it through a custom mobile app built with **MIT App Inventor**, and securely stores it in the cloud using **AWS (Amazon Web Services)**.

## Architecture Overview

The system is built using a serverless cloud architecture to ensure scalability and low cost:

1. **Hardware / Sensor (Optional):** Collects data and sends it to the mobile app (e.g., via Bluetooth BLE).
2. **Mobile App (MIT App Inventor):** Acts as the bridge. It receives the sensor data and makes an HTTP POST request to the cloud.
3. **AWS API Gateway:** The front door to the cloud backend. It receives the HTTP request from the mobile app.
4. **AWS Lambda:** The serverless compute engine. It processes the incoming JSON data from the API Gateway.
5. **AWS DynamoDB:** The NoSQL database where the sensor data is permanently stored.

```text
[ Sensor / Arduino ] --(BLE)--> [ MIT App Inventor App ] --(HTTP POST)--> [ AWS API Gateway ] --> [ AWS Lambda ] --> [ AWS DynamoDB ]

## Setup Instructions

### 1. AWS Backend Setup
To run this project, you will need an AWS account. Follow these steps to deploy the backend:

* **DynamoDB:** Create a table named `SensorData` with a partition key `deviceId` (String).
* **Lambda:** Create a Node.js or Python Lambda function. Attach an IAM role with DynamoDB write access. Copy the code from the `backend/` folder of this repository into your Lambda function.
* **API Gateway:** Create an HTTP API. Set up a `POST` route (e.g., `/data`) and integrate it with your Lambda function. Note your **Invoke URL**.

### 2. Mobile App Setup (MIT App Inventor)
1. Go to [MIT App Inventor](https://appinventor.mit.edu/).
2. Import the `.aia` project file found in the `app/` directory of this repository.
3. Go to the **Blocks** editor.
4. Locate the `Web1.Url` block and replace the placeholder URL (`https://[YOUR_API_URL_HERE]`) with your actual AWS API Gateway Invoke URL.
5. Build the `.apk` and install it on your Android device.
