import React, { useState, useRef, useEffect } from "react";
import { Typography, Input, Button, Checkbox, message, Spin } from "antd";
import { sendOtp, verifyOtp } from "../services/auth";
const { Title, Text } = Typography;
const roles = ["buyer", "seller", "tenant", "landlord", "property_manager", "consultant"];

export default function Login({ onLoginSuccess }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [selectedRole, setSelectedRole] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleOtpChange = async (val, index) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = val;
    setOtpDigits(newOtp);

    if (val && index < 3) otpRefs.current[index + 1]?.focus();
    if (!val && index > 0) otpRefs.current[index - 1]?.focus();

    if (newOtp.every(d => d !== "")) {
      // Verify OTP
      const otp = newOtp.join("");
      setLoading(true);
      try {
        const res = await verifyOtp(phone, otp, selectedRole);
        if (res.data.success) {
          localStorage.setItem("authToken", res.data.accessToken);
          message.success(res.data.message || "Login successful!");
          onLoginSuccess(res.data.user);
        }
      } catch (err) {
        setOtpDigits(["", "", "", ""]); // reset OTP inputs on error
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendOtp = async () => {
    if (!phone || !selectedRole || !agreed) {
      message.error("Please enter phone, select role, and agree to terms.");
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(phone, selectedRole);
      if (res.data.success) {
        message.success(res.data.message || "OTP sent!");
        setStep("otp");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {loading && <Spin style={{ marginBottom: 20 }} />}
      {step === "phone" ? (
        <>
          <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>Welcome! 🚀</Title>
          <Input
            placeholder="Enter mobile number"
            maxLength={10}
            size="large"
            style={styles.input}
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 12 }}>
            {roles.map(role => (
              <Button
                key={role}
                type={selectedRole === role ? "primary" : "default"}
                shape="round"
                size="large"
                onClick={() => setSelectedRole(role)}
              >
                {role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>
          <Checkbox checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 12 }}>
            I agree to Terms & Privacy Policy
          </Checkbox>
          <Button
            type="primary"
            block
            size="large"
            style={{ marginTop: 12, borderRadius: 8 }}
            onClick={handleSendOtp}
            disabled={!phone || !selectedRole || !agreed}
          >
            Send OTP
          </Button>
        </>
      ) : (
        <>
          <Title level={4} style={{ textAlign: "center" }}>Enter OTP</Title>
          <Text style={{ display: "block", textAlign: "center", marginBottom: 20 }}>
            Sent to +91 {phone} <a onClick={() => setStep("phone")}>Change</a>
          </Text>
          <div style={{ display: "flex", justifyContent: "center", gap: "4vw" }}>
            {otpDigits.map((d, i) => (
              <Input
                key={i}
                maxLength={1}
                value={d}
                onChange={e => handleOtpChange(e.target.value, i)}
                ref={el => (otpRefs.current[i] = el)}
                style={styles.otpInput}
                type="tel"
              />
            ))}
          </div>
          <Text style={{ display: "block", marginTop: 15, textAlign: "center" }}>
            OTP will auto-verify once all 4 digits are entered
          </Text>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 16,
    width: "100%",
    maxWidth: 400,
    margin: "0 auto",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
  },
  input: {
    borderRadius: 8,
    fontSize: 16,
  },
  otpInput: {
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 24,
    borderRadius: 8,
  },
};
