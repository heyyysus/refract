#!/bin/bash
cd refract_get_upload_link

# compile index.ts
npx tsc

# zip all files in the dist directory
cd dist
zip -r ../aws_dist/refract_get_upload_link.zip .

cd ../aws_dist

aws lambda update-function-code --function-name refract_get_upload_link \
--zip-file fileb://refract_get_upload_link.zip