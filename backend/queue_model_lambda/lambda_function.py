import boto3
import botocore
import json
import time

'''

Query Params:
- input_url: URL of the image to be processed
- noise_percent: Percentage of noise to be added to the image
- learning_rate: Learning rate for the optimizer
- p_allow: p_allow for the optimizer
- alpha: alpha for the optimizer
- max_steps: Maximum number of steps for the optimizer

'''

def lambda_handler(event, context):
      print(f'boto3 version: {boto3.__version__}')
      print(f'botocore version: {botocore.__version__}')

      # Get query param "input_url"
      input_url = event['queryStringParameters']['input_url']
      user_id = "test_user_id"

      compress_size = int(event['queryStringParameters']['compress_size'])
      p_allow = float(event['queryStringParameters']['p_allow'])
      alpha = float(event['queryStringParameters']['alpha'])

      dynamodb = boto3.resource('dynamodb')
      table = dynamodb.Table('refract_jobs')
   
      response = table.scan()
      items = response['Items']
      job_id = len(items) + 1

      job = {
            'job_id': job_id,
            'user_id': user_id,
            'input_url': input_url,
            'compress_size': compress_size,
            'p_allow': p_allow,
            'alpha': alpha,
            'status': 'queued',
            'ordered_ts': int(time.time())
      }

      table.put_item(Item=job)

      return {
            'statusCode': 200,
            'body': json.dumps({
                  'message': 'Job created successfully',
                  'job_id': job_id
            })
      }




   