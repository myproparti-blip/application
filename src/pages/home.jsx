// Home.jsx - Fixed modal closing for both cancel and success
import React, { useState, useEffect } from "react";
import {
  SearchBar,
  Grid,
  Card,
  Tag,
  Button,
  Rate,
  Toast,
  Modal,
  Avatar,
  Popup,
  SpinLoading,
  Dialog,
  Space,
  Divider,
  List,
  Badge,
} from "antd-mobile";
import {
  UserOutline,
  PhoneFill,
  EnvironmentOutline,
  EditSOutline,
  DeleteOutline,
  SearchOutline,
  StarFill,
} from "antd-mobile-icons";
import { getConsultants } from "../services/consultants";
import { getProperties } from "../services/properties";
import { deleteProfile, getProfile } from "../services/auth";
import AddConsultantModal from "../components/consultantComponent";
import AgentRegistration from "../components/agentComponent";
import { useNavigate } from "react-router";

export default function Home({ setActiveTab }) {
  const [city, setCity] = useState("");
  const [consultants, setConsultants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const navigate=useNavigate();

  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [consultantModalVisible, setConsultantModalVisible] = useState(false);
  
  // Role-based modal states
  const [consultantFormVisible, setConsultantFormVisible] = useState(false);
  const [agentFormVisible, setAgentFormVisible] = useState(false);
  const [hasFilledForm, setHasFilledForm] = useState(false);

  const fetchConsultants = async () => {
    try {
      const res = await getConsultants();
      if (res.success) {
        const dataArray = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setConsultants(dataArray);
        return dataArray;
      } else {
        Toast.show({
          icon: "fail",
          content: res.error || "Failed to fetch consultants",
        });
      }
    } catch (e) {
      Toast.show({
        icon: "fail",
        content: "Error fetching consultants",
      });
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await getProperties();
      if (res.success) {
        const dataArray = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setProperties(dataArray);
      } else {
        Toast.show({
          icon: "fail",
          content: res.error || "Failed to fetch properties",
        });
      }
    } catch (e) {
      Toast.show({
        icon: "fail",
        content: "Error fetching properties",
      });
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res.success) {
        setProfile(res.data.user);
        return res.data.user;
      }
    } catch (e) {
      console.log("Profile fetch error:", e);
    }
    return null;
  };

  const detectCity = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            console.log("📍 Browser GPS:", latitude, longitude);

            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            console.log("🏙️ Geocode result:", data);

            const detectedCity =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              data.address?.state_district ||
              data.address?.state ||
              "";

            if (detectedCity) {
              console.log("✅ City detected:", detectedCity);
              setCity(detectedCity);
            }
          },
          (err) => console.log("Geolocation error:", err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } catch (e) {
      console.log("Location detection error:", e);
    }
  };

  // Check if user needs to fill form based on role
  const checkFormCompletion = async (userProfile) => {
    try {
      if (!userProfile) return;

      const userRoles = userProfile.selectedRole || [];
      const userId = userProfile._id;
      const hasFilled = localStorage.getItem(`form_filled_${userId}`);

      console.log("🔍 Checking form completion:", {
        userId,
        userRoles,
        hasFilled
      });

      // If form not filled and user has specific roles, show modal
      if (!hasFilled) {
        if (userRoles.includes('consultant')) {
          console.log("👨‍💼 Showing consultant form modal");
          setConsultantFormVisible(true);
        } else if (userRoles.includes('agent')) {
          console.log("🏠 Showing agent form modal");
          setAgentFormVisible(true);
        }
        // Add more role checks as needed
      } else {
        console.log("✅ Form already filled for user:", userId);
        setHasFilledForm(true);
      }
    } catch (error) {
      console.log("Error checking form completion:", error);
    }
  };

  // Listen for messages from React Native WebView
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        console.log("📥 Received message:", data);

        if (data.type === "SET_LOCATION" && data.city) {
          console.log("✅ Setting city from React Native:", data.city);
          setCity(data.city);
        }
      } catch (e) {
        console.log("Message parse error:", e);
      }
    };

    window.addEventListener("message", handleMessage);
    document.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const [consultantsData, propertiesData, userProfile] = await Promise.all([
          fetchConsultants(),
          fetchProperties(),
          fetchProfile()
        ]);

        // Check if user needs to fill role-based form
        if (userProfile) {
          await checkFormCompletion(userProfile);
        }

        // Open consultant modal on initial load only on mobile (separate from role-based forms)
        const isMobileDevice = window.innerWidth <= 768;
        if (
          isMobileDevice &&
          consultantsData &&
          consultantsData.length > 0 &&
          !localStorage.getItem("consultant_promo_shown")
        ) {
          setSelectedConsultant(consultantsData[0]);
          setConsultantModalVisible(true);
          localStorage.setItem("consultant_promo_shown", "true");
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    // Try browser geolocation as fallback
    detectCity();
  }, []);

  // Handle form submission success
  const handleFormSuccess = () => {
    console.log("✅ Form submitted successfully, closing modal...");
    
    if (profile?._id) {
      localStorage.setItem(`form_filled_${profile._id}`, "true");
      setHasFilledForm(true);
    }
    
    // Close the modal directly
    setConsultantFormVisible(false);
    setAgentFormVisible(false);
    
    Toast.show({
      icon: "success",
      content: "Profile information saved successfully!"
    });
  };

  // Handle cancel button click - ALWAYS allow closing
  const handleCancelClick = () => {
    console.log("❌ Cancel button clicked, closing modal");
    setConsultantFormVisible(false);
    setAgentFormVisible(false);
  };

  // Handle modal close via mask click or back button
  const handleModalClose = (role) => {
    const userId = profile?._id;
    const hasFilled = userId && localStorage.getItem(`form_filled_${userId}`);
    
    if (!hasFilled) {
      Toast.show({
        icon: "fail",
        content: "Please complete your profile information to continue"
      });
      return false; // Prevent closing only for mask/back button, not cancel button
    }
    return true;
  };

  // Handle consultant modal visibility
  const handleConsultantModalVisibility = (visible) => {
    console.log("🔧 Consultant modal visibility:", visible);
    
    if (!visible) {
      const canClose = handleModalClose('consultant');
      if (canClose) {
        setConsultantFormVisible(false);
      }
    } else {
      setConsultantFormVisible(visible);
    }
  };

  // Handle agent modal visibility
  const handleAgentModalVisibility = (visible) => {
    console.log("🔧 Agent modal visibility:", visible);
    
    if (!visible) {
      const canClose = handleModalClose('agent');
      if (canClose) {
        setAgentFormVisible(false);
      }
    } else {
      setAgentFormVisible(visible);
    }
  };

  const filteredConsultants = consultants.filter(
    (c) =>
      (!city ||
        (c.location && c.location.toLowerCase().includes(city.toLowerCase()))) &&
      (!search ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.expertise?.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredProperties = properties.filter(
    (p) =>
      (!city || (p.city && p.city.toLowerCase().includes(city.toLowerCase()))) &&
      (!search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.propertyType?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDeleteProfile = async () => {
    try {
      const result = await Dialog.confirm({
        content: "Are you sure you want to delete this profile?",
        confirmText: "Delete",
        cancelText: "Cancel",
      });

      if (!result) return;

      const res = await deleteProfile();
      if (res.success) {
        // ✅ Clear token from localStorage (web)
        localStorage.removeItem("authToken");
        // Clear form completion status
        if (profile?._id) {
          localStorage.removeItem(`form_filled_${profile._id}`);
        }

        // ✅ Notify React Native WebView to remove token
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "REMOVE_TOKEN" }));
        }

        Toast.show({
          icon: "success",
          content: "Profile deleted successfully!",
        });

        // ✅ Redirect to login page
        window.location.href = "/login";
      } else {
        Toast.show({
          icon: "fail",
          content: res.error || "Failed to delete profile",
        });
      }
    } catch (err) {
      Toast.show({
        icon: "fail",
        content: err.message || "Something went wrong!",
      });
    }
  };

  return (
    <div
      style={{
        paddingTop: "60px",
        paddingBottom: "80px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Sticky Search Header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: "#fff",
          padding: "8px 12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <SearchBar
            placeholder={
              city ? `Search in ${city}...` : "Search properties or consultants..."
            }
            value={search}
            onChange={setSearch}
            style={{ flex: 1 }}
            showCancelButton
            onClear={() => setSearch("")}
          />
          <Button
            color="primary"
            fill="none"
            size="large"
            style={{
              padding: "8px",
              minWidth: "44px",
              height: "44px",
            }}
            onClick={() => fetchProfile().then(() => setProfileVisible(true))}
          >
            <UserOutline fontSize={24} />
          </Button>
        </div>
        {city && (
          <div style={{ marginTop: "8px", display: "flex", alignItems: "center" }}>
            <Tag
              color="primary"
              fill="outline"
              style={{ fontSize: "12px", margin: 0 }}
            >
              <EnvironmentOutline /> {city}
            </Tag>
          </div>
        )}
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <SpinLoading color="primary" style={{ fontSize: 48 }} />
        </div>
      ) : (
        <div style={{ padding: "0 12px" }}>
          {/* Consultants Section */}
          <div style={{ marginBottom: "20px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                margin: "16px 0 12px 0",
                color: "#262626",
              }}
            >
              Expert Consultants Near You
            </h3>

            {filteredConsultants.length > 0 ? (
              <Grid columns={3} gap={8}>
                {filteredConsultants.map((c) => (
                  <Grid.Item key={c._id}>
                    <Card
                      style={{
                        borderRadius: "8px",
                        overflow: "hidden",
                        padding: "8px",
                        textAlign: "center",
                      }}
                      onClick={() => {
                        setSelectedConsultant(c);
                        setConsultantModalVisible(true);
                      }}
                    >
                      <Avatar
                        src={c.image}
                        style={{
                          "--size": "48px",
                          "--border-radius": "50%",
                          border: "2px solid #1677ff",
                          marginBottom: "6px",
                        }}
                      >
                        <UserOutline />
                      </Avatar>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "12px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          lineHeight: "1.3",
                          marginBottom: "2px",
                        }}
                      >
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#8c8c8c",
                          marginBottom: "4px",
                        }}
                      >
                        {c.designation} | {c.expertise}
                      </div>
                      {c.languages && c.languages.length > 0 && (
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#595959",
                            marginBottom: "4px",
                          }}
                        >
                          Languages: {c.languages.join(", ")}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#262626",
                          marginBottom: "4px",
                        }}
                      >
                        Experience: {c.experience} yrs
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#1677ff",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "6px",
                        }}
                      >
                        {c.city} | ₹{c.money} / {c.moneyType}
                      </div>
                      <Rate
                        readOnly
                        value={c.review || 0}
                        style={{
                          "--star-size": "10px",
                          marginBottom: "4px",
                        }}
                      />
