import React from 'react';

export interface ModelUIProps {
    className?: string;
    outputImage: string | null;
    handleRunModel: (inputImage: File) => Promise<void>;
}

const ModelUI: React.FC<ModelUIProps> = ({ className, outputImage, handleRunModel }) => {
    const [inputImage, setInputImage] = React.useState<File | null>(null);

    return (
        <div className={`${className} flex flex-col items-center`}>
            <span className='text-lg font-bold'>Uploaded Image</span>
            <div className="inline-flex border-black border-solid border-2 mb-5">
            {
                inputImage ? (<img src={URL.createObjectURL(inputImage)} alt="Uploaded Image" />) : (
                <div className='w-[400px] h-[400px] bg-gray-200'></div>
                )
            }
            </div>
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
            <span className='text-lg font-bold mt-10'>Model Output</span>
            <div className="inline-flex border-black border-solid border-2">
            {
                outputImage ? (<img src={outputImage} alt="Model Output" />) : (
                <div className='w-[400px] h-[400px] bg-gray-200'></div>
                )
            }
            </div>
        </div>
    );
};

export default ModelUI;
