import React, { useState } from "react";
import { useParams } from "react-router-dom";

function AnimationEditorPage() {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("story");
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

  const TabButton = ({ id, children }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-md text-sm font-semibold focus:outline-none ${activeTab === id ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"}`}
    >
      {children}
    </button>
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
        <TabButton id="story">Story Creation</TabButton>
        <TabButton id="image">Image Creation</TabButton>
        <TabButton id="video">Video</TabButton>
      </div>
      {activeTab === "story" && renderStoryTab()}
      {activeTab === "image" && renderImagesTab()}
      {activeTab === "video" && renderVideoTab()}
    </div>
  );
}

export default AnimationEditorPage;
