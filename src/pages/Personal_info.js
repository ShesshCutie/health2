import React, { useState, useEffect } from "react";
import axios from "axios";

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    maxWidth: "90%",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
  },
  buttonGroup: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

// Reusable Modal Component
const Modal = ({ title, children, onClose, onSubmit, isLoading }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{title}</h3>
        {children}
        <div style={styles.buttonGroup}>
          <button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Form Component
const FormFields = ({ formData, handleChange, handleImageChange }) => (
  <>
    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
    <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Middle Name" />
    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" />
    <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} />
    <select name="gender" value={formData.gender} onChange={handleChange}>
      <option value="">Select Gender</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    </select>
    <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Occupation" />
    <input type="file" onChange={handleImageChange} />
  </>
);

const Personal_info = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    birthday: "",
    gender: "",
    occupation: "",
    image: null,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch all patients
  const fetchAllData = () => {
    axios.get("http://localhost:5000/api/personal-info")
      .then(response => setEntries(response.data))
      .catch(error => console.error("Error fetching data:", error));
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      age: "",
      birthday: "",
      gender: "",
      occupation: "",
      image: null,
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      firstName: patient.firstName || "",
      middleName: patient.middleName || "",
      lastName: patient.lastName || "",
      age: patient.age || "",
      birthday: patient.birthday || "",
      gender: patient.gender || "",
      occupation: patient.occupation || "",
      image: null,
    });
    setShowEditModal(true);
  };

  // Handle adding a new patient
  const handleAdd = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("First and Last Name are required!");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      await axios.post("http://localhost:5000/api/personal-info", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchAllData();
      setShowAddModal(false);
    } catch (error) {
      setError("Error saving data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating patient data
  const handleEdit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("First and Last Name are required!");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      await axios.put(`http://localhost:5000/api/personal-info/${selectedPatient.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchAllData();
      setShowEditModal(false);
    } catch (error) {
      setError("Error updating data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Patient List</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {showAddModal && (
        <Modal title="Add New Patient" onClose={() => setShowAddModal(false)} onSubmit={handleAdd} isLoading={isLoading}>
          <FormFields formData={formData} handleChange={handleChange} handleImageChange={handleImageChange} />
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Edit Patient" onClose={() => setShowEditModal(false)} onSubmit={handleEdit} isLoading={isLoading}>
          <FormFields formData={formData} handleChange={handleChange} handleImageChange={handleImageChange} />
        </Modal>
      )}

      <div style={{ margin: "10px", padding: "10px", border: "1px solid #ccc" }}>
        {entries.length > 0 ? (
          entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => openEditModal(entry)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                margin: "5px 0",
                cursor: "pointer",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
                width: "100%",
                textAlign: "left",
              }}
            >
              <p>{entry.firstName} {entry.middleName} {entry.lastName}</p>
              {entry.image && <img src={`http://localhost:5000${entry.image}`} alt="Patient" style={{ width: "50px", height: "50px", borderRadius: "50%" }} />}
            </button>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>
      <button onClick={openAddModal} style={{ padding: "10px", marginBottom: "10px" }}>
        + Add Patient
      </button>
    </div>
  );
};

export default Personal_info;
