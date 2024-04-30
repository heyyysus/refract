import React from 'react';
import { useAuth0 } from "@auth0/auth0-react"
import './App.css';

import { MobileUI } from './components/MobileUI';

import { runModel } from './utility/api';
import LoginPage from './LoginPage';

function App() {

  const [outputImage, setOutputImage] = React.useState<string | null>(null);

  // const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  const handleRunModel = async (inputImage: File): Promise<void> => {
    console.log('Running Model');
    try {
      // const access_token = await getAccessTokenSilently();
      const access_token = "";
      const imageUrl = await runModel(inputImage, access_token);
      if (imageUrl) {
        setOutputImage(imageUrl);
      }
    } catch (error) {
      // Handle Error in the UI
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
