#!/bin/bash
cd queue_model_lambda/package
zip -r ../queue_model.zip .
cd ..
zip queue_model.zip lambda_function.py

aws lambda update-function-code --function-name queue_refract_model \
--zip-file fileb://queue_model.zip