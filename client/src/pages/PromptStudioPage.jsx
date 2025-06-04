import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const leonardoModels = [
  { id: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3", name: "Leonardo Diffusion XL" },
  { id: "b24e16ff-06e3-43eb-8d33-4416c2d75876", name: "SDXL 0.9" },
  { id: "1e6233eb-5197-4488-9146-170b8cb005a7", name: "Absolute Reality" },
  { id: "291be633-cb24-434f-898f-e662799db19b", name: "DreamShaper v7" },
];

const chatGptModels = [
  { id: "gpt-4o", name: "GPT-4o (Advanced)" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo (Fast)" },
];

const heroOptions = [
  {
    id: "hero1",
    name: "Hero 1",
    image: "https://via.placeholder.com/150?text=Hero+1",
  },
  {
    id: "hero2",
    name: "Hero 2",
    image: "https://via.placeholder.com/150?text=Hero+2",
  },
  {
    id: "hero3",
    name: "Hero 3",
    image: "https://via.placeholder.com/150?text=Hero+3",
  },
];

const channelOptions = [
  { id: "youtube", name: "YouTube", image: "https://via.placeholder.com/80?text=YT" },
  { id: "instagram", name: "Instagram", image: "https://via.placeholder.com/80?text=IG" },
  { id: "tiktok", name: "TikTok", image: "https://via.placeholder.com/80?text=TT" },
];

const postImageGeneration = async (params) => {
  const { data } = await axios.post(`${API_BASE_URL}/generations`, params);
  return data.sdGenerationJob.generationId;
};

const fetchGenerationResult = async (generationId) => {
  if (!generationId) return null;
  const { data } = await axios.get(
    `${API_BASE_URL}/generations/${generationId}`
  );
  return data.generations_by_pk;
};

const postStoryGeneration = async (params) => {
  const { data } = await axios.post(`${API_BASE_URL}/story`, params);
  return data.story;
};

function PromptStudioPage() {
  const queryClient = useQueryClient();

  const [generationType, setGenerationType] = useState("image");
  const [prompt, setPrompt] = useState(
    "A majestic lion in a futuristic city, neon lights, rain"
  );
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, low quality, ugly"
  );
  const [selectedLeonardoModel, setSelectedLeonardoModel] = useState(
    leonardoModels[0].id
  );
  const [selectedChatGptModel, setSelectedChatGptModel] = useState(
    chatGptModels[0].id
  );

  const [imageWidth, setImageWidth] = useState(1024);
  const [imageHeight, setImageHeight] = useState(1024);
  const [guidanceScale, setGuidanceScale] = useState(7);
  const [numImages, setNumImages] = useState(1);
  const [seed, setSeed] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedHero, setSelectedHero] = useState(heroOptions[0].id);
  const [productImage, setProductImage] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(channelOptions[0].id);

  const [useAlchemy, setUseAlchemy] = useState(false);
  const [usePhotoReal, setUsePhotoReal] = useState(false);
  const [controlNetType, setControlNetType] = useState("none");
  const [controlNetImage, setControlNetImage] = useState(null);

  const [currentGenerationId, setCurrentGenerationId] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generatedStory, setGeneratedStory] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isUiLoading, setIsUiLoading] = useState(false); // UI 로딩 상태를 위한 별도 상태

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 9999999999).toString());
  };

  const handleProductImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProductImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setProductImage(null);
    }
  };

  const imageGenerationMutation = useMutation({
    mutationFn: postImageGeneration,
    onSuccess: (generationId) => {
      setCurrentGenerationId(generationId);
      setGeneratedImages([]);
      setErrorMsg("");
      setIsUiLoading(true); // UI 로딩 시작
      queryClient.invalidateQueries({
        queryKey: ["generationResult", generationId],
      });
    },
    onError: (error) => {
      setErrorMsg(
        `Failed to start generation: ${
          error.response?.data?.error || error.message
        }`
      );
      setCurrentGenerationId(null);
      setIsUiLoading(false); // UI 로딩 종료
    },
  });

  const storyGenerationMutation = useMutation({
    mutationFn: postStoryGeneration,
    onSuccess: (story) => {
      setGeneratedStory(story);
      setIsUiLoading(false);
      setErrorMsg("");
    },
    onError: (error) => {
      setErrorMsg(
        `Failed to generate story: ${
          error.response?.data?.error || error.message
        }`
      );
      setIsUiLoading(false);
    },
  });

  const {
    data: generationResult,
    status: queryHookStatus, // 'pending', 'error', 'success'
    error: fetchError, // useQuery 자체의 에러 객체
    isFetching: isFetchingResult, // 현재 데이터를 가져오는 중인지
  } = useQuery({
    queryKey: ["generationResult", currentGenerationId],
    queryFn: () => fetchGenerationResult(currentGenerationId),
    enabled: !!currentGenerationId && generationType === "image",
    refetchInterval: (query) => {
      const currentQueryData = query.state.data;
      const status = currentQueryData?.status;
      if (status === "COMPLETE" || status === "FAILED") {
        return false;
      }
      return 5000;
    },
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (queryHookStatus === "success" && generationResult) {
      if (generationResult.status === "COMPLETE") {
        if (generationResult.generated_images?.length > 0) {
          const newImages = generationResult.generated_images.map((img) => ({
            ...img,
            id: img.id || Math.random().toString(),
          }));
          setGeneratedImages(newImages);
        } else {
          // COMPLETE 되었지만 이미지가 없는 경우 (예: upscale 실패 등)
          setErrorMsg("Generation completed, but no images were returned.");
        }
        setIsUiLoading(false); // UI 로딩 종료
        setErrorMsg("");
      } else if (generationResult.status === "FAILED") {
        setErrorMsg("Image generation failed (API reported failure).");
        setIsUiLoading(false); // UI 로딩 종료
      } else if (
        generationResult.status === "PENDING" ||
        generationResult.status === "PROCESSING"
      ) {
        setIsUiLoading(true); // 명시적으로 PENDING/PROCESSING 시 로딩 유지
      }
    } else if (queryHookStatus === "error" && fetchError) {
      setErrorMsg(`Error fetching result: ${fetchError.message}`);
      setIsUiLoading(false); // UI 로딩 종료
    }
  }, [generationResult, queryHookStatus, fetchError]);

  const handleGenerate = () => {
    setErrorMsg("");
    setGeneratedImages([]); // 이전 결과 즉시 숨기기
    if (generationType === "image") {
      const params = {
        prompt,
        negative_prompt: negativePrompt,
        modelId: selectedLeonardoModel,
        width: imageWidth,
        height: imageHeight,
        num_images: numImages,
        guidance_scale: guidanceScale,
        seed: seed ? parseInt(seed) : null,
        alchemy: useAlchemy,
        photoReal: usePhotoReal,
      };
      imageGenerationMutation.mutate(params);
    } else {
      imageGenerationMutation.reset();
      setCurrentGenerationId(null);
      setIsUiLoading(true);
      setGeneratedStory("");
      storyGenerationMutation.mutate({
        prompt,
        model: selectedChatGptModel,
        hero: selectedHero,
        channel: selectedChannel,
        productImage,
      });
    }
  };

  const isLoadingDisplay =
    imageGenerationMutation.isPending ||
    storyGenerationMutation.isPending ||
    isUiLoading;

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 p-6 bg-gray-800 rounded-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-100">
            Generation Settings
          </h2>
          <div className="space-y-2">
            <label
              htmlFor="generationType"
              className="block text-sm font-medium text-gray-300"
            >
              Type
            </label>
            <select
              id="generationType"
              value={generationType}
              onChange={(e) => {
                setGenerationType(e.target.value);
                setCurrentGenerationId(null);
                setGeneratedImages([]);
                setGeneratedStory("");
                setErrorMsg("");
                setIsUiLoading(false);
                imageGenerationMutation.reset();
              }}
              className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="image">Image (Leonardo AI)</option>
              <option value="story">Story (ChatGPT)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-300"
            >
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows="5"
              className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={
                generationType === "image"
                  ? "e.g., A hyperrealistic portrait of a cybernetic wolf..."
                  : "e.g., Write a short sci-fi story about..."
              }
            />
          </div>
          {generationType === "image" && (
            <div>
              <label
                htmlFor="negativePrompt"
                className="block text-sm font-medium text-gray-300"
              >
                Negative Prompt (Optional)
              </label>
              <textarea
                id="negativePrompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                rows="3"
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., blurry, low quality, text, watermark..."
              />
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-300"
          >
            {generationType === "image" ? "Leonardo AI Model" : "ChatGPT Model"}
          </label>
          <select
            id="model"
            value={
              generationType === "image"
                ? selectedLeonardoModel
                : selectedChatGptModel
            }
            onChange={(e) =>
              generationType === "image"
                ? setSelectedLeonardoModel(e.target.value)
                : setSelectedChatGptModel(e.target.value)
            }
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {(generationType === "image" ? leonardoModels : chatGptModels).map(
              (model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              )
            )}
          </select>
        </div>

        {generationType === "image" && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-medium text-gray-200 mb-1">
              Image Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="width"
                  className="block text-xs font-medium text-gray-400"
                >
                  Width
                </label>
                <input
                  type="number"
                  id="width"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(parseInt(e.target.value))}
                  step="64"
                  min="64"
                  max="2048"
                  className="w-full p-2 bg-gray-700 rounded-md border border-gray-600"
                />
              </div>
              <div>
                <label
                  htmlFor="height"
                  className="block text-xs font-medium text-gray-400"
                >
                  Height
                </label>
                <input
                  type="number"
                  id="height"
                  value={imageHeight}
                  onChange={(e) => setImageHeight(parseInt(e.target.value))}
                  step="64"
                  min="64"
                  max="2048"
                  className="w-full p-2 bg-gray-700 rounded-md border border-gray-600"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="numImages"
                className="block text-xs font-medium text-gray-400"
              >
                Number of Images (1-8)
              </label>
              <input
                type="number"
                id="numImages"
                value={numImages}
                onChange={(e) =>
                  setNumImages(
                    Math.max(1, Math.min(8, parseInt(e.target.value)))
                  )
                }
                min="1"
                max="8"
                className="w-full p-2 bg-gray-700 rounded-md border border-gray-600"
              />
            </div>
            <div>
              <label
                htmlFor="guidanceScale"
                className="block text-xs font-medium text-gray-400"
              >
                Guidance Scale ({guidanceScale})
              </label>
              <input
                type="range"
                id="guidanceScale"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseInt(e.target.value))}
                min="1"
                max="20"
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="seed"
                className="block text-xs font-medium text-gray-400 whitespace-nowrap"
              >
                Seed (Optional)
              </label>
              <input
                type="text"
                id="seed"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Leave blank for random"
                className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-sm"
              />
              <button
                onClick={randomizeSeed}
                className="p-2 bg-gray-600 hover:bg-gray-500 rounded-md text-xs whitespace-nowrap"
              >
                Random
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full text-sm text-indigo-400 hover:text-indigo-300 flex items-center justify-center py-2"
              >
                {showAdvanced
                  ? "Hide Advanced Settings"
                  : "Show Advanced Settings"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-1 transform transition-transform duration-200 ${
                    showAdvanced ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700 animate-fadeIn">
                <h4 className="text-md font-semibold text-gray-300 border-b border-gray-600 pb-2">
                  Advanced Options
                </h4>
                <div className="flex items-center justify-between">
                  <label htmlFor="useAlchemy" className="text-sm text-gray-300">
                    Use Alchemy
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseAlchemy(!useAlchemy)}
                    className={`${
                      useAlchemy ? "bg-indigo-600" : "bg-gray-600"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                    role="switch"
                    aria-checked={useAlchemy}
                  >
                    <span
                      className={`${
                        useAlchemy ? "translate-x-5" : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="usePhotoReal"
                    className="text-sm text-gray-300"
                  >
                    Use PhotoReal
                  </label>
                  <button
                    type="button"
                    onClick={() => setUsePhotoReal(!usePhotoReal)}
                    className={`${
                      usePhotoReal ? "bg-indigo-600" : "bg-gray-600"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                    role="switch"
                    aria-checked={usePhotoReal}
                  >
                    <span
                      className={`${
                        usePhotoReal ? "translate-x-5" : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>

                <div>
                  <label
                    htmlFor="controlNetType"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    ControlNet Type
                  </label>
                  <select
                    id="controlNetType"
                    value={controlNetType}
                    onChange={(e) => setControlNetType(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 text-sm"
                  >
                    <option value="none">None</option>
                    <option value="CANNY">Canny (Edge Detection)</option>
                    <option value="POSE">OpenPose (Pose)</option>
                    <option value="DEPTH">Depth</option>
                  </select>
                </div>
                {controlNetType !== "none" && (
                  <div>
                    <label
                      htmlFor="controlNetImage"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      ControlNet Reference Image
                    </label>
                    <input
                      type="file"
                      id="controlNetImage"
                      accept="image/*"
                      onChange={(e) => setControlNetImage(e.target.files[0])}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {controlNetImage && (
                      <p className="text-xs text-gray-500 mt-1">
                        Selected: {controlNetImage.name}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  More advanced settings (Prompt Magic, Tiling, etc.) will be
                  available here.
                </p>
              </div>
            )}
          </div>
        )}

        {generationType === "story" && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-medium text-gray-200">
              Story Parameters
            </h3>
            <p className="text-xs text-gray-500">
              Settings like Temperature and Max Tokens will be available here.
            </p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isLoadingDisplay}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isLoadingDisplay ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </div>
          ) : (
            `Generate ${generationType === "image" ? "Images" : "Story"}`
          )}
        </button>
      </div>

      <div className="lg:col-span-2 p-6 bg-gray-800 rounded-xl shadow-xl min-h-[60vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">Results</h2>
          {currentGenerationId && generationType === "image" && (
            <p className="text-xs text-gray-500">ID: {currentGenerationId}</p>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-md">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {isLoadingDisplay && (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <svg
                className="animate-spin mx-auto h-10 w-10 text-indigo-400 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-400 text-lg">
                {generationResult?.status &&
                generationResult.status !== "COMPLETE" &&
                generationResult.status !== "FAILED"
                  ? `Processing... (Status: ${generationResult.status})`
                  : "Requesting generation..."}
              </p>
            </div>
          </div>
        )}

        {!isLoadingDisplay &&
          generationType === "image" &&
          generatedImages.length === 0 &&
          !errorMsg && (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l2.586-2.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-gray-400">
                  Generated images will appear here.
                </p>
                {generationResult?.status === "FAILED" && !errorMsg && (
                  <p className="text-red-400 mt-1">Last attempt failed.</p>
                )}
              </div>
            </div>
          )}
        {!isLoadingDisplay &&
          generationType === "image" &&
          generatedImages.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[calc(100vh-250px)]">
              {generatedImages.map((img) => (
                <div
                  key={img.id}
                  className="bg-gray-700 rounded-lg overflow-hidden shadow-lg group relative aspect-square"
                >
                  <img
                    src={img.url}
                    alt={img.prompt || "Generated image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
                    <button className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md text-sm mb-2">
                      Use Image
                    </button>
                    <p className="text-xs text-gray-300 text-center truncate w-full">
                      {img.prompt || "Generated Image"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        {!isLoadingDisplay &&
          generationType === "story" &&
          !generatedStory &&
          !errorMsg && (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                  />
                </svg>
                <p className="mt-2 text-gray-400">
                  Generated story will appear here.
                </p>
              </div>
            </div>
          )}
        {!isLoadingDisplay && generationType === "story" && generatedStory && (
          <div className="prose prose-sm sm:prose-base prose-invert max-w-none p-4 bg-gray-700 rounded-md overflow-y-auto max-h-[calc(100vh-250px)]">
            <p>{generatedStory}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptStudioPage;
