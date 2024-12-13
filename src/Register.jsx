import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import { FaUser, FaLock } from 'react-icons/fa';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { API_ENDPOINT } from "./Api/api.jsx";

function Register() {
  const navigate = useNavigate();
  const [fullname, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate password and confirm password match
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      setLoading(false);
      return;
    }

    try {
      // Register user using the backend API
      await axios.post(`${API_ENDPOINT}/api/auth/register`, {
        fullname,
        username,
        password: password, // Use `passwordx` as per API requirements
      });

      setError('');
      setLoading(false);
      setShowModal(true); // Show success modal
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during registration');
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/login'); // Redirect to login page after closing modal
  };

  return (
    <>
      <Navbar style={{ backgroundColor: '#0a0a0a', backgroundImage: 'linear-gradient(to right, #00d2ff, #00a1ff)', padding: '1rem 0' }} variant="dark">
        <Container>
          <Navbar.Brand 
            href="#home" 
            style={{
              color: '#eae2b7', 
              fontWeight: 'bold', 
              fontFamily: 'monospace', 
              fontSize: '1.8rem'
            }}
          >
            Cryptoset Institute of Computing
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container>
        <Row className="justify-content-md-center vh-100 align-items-center">
          <Col md={6} lg={5}>
            <div className="text-center mb-4">
              <img
                src="/NCF.jpg"
                alt="NCF Logo"
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}
              />
            </div>
            <div className="card shadow" style={{ borderRadius: '12px', padding: '20px', backgroundColor: '#ffffff', borderColor: '#fcbf49' }}>
              <div className="card-body">
                <h5 className="text-center mb-4 fs-3 fw-bold" style={{ color: '#f77f00', fontFamily: 'monospace' }}>Register</h5>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formFullName" className="mb-3">
                    <Form.Label style={{ color: '#333', fontWeight: 'bold' }}>Full Name:</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#d3d3d3' }}>
                        <FaUser />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Enter Full Name"
                        value={fullname}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={{
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          color: '#333',
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group controlId="formUsername" className="mb-3">
                    <Form.Label style={{ color: '#333', fontWeight: 'bold' }}>Username:</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#d3d3d3' }}>
                        <FaUser />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          color: '#333',
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group controlId="formPassword" className="mb-3">
                    <Form.Label style={{ color: '#333', fontWeight: 'bold' }}>Password:</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#d3d3d3' }}>
                        <FaLock />
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          color: '#333',
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group controlId="formConfirmPassword" className="mb-3">
                    <Form.Label style={{ color: '#333', fontWeight: 'bold' }}>Confirm Password:</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#d3d3d3' }}>
                        <FaLock />
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          color: '#333',
                        }}
                      />
                    </div>
                  </Form.Group>

                  {error && <p className="text-danger">{error}</p>}

                  <Button
                    variant="primary"
                    className="w-100"
                    type="submit"
                    disabled={loading}
                    style={{ 
                      borderRadius: '8px', 
                      backgroundColor: '#00d2ff', 
                      border: '1px solid #00d2ff', 
                    }}
                  >
                    {loading ? 'Registering...' : 'Register Now'}
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  <p>
                    Already have an account?{' '}
                    <Link to="/login" className="text-success fw-bold" style={{ textDecoration: 'none' }}>
                      Login here.
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Success Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registration Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Your account has been created successfully!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleModalClose}>
            Proceed to Login
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Register;
