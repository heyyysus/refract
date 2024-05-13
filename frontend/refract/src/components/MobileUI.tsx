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

  const [openTab, setOpenTab] = React.useState(1);

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

      const alpha = 10 - (parseInt(cloakStrength) / 100.0) * 5.0;
      const compress_size = (parseInt(renderTime) >= 50) ? 512 : 160;

      console.log(`alpha: ${alpha}`);
      console.log(`compress_size: ${compress_size}`);

      await handleRunModel(inputImage!, compress_size, 0.0, alpha);
      setOutputURL(URL.createObjectURL(inputImage!));
      setIsRunning(false);
      setHasOutput(true);
  }

  return (
  <div className="flex flex-col mx-auto w-[100%] bg-slate-600 font-Segoe UI Emoji">
    <div className="flex flex-col items-center mx-auto w-full">
      <div className="flex flex-col gap-0 mt-2 text-base tracking-tight leading-4 text-center whitespace-nowrap px-5 xl:w-[40%] lg:w-[60%] md:w-[80%] sm:w-[100%] content-center">
        <img className="flex my-5 w-[70%] self-center" src="https://i.ibb.co/5cnmX59/Refract-Presentation-removebg-preview.png" />
        <ul
          className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row"
          role="tablist"
        >
          <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
            <a
              className={
                "text-xl font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                (openTab === 1
                  ? "text-white bg-indigo-400"
                  : "text-indigo-400 bg-white")
              }
              onClick={e => {
                e.preventDefault();
                setOpenTab(1);
              }}
            >
              Demo
            </a>
          </li>
          <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
            <a
              className={
                "text-xl font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                (openTab === 2
                  ? "text-white bg-indigo-400"
                  : "text-indigo-400 bg-white")
              }
              onClick={e => {
                e.preventDefault();
                setOpenTab(2);
              }}
            >
                About
            </a>
          </li>
        </ul>
        {openTab === 1 && 
        <div className="flex flex-col grow shrink-0 basis-0 w-full pb-5">
          <div className="flex gap-4 px-9 py-6 items-stretch rounded-2xl bg-slate-500">
            <div className="flex flex-col flex-1 items-stretch text-white">
              <div className="flex flex-row justify-between">
                  <div className="font-bold">1. Upload Image</div>
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
              </div>
              <div className="flex-column justify-center">
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
        </div>}
        {openTab === 2 && 
        <div className="flex flex-col grow shrink-0 basis-0 w-full pb-5 text-white leading-relaxed">
          <div className="text-3xl font-bold text-center mb-4">About Refract</div>
          
          <div className="mb-8 ">
            <div className="text-2xl font-semibold pb-2">Description</div>
            <div className="flex gap-4 px-9 py-6 items-stretch rounded-2xl bg-slate-500 text-wrap">
              Refract is a cutting-edge model designed to cloak photos of individuals
              to protect them against unauthorized use in facial recognition technologies,
              deepfakes, and other forms of digital identity theft. This model subtly alters
              facial features in images to confuse data models while keeping changes imperceptible
              to human observers.
            </div>
          </div>
          
          <div className="mb-8">
            <div className="text-2xl font-semibold pb-2">Implementation</div>
            <div className="flex gap-4 px-9 py-6 items-stretch rounded-2xl bg-slate-500 text-wrap">
              The Refract model integrates advanced image processing algorithms to selectively
              alter facial data points. It operates by identifying target features in images and
              applying slight modifications that significantly impede machine learning algorithms
              without affecting the image's appearance for human viewers.
            </div>
          </div>
          
          <div className="mb-8">
            <div className="text-2xl font-semibold pb-2">Tech Used</div>
            <div className="flex gap-4 px-9 py-6 items-stretch rounded-2xl bg-slate-500 text-wrap">
              <ul className="list-disc pl-5 mt-2 text-left">
                <li>Python for backend logic</li>
                <li>Pytorch and Torchvision for image transformations</li>
                <li><a href="https://github.com/timesler/facenet-pytorch" className="text-indigo-400">Pytorch Facenet pre-trained MTCNN</a> for feature embedding extraction</li>
                <li><a href="https://github.com/richzhang/PerceptualSimilarity" className="text-indigo-400">LPIPS</a> for perceptual similarity measurement</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-8 content-center">
            <h2 className="text-2xl font-semibold">Authors</h2>
            <div className="flex flex-col gap-4 px-9 py-6 items-stretch rounded-2xl bg-slate-500 text-wrap">
              <img src="https://i.ibb.co/f2nyCJD/IMG-5960-1.jpg" alt="Group of authors" className="object-cover rounded-1 max-w-full shadow-lg" />
            </div>
          </div>
        </div>}
        {/* a footer that contains the following text, and a link to github 
        © 2022 Created by Gen Tamada with React.js and Chakra UI. All rights reserved. Last edit: 5/11/2024*/}
      </div>
    </div>
    <div className="flex flex-col items-center py-5 text-sm text-white bg-slate-400 px-10">
      <div className="flex flex-row gap-2">
        <div>© 2024 Created by Ysabel Chen, Gen Tamada, Emily Tian, Jesus Velarde, Christy Yu.</div>
      </div>
      <div className="flex flex-row gap-2">
        <div>View on</div>
        <a href="https://github.com/heyyysus/refract" className="text-indigo-500">Github</a>
      </div>
    </div>
  </div>
  );
};
