import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { FaUser, FaCog, FaSignOutAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false); // State for add user modal
    const [newUser, setNewUser] = useState({
        fullname: '',
        username: '',
        password: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);
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

                const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/users`, {
                    headers: {
                        Authorization: `Bearer ${parsedToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const usersData = await response.json();
                console.log('Fetched users:', usersData);
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

    const handleView = (userToView) => {
        setSelectedUser(userToView);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const userIdToDelete = id || user.user_id;

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
                const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/users/${userIdToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }

                Swal.fire('Deleted!', 'The user has been deleted.', 'success');
                setUsers(users.filter(user => user.user_id !== userIdToDelete));
            } catch (error) {
                console.error('Error deleting user:', error);
                Swal.fire('Error', 'There was an issue deleting the user.', 'error');
            }
        }
    };

    // Handle the form submission for adding a new user
    const handleAddUser = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullname: newUser.fullname,
                    username: newUser.username,
                    password: newUser.password,
                }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to create user');
            }
    
            const createdUser = await response.json();
            console.log('Created user:', createdUser);  // Log to verify the response structure
            Swal.fire('Success', 'User has been created.', 'success');
    
            // Refetch the users to ensure the new user is in the list
            const token = JSON.parse(localStorage.getItem('token'));
            const usersResponse = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (!usersResponse.ok) {
                throw new Error('Failed to fetch users');
            }
    
            const usersData = await usersResponse.json();
            setUsers(usersData); // Update users state with the latest list
    
            setShowAddUserModal(false); // Close the modal after adding the user
        } catch (error) {
            console.error('Error adding user:', error);
            Swal.fire('Error', 'There was an issue creating the user.', 'error');
        }
    };
    
    return (
        <>
            <Navbar bg="success" variant="dark">
                <Container>
                    <Navbar.Brand href="#home">Naga College Foundation, Inc.</Navbar.Brand>
                    <Nav className="ms-auto">
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

                        {/* Add User Button */}
                        <Button
                            variant="primary"
                            className="ms-2"
                            onClick={() => setShowAddUserModal(true)} // Show add user modal
                        >
                            <FaPlus className="me-2" />
                            Add User
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            <Container className="mt-4">
                <h2>Users</h2>
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
                                        onClick={() => handleView(user)}
                                    >
                                        <FaEdit /> View
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(user.user_id)}
                                    >
                                        <FaTrash /> Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>

            {/* Modal for Viewing User */}
            {selectedUser && (
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>View User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="username">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedUser.username}
                                    readOnly
                                />
                            </Form.Group>

                            <Form.Group controlId="fullname" className="mt-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedUser.fullname}
                                    readOnly
                                />
                            </Form.Group>

                            <Form.Group controlId="ID" className="mt-3">
                                <Form.Label>User ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedUser.user_id}
                                    readOnly
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}

            {/* Modal for Adding New User */}
            <Modal show={showAddUserModal} onHide={() => setShowAddUserModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="fullname">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newUser.fullname}
                                onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="username" className="mt-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="password" className="mt-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddUserModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddUser}>
                        Add User
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Dashboard;
