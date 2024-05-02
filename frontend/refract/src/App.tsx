import React from 'react';
import { useAuth0 } from "@auth0/auth0-react"
import './App.css';

import { MobileUI } from './components/MobileUI';

import { queueModel, getUploadLinkURL, getJobStatus, uploadImage, s3BucketURL } from './utility/api';
import LoginPage from './LoginPage';

function App() {

  const [outputImage, setOutputImage] = React.useState<string | null>(null);

  // const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  const handleRunModel = async (inputImage: File, compress_size: number,  p_allow: number, alpha: number): Promise<void> => {
    console.log('Running Model');

    try {
      const extension = inputImage.name.split('.').pop()?.toLowerCase() || '';

      console.log(inputImage);
      console.log(extension);

      const uploadLink = await getUploadLinkURL((extension === 'jpeg') ? 'jpg' : extension);

      console.log("Upload Link: ");
      console.log(uploadLink);

      if (uploadLink === undefined) {
        throw new Error('Error getting upload link');
      }

      await uploadImage(inputImage, uploadLink.url);

      const input_path = `${s3BucketURL}/in/${uploadLink.filename}`;

      const job_id = await queueModel(input_path, compress_size, p_allow, alpha);

      console.log(job_id);

      if (job_id === undefined) {
        throw new Error('Error queuing model');
      }
      

      let job_save = null;
      let status = 'queued';
      while (status === 'queued' || status === 'processing') {
        const job = await getJobStatus(job_id);
        status = job ? job.status : 'client_error';
        console.log(status);
        job_save = job;
      }

      const output_url = job_save?.output_url;
      console.log(output_url);
      if (output_url) setOutputImage(output_url);

    } catch (error) {
      console.error(error);
    }
    
  };


  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (!isAuthenticated){
  //   return <LoginPage />;
  // }

  return (
    <div className="App">
      {/* UI Container  */}
      <div className='flex justify-center'>
        <MobileUI outputImage={outputImage} handleRunModel={handleRunModel} />
      </div>
    </div>
  );
}

export default App;
