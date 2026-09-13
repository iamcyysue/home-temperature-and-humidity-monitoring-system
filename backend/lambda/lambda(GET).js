import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

// Use environment variables for table names, fallback to "TemperatureData" if not set
const TABLE_NAME = process.env.TABLE_NAME || "TemperatureData"; 

export const handler = async (event) => {
  try {
    // Fetch data from the DynamoDB table
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const data = await dynamo.send(command);
    
    // Return successful response to the frontend
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Enable CORS for frontend access
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.error("DynamoDB Scan Error:", error);
    
    // Return error response (also including CORS headers)
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        message: "Failed to fetch data", 
        error: error.message 
      }),
    };
  }
};
