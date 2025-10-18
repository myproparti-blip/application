import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Input,
  Checkbox,
  Toast,
  SpinLoading,
  AutoCenter,
  Grid,
} from "antd-mobile";
import { sendOtp, verifyOtp } from "../services/auth";

const roles = [
"user",
  "seller",
  "owner",
  "investor",
  "agent",
  "consultant"
];

export default function Login({ onLoginSuccess }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [selectedRole, setSelectedRole] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  // Auto resize listener (to detect mobile)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleOtpChange = async (val, index) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = val;
    setOtpDigits(newOtp);

    if (val && index < 3) otpRefs.current[index + 1]?.focus();
    if (!val && index > 0) otpRefs.current[index - 1]?.focus();

    if (newOtp.every((d) => d !== "")) {
      const otp = newOtp.join("");
      setLoading(true);
      try {
        const res = await verifyOtp(phone, otp, selectedRole);
        if (res.data.success) {
          localStorage.setItem("authToken", res.data.accessToken);
          Toast.show({ content: res.data.message || "Login successful!" });
          onLoginSuccess(res.data.user);
        }
      } catch (err) {
        setOtpDigits(["", "", "", ""]);
        Toast.show({ content: "Invalid OTP. Try again.", icon: "fail" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendOtp = async () => {
    if (!phone || !selectedRole || !agreed) {
      Toast.show({
        content: "Please enter phone, select role, and agree to terms.",
        icon: "fail",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(phone, selectedRole);
      if (res.data.success) {
        Toast.show({ content: res.data.message || "OTP sent!" });
        setStep("otp");
      }
    } catch (err) {
      Toast.show({ content: "Failed to send OTP", icon: "fail" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {loading && (
        <div style={styles.loadingOverlay}>
          <SpinLoading color="primary" style={{ "--size": "40px" }} />
          <AutoCenter style={{ marginTop: 12 }}>Processing...</AutoCenter>
        </div>
      )}

      {step === "phone" ? (
        <>
          <div style={styles.header}>
            <h2 style={styles.title}>Welcome 🚀</h2>
            <p style={styles.subtitle}>Enter your details to get started</p>
          </div>

          <div style={styles.formContainer}>
            <Input
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              type="tel"
              value={phone}
              onChange={(val) => setPhone(val.replace(/\D/g, ""))}
              clearable
              style={styles.input}
            />

            <div>
              <p style={styles.label}>Select Your Role</p>
              <Grid columns={2} gap={8}>
                {roles.map((role) => (
                  <Grid.Item key={role}>
                    <Button
                      block
                      color={selectedRole === role ? "primary" : "default"}
                      size="middle"
                      style={{
                        borderRadius: 20,
                        fontSize: 13,
                        border:
                          selectedRole === role
                            ? "2px solid #1677ff"
                            : "1px solid #ccc",
                      }}
                      onClick={() => setSelectedRole(role)}
                    >
                      {role
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Button>
                  </Grid.Item>
                ))}
              </Grid>
            </div>

            <Checkbox
              checked={agreed}
              onChange={setAgreed}
              style={{ marginTop: 12 }}
            >
              <span style={styles.checkboxText}>
                I agree to{" "}
                <a href="#" style={styles.link}>
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="#" style={styles.link}>
                  Privacy Policy
                </a>
              </span>
            </Checkbox>

            <Button
              block
              color="primary"
              size="large"
              style={styles.sendButton}
              onClick={handleSendOtp}
              disabled={!phone || !selectedRole || !agreed}
              loading={loading}
            >
              Send OTP
            </Button>
          </div>
        </>
      ) : (
        <>
          <div style={styles.header}>
            <h3 style={styles.title}>Enter OTP</h3>
            <p style={styles.subtitle}>
              Sent to +91 {phone}{" "}
              <a style={styles.changeLink} onClick={() => setStep("phone")}>
                Change
              </a>
            </p>
          </div>

          <div style={styles.otpContainer}>
            {otpDigits.map((d, i) => (
              <Input
                key={i}
                maxLength={1}
                value={d}
                onChange={(val) => handleOtpChange(val, i)}
                ref={(el) => (otpRefs.current[i] = el)}
                type="tel"
                inputMode="numeric"
                style={styles.otpInput}
              />
            ))}
          </div>

          <p style={styles.otpHint}>
            OTP will auto-verify once all 4 digits are entered.
          </p>

          <div style={styles.resend}>
            <span>Didn’t receive OTP? </span>
            <Button
              size="mini"
              color="primary"
              fill="none"
              onClick={handleSendOtp}
              disabled={loading}
            >
              Resend
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
  },
  header: { textAlign: "center", marginBottom: 20 },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },
  formContainer: { display: "flex", flexDirection: "column", gap: 16 },
  input: {
    borderRadius: 12,
    background: "#fff",
  },
  label: {
    marginBottom: 8,
    fontWeight: 500,
    fontSize: 13,
    color: "#374151",
  },
  checkboxText: {
    fontSize: 13,
    color: "#374151",
  },
  link: {
    color: "#1677ff",
    textDecoration: "none",
  },
  sendButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  otpContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    margin: "20px auto",
  },
  otpInput: {
    width: "50px",
    height: "50px",
    textAlign: "center",
    fontSize: "20px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff",
  },
  otpHint: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
  },
  resend: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    color: "#6b7280",
  },
  changeLink: { color: "#1677ff", marginLeft: 6 },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.9)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
};
