// App.jsx
import React, { useState } from "react";
import { HomeOutlined, CalendarOutlined, AppstoreOutlined, SolutionOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";

import Home from "./pages/home";
import Profile from "./pages/profile";
import Notifications from "./pages/notifications";
import Settings from "./pages/settings";
import Login from "./pages/login";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  if (!loggedIn) return <Login onLoginSuccess={() => setLoggedIn(true)} />;

  const tabs = [
    { key: "home", icon: <HomeOutlined />, label: "Home" },
    { key: "profile", icon: <CalendarOutlined />, label: "Book Consultant" },
    { key: "notifications", icon: <AppstoreOutlined />, label: "Property Listing" },
    { key: "settings", icon: <SolutionOutlined />, label: "Property Management" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <Home />;
      case "profile": return <Profile />;
      case "notifications": return <Notifications />;
      case "settings": return <Settings />;
      default: return <Home />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>{renderContent()}</div>

      <div style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        height: 65,
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTop: "1px solid #eee",
      }}>
        {tabs.map(tab => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: activeTab === tab.key ? "#1890ff" : "#999",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 24 }}>{tab.icon}</div>
            <span style={{ fontSize: 12 }}>{tab.label}</span>
            {activeTab === tab.key && <div style={{ height: 3, width: 22, backgroundColor: "#1890ff", marginTop: 4, borderRadius: 2 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
