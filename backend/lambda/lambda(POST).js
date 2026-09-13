import json
import os
import boto3
from decimal import Decimal

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')

# Use environment variables for table name, fallback to "TemperatureData" if not set
TABLE_NAME = os.environ.get('TABLE_NAME', 'TemperatureData')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    try:
        # 1. Extract data from the incoming event
        if 'body' in event and event['body']:
            # Parse JSON body, converting floats to Decimal for DynamoDB compatibility
            data = json.loads(event['body'], parse_float=Decimal)
        else:
            # Fallback if the event itself is the payload
            event_json_str = json.dumps(event)
            data = json.loads(event_json_str, parse_float=Decimal)

        # 2. Validate required fields
        if 'sensor_id' not in data:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*' # Enable CORS
                },
                'body': json.dumps({'message': 'Bad Request: Missing required field sensor_id'})
            }

        # 3. Write data to DynamoDB
        table.put_item(Item=data)

        # 4. Return success response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'message': 'Data successfully written to DynamoDB!'})
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Internal Server Error', 
                'error': str(e)
            })
        }
