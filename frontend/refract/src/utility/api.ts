
/**
 * 
 * @param imageFile - The image file to upload
 * @returns The URL of the output image
 * 
 * Will throw an error if the API endpoint is not found in the environment variables or 
 * if the fetch request fails
 */
export async function runModel(imageFile: File, auth_token: string): Promise<string | void> {
    const apiEndpoint: string = process.env.API_ENDPOINT || '';
    if (apiEndpoint === '') {
        throw new Error('API endpoint not found in environment variables');
    }
    
    const url = new URL(`${apiEndpoint}/queue-model`);
    const method = 'POST';
    const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${auth_token}`,
    };


    const formData = new FormData();
    formData.append('image', imageFile);

    const options = {
        method,
        headers,
        body: formData,
    };

    try {
        const response = await fetch(url.toString(), options);
        if (response.ok) {
            const data = response.json();
            data.then((json) => {
                return json['imageUrl'];
            }
            ).catch((error) => {
                throw error;
            }
            );
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error uploading image');
    }
}
