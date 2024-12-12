import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa'; // Icons

function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDecodedUserID = () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const parsedToken = JSON.parse(token);
                const decodedToken = jwtDecode(parsedToken);
                setUser(decodedToken);
            } catch (error) {
                console.error('Token decoding error:', error);
                navigate('/login');
            }
        };

        fetchDecodedUserID();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <>
            <Navbar bg="success" variant="dark">
                <Container>
                    <Navbar.Brand href="#home">Naga College Foundation, Inc.</Navbar.Brand>
                    <Nav className="ms-auto">
                        <Nav.Link href="#users">Users</Nav.Link>
                        <Nav.Link href="#departments">Departments</Nav.Link>
                        <Nav.Link href="#courses">Courses</Nav.Link>
                        <NavDropdown title={user ? `Hello, ${user.username}` : 'More'} id="user-nav-dropdown">
                            <NavDropdown.Item href="#">
                                <FaUser className="me-2" />
                                Profile
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#">
                                <FaCog className="me-2" />
                                Settings
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={handleLogout}>
                                <FaSignOutAlt className="me-2" />
                                Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Container>
            </Navbar>
        </>
    );
}

export default Dashboard;
