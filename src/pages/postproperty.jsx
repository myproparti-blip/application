import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Selector,
  Toast,
  ImageUploader,
} from "antd-mobile";
import { createProperty } from "../services/properties";

export default function PostProperty() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("propertyType", values.propertyType[0]);
      formData.append("listingType", values.listingType[0]);
      formData.append("bedrooms", values.bedrooms);
      formData.append("price", values.price);
      formData.append("addressLine1", values.addressLine1);
      formData.append("locality", values.locality);
      formData.append("city", values.city);
      formData.append("state", values.state);

      if (values.images) {
        values.images.forEach((file) => {
          formData.append("images", file.file);
        });
      }

      const response = await createProperty(formData);

      if (response.success) {
        Toast.show({ content: "Property added successfully", icon: "success" });
        form.resetFields();
      } else {
        Toast.show({
          content: response.error || "Failed to add property",
          icon: "fail",
        });
      }
    } catch (err) {
      Toast.show({ content: "Error submitting form", icon: "fail" });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Post New Property
      </h2>
      <Form
        form={form}
        layout="horizontal"
        onFinish={handleSubmit}
        footer={
          <Button
            block
            color="primary"
            type="submit"
            loading={loading}
            size="large"
          >
            Post Property
          </Button>
        }
      >
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="Enter title" clearable />
        </Form.Item>

        <Form.Item
          name="propertyType"
          label="Property Type"
          rules={[{ required: true }]}
        >
          <Selector
            options={[
              { label: "Apartment", value: "Apartment" },
              { label: "Villa", value: "Villa" },
              { label: "House", value: "House" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="listingType"
          label="Listing Type"
          rules={[{ required: true }]}
        >
          <Selector
            options={[
              { label: "Sale", value: "Sale" },
              { label: "Rent", value: "Rent" },
            ]}
          />
        </Form.Item>

        <Form.Item name="bedrooms" label="Bedrooms" rules={[{ required: true }]}>
          <Input placeholder="e.g., 3 BHK" clearable />
        </Form.Item>

        <Form.Item name="price" label="Price" rules={[{ required: true }]}>
          <Input type="number" placeholder="Enter price" clearable />
        </Form.Item>

        <Form.Item
          name="addressLine1"
          label="Address Line 1"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter address line 1" clearable />
        </Form.Item>

        <Form.Item name="locality" label="Locality" rules={[{ required: true }]}>
          <Input placeholder="Enter locality" clearable />
        </Form.Item>

        <Form.Item name="city" label="City" rules={[{ required: true }]}>
          <Input placeholder="Enter city" clearable />
        </Form.Item>

        <Form.Item name="state" label="State" rules={[{ required: true }]}>
          <Input placeholder="Enter state" clearable />
        </Form.Item>

        <Form.Item name="images" label="Images">
          <ImageUploader
            upload={(file) =>
              Promise.resolve({
                url: URL.createObjectURL(file),
                file,
              })
            }
          />
        </Form.Item>
      </Form>
    </div>
  );
}
