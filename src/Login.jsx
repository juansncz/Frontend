import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import { FaUser, FaLock } from 'react-icons/fa';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { API_ENDPOINT } from "./Api/api.jsx";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_ENDPOINT}/api/auth/login`, {
        username,
        password: password,
      });

      const token = response.data.token;
      localStorage.setItem('token', JSON.stringify(token));
      setError('');
      setLoading(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      setError('Invalid username or password');
      setLoading(false);
    }
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
                <h5 className="text-center mb-4 fs-3 fw-bold" style={{ color: '#f77f00', fontFamily: 'monospace' }}>Login</h5>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formUsername" className="mb-3">
                    <Form.Label style={{ color: '#333' }}>Username:</Form.Label>
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
                    <Form.Label style={{ color: '#333' }}>Password:</Form.Label>
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

                  {error && <p className="text-danger">{error}</p>}

                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading} 
                    className="w-100" 
                    style={{ 
                      borderRadius: '8px', 
                      backgroundColor: '#00d2ff', 
                      border: '1px solid #00d2ff', 
                    }}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  <p>
                    Don't have an account?{' '}
                    <a href="/register" className="text-success fw-bold" style={{ textDecoration: 'none', color: '#f77f00', fontFamily: 'monospace' }}>
                      Register here.
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Login;
