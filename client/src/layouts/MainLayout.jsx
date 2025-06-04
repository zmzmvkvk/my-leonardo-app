import React from "react";
import { Link, NavLink } from "react-router-dom";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 shadow-md">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-white">
              AI Animator
            </Link>
            <div className="flex space-x-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/studio"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                Prompt Studio
              </NavLink>
              {/* <NavLink
                to="/editor/some-project-id" // 예시 링크
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                Editor
              </NavLink> */}
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-6 py-8">{children}</main>
      <footer className="bg-gray-800 text-center py-4">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} AI Animator. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default MainLayout;
