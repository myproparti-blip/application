// App.jsx - Ant Design Mobile Version
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { TabBar, FloatingBubble } from "antd-mobile";
import {
  AppOutline,
  UserOutline,
  UnorderedListOutline,
  SetOutline,
  AddCircleOutline,
} from "antd-mobile-icons";
import "antd-mobile/es/global";

import Home from "./pages/home";
import Profile from "./pages/profile";
import Notifications from "./pages/notifications";
import Settings from "./pages/settings";
import Login from "./pages/login";
import PostProperty from "./pages/postproperty";

// Define constants for mobile-friendly sizes
const MOBILE_MAX_WIDTH = "500px";

// Styles for the main container
const appContainerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100%",
  maxWidth: MOBILE_MAX_WIDTH,
  margin: "0 auto",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  position: "relative",
  overflow: "hidden",
  backgroundColor: "#f5f5f5",
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem("loggedIn") === "true"
  );
  const location = useLocation();
  const navigate = useNavigate();

  // Get current active tab from route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/" || path === "/home") return "home";
    if (path.startsWith("/profile")) return "profile";
    if (path === "/notifications") return "notifications";
    if (path === "/settings") return "settings";
    if (path === "/postproperty") return "postproperty";
    return "home";
  };

  const activeTab = getActiveTab();

  // Persist login state
  useEffect(() => {
    localStorage.setItem("loggedIn", loggedIn);
  }, [loggedIn]);

  if (!loggedIn) return <Login onLoginSuccess={() => setLoggedIn(true)} />;

  // Tabs config
  const tabs = [
    {
      key: "home",
      icon: <AppOutline />,
      title: "Home",
      path: "/home"
    },
    {
      key: "profile",
      icon: <UserOutline />,
      title: "Book Consultant", 
      path: "/profile"
    },
    {
      key: "notifications",
      icon: <UnorderedListOutline />,
      title: "Property Listing",
      path: "/notifications"
    },
    {
      key: "settings",
      icon: <SetOutline />,
      title: "Property Management",
      path: "/settings"
    },
  ];

  const handleTabChange = (key) => {
    const tab = tabs.find(t => t.key === key);
    if (tab) {
      navigate(tab.path);
    }
  };

  const isPostPropertyPage = activeTab === "postproperty";

  return (
    <div style={appContainerStyle}>
      {/* Main content area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          width: "100%",
          paddingBottom: isPostPropertyPage ? "20px" : "60px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/postproperty" element={<PostProperty />} />
        </Routes>
      </div>

      {/* Floating Post Property Button */}
      {!isPostPropertyPage && (
        <FloatingBubble
          style={{
            "--initial-position-bottom": "70px",
            "--initial-position-right": "16px",
            "--edge-distance": "16px",
            "--size": "56px",
            "--background": "#1677ff",
          }}
          onClick={() => navigate("/postproperty")}
        >
          <AddCircleOutline fontSize={32} color="#fff" />
        </FloatingBubble>
      )}

      {/* Bottom Tab Bar */}
      {!isPostPropertyPage && (
        <TabBar
          activeKey={activeTab}
          onChange={handleTabChange}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            maxWidth: MOBILE_MAX_WIDTH,
            margin: "0 auto",
            backgroundColor: "#fff",
            borderTop: "1px solid #e5e5e5",
          }}
        >
          {tabs.map((item) => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      )}
    </div>
  );
}