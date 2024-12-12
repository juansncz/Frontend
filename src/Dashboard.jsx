import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { FaUser, FaCog, FaSignOutAlt, FaEye, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]); // State for users table
    const [newUser, setNewUser] = useState({ username: '', fullname: '', password: '' });
    const [showModal, setShowModal] = useState(false); // State to show modal
    const [userInfo, setUserInfo] = useState(null); // State for user info when "Read" button is clicked
    const [showUserInfoModal, setShowUserInfoModal] = useState(false); // State for displaying user info modal
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDecodedUserID = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const parsedToken = JSON.parse(token);
                const decodedToken = jwtDecode(parsedToken);
                setUser(decodedToken);

                const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users`, {
                    headers: {
                        Authorization: `Bearer ${parsedToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const usersData = await response.json();
                console.log('Fetched users:', usersData); // Debugging the response data
                setUsers(usersData);
            } catch (error) {
                console.error('Error:', error);
                navigate('/login');
            }
        };

        fetchDecodedUserID();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleRead = (user) => {
        setUserInfo(user); // Set the user info for the modal
        setShowUserInfoModal(true); // Show the modal with user info
    };

    const handleDelete = async (id) => {
        const userIdToDelete = id || user.user_id; // Fallback to `user.user_id`

        if (!userIdToDelete) {
            console.error('User ID is missing');
            Swal.fire('Error', 'User ID is missing', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action will permanently delete the user!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const token = JSON.parse(localStorage.getItem('token'));
                const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/${userIdToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }

                Swal.fire('Deleted!', 'The user has been deleted.', 'success');
                setUsers(users.filter(user => user.user_id !== userIdToDelete)); // Adjusted to `user_id`
            } catch (error) {
                console.error('Error deleting user:', error);
                Swal.fire('Error', 'There was an issue deleting the user.', 'error');
            }
        }
    };

    // Handle creating a new user
    const handleCreateUser = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('token'));
            const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                throw new Error('Failed to create user');
            }

            const newUserData = await response.json();
            console.log('New user data:', newUserData); // Debugging response data

            if (newUserData.user_id) {
                // Ensure that the new user data includes `user_id`
                setUsers([...users, newUserData]); // Add the new user to the state
                Swal.fire('Created!', 'The user has been created.', 'success');
                setShowModal(false); // Close the modal
            } else {
                Swal.fire('Error', 'No user_id returned from the backend', 'error');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            Swal.fire('Error', 'There was an issue creating the user.', 'error');
        }
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

            <Container className="mt-4">
                <h2>Users</h2>
                <Button
                    variant="success"
                    className="mb-3"
                    onClick={() => setShowModal(true)}
                >
                    Create User
                </Button>

                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td>{user.user_id || 'N/A'}</td>
                                <td>{user.username}</td>
                                <td>{user.fullname}</td>
                                <td>
                                    <Button
                                        variant="info"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleRead(user)}
                                    >
                                        <FaEye /> Read
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <FaTrash /> Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>

            {/* Modal for creating a new user */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="formFullname" className="mt-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter full name"
                                value={newUser.fullname}
                                onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mt-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCreateUser}>
                        Create User
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for displaying user information */}
            <Modal show={showUserInfoModal} onHide={() => setShowUserInfoModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>User Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {userInfo && (
                        <>
                            <p><strong>Username:</strong> {userInfo.username}</p>
                            <p><strong>Full Name:</strong> {userInfo.fullname}</p>
                            <p><strong>User ID:</strong> {userInfo.user_id}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUserInfoModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Dashboard;
