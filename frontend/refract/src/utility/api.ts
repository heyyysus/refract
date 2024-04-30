
export interface JobStatus {
    job_id: number;
    user_id: string;
    input_url: string;
    alpha: number;
    p_allow: number;
    compress_size: number;
    status: string;
    ordered_ts: number;
    processed_ts?: number;
    completed_ts?: number;
    output_url?: string;
};

/* SET IN VERCEL */
/* HARDCODED FOR TESTING */
export const s3BucketURL: string = process.env.S3_BUCKET_URL || 'http://refract-data.s3-website-us-west-2.amazonaws.com';
export const apiEndpoint: string = process.env.API_ENDPOINT || 'https://qzklhiba4m.execute-api.us-west-1.amazonaws.com/';

if (apiEndpoint === '') {
    console.error('API_ENDPOINT not found in environment variables');
}

if (s3BucketURL === '') {
    console.error('S3_BUCKET_URL not found in environment variables');
}

/**
 * 
 * @param input_url - The URL of the input image
 * @returns job_id - The ID of the job
 * 
 */
export async function queueModel(
    input_url: string, 
    compress_size: number, 
    p_allow: number, 
    alpha: number
): Promise<number | void> {
    
    const url = new URL(`${apiEndpoint}/queue_refract_model`);
    url.searchParams.append('input_url', input_url);
    url.searchParams.append('compress_size', compress_size.toString());
    url.searchParams.append('p_allow', p_allow.toString());
    url.searchParams.append('alpha', alpha.toString());

    const method = 'POST';
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        // 'Authorization': `Bearer ${auth_token}`,
    };
    
    
    const options = {
        method,
        headers
    };
    
    try {
        const response = await fetch(url.toString(), options);
        if (response.ok) {
            const data = response.json();
            data.then((json) => {
                return json['job_id'];
            }).catch((error) => {
                throw error;
            }
        );
    }
    } catch (error) {
        console.error(error);
        throw new Error('Error uploading image');
    }
}

/** 
 * 
 * @param ext - The file extension of the image to upload
 * @returns The presigned URL to upload the image to
 * 
 **/
export async function getUploadLinkURL(ext: string): Promise< {url: string, filename: string} | void > {
    if (apiEndpoint === '') {
        throw new Error('API_ENDPOINT not found in environment variables');
    }

    const url = new URL(`${apiEndpoint}/refract_get_upload_link`);
    url.searchParams.append('extension', ext);
    const method = 'GET';
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };
    
    const options = {
        method,
        headers,
    };
    
    try {
        const response = await fetch(url.toString(), options);
        if (response.ok) {
            const data = response.json();
            data.then((json) => {
                return json;
            }).catch((error) => {
                throw error;
            }
        );
    }
    } catch (error) {
        console.error(error);
        throw new Error('Error getting upload link');
    }
}

/** 
 * 
 * @param imageFile - The image file to upload
 * @param uploadLink - The presigned URL to upload the image to
 * @returns The URL of the uploaded image
 * 
 **/
export async function uploadImage(imageFile: File, uploadLink: string): Promise<string | void> {
    const formData = new FormData();
    formData.append('file', imageFile);

    const headers = {
        'Content-Type': 'image/jpeg',
        'Access-Control-Allow-Origin': '*',
    };

    const options = {
        method: 'PUT',
        body: formData,
        headers,
    };

    try {
        const response = await fetch(uploadLink, options);
        if (response.ok) {
            return uploadLink;
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error uploading image');
    }
}

/** 
 * 
 * @param job_id - The ID of the job
 * @returns The status of the job
 * 
 **/

export async function getJobStatus(job_id: number): Promise<JobStatus | void> {
    if (apiEndpoint === '') {
        throw new Error('API_ENDPOINT not found in environment variables');
    }

    const url = new URL(`${apiEndpoint}/refract_get_job_status`);
    url.searchParams.append('job_id', job_id.toString());
    const method = 'GET';
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };
    
    const options = {
        method,
        headers,
    };
    
    try {
        const response = await fetch(url.toString(), options);
        if (response.ok) {
            const data = response.json();
            data.then((json) => {
                return json;
            }
            ).catch((error) => {
                throw error;
            }
        );
    }
    } catch (error) {
        console.error(error);
        throw new Error('Error getting job status');
    }
}