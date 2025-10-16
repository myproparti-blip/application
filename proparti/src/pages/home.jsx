// Home.jsx
import React, { useState } from "react";
import { Input, Row, Col, Card, AutoComplete } from "antd";

const { Search } = Input;

// Sample consultant data
const consultants = [
  { name: "John Doe", expertise: "Real Estate", location: "Surat" },
  { name: "Jane Smith", expertise: "Property Management", location: "Ahmedabad" },
  { name: "Alice Johnson", expertise: "Interior Design", location: "Baroda" },
  { name: "Bob Brown", expertise: "Architecture", location: "Aurangabad" },
  { name: "Mary Williams", expertise: "Construction", location: "Surat" },
];

// Dummy locations for autocomplete (replace with API for real search)
const locations = [
  "Surat",
  "Ahmedabad",
  "Baroda",
  "Aurangabad",
  "Mumbai",
  "Pune",
  "Delhi",
];

export default function Home() {
  const [searchLocation, setSearchLocation] = useState("");
  const [filteredConsultants, setFilteredConsultants] = useState(consultants);

  // Handle search
  const onSearch = (value) => {
    setSearchLocation(value);
    const filtered = consultants.filter((c) =>
      c.location.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredConsultants(filtered);
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* Header with location search */}
      <div style={{ marginBottom: "24px" }}>
        <AutoComplete
          style={{ width: "100%" }}
          options={locations.map((loc) => ({ value: loc }))}
          value={searchLocation}
          onChange={(value) => setSearchLocation(value)}
          onSelect={onSearch}
        >
          <Search
            placeholder="Search by location"
            enterButton="Search"
            size="large"
            onSearch={onSearch}
          />
        </AutoComplete>
      </div>

      {/* Consultants cards */}
      <Row gutter={[16, 16]}>
        {filteredConsultants.length > 0 ? (
          filteredConsultants.map((consultant, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card title={consultant.name} bordered>
                <p>Expertise: {consultant.expertise}</p>
                <p>Location: {consultant.location}</p>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <p>No consultants found in "{searchLocation}"</p>
          </Col>
        )}
      </Row>
    </div>
  );
}
