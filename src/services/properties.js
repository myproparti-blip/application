import api from "./axios";
export const getProperties = async () => {
  try {
    const { data } = await api.get("/properties");
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};
export const createProperty = async (propertyData) => {
  try {
    const { data } = await api.post("/properties", propertyData, {
      headers: {
        "Content-Type": "multipart/form-data" 
      }
    });
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};