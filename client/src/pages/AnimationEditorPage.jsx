import React from "react";
import { useParams } from "react-router-dom";

function AnimationEditorPage() {
  const { projectId } = useParams();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Animation Editor</h1>
      <p>Project ID: {projectId}</p>
      <p>
        여기에는 타임라인, 에셋 라이브러리, 미리보기, 속성 패널 등이 표시됩니다.
      </p>
      <div className="mt-4 h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <p>Timeline / Canvas Area</p>
      </div>
    </div>
  );
}

export default AnimationEditorPage;
