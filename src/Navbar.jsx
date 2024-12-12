import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Nav, Navbar, Container } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa'; // You can use this for the hamburger icon
import './Navbar.css'; // Add your custom styling here

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => setIsOpen(!isOpen);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" onClick={toggleNavbar} />
        <Navbar.Collapse id="navbar-nav" className={isOpen ? 'show' : ''}>
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/dashboard">Home</Nav.Link>
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
            <Nav.Link as={Link} to="/register">Register</Nav.Link>
            <Button variant="danger" onClick={logout}>Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
