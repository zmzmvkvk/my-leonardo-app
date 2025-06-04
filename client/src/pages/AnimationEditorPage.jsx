import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useParams } from "react-router-dom";

const heroOptions = [
  { id: "hero1", name: "Hero 1", image: "https://via.placeholder.com/150?text=Hero+1" },
  { id: "hero2", name: "Hero 2", image: "https://via.placeholder.com/150?text=Hero+2" },
  { id: "hero3", name: "Hero 3", image: "https://via.placeholder.com/150?text=Hero+3" },
];

const channelOptions = [
  { id: "youtube", name: "YouTube", image: "https://via.placeholder.com/80?text=YT" },
  { id: "instagram", name: "Instagram", image: "https://via.placeholder.com/80?text=IG" },
  { id: "tiktok", name: "TikTok", image: "https://via.placeholder.com/80?text=TT" },
];

function AnimationEditorPage() {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("setup");
  const [selectedHero, setSelectedHero] = useState(heroOptions[0].id);
  const [productImage, setProductImage] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(channelOptions[0].id);
  const [setupComplete, setSetupComplete] = useState(false);
  const [scenes, setScenes] = useState([
    { id: 1, title: "Cutscene 1", story: "", images: [] },
  ]);

  const addScene = () => {
    const newId = scenes.length + 1;
    setScenes([
      ...scenes,
      { id: newId, title: `Cutscene ${newId}`, story: "", images: [] },
    ]);
  };

  const updateSceneStory = (id, value) => {
    setScenes(
      scenes.map((scene) =>
        scene.id === id ? { ...scene, story: value } : scene
      )
    );
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

  const TabButton = ({ id, children, disabled = false }) => (
    <button
      onClick={() => !disabled && setActiveTab(id)}
      className={`px-4 py-2 rounded-md text-sm font-semibold focus:outline-none ${
        activeTab === id ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  const saveSetupToFirebase = async () => {
    try {
      await addDoc(collection(db, "projectSetups"), {
        projectId,
        selectedHero,
        productImage,
        selectedChannel,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to save setup", err);
    }
  };

  const handleStoryGeneration = async () => {
    await saveSetupToFirebase();
    setSetupComplete(true);
    setActiveTab("story");
  };

  const renderSetupTab = () => (
    <div className="space-y-6 bg-gray-800 p-6 rounded-md">
      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">Select Hero</p>
        <div className="grid grid-cols-3 gap-4">
          {heroOptions.map((hero) => (
            <button
              key={hero.id}
              onClick={() => setSelectedHero(hero.id)}
              className={`border rounded-lg p-2 text-center ${
                selectedHero === hero.id ? "border-indigo-500 bg-gray-700" : "border-gray-600"
              }`}
            >
              <img src={hero.image} alt={hero.name} className="w-full h-20 object-cover rounded" />
              <p className="mt-1 text-xs">{hero.name}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">Product Image (optional)</p>
        <input type="file" accept="image/*" onChange={handleProductImage} className="text-gray-300" />
        {productImage && (
          <img src={productImage} alt="Product" className="mt-2 h-20 object-cover rounded" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">Channel</p>
        <div className="flex space-x-2">
          {channelOptions.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`p-2 rounded-md border text-xs flex flex-col items-center ${
                selectedChannel === ch.id ? "border-indigo-500 bg-gray-700" : "border-gray-600"
              }`}
            >
              <img src={ch.image} alt={ch.name} className="w-10 h-10 object-cover" />
              <span className="mt-1">{ch.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="text-right">
        <button
          onClick={handleStoryGeneration}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Story AI Generation
        </button>
      </div>
    </div>
  );

  const renderStoryTab = () => (
    <div>
      {scenes.map((scene) => (
        <div key={scene.id} className="mb-6">
          <h3 className="font-semibold mb-2">{scene.title}</h3>
          <textarea
            className="w-full bg-gray-800 p-2 rounded-md"
            rows="3"
            value={scene.story}
            onChange={(e) => updateSceneStory(scene.id, e.target.value)}
            placeholder="Write the story for this cutscene"
          />
        </div>
      ))}
      <button
        onClick={addScene}
        className="px-4 py-2 bg-indigo-600 rounded-md text-sm"
      >
        + Add Cutscene
      </button>
    </div>
  );

  const renderImagesTab = () => (
    <div>
      {scenes.map((scene) => (
        <div key={scene.id} className="mb-8">
          <h3 className="font-semibold mb-2">{scene.title} Images</h3>
          {scene.images.length === 0 && (
            <p className="text-gray-400 mb-2">No images yet.</p>
          )}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {scene.images.map((img, i) => (
              <img key={i} src={img} alt="scene" className="rounded-md" />
            ))}
          </div>
          <button className="px-3 py-1 bg-indigo-600 rounded-md text-sm">
            Generate Image
          </button>
        </div>
      ))}
    </div>
  );

  const renderVideoTab = () => (
    <div className="bg-gray-800 p-6 rounded-md">
      <p className="mb-4">
        All cutscenes will be combined into a video using Leonardo Motion.
      </p>
      <button className="px-4 py-2 bg-indigo-600 rounded-md text-sm">
        Create Video
      </button>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Project {projectId}</h1>
      <div className="flex space-x-4 mb-6">
        <TabButton id="setup">Setup</TabButton>
        <TabButton id="story" disabled={!setupComplete}>
          Story Creation
        </TabButton>
        <TabButton id="image">Image Creation</TabButton>
        <TabButton id="video">Video</TabButton>
      </div>
      {activeTab === "setup" && renderSetupTab()}
      {activeTab === "story" && renderStoryTab()}
      {activeTab === "image" && renderImagesTab()}
      {activeTab === "video" && renderVideoTab()}
    </div>
  );
}

export default AnimationEditorPage;
