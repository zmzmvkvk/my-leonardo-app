import { Routes, Route, Outlet } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProjectDashboardPage from "./pages/ProjectDashboardPage";
import PromptStudioPage from "./pages/PromptStudioPage";
import AnimationEditorPage from "./pages/AnimationEditorPage"; // 기획에 따른 페이지

function App() {
  return (
    <Routes>
      <Route element={<MainLayoutWithOutlet />}>
        <Route path="/" element={<ProjectDashboardPage />} />
        <Route path="/studio" element={<PromptStudioPage />} />
        <Route path="/editor/:projectId" element={<AnimationEditorPage />} />
      </Route>
    </Routes>
  );
}

// MainLayout 안에 Outlet을 포함시키기 위한 래퍼 컴포넌트
// 또는 MainLayout 자체에서 Outlet을 사용해도 됩니다.
function MainLayoutWithOutlet() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default App;
