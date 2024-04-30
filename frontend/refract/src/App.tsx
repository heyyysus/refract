import React from 'react';
import { useAuth0 } from "@auth0/auth0-react"
import './App.css';

import { MobileUI } from './components/MobileUI';

import { queueModel, getUploadLinkURL, getJobStatus, uploadImage, s3BucketURL } from './utility/api';
import LoginPage from './LoginPage';

function App() {

  const [outputImage, setOutputImage] = React.useState<string | null>(null);

  // const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  const handleRunModel = async (inputImage: File): Promise<void> => {
    console.log('Running Model');

    const compress_size = 160;
    const p_allow = 0.00;
    const alpha = 5.00;

    try {
      const uploadLink = await getUploadLinkURL(inputImage.name.split('.').pop() || '');

      if (uploadLink === undefined) {
        throw new Error('Error getting upload link');
      }

      await uploadImage(inputImage, uploadLink.url);

      const input_path = `{s3BucketURL}/in/${uploadLink.filename}`;

      const job_id = await queueModel(input_path, compress_size, p_allow, alpha);

      if (job_id === undefined) {
        throw new Error('Error queuing model');
      }

      let status = 'queued';
      while (status === 'queued' || status === 'running') {
        const job_status = await getJobStatus(job_id);
        status = job_status ? job_status.status : 'error';
        console.log(status);

      }

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
