import React from 'react';
 
export interface RunButtonProps {
    onClick: () => Promise<void>;
    disabled?: boolean;
}


const RunButton: React.FC<RunButtonProps> = ({ onClick, disabled }) => {

    const buttonClass = disabled ? 'bg-blue-300 text-white font-bold py-2 px-4 rounded mt-5' : 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5';

    return (
        <button
            className={ buttonClass }
            onClick={onClick}
            disabled={disabled}
        >
            Run Model
        </button>
    );
}

export interface ModelUIProps {
    className?: string;
    outputImage: string | null;
    handleRunModel: (inputImage: File) => Promise<void>;
}

const ModelUI: React.FC<ModelUIProps> = ({ className, outputImage, handleRunModel }) => {
    const [inputImage, setInputImage] = React.useState<File | null>(null);

    

    return (
        <div className={`${className} flex flex-row align-start`}>
            <div className='flex flex-col'>
                <span className='text-lg font-bold mb-3'>Uploaded Image</span>
                <div className="inline-flex mb-5">
                {
                    inputImage ? (<img src={URL.createObjectURL(inputImage)} alt="Uploaded Image" />) : (
                    <div className='w-[400px] h-[400px] bg-gray-200'></div>
                    )
                }
                </div>
                <div className='flex flex-col align-start'>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                            setInputImage(file);
                        }
                    }}
                />

                <RunButton
                    onClick={async () => {
                        if (inputImage) {
                            await handleRunModel(inputImage);
                        }
                    }}
                    disabled={!inputImage}
                />
                </div>
            </div>
           
            <div className='flex flex-col ml-10'>
                <span className='text-lg font-bold mb-3'>Model Output</span>
                <div className="inline-flex mb-2">
                {
                    outputImage ? (<img src={outputImage} alt="Model Output" />) : (
                    <div className='w-[400px] h-[400px] bg-gray-200'></div>
                    )
                }
                </div>
                {
                    outputImage && (
                    <a href={outputImage} download>Download Image</a>
                    )
                }
            </div>
        </div>
    );
};

export default ModelUI;
