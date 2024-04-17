import * as React from "react";

export interface MobileUIProps {
  className?: string;
  outputImage: string | null;
  handleRunModel: (inputImage: File) => Promise<void>;
}

export const MobileUI: React.FC<MobileUIProps> = ({
  className,
  outputImage,
  handleRunModel,
}) => {
  const [inputImage, setInputImage] = React.useState<File | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setInputImage(file); // Assuming setInputImage is defined somewhere in your component or props
    }
  };

  return (
    <div className="flex flex-col items-center mx-auto w-full bg-slate-600 font-mono max-w-[480px] overflow-auto">
      <div className="flex gap-0 justify-center self-stretch px-5">
        <div className="flex gap-1 justify-center px-11 py-6 text-lg tracking-tight leading-3 text-center text-black whitespace-nowrap font-[590]"></div>
      </div>
      <div className="flex gap-0 mt-2 text-base tracking-tight leading-4 text-center whitespace-nowrap">
        <div className="flex flex-col grow shrink-0 basis-0 w-fit px-9 pb-5">
          <div className="flex gap-4 px-9 py-6 items-stretch rounded-2xl bg-slate-500">
            <div className="flex flex-col flex-1 items-stretch text-white">
              <div className="flex flex-row justify-between	">
                <div className="font-bold">1. Upload Image</div>
                <div className="text-slate-300">image.png</div>
              </div>
              <div className="">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  ref={fileInputRef}
                />
                <button
                  className="grow justify-center self-center px-9 py-3.5 mr-2 mt-5 rounded-2xl
                  bg-[#9F7DFF] hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
                  onClick={(e: any) => {
                    handleButtonClick();
                  }}
                >
                  Upload
                </button>
                <button
                  className="grow justify-center self-center px-9 py-3.5 ml-2 mt-5 text-black bg-indigo-200 rounded-2xl
                 hover:bg-indigo-300 active:bg-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"
                >
                  Clear File
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col px-9 py-6 mt-3 text-white rounded-2xl bg-slate-500">
            {/* fhweuaifhiuhHIFUEWHAIFUHWEILUFAEHEWUAIFWA */}
            <div className="self-start font-bold">2. Adjust settings</div>
            <div className="flex flex-col justify-center items-center px-10 py-5 mt-4 rounded-2xl bg-slate-400">
              <div className="pb-2 flex flex-col max-w-full">
                <div>Intensity</div>
              </div>
              <div className="container mx-2">
                <input
                  type="range"
                  className="w-full bg-white h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center items-center px-10 py-5 mt-4 rounded-2xl bg-slate-400">
              <div className="pb-2 flex flex-col max-w-full">
                <div>Render Quality</div>
              </div>
              <div className="container mx-2">
                <input
                  type="range"
                  className="w-full bg-white h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            <button
              className="grow justify-center self-center px-9 py-3.5 mt-4 text-black bg-indigo-200 rounded-2xl
            hover:bg-indigo-300 active:bg-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"
            >
              Start!
            </button>
          </div>
          {/* <div className="shrink-0 self-end mt-5 rounded border border-solid bg-slate-600 bg-opacity-50 border-white border-opacity-50 h-[275px] w-[9px]" /> */}

          <div className="flex flex-col items-center px-9 py-6 mt-3 text-white whitespace-nowrap rounded-2xl bg-slate-500">
            <div className="flex self-start font-bold">3. Resulting image:</div>
            <img
              className="h-full w-full mt-4 object-cover"
              src="https://images.pexels.com/photos/821944/pexels-photo-821944.jpeg?cs=srgb&dl=pexels-george-desipris-821944.jpg&fm=jpg"
            />
            <button
              className="grow justify-center self-center px-9 py-3.5 mt-3 mb-3 text-black bg-indigo-200 rounded-2xl
       hover:bg-indigo-300 active:bg-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
