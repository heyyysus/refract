import * as React from "react";

export interface MobileUIProps {
  className?: string;
  outputImage: string | null;
  handleRunModel: (inputImage: File) => Promise<void>;
}

export const MobileUI: React.FC<MobileUIProps> = ({ className, outputImage, handleRunModel }) => {
  const [inputImage, setInputImage] = React.useState<File | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if(fileInputRef.current)
      fileInputRef.current.click();
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setInputImage(file); // Assuming setInputImage is defined somewhere in your component or props
    }
  };

  return (
    <div className="flex flex-col items-center mx-auto w-full bg-slate-600 font-Segoe UI Emoji max-w-[480px]">
      <div className="flex gap-0 justify-center self-stretch px-5">
        <div className="flex gap-1 justify-center px-11 py-6 text-lg tracking-tight leading-3 text-center text-black whitespace-nowrap font-[590]"></div>
      </div>
      <div className="flex gap-0 mt-2 text-base tracking-tight leading-4 text-center whitespace-nowrap">
        <div className="flex flex-col grow shrink-0 basis-0 w-fit">
          <div className="flex gap-4 px-9 py-5 rounded-2xl bg-slate-500">
            <div className="flex flex-col flex-1 text-white">
              <div className="self-start font-bold">1. Upload Image</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <button
                className="justify-center px-11 py-3 mt-7 bg-violet-400 rounded-2xl"
                onClick={ (e: any) => {handleButtonClick()} }
                >
                Upload
              </button>
            </div>
            <button className="grow justify-center self-end px-9 py-3.5 mt-11 text-black bg-indigo-200 rounded-2xl">
              Clear File
            </button>
          </div>
          <div className="flex flex-col px-3 py-6 mt-3 text-white rounded-2xl bg-slate-500">
            <div className="self-start ml-6 font-bold">2. Adjust settings</div>
            <div className="flex flex-col justify-center items-center px-10 py-5 mt-4 rounded-2xl bg-slate-400">
              <div className="pb-2 flex flex-col max-w-full w-[106px]">
                <div>Intensity</div>
              </div>
              <div className="container mx-2">
                  <input type="range" className="w-full bg-white h-1 rounded-lg appearance-none cursor-pointer" />
                </div>
            </div>
            <div className="flex flex-col justify-center items-center px-10 py-5 mt-4 rounded-2xl bg-slate-400">
              <div className="pb-2 flex flex-col max-w-full w-[106px]">
                <div>Render Quality</div>
              </div>
              <div className="container mx-2">
                  <input type="range" className="w-full bg-white h-1 rounded-lg appearance-none cursor-pointer" />
                </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="shrink-0 self-end mt-5 rounded border border-solid bg-slate-600 bg-opacity-50 border-white border-opacity-50 h-[275px] w-[9px]" /> */}

      <div className="items-center px-16 pt-3.5 pb-3.5 mt-4 w-full text-base tracking-tight leading-4 text-center text-white whitespace-nowrap rounded-t-2xl bg-slate-500 max-w-[367px]">
        Resulting image:
      </div>
      <div className="flex z-10 flex-col items-center px-16 pt-20 pb-2 mt-0 w-full bg-slate-400 max-w-[367px] overflow-auto">
      </div>
    </div>
  );
}