import boto3
import botocore
import json
from decimal import Decimal
import time

from boto3.dynamodb.conditions import Key

class DecimalEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, Decimal):
      return str(obj)
    return json.JSONEncoder.default(self, obj)

def lambda_handler(event, context):
    job_id = event['queryStringParameters']['job_id']
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('refract_jobs')

    filtering_exp = Key('job_id').eq(int(job_id))
    response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    item = items[0] if items else None

    if item:
        return {
            'statusCode': 200,
            'body': json.dumps(item, cls=DecimalEncoder)
        }
    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'Job not found'})
        }