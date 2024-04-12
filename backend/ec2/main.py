from model.process_image import process_image
import numpy as np
import time
import datetime
import boto3

# Check latest job from DynamoDB
def check_latest_job():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('refract_jobs')

    response = table.scan()
    items = response['Items']

    latest_job = items[0]
    for item in items:
        if item['timestamp'] > latest_job['timestamp']:
            latest_job = item

    return latest_job

def main():
    while(True):
        start_time = time.time()

        job = check_latest_job()
        print(job)

        end_time = time.time()
        time.sleep(5)
        

if __name__ == '__main__':
    main()
