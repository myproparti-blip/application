import React, { useState, useEffect } from "react";
import { 
  NavBar, 
  Card, 
  Button, 
  Divider, 
  Tag,
  Image,
  Space,
  Toast,
  SpinLoading
} from "antd-mobile";
import { 
  LeftOutline, 
  StarOutline, 
  LocationOutline, 
  UserOutline,
  TeamOutline,
  PayCircleOutline,
  CalendarOutline,
  PhoneFill,
  MessageOutline
} from "antd-mobile-icons";
import { useParams, useNavigate } from "react-router-dom";
import { getConsultantById } from "../services/consultants";

export default function BookAppointment() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultant = async () => {
      if (!id) {
        Toast.show({
          icon: "fail",
          content: "No consultant ID provided"
        });
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const res = await getConsultantById(id);
        
        console.log("API Response:", res);

        if (res.success) {
          setConsultant(res.data);
        } else {
          Toast.show({
            icon: "fail",
            content: res.message || "Failed to fetch consultant details"
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching consultant:", error);
        Toast.show({
          icon: "fail",
          content: "Error fetching consultant details"
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchConsultant();
  }, [id, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBookAppointment = () => {
    if (!consultant) return;
    
    Toast.show({
      icon: "success",
      content: "Booking functionality coming soon!"
    });
  };

  const handleMessage = () => {
    Toast.show({
      icon: "success",
      content: "Messaging functionality coming soon!"
    });
  };

  const handleCall = () => {
    if (consultant?.phone) {
      window.location.href = `tel:${consultant.phone}`;
    } else {
      Toast.show({
        icon: "fail",
        content: "Phone number not available"
      });
    }
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <SpinLoading color="primary" style={{ fontSize: 48 }} />
      </div>
    );
  }

  if (!consultant) {
    return (
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <UserOutline style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }} />
          <div style={{ color: "#666", fontSize: 16 }}>Consultant not found</div>
          <div style={{ color: "#999", fontSize: 12, marginBottom: 16 }}>
            ID: {id}
          </div>
          <Button 
            color="primary" 
            style={{ marginTop: 16 }}
            onClick={() => navigate("/")}
          >
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <NavBar 
        back="Back"
        backArrow={<LeftOutline />}
        onBack={handleBack}
        style={{
          backgroundColor: "#00b8a9",
          color: "white",
        }}
      >
        <span style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>
          Book Consultation
        </span>
      </NavBar>

      <div style={{ padding: "16px", paddingBottom: "120px" }}>
        {/* Consultant Card */}
        <Card 
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "20px",
            border: "none"
          }}
        >
          <div style={{ display: "flex", padding: "16px" }}>
            <Image
              src={consultant.image || "https://randomuser.me/api/portraits/men/32.jpg"}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "8px",
                objectFit: "cover",
                marginRight: "16px"
              }}
              fallback={
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "8px",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "16px"
                }}>
                  <UserOutline style={{ fontSize: 32, color: "#ccc" }} />
                </div>
              }
            />
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#333", marginBottom: "4px" }}>
                {consultant.name}
              </div>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                {consultant.designation}
              </div>
              
              {/* Rating - Since it's not in API, showing default */}
              <Space align="center" style={{ marginBottom: "8px" }}>
                <StarOutline style={{ color: "#ffc107", fontSize: "16px" }} />
                <span style={{ fontSize: "14px", color: "#666", fontWeight: "500" }}>
                  No reviews yet
                </span>
              </Space>

              <Space align="center">
                <LocationOutline style={{ color: "#666", fontSize: "14px" }} />
                <span style={{ fontSize: "14px", color: "#666" }}>
                  {consultant.location}
                </span>
              </Space>
            </div>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          {/* Languages */}
          {consultant.languages && consultant.languages.length > 0 && (
            <>
              <div style={{ padding: "0 16px 16px 16px" }}>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                  Languages spoken
                </div>
                <Space wrap>
                  {consultant.languages.map((language, index) => (
                    <Tag 
                      key={index}
                      style={{ 
                        borderRadius: "16px",
                        fontSize: "12px",
                        padding: "4px 12px",
                        backgroundColor: "#f0f0f0",
                        border: "none"
                      }}
                    >
                      {language}
                    </Tag>
                  ))}
                </Space>
              </div>
              <Divider style={{ margin: "12px 0" }} />
            </>
          )}

          {/* Expertise */}
          {consultant.expertise && (
            <>
              <div style={{ padding: "0 16px 16px 16px" }}>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                  Expertise
                </div>
                <Space wrap>
                  <Tag 
                    style={{ 
                      borderRadius: "16px",
                      fontSize: "12px",
                      padding: "4px 12px",
                      backgroundColor: "#e6f7ff",
                      border: "1px solid #91d5ff",
                      color: "#1890ff"
                    }}
                  >
                    {consultant.expertise}
                  </Tag>
                </Space>
              </div>
              <Divider style={{ margin: "12px 0" }} />
            </>
          )}

          {/* Experience & Fee */}
          <div style={{ padding: "0 16px 16px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space align="center">
                <TeamOutline style={{ color: "#666", fontSize: "16px" }} />
                <span style={{ fontSize: "14px", color: "#666" }}>
                  {consultant.experience}+ years experience
                </span>
              </Space>
              
              <Space align="center">
                <PayCircleOutline style={{ color: "#00b8a9", fontSize: "16px" }} />
                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#00b8a9" }}>
                  ₹{consultant.money}
                  {consultant.moneyType && ` / ${consultant.moneyType}`}
                </span>
              </Space>
            </div>
          </div>

          {/* Address */}
          {consultant.address && (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <div style={{ padding: "0 16px 16px 16px" }}>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px", fontWeight: "500" }}>
                  Address
                </div>
                <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.5" }}>
                  {consultant.address}
                </div>
              </div>
            </>
          )}

          {/* Phone */}
          <Divider style={{ margin: "12px 0" }} />
          <div style={{ padding: "0 16px 16px 16px" }}>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px", fontWeight: "500" }}>
              Contact
            </div>
            <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.5" }}>
              📞 {consultant.phone}
            </div>
          </div>
        </Card>
      </div>

      {/* Fixed Action Buttons */}
      <div style={{ 
        position: "fixed", 
        bottom: "0", 
        left: "0", 
        right: "0", 
        padding: "16px", 
        backgroundColor: "white", 
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        zIndex: 1000
      }}>
        <Space direction="vertical" style={{ width: "100%", gap: "12px" }}>
          <Button 
            color="primary" 
            size="large"
            style={{
              borderRadius: "8px",
              height: "48px",
              fontWeight: "600",
              fontSize: "16px",
              backgroundColor: "#00b8a9",
              border: "none"
            }}
            block
            onClick={handleBookAppointment}
          >
            <CalendarOutline style={{ marginRight: "8px" }} />
            Book Appointment
          </Button>
          
          <Space style={{ width: "100%", gap: "8px" }}>
            <Button 
              color="default"
              size="large"
              style={{
                borderRadius: "8px",
                height: "48px",
                flex: 1,
                fontWeight: "500",
                backgroundColor: "#f8f9fa",
                border: "1px solid #e0e0e0"
              }}
              onClick={handleMessage}
            >
              <MessageOutline style={{ marginRight: "8px" }} />
              Message
            </Button>
            
            <Button 
              color="default"
              size="large"
              style={{
                borderRadius: "8px",
                height: "48px",
                flex: 1,
                fontWeight: "500",
                backgroundColor: "#f8f9fa",
                border: "1px solid #e0e0e0"
              }}
              onClick={handleCall}
            >
              <PhoneFill style={{ marginRight: "8px" }} />
              Call
            </Button>
          </Space>
        </Space>
      </div>
    </div>
  );
}