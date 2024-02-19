import React from 'react';
import './App.css';

import ModelUI from './components/ModelUI';

import { uploadImage } from './utility/RefractModel';

function App() {

  const [outputImage, setOutputImage] = React.useState<string | null>(null);

  const handleRunModel = async (inputImage: File): Promise<void> => {
    try {
      const imageUrl = await uploadImage(inputImage);
      if (imageUrl) {
        setOutputImage(imageUrl);
      }
    } catch (error) {
      // Handle Error in the UI
      // The error message has already been logged in the utility function
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
