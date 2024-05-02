import { truncateSync } from "fs";
import * as React from "react";

export interface MobileUIProps {
  className?: string;
  outputImage: string | null;
  handleRunModel: (inputImage: File, compress_size: number, p_allow: number, alpha: number) => Promise<void>;
}

const delay = (ms:number) => new Promise(res => setTimeout(res, ms));

export const MobileUI: React.FC<MobileUIProps> = ({
  className,
  outputImage,
  handleRunModel,
}) => {

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cloakStrengthRef = React.useRef<HTMLInputElement>(null);
  const renderTimeRef = React.useRef<HTMLInputElement>(null);

  const [inputImage, setInputImage] = React.useState<File | null>(null);

  // TODO: REMOVE THIS
  // outputImage automatically updates when model successfully runs
  const [outputURL, setOutputURL] = React.useState<string | undefined>("https://m.media-amazon.com/images/I/51y8GUVKJoL.jpg");

  const [hasInput, setHasInput] = React.useState<boolean>(false);
  const [isRunning, setIsRunning] = React.useState<boolean>(false);
  const [hasOutput, setHasOutput] = React.useState<boolean>(false);

  // const fileInputRef = React.useRef<HTMLInputElement>(null);

  // const handleButtonClick = () => {
  //   if (fileInputRef.current) fileInputRef.current.click();
  // };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setInputImage(file); // Assuming setInputImage is defined somewhere in your component or props
    }
    setHasInput(true);
  };

  const onRunModel = async () => {
      if (!hasInput) return;
      setIsRunning(true);
      await delay(5000);
      // insert code to actually load...

      const cloakStrength = cloakStrengthRef.current?.value || '0';
      const renderTime = renderTimeRef.current?.value || '0';

      const alpha = 5.5 - (parseInt(cloakStrength) / 100.0) * 5.0;
      const compress_size = (parseInt(renderTime) >= 50) ? 512 : 160;

      console.log(`alpha: ${alpha}`);
      console.log(`compress_size: ${compress_size}`);

      await handleRunModel(inputImage!, compress_size, 0.0, alpha);
      setOutputURL(URL.createObjectURL(inputImage!));
      setIsRunning(false);
      setHasOutput(true);
  }

  return (
    <div className="flex flex-col items-center mx-auto w-full bg-slate-600 font-Segoe UI Emoji max-w-[480px]">
      <div className="flex gap-0 justify-center self-stretch px-5">
        <div className="flex gap-1 justify-center px-11 py-6 text-lg tracking-tight leading-3 text-center text-black whitespace-nowrap font-[590]"></div>
      </div>
      <div className="flex gap-0 mt-2 text-base tracking-tight leading-4 text-center whitespace-nowrap">
        <div className="flex flex-col grow shrink-0 basis-0 w-fit px-9 pb-5">
          <div className="flex gap-4 px-9 py-6 items-stretch rounded-2xl bg-slate-500">
            <div className="flex flex-col flex-1 items-stretch text-white">
              <div className="flex flex-row justify-between">
                  <div className="font-bold">1. Upload Image</div>

                  { /* TODO: Set styling to force rounded button on mobile */ }
                  <button
                    className="justify-center self-center p-0.5 disabled:text-gray-400 enabled:text-black text-sm
                    bg-indigo-200 rounded-2xl enabled:active:hover:bg-indigo-300 enabled:active:bg-indigo-400 
                    enabled:active:focus:outline-none enabled:active:focus:ring enabled:active:focus:ring-indigo-100 disabled:cursor-not-allowed"
                    disabled={!hasInput || isRunning}
                    onClick={() => {
                      setInputImage(null);
                      setHasInput(false);
                      fileInputRef.current!.value = "";
                    }}
                  >Clear File</button>
                  {/* TODO: Make clear file button look nicer */}
                {/* <div className="text-slate-300">image.png</div> */}
              </div>

              {/* <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file"></input> */}


              <div className="flex-column justify-center">
                {/* <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  ref={fileInputRef}
                /> */}
                {/* <input className="grow justify-center self-center py-3.5 mt-5 rounded-2xl dark:bg-gray-700" id="file_input" type="file" accept="image/*" onChange={(e) => handleFileChange(e)}></input> */}
                
                {/* <label
                  htmlFor="formFile"
                  className="mb-2 inline-block text-neutral-700 dark:text-neutral-200"
                >
                Default file input example
                </label> */}
                <input
                  className="relative m-0 block w-full min-w-0 flex-auto py-3.5 mt-5 rounded-2xl dark:bg-slate-400 file:disabled:text-gray-400 disabled:text-gray-500
                  bg-clip-padding px-3 py-[0.32rem] text-base text-neutral-700 file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 
                  file:border-solid file:border-inherit file:bg-indigo-200 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:enabled:active:bg-indigo-400 file:active:text-neutral-800
                  file:[margin-inline-end:0.75rem] hover:file:enabled:bg-indigo-300 focus:outline-none focus:ring focus:ring-indigo-100"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isRunning}
                  ref={fileInputRef}
                id="formFile"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF</p>

                {/* <button
                  className="grow justify-center self-center px-9 py-3.5 mr-2 mt-5 rounded-2xl
                  bg-[#9F7DFF] hover:bg-violet-600 enabled:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
                  onClick={(e: any) => {
                    handleButtonClick();
                  }}
                >
                  Upload
                </button> */}
              </div>
            </div>
          </div>
          <div className="flex flex-col px-9 py-6 mt-3 text-white rounded-2xl bg-slate-500">
            <div className="self-start font-bold">2. Adjust settings</div>
            <div className="flex flex-col justify-center items-center px-10 py-5 mt-4 rounded-2xl bg-slate-400">
              <div className="pb-2 flex flex-col max-w-full">
                <div>Cloak Strength</div>
              </div>
              <div className="container relative mx-2 mb-6">
                <input 
                id="labels-range-input" type="range" step="25"  
                className="w-full bg-white h-1 rounded-lg appearance-none cursor-pointer"
                disabled={isRunning}
                ref={cloakStrengthRef}
                />
                <span className="text-sm text-gray-500 dark:text-gray-500 absolute start-0 -bottom-6">Min</span>
                <span className="text-sm text-gray-500 dark:text-gray-500 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">Low</span>
                <span className="text-sm text-gray-500 dark:text-gray-500 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">Med</span>
                <span className="text-sm text-gray-500 dark:text-gray-500 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">High</span>
                <span className="text-sm text-gray-500 dark:text-gray-500 absolute end-0 -bottom-6">Max</span>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center px-10 py-5 mt-4 rounded-2xl bg-slate-400">
              <div className="pb-2 flex flex-col max-w-full">
                <div>Render Time</div>
              </div>
              <div className="container relative mx-2 mb-6">
                <input 
                id="labels-range-input" type="range" step="25" 
                className="w-full bg-white h-1 rounded-lg appearance-none cursor-pointer"
                disabled={isRunning}
                ref={renderTimeRef}
                />
                <span className="text-sm text-gray-500 dark:text-gray-500 absolute start-0 -bottom-6">Min</span>
                <span className="text-sm text-gray-500 dark:text-gray-500 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">Low</span>
                <span className="text-sm text-gray-500 dark:text-gray-500 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">Med</span>
                <span className="text-sm text-gray-500 dark:text-gray-500 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">High</span>
                <span className="text-sm text-gray-500 dark:text-gray-500 absolute end-0 -bottom-6">Max</span>
              </div>
            </div>
            <button
              className="grow justify-center self-center px-9 py-3.5 mt-4 disabled:text-gray-400 enabled:text-black 
              bg-indigo-200 rounded-2xl enabled:active:hover:bg-indigo-300 enabled:active:bg-indigo-400
              enabled:active:focus:outline-none enabled:active:focus:ring enabled:active:focus:ring-indigo-100 disabled:cursor-not-allowed"
              disabled={!hasInput || isRunning}
              onClick={() => onRunModel()}
            >
              Run model
            </button>
          </div>
          {/* <div className="shrink-0 self-end mt-5 rounded border border-solid bg-slate-600 bg-opacity-50 border-white border-opacity-50 h-[275px] w-[9px]" /> */}

          <div className="flex flex-col items-center px-9 py-6 mt-3 text-white whitespace-nowrap rounded-2xl bg-slate-500">
            <div className="flex self-start font-bold">3. Results</div>
            {isRunning && 
              <div className="flex flex-col justify-center items-center px-10 py-5 mt-4 rounded-2xl bg-slate-400">
                <div>Processing...</div>
              </div>}
            {!isRunning && hasOutput && 
            <img
              className="h-full w-full mt-4 object-cover"
              src={outputImage || outputURL}
            />}
            <a href={outputImage || outputURL} download target="_blank">
              <button
                className="grow justify-center self-center px-9 p-3.5 mt-3 mb-3 disabled:text-gray-400 enabled:text-black 
                bg-indigo-200 rounded-2xl enabled:active:hover:bg-indigo-300 enabled:active:bg-indigo-400 
                enabled:active:focus:outline-none enabled:active:focus:ring enabled:active:focus:ring-indigo-100 disabled:cursor-not-allowed"
                disabled={!hasOutput}
              > Download </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
