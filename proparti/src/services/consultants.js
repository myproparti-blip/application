import api from "./axios";
export const sendOtp = async () => {
  try {
    const { data } = await api.get("/consultants",);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};