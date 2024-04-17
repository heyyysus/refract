#!/bin/bash
cd refract_get_job/package
zip -r ../refract_get_job.zip .
cd ..
zip refract_get_job.zip lambda_function.py

aws lambda update-function-code --function-name refract_get_job \
--zip-file fileb://refract_get_job.zip