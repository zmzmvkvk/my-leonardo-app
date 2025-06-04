import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// 임시 프로젝트 데이터
const initialProjects = [
  {
    id: "proj_001",
    title: "My First Animation",
    lastModified: "2025-05-30",
    thumbnailUrl:
      "https://via.placeholder.com/300x200.png/2d3748/ffffff?text=Project+1",
    status: "Completed",
  },
  {
    id: "proj_002",
    title: "Character Showcase",
    lastModified: "2025-06-01",
    thumbnailUrl:
      "https://via.placeholder.com/300x200.png/2d3748/ffffff?text=Project+2",
    status: "Draft",
  },
  {
    id: "proj_003",
    title: "Sci-Fi Short Film",
    lastModified: "2025-06-02",
    thumbnailUrl:
      "https://via.placeholder.com/300x200.png/2d3748/ffffff?text=Project+3",
    status: "Generating",
  },
];

function ProjectDashboardPage() {
  const [projects, setProjects] = useState(initialProjects);
  const navigate = useNavigate();

  const handleCreateNewProject = () => {
    // 실제로는 프로젝트 생성 로직 후 해당 editor로 이동
    const newProjectId = `proj_${String(Date.now()).slice(-5)}`; // 임시 ID 생성
    console.log("Creating new project...", newProjectId);
    navigate(`/editor/${newProjectId}`);
  };

  return (
    <div className="animate-fadeIn">
      {" "}
      {/* 간단한 페이드인 애니메이션 */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-100 mb-4 sm:mb-0">
          My Projects
        </h1>
        <button
          onClick={handleCreateNewProject}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          + Create New Project
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-300">
            No projects yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Link
              to={`/editor/${project.id}`}
              key={project.id}
              className="group block"
            >
              <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-indigo-500 transform group-hover:-translate-y-1">
                <img
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  src={
                    project.thumbnailUrl ||
                    "https://via.placeholder.com/300x200.png/2d3748/ffffff?text=Project"
                  }
                  alt={project.title}
                />
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-100 mb-2 truncate group-hover:text-indigo-400">
                    {project.title}
                  </h2>
                  <p className="text-xs text-gray-500 mb-1">
                    Last modified: {project.lastModified}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        project.status === "Completed"
                          ? "bg-green-700 text-green-100"
                          : project.status === "Draft"
                          ? "bg-yellow-700 text-yellow-100"
                          : "bg-blue-700 text-blue-100"
                      }`}
                    >
                      {project.status}
                    </span>
                    {/* 추가 액션 버튼 (예: 삭제, 복제)은 여기에 ... 아이콘 등으로 추가 가능 */}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectDashboardPage;
