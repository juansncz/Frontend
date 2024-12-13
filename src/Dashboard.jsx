import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { FaSignOutAlt, FaEdit, FaTrash, FaPlus, FaEye} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './Dashboard.css';


function Dashboard() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false); // State for add user modal
    const [showUpdateUserModal, setShowUpdateUserModal] = useState(false); // State for update user modal
    const [newUser, setNewUser] = useState({
        fullname: '',
        username: '',
        password: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [updatedUser, setUpdatedUser] = useState({
        fullname: '',
        username: '',
        password: ''
    });
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

    const handleUpdate = (userToUpdate) => {
        setUpdatedUser({
            fullname: userToUpdate.fullname,
            username: userToUpdate.username,
            password: '', // Leave password empty for now
        });
        setSelectedUser(userToUpdate);
        setShowUpdateUserModal(true);
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

    const handleUpdateUser = async () => {
        // Ensure selectedUser and user_id are valid
        if (!selectedUser || !selectedUser.user_id || isNaN(selectedUser.user_id)) {
        Swal.fire('Error', 'User details are missing or invalid.', 'error');
        console.log('Selected user or user_id is missing or invalid:', selectedUser);
        return;
        }  
    
        const updatedUserData = {
        fullname: updatedUser.fullname,
        username: updatedUser.username,
        ...(updatedUser.password && { password: updatedUser.password }),  // Only include password if it's not empty
        };
    
        const token = JSON.parse(localStorage.getItem('token'));
        if (!token) {
        Swal.fire('Error', 'Token is missing. Please log in again.', 'error');
        console.log('No token found in localStorage');
        return;
        }
    
        const apiUrl = `${import.meta.env.VITE_API_ENDPOINT}/api/users/${selectedUser.user_id}`;
        console.log('Making API request to:', apiUrl);
    
        try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedUserData), // Send the updated user data, including password if provided
        });
    
        const responseBody = await response.json();  // Get the JSON response
        console.log('Backend Response:', responseBody);
    
        if (!response.ok) {
            throw new Error(`Failed to update user. Status: ${response.status}, Message: ${responseBody.error || responseBody.message}`);
        }
    
        Swal.fire('Success', 'User details updated successfully.', 'success');
    
        // Update the user in the local state if the update was successful
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
            user.user_id === selectedUser.user_id ? { ...user, ...updatedUserData } : user
            )
        );
    
        setShowUpdateUserModal(false);
        } catch (error) {
        console.error('Error updating user:', error);
        Swal.fire('Error', `There was an issue updating the user: ${error.message}`, 'error');
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
        fontSize: '1.8rem' // Increased font size for branding
    }}
>
    Cryptoset Institute of Computing
</Navbar.Brand>
<Nav className="ms-auto">
    <NavDropdown title={user ? `Hello, ${user.username}` : 'More'} id="user-nav-dropdown">
        <NavDropdown.Item 
            onClick={handleLogout} 
            style={{ 
                color: '#1a1a1a', 
                fontSize: '1.2rem' // Increased font size for dropdown item
            }}
        >
            <FaSignOutAlt className="me-2" />
            Logout
        </NavDropdown.Item>
    </NavDropdown>
    <Button
        variant="primary"
        className="ms-2"
        onClick={() => setShowAddUserModal(true)} 
        style={{
            backgroundColor: '#00d2ff',
            borderColor: '#00d2ff',
            fontFamily: 'monospace',
            fontSize: '1.2rem', // Increased font size for the button text
            borderRadius: '5px',
            transition: 'all 0.3s ease',
            padding: '0.8rem 1.4rem' // Increased padding for larger button
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#006699'}  
        onMouseLeave={(e) => e.target.style.backgroundColor = '#00d2ff'}
    >
        <FaPlus className="me-2" />
        Add User
    </Button>
</Nav>
</Container>
</Navbar>


<Container className="mt-4">
<h2 style={{ color: '#f77f00', fontWeight: 'bold', fontFamily: 'monospace' }}>Users</h2> {/* Change color of heading */}
<Table striped bordered hover responsive className="table-hover shadow-lg" 
style={{
    backgroundColor: '#1a1a1a', // Dark background to match your website's theme
    color: '#eae2b7', // Light text for good contrast
    borderRadius: '12px', // Rounded corners
    borderColor: '#333',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // Added box shadow for depth
    transition: 'all 0.3s ease',
}}>
<thead className="bg-dark text-white">
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
                <Button variant="info" size="sm" className="me-2" onClick={() => handleView(user)} 
                    style={{
                        backgroundColor: '#007bff',
                        borderColor: '#007bff',
                        color: 'white',
                        borderRadius: '8px', // Rounded corners for the buttons
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)', // Subtle shadow for hover effect
                        transition: 'all 0.3s ease', // Smooth transitions
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}>
                    <FaEye /> View
                </Button>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleUpdate(user)} 
                    style={{
                        backgroundColor: '#ffc107',
                        color: 'black',
                        borderRadius: '8px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e0a800'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ffc107'}>
                    <FaEdit /> Update
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(user.user_id)} 
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}>
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
<Modal show={showModal} onHide={() => setShowModal(false)} centered>
<Modal.Header closeButton>
    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#eae2b7' }}>View User</Modal.Title>
</Modal.Header>
<Modal.Body>
    <Form>
        <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
                type="text"
                defaultValue={selectedUser.username}
                readOnly
                style={{
                    backgroundColor: '#2a2a2a',
                    color: '#eae2b7',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    padding: '10px',
                    transition: 'background-color 0.3s ease',
                }}
            />
        </Form.Group>

        <Form.Group controlId="fullname" className="mt-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
                type="text"
                defaultValue={selectedUser.fullname}
                readOnly
                style={{
                    backgroundColor: '#2a2a2a',
                    color: '#eae2b7',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    padding: '10px',
                    transition: 'background-color 0.3s ease',
                }}
            />
        </Form.Group>

        <Form.Group controlId="ID" className="mt-3">
            <Form.Label>User ID</Form.Label>
            <Form.Control
                type="text"
                defaultValue={selectedUser.user_id}
                readOnly
                style={{
                    backgroundColor: '#2a2a2a',
                    color: '#eae2b7',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    padding: '10px',
                    transition: 'background-color 0.3s ease',
                }}
            />
        </Form.Group>
    </Form>
</Modal.Body>
</Modal>
)}

