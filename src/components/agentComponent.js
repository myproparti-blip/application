import React, { useState } from 'react';
import { 
  Modal,
  Button, 
  Input, 
  TextArea, 
  Toast
} from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';
import { addAgent } from '../services/agents';
const AgentModal = ({ visible, setVisible, agent, refreshData, onSuccess, onCancel }) => {
  const [isPropertyDealer, setIsPropertyDealer] = useState(true);
  const [fullName, setFullName] = useState('');
  const [firmName, setFirmName] = useState('');
  const [yearsOperating, setYearsOperating] = useState('');
  const [teamCount, setTeamCount] = useState('');
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [operatingCity, setOperatingCity] = useState('');
  const [aboutAgent, setAboutAgent] = useState('');
  const [loading, setLoading] = useState(false);

  const dealTypes = ['Rent/Lease', 'Pre-launch', 'Original Booking', 'Resale', 'Others'];

  const toggleDeal = (deal) => {
    setSelectedDeals(prev => 
      prev.includes(deal) 
        ? prev.filter(d => d !== deal)
        : [...prev, deal]
    );
  };

  // Handle cancel button click
  const handleCancel = () => {
    console.log("❌ Cancel button clicked in AgentModal");
    if (onCancel) {
      onCancel();
    } else {
      setVisible(false);
    }
  };

  // Handle modal close (mask click, back button, etc.)
  const handleModalClose = () => {
    console.log("🔧 Modal close triggered in AgentModal");
    setVisible(false);
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Toast.show({ content: 'Please enter your full name', position: 'top' });
      return;
    }
    if (selectedDeals.length === 0) {
      Toast.show({ content: 'Please select at least one deal type', position: 'top' });
      return;
    }
    if (!operatingCity.trim()) {
      Toast.show({ content: 'Please select an operating city', position: 'top' });
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for API call
      const agentData = {
        isPropertyDealer: isPropertyDealer ? "yes" : "no",
        agentName: fullName.trim(),
        firmName: firmName?.trim() || "",
        operatingCity: operatingCity.trim(),
        operatingAreaChips: [], // You can add this functionality later
        operatingSince: yearsOperating,
        teamMembers: teamCount,
        dealsIn: selectedDeals,
        dealsInOther: "", // You can handle "Others" specifically if needed
        aboutAgent: aboutAgent?.trim() || "",
      };

      console.log('Sending agent data:', agentData);

      // Call your service function
      const response = await addAgent(agentData);
      
      if (response) {
        Toast.show({ 
          content: response.message || 'Registration Submitted Successfully!', 
          position: 'top' 
        });
        
        console.log('API Response:', response);
        
        // Reset form
        resetForm();
        
        // Close modal after submission
        setVisible(false);
        
        // Call onSuccess callback to notify parent with response data
        onSuccess?.(response.data);
        
        // Refresh data if needed
        refreshData?.();
      } else {
        throw new Error('No response from server');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({ 
        content: error.message || 'Submission failed. Please try again.', 
        position: 'top' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setFullName('');
    setFirmName('');
    setYearsOperating('');
    setTeamCount('');
    setSelectedDeals([]);
    setOperatingCity('');
    setAboutAgent('');
    setIsPropertyDealer(true);
  };

  return (
    <Modal
      visible={visible}
      content={(
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '32px', marginRight: '12px' }}>💼</span>
              <h2 style={{ 
                margin: 0, 
                color: '#00897b', 
                fontSize: '24px',
                fontWeight: 600
              }}>
                Agent Registration
              </h2>
            </div>
            <Button
              fill="none"
              onClick={handleModalClose}
              style={{ padding: '4px', minWidth: 'auto' }}
            >
              <CloseOutline fontSize={20} />
            </Button>
          </div>

          {/* Property Dealer Question */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '12px',
              color: '#333',
              fontWeight: 600
            }}>
              Are you a property dealer?
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsPropertyDealer(true)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isPropertyDealer ? '#00897b' : '#e8d4f8',
                  color: isPropertyDealer ? 'white' : '#00897b',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                ✓ Yes
              </button>
              <button
                onClick={() => setIsPropertyDealer(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: !isPropertyDealer ? '#00897b' : '#e8d4f8',
                  color: !isPropertyDealer ? 'white' : '#00897b',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                No
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

          {/* Agent & Firm Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '16px',
              color: '#333',
              fontWeight: 600
            }}>
              Agent & Firm Details
            </h3>
            
            <Input
              placeholder="Your Full Name *"
              value={fullName}
              onChange={setFullName}
              style={{ 
                marginBottom: '12px',
                borderRadius: '8px'
              }}
            />
            
            <Input
              placeholder="Firm Name (Optional)"
              value={firmName}
              onChange={setFirmName}
              style={{ 
                marginBottom: '12px'
              }}
            />
            
            <Input
              placeholder="Years Operating Since (e.g., 2005)"
              value={yearsOperating}
              onChange={setYearsOperating}
              style={{ 
                marginBottom: '12px'
              }}
            />
            
            <Input
              placeholder="Team Members Count"
              value={teamCount}
              onChange={setTeamCount}
              type="number"
            />
          </div>

          <div style={{ borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

          {/* Deals In */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '12px',
              color: '#333',
              fontWeight: 600
            }}>
              Deals In *
            </h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px' 
            }}>
              {dealTypes.map(deal => (
                <button
                  key={deal}
                  onClick={() => toggleDeal(deal)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: selectedDeals.includes(deal) ? '#00897b' : '#e8d4f8',
                    color: selectedDeals.includes(deal) ? 'white' : '#00897b',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    flex: '1 0 calc(50% - 8px)',
                    minWidth: '120px'
                  }}
                >
                  {deal}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

          {/* Operating City */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '12px',
              color: '#333',
              fontWeight: 600
            }}>
              Operating City *
            </h3>
            
            <Input
              placeholder="Search and Select City"
              value={operatingCity}
              onChange={setOperatingCity}
              style={{ 
                marginBottom: '12px'
              }}
            />
            
            <div style={{
              backgroundColor: '#fff8e1',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>👆</span>
              <span style={{ color: '#f57c00', fontSize: '13px' }}>
                Please select an Operating City to see and add areas.
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

          {/* About Agent */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '12px',
              color: '#333',
              fontWeight: 600
            }}>
              About Agent
            </h3>
            
            <TextArea
              placeholder="Write a brief description about your services and firm."
              value={aboutAgent}
              onChange={setAboutAgent}
              rows={3}
              style={{ 
                borderRadius: '8px'
              }}
            />
          </div>

          {/* Cancel and Submit Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            marginTop: '24px'
          }}>
            <Button
              block
              onClick={handleCancel}
              disabled={loading}
              style={{
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                height: '48px',
                flex: 1,
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #d9d9d9'
              }}
            >
              Cancel
            </Button>
            <Button
              block
              color="primary"
              size="large"
              onClick={handleSubmit}
              loading={loading}
              style={{
                backgroundColor: '#00897b',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                height: '48px',
                flex: 1
              }}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </div>
        </div>
      )}
      onClose={handleModalClose}
      bodyStyle={{
        padding: '16px'
      }}
      closeOnMaskClick
    />
  );
};

export default AgentModal;