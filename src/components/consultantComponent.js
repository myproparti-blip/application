// src/components/AddConsultantModal.jsx
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Stepper,
  ImageUploader,
  Button,
  Toast,
  Picker,
  TextArea,
} from "antd-mobile";
import { addConsultant } from "../services/consultants";

export default function AddConsultantModal({ visible, setVisible, refreshData, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [idProofFile, setIdProofFile] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !["image", "idProof"].includes(key)) {
          if (Array.isArray(value)) formData.append(key, value[0]);
          else formData.append(key, value);
        }
      });

      if (imageFile) formData.append("image", imageFile);
      if (idProofFile) formData.append("idProof", idProofFile);

      const res = await addConsultant(formData);
      if (res.success) {
        Toast.show({ icon: "success", content: "Consultant added successfully!" });
        form.resetFields();
        setImageFile(null);
        setIdProofFile(null);
        setVisible(false);
        refreshData?.();
        // Call onSuccess callback to notify parent
        onSuccess?.();
      } else {
        Toast.show({ icon: "fail", content: res.error || "Failed to add consultant" });
      }
    } catch (err) {
      console.error(err);
      Toast.show({ icon: "fail", content: "Something went wrong!" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    setImageFile(file);
    return { url: URL.createObjectURL(file) };
  };

  const handleIdProofUpload = (file) => {
    setIdProofFile(file);
    return { url: URL.createObjectURL(file) };
  };

  // Handle cancel button click
  const handleCancel = () => {
    console.log("❌ Cancel button clicked in AddConsultantModal");
    // Call the onCancel prop if provided, otherwise use default close
    if (onCancel) {
      onCancel();
    } else {
      setVisible(false);
    }
  };

  // Handle modal close (mask click, back button, etc.)
  const handleModalClose = () => {
    console.log("🔧 Modal close triggered in AddConsultantModal");
    // For modal close (not cancel button), use the setVisible function
    // The parent component will handle whether to allow closing or not
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      title="Add Consultant"
      content={
        <div style={{ maxHeight: "70vh", overflowY: "auto", padding: "16px 0" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            footer={
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Button 
                  block 
                  onClick={handleCancel}
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  block 
                  type="submit" 
                  color="primary" 
                  loading={loading} 
                  style={{ flex: 1 }}
                >
                  {loading ? "Adding..." : "Add Consultant"}
                </Button>
              </div>
            }
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input clearable />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input type="tel" maxLength={10} clearable />
            </Form.Item>

            <Form.Item
              name="designation"
              label="Designation"
              rules={[{ required: true, message: "Please enter designation" }]}
            >
              <Input clearable />
            </Form.Item>

            <Form.Item
              name="experience"
              label="Experience (years)"
              rules={[{ required: true, message: "Please enter experience" }]}
            >
              <Stepper min={0} max={50} defaultValue={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="expertise"
              label="Expertise"
              rules={[{ required: true, message: "Please enter expertise" }]}
            >
              <Input clearable />
            </Form.Item>

            <Form.Item
              name="money"
              label="Consultation Fee (₹)"
              rules={[{ required: true, message: "Please enter fee" }]}
            >
              <Input type="number" min={0} clearable />
            </Form.Item>

            <Form.Item
              label="Fee Type"
              rules={[{ required: true, message: "Please select fee type" }]}
            >
              <Form.Item
                name="moneyType"
                noStyle
                rules={[{ required: true, message: "Please select fee type" }]}
              >
                <Form.Item shouldUpdate={(prev, curr) => prev.moneyType !== curr.moneyType}>
                  {({ getFieldValue, setFieldValue }) => {
                    const selectedType = getFieldValue("moneyType");
                    return (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["hourly", "monthly", "project"].map((type) => {
                          const selected = selectedType === type;
                          return (
                            <div
                              key={type}
                              onClick={() => setFieldValue("moneyType", type)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 16,
                                cursor: "pointer",
                                border: `1px solid ${selected ? "#1677ff" : "#d9d9d9"}`,
                                backgroundColor: selected ? "#1677ff" : "#fff",
                                color: selected ? "#fff" : "#000",
                                fontSize: 14,
                                userSelect: "none",
                              }}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                </Form.Item>
              </Form.Item>
            </Form.Item>

            <Form.Item name="languages" label="Languages">
              <Input
                clearable
                placeholder="Enter comma-separated languages"
                value={form.getFieldValue("languages")?.join(",") || ""}
                onChange={(val) => form.setFieldValue("languages", val.split(",").map(l => l.trim()))}
              />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <TextArea rows={3} maxLength={200} showCount />
            </Form.Item>

            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Please enter location" }]}
            >
              <Input clearable />
            </Form.Item>

            <Form.Item name="image" label="Profile Photo">
              <ImageUploader
                maxCount={1}
                upload={handleImageUpload}
                style={{ "--cell-size": "100px" }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    border: "1px dashed #d9d9d9",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#999",
                  }}
                >
                  Upload Photo
                </div>
              </ImageUploader>
            </Form.Item>

            <Form.Item name="idProof" label="ID Proof (Aadhaar/PAN)">
              <ImageUploader
                maxCount={1}
                upload={handleIdProofUpload}
                style={{ "--cell-size": "100px" }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    border: "1px dashed #d9d9d9",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#999",
                  }}
                >
                  Upload ID
                </div>
              </ImageUploader>
            </Form.Item>
          </Form>
        </div>
      }
      closeOnAction
      onClose={handleModalClose}
      actions={[]} // Remove default actions since we have our own cancel button
    />
  );
}