{/* Modal for Adding New User */}
<Modal show={showAddUserModal} onHide={() => setShowAddUserModal(false)} centered>
<Modal.Header closeButton>
<Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#eae2b7' }}>Add New User</Modal.Title>
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
            style={{
                backgroundColor: '#2a2a2a',
                color: '#eae2b7',
                borderRadius: '8px',
                border: '1px solid #333',
                padding: '10px',
                transition: 'background-color 0.3s ease',
            }}
        />
    </Form.Group>

    <Form.Group controlId="username" className="mt-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
            type="text"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            required
            style={{
                backgroundColor: '#2a2a2a',
                color: '#eae2b7',
                borderRadius: '8px',
                border: '1px solid #333',
                padding: '10px',
                transition: 'background-color 0.3s ease',
            }}
        />
    </Form.Group>

    <Form.Group controlId="password" className="mt-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
            style={{
                backgroundColor: '#2a2a2a',
                color: '#eae2b7',
                borderRadius: '8px',
                border: '1px solid #333',
                padding: '10px',
                transition: 'background-color 0.3s ease',
            }}
        />
    </Form.Group>
</Form>
</Modal.Body>
<Modal.Footer>
<Button
    variant="secondary"
    onClick={() => setShowAddUserModal(false)}
    style={{
        backgroundColor: '#666',
        borderColor: '#666',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    }}
>
    Close
</Button>
<Button
    variant="primary"
    onClick={handleAddUser}
    style={{
        backgroundColor: '#00d2ff',
        borderColor: '#00d2ff',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    }}
>
    Add User
</Button>
</Modal.Footer>
</Modal>

{/* Modal for Updating User */}
<Modal show={showUpdateUserModal} onHide={() => setShowUpdateUserModal(false)} centered>
<Modal.Header closeButton>
<Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#eae2b7' }}>Update User</Modal.Title>
</Modal.Header>
<Modal.Body>
<Form>
    <Form.Group controlId="fullname">
        <Form.Label>Full Name</Form.Label>
        <Form.Control
            type="text"
            value={updatedUser.fullname}
            onChange={(e) => setUpdatedUser({ ...updatedUser, fullname: e.target.value })}
            required
            style={{
                backgroundColor: '#2a2a2a',
                color: '#eae2b7',
                borderRadius: '8px',
                border: '1px solid #333',
                padding: '10px',
                transition: 'background-color 0.3s ease',
            }}
        />
    </Form.Group>

    <Form.Group controlId="username" className="mt-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
            type="text"
            value={updatedUser.username}
            onChange={(e) => setUpdatedUser({ ...updatedUser, username: e.target.value })}
            required
            style={{
                backgroundColor: '#2a2a2a',
                color: '#eae2b7',
                borderRadius: '8px',
                border: '1px solid #333',
                padding: '10px',
                transition: 'background-color 0.3s ease',
            }}
        />
    </Form.Group>

    <Form.Group controlId="password" className="mt-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
            type="password"
            value={updatedUser.password}
            onChange={(e) => setUpdatedUser({ ...updatedUser, password: e.target.value })}
            style={{
                backgroundColor: '#2a2a2a',
                color: '#eae2b7',
                borderRadius: '8px',
                border: '1px solid #333',
                padding: '10px',
                transition: 'background-color 0.3s ease',
            }}
        />
    </Form.Group>
</Form>
</Modal.Body>
<Modal.Footer>
<Button
    variant="secondary"
    onClick={() => setShowUpdateUserModal(false)}
    style={{
        backgroundColor: '#666',
        borderColor: '#666',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    }}
>
    Close
</Button>
<Button
    variant="primary"
    onClick={handleUpdateUser}
    style={{
        backgroundColor: '#00d2ff',
        borderColor: '#00d2ff',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    }}
>
    Update User
</Button>
</Modal.Footer>
</Modal>

        </>
    );
}

export default Dashboard;
