import React from 'react';
import './App.css';

import ModelUI from './components/ModelUI';

import { uploadImage } from './utility/api';

function App() {

  const [outputImage, setOutputImage] = React.useState<string | null>(null);


  const handleRunModel = async (inputImage: File): Promise<void> => {
    console.log('Running Model');
    try {
      const imageUrl = await uploadImage(inputImage);
      if (imageUrl) {
        setOutputImage(imageUrl);
      }
    } catch (error) {
      // Handle Error in the UI
      console.error(error);
    }
  };

  return (
    <div className="App">
      {/* UI Container  */}
      <div className='flex justify-center'>
        <ModelUI className='w-1/2 flex content-center mt-10' 
          outputImage={ outputImage } 
          handleRunModel={ handleRunModel } 
        />
      </div>
    </div>
  );
}

export default App;
