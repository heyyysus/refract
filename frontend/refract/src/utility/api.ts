
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

const s3BucketURL: string = process.env.S3_BUCKET_URL || '';
const apiEndpoint: string = process.env.API_ENDPOINT || '';

/**
 * 
 * @param imageFile - The image file to upload
 * @returns The URL of the output image
 * 
 * Will throw an error if the API endpoint is not found in the environment variables or 
 * if the fetch request fails
 */


export async function queueModel(
    input_url: string, 
    compress_size: number, 
    p_allow: number, 
    alpha: number
): Promise<number | void> {
    
    if (apiEndpoint === '') {
        throw new Error('API_ENDPOINT not found in environment variables');
    }

    if (s3BucketURL === '') {
        throw new Error('S3_BUCKET_URL not found in environment variables');
    }
    
    const url = new URL(`${apiEndpoint}/queue_refract_model`);
    url.searchParams.append('input_url', input_url);
    url.searchParams.append('compress_size', compress_size.toString());
    url.searchParams.append('p_allow', p_allow.toString());
    url.searchParams.append('alpha', alpha.toString());

    const method = 'POST';
    const headers = {
        'Content-Type': 'application/json',
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

export async function getUploadLinkURL(ext: string): Promise< {url: string, filename: string} | void > {
    if (apiEndpoint === '') {
        throw new Error('API_ENDPOINT not found in environment variables');
    }

    const url = new URL(`${apiEndpoint}/refract_get_upload_link`);
    url.searchParams.append('extension', ext);
    const method = 'GET';
    const headers = {
        'Content-Type': 'application/json',
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

export async function uploadImage(imageFile: File, uploadLink: string): Promise<string | void> {
    const formData = new FormData();
    formData.append('file', imageFile);

    const options = {
        method: 'PUT',
        body: formData,
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

export async function getJobStatus(job_id: number): Promise<JobStatus | void> {
    if (apiEndpoint === '') {
        throw new Error('API_ENDPOINT not found in environment variables');
    }

    const url = new URL(`${apiEndpoint}/refract_get_job_status`);
    url.searchParams.append('job_id', job_id.toString());
    const method = 'GET';
    const headers = {
        'Content-Type': 'application/json',
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