<Button
  color="primary"
  fill="solid"
  size="mini"
  block
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/profile/${c._id}`);
  }}
  style={{ fontSize: "11px" }}
>
  View
</Button>
                    </Card>
                  </Grid.Item>
                ))}
              </Grid>
            ) : (
              <Card style={{ textAlign: "center", padding: "24px" }}>
                <div style={{ color: "#8c8c8c", fontSize: "14px" }}>
                  No consultants found
                </div>
              </Card>
            )}
          </div>

          {/* Properties Section */}
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                margin: "16px 0 12px 0",
                color: "#262626",
              }}
            >
              Featured Properties
            </h3>

            {filteredProperties.length > 0 ? (
              <Grid columns={3} gap={8}>
                {filteredProperties.map((p) => (
                  <Grid.Item key={p._id}>
                    <Card
                      style={{
                        borderRadius: "8px",
                        overflow: "hidden",
                        padding: 0,
                      }}
                    >
                      <img
                        src={
                          p.images?.[0] ||
                          "https://via.placeholder.com/200x120?text=Property"
                        }
                        alt={p.title}
                        style={{
                          width: "100%",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ padding: "8px" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "11px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            lineHeight: "1.3",
                            marginBottom: "4px",
                          }}
                        >
                          {p.title}
                        </div>
                        <Space wrap style={{ marginBottom: "4px" }}>
                          <Tag
                            color="primary"
                            style={{ fontSize: "9px", padding: "0 4px" }}
                          >
                            {p.propertyType}
                          </Tag>
                          <Tag
                            color={p.listingType === "Sale" ? "success" : "warning"}
                            style={{ fontSize: "9px", padding: "0 4px" }}
                          >
                            {p.listingType}
                          </Tag>
                        </Space>
                        <div
                          style={{
                            color: "#ff6b00",
                            fontWeight: 600,
                            fontSize: "11px",
                            marginBottom: "4px",
                          }}
                        >
                          ₹{(p.price / 100000).toFixed(1)}L
                          {p.negotiable && (
                            <Tag
                              color="warning"
                              style={{
                                marginLeft: 4,
                                fontSize: "8px",
                                padding: "0 3px",
                              }}
                            >
                              Neg
                            </Tag>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#8c8c8c",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <EnvironmentOutline /> {p.locality}, {p.city}
                        </div>
                      </div>
                    </Card>
                  </Grid.Item>
                ))}
              </Grid>
            ) : (
              <Card style={{ textAlign: "center", padding: "24px" }}>
                <div style={{ color: "#8c8c8c", fontSize: "14px" }}>
                  No properties found
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Profile Popup */}
      <Popup
        visible={profileVisible}
        onMaskClick={() => setProfileVisible(false)}
        onClose={() => setProfileVisible(false)}
        bodyStyle={{
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          minHeight: "40vh",
          padding: "24px 16px",
        }}
      >
        {profile ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <EditSOutline
                fontSize={22}
                style={{ color: "#1677ff", cursor: "pointer" }}
                onClick={() =>
                  Toast.show({
                    icon: "loading",
                    content: "Edit feature coming soon!",
                  })
                }
              />
              <DeleteOutline
                fontSize={22}
                style={{ color: "#ff3141", cursor: "pointer" }}
                onClick={handleDeleteProfile}
              />
            </div>

            <Avatar
              src={profile.avatar}
              style={{
                "--size": "80px",
                "--border-radius": "50%",
                backgroundColor: "#1677ff",
                marginBottom: "16px",
              }}
            >
              <UserOutline fontSize={40} />
            </Avatar>

            <h2
              style={{
                margin: "8px 0",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              {profile.selectedRole}
            </h2>

            <List style={{ marginTop: "16px" }}>
              <List.Item prefix={<PhoneFill />}>
                <strong>{profile.phone}</strong>
              </List.Item>
              <List.Item prefix={<StarFill />}>
                <Space wrap>
                  {profile.role?.map((r) => (
                    <Tag color="success" key={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Tag>
                  ))}
                </Space>
              </List.Item>
              <List.Item>
                <div style={{ fontSize: "13px", color: "#8c8c8c" }}>
                  Joined: {new Date(profile.createdAt).toLocaleDateString("en-IN")}
                </div>
              </List.Item>
            </List>

            <Button
              color="primary"
              fill="solid"
              block
              size="large"
              style={{ marginTop: "24px" }}
              onClick={() => setProfileVisible(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px 0",
            }}
          >
            <SpinLoading color="primary" style={{ fontSize: 48 }} />
          </div>
        )}
      </Popup>

      {/* Role-based Modals */}
      <AddConsultantModal
        visible={consultantFormVisible}
        setVisible={handleConsultantModalVisibility}
        refreshData={fetchConsultants}
        onSuccess={handleFormSuccess}
        onCancel={handleCancelClick} // Pass cancel handler
      />

      <AgentRegistration
        visible={agentFormVisible}
        setVisible={handleAgentModalVisibility}
        refreshData={fetchProperties}
        onSuccess={handleFormSuccess}
        onCancel={handleCancelClick} // Pass cancel handler
      />
    </div>
  );
}