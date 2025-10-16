import api from "./axios";
export const sendOtp = async (phone, role) => {
  try {
    const { data } = await api.post("/auth/send-otp", { phone, role });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const verifyOtp = async (phone, otp, role) => {
  try {
    const { data } = await api.post("/auth/verify-otp", { phone, otp, role });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};
