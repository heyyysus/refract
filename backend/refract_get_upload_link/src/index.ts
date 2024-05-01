import { APIGatewayProxyResult } from "aws-lambda";
import { APIEvent, Context, RequestContext } from "./types";
import { S3 } from "aws-sdk";

const PRODUCTION = true;

const cors = (a: any, origin: string) => {
    return {
        ... a,
        headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': "Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
            "Access-Control-Max-Age": "300",

        },
    };
}

class InvalidExtensionError extends Error {};

const isValidExtension = (ext: string) => {
    if(!ext) return false;
    const l_ext = ext.toLowerCase();
    if(l_ext === 'png' || l_ext === 'jpg' || l_ext === 'jpeg')
        return true;
    return false;
}

const createPresignedImageUploadUrl = async (user_id: string, extension: string) => {
    const s3 = new S3();
    const region = "us-west-2";
    const bucket = "refract-images";
    const dateTime = Date.now();
    const filename = `${user_id}-${dateTime}.${extension}`;
    const key = `in/${filename}`;
    const presignedUrl = await s3.getSignedUrlPromise('putObject', {
        Bucket: bucket,
        Key: key,
        Expires: 100,
        ContentType: `image/${extension}`,
    });

    return { url: presignedUrl, filename: filename }
    
  };
  

export const prehandler = async (event: APIEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
        const method = event.requestContext.http.method;
        // const sub = event.requestContext.authorizer.jwt.claims.sub;
        const sub = "test_user";
        switch(method){
        case "GET":
            const extension = event.queryStringParameters?.extension || undefined;
            if(!isValidExtension(extension)) throw new InvalidExtensionError;

            const signedUrl = await createPresignedImageUploadUrl(sub, extension);
            console.log(signedUrl);
            return {
                statusCode: 200,
                body: JSON.stringify(signedUrl)
            };
        }
    } catch(e){
        console.log(e);
        if(e instanceof InvalidExtensionError)
            return {
                statusCode: 400,
                body: "Invalid Extension Type"
            };
        return { 
            statusCode: 500,
            body: `Internal Error: ${e}`
        }
    }
}

export const handler = async (event: APIEvent, context: Context): Promise<APIGatewayProxyResult> => {


    return prehandler(event, context);

    try {

        const allowed_origin = (PRODUCTION) ? `https://d29ba174zxs5ij.cloudfront.net` : 'http://169.231.185.82';
        if(event.requestContext.http.method === "OPTIONS")
            return cors({
                statusCode: 200,
                body: "",
            }, allowed_origin);
        
        return cors(await prehandler(event, context), allowed_origin);
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error })
        };
    }
}