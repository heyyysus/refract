from model.process_image import process_image
from model.refract import RunRefract
from model.run_model import run_model
import numpy as np
import time
import datetime
import boto3
import requests
import os


dynamodb = boto3.resource('dynamodb', region_name='us-west-1')
table = dynamodb.Table('refract_jobs')

s3_path = "http://refract-data.s3-website-us-west-2.amazonaws.com"

def check_latest_job():
    response = table.scan()
    items = response['Items']

    latest_job = items[0]
    for item in items:
        if item['ordered_ts'] > latest_job['ordered_ts']:
            latest_job = item

    return latest_job

def main():
    while(True):

        job = check_latest_job()
        # job = "TEST PRINT"

        if job['status'] == "queued":
            print("Processing job...")

            job['processed_ts'] = int(time.time())
            table.put_item(Item=job)

            print(job)

            input_url = job['input_url']
            compress_size = int(job['compress_size'])
            p_allow = float(job['p_allow'])
            alpha = float(job['alpha'])


            ext = input_url.split('.')[-1]

            # Get image and download to ./tmp/
            print("Downloading image...")

            try:
                response = requests.get(input_url)
                input_path = f"./tmp/{job['job_id']}-in.{ext}"
                output_path = f"./tmp/{job['job_id']}-out.{ext}"
                
                if response.status_code == 200:
                    with open(input_path, 'wb') as file:
                        file.write(response.content)
                    print("Image downloaded successfully.")
                    job['status'] = "processing"    
                    table.put_item(Item=job)

                    refract_image = run_model(
                        compress_size=compress_size,
                        p_allow=p_allow, 
                        alpha=alpha, 
                        input_path=input_path,
                        output_path=output_path
                    )

                    print("Refract finished running")

                    # Upload image to S3
                    s3 = boto3.client('s3')
                    s3.upload_file(output_path, 'refract-data', f"{job['job_id']}-out.{ext}")

                    print("Image uploaded to S3")

                    job['output_url'] = f"{s3_path}/{job['job_id']}-out.{ext}"
                    job['status'] = "completed"
                    job['completed_ts'] = int(time.time())
                    table.put_item(Item=job)


                else:
                    print("Failed to download image.")
                    print("Response status: ", response.status_code)
                    job['status'] = "failed_image_download"
                    table.put_item(Item=job)

            except Exception as e:
                print("Server Error.")
                job['status'] = "server_error"
                print("Exception", e)
                table.put_item(Item=job)
                continue

            

            time.sleep(2)

            print("Job processed.")

        # DELETE TMP/*
        print("Deleting tmp files...")
        for file in os.listdir('./tmp'):
            os.remove(f"./tmp/{file}")
        
        time.sleep(5)
        

if __name__ == '__main__':
    main()
