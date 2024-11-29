document.addEventListener('DOMContentLoaded', async () => {
    const content = document.getElementById('content');
    const homeLink = document.getElementById('homeLink');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const usersLink = document.getElementById('usersLink');
    const postsLink = document.getElementById('postsLink');
    const logoutLink = document.getElementById('logoutLink');

    let currentUser = null;

    // Function to check if the user is logged in by getting their data
    async function getCurrentUser() {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include' // Ensures cookies are sent with the request
            });
            if (response.ok) {
                const user = await response.json();
                currentUser = user;
                updateNavigation(); // Updates UI based on currentUser
            } else {
                currentUser = null;
                updateNavigation(); // Updates UI when not logged in
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            currentUser = null;
            updateNavigation();
        }
    }

    // Navigates to a new URL and updates the page content
    function navigateTo(url) {
        history.pushState(null, '', url); // Update browser history without reloading
        handleLocation(); // Handle page content for the new location
    }

    // Listens for browser navigation events (e.g., back/forward buttons)
    window.addEventListener('popstate', handleLocation);

    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/');
    });

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/login');
    });

    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/register');
    });

    usersLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/users');
    });

    postsLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/posts');
    });

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Updates the navigation bar based on the current user's role and login status
    function updateNavigation() {
        if (currentUser) {
            loginLink.style.display = 'none';
            registerLink.style.display = 'none';
            logoutLink.style.display = 'inline';
            postsLink.style.display = 'inline';
            usersLink.style.display = currentUser.role === 'admin' || currentUser.role === 'moderator' ? 'inline' : 'none';
        } else {
            loginLink.style.display = 'inline';
            registerLink.style.display = 'inline';
            logoutLink.style.display = 'none';
            postsLink.style.display = 'none';
            usersLink.style.display = 'none';
        }
    }

    // Handles page rendering based on the current URL
    async function handleLocation() {
        const path = window.location.pathname;

        switch (path) {
            case '/':
                showHome();
                break;
            case '/login':
                showLoginForm();
                break;
            case '/register':
                showRegisterForm();
                break;
            case '/users':
                if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')) {
                    await showUsers();
                } else {
                    showUnauthorized();
                }
                break;
            case '/posts':
                if (currentUser) {
                    await showPosts();
                } else {
                    showUnauthorized();
                }
                break;
            default:
                show404();
        }
    }

    function showHome() {
        content.innerHTML = '<h1>Welcome to RBAC System</h1>';
        if (currentUser) {
            content.innerHTML += `<p>You are logged in as ${currentUser.username} (${currentUser.role})</p>`;
        }
    }

    function showLoginForm() {
        content.innerHTML = `
            <h2>Login</h2>
            <form id="loginForm">
                <input type="text" id="loginUsername" placeholder="Username" required>
                <input type="password" id="loginPassword" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
        `;
        document.getElementById('loginForm').addEventListener('submit', login);
    }

    function showRegisterForm() {
        content.innerHTML = `
            <h2>Register</h2>
            <form id="registerForm">
                <input type="text" id="registerUsername" placeholder="Username" required>
                <input type="password" id="registerPassword" placeholder="Password" required>
                <select id="registerRole">
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit">Register</button>
            </form>
        `;
        document.getElementById('registerForm').addEventListener('submit', register);
    }

    function showUnauthorized() {
        content.innerHTML = '<h2>Unauthorized</h2><p>You do not have permission to access this page.</p>';
    }

    // Fetch and display the list of users for admin or moderator roles
    async function showUsers() {
        if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
            content.innerHTML = '<p>You do not have permission to view users.</p>';
            return;
        }

        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const users = await response.json();
                content.innerHTML = '<h2>Users</h2><ul>' +
                    users.map(user => `
                        <li>
                            ${user.username} (${user.role})
                            ${currentUser.role === 'admin' && user.role !== 'admin' || currentUser.role === 'moderator' && user.role === 'user' ?
                            `<button onclick="deleteUser('${user._id}')">Delete</button>` : ''}
                            ${currentUser.role === 'admin' && user.role === 'user' ? `<button onclick="promoteUser('${user._id}')">Promote to Moderator</button>` : ''}
                            ${currentUser.role === 'admin' && user.role === 'moderator' ? `<button onclick="demoteUser('${user._id}')">Demote to User</button>` : ''}
                        </li>
                    `).join('') +
                    '</ul>';
            } else {
                throw new Error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching users: ' + error.message);
        }
    }

    // Fetch and display posts; allow post creation for logged-in users
    async function showPosts() {
        try {
            const response = await fetch('/api/posts');
            if (response.ok) {
                const posts = await response.json();
                content.innerHTML = '<h2>Posts</h2>';
                if (posts.length === 0) {
                    content.innerHTML += '<p>No posts available.</p>';
                } else {
                    content.innerHTML += posts.map(post => `
                        <div>
                            <h3>${post.title}</h3>
                            <p>${post.content}</p>
                            <p>Author: ${post.author.username} (${post.author.role})</p>
                            ${currentUser._id === post.author._id || (currentUser.role === 'admin' && post.author.role !== 'admin') || (currentUser.role === 'moderator' && post.author.role === 'user') ?
                            `<button onclick="deletePost('${post._id}')">Delete</button>` : ''}
                        </div>
                    `).join('');
                }
                content.innerHTML += `
                    <h3>Create New Post</h3>
                    <form id="postForm">
                        <input type="text" id="postTitle" placeholder="Title" required>
                        <textarea id="postContent" placeholder="Content" required></textarea>
                        <button type="submit">Create Post</button>
                    </form>
                `;
                document.getElementById('postForm').addEventListener('submit', createPost);
            } else {
                throw new Error('Failed to fetch posts');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching posts: ' + error.message);
        }
    }

    function show404() {
        content.innerHTML = '<h1>404 - Page Not Found</h1>';
    }

    async function login(e) {
        e.preventDefault(); // Prevent form submission from refreshing the page
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                const data = await response.json();
                currentUser = data.user;
                updateNavigation();
                navigateTo('/');
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login: ' + error.message);
        }
    }

    async function register(e) {
        e.preventDefault(); // Prevent form submission from refreshing the page
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });
            if (response.ok) {
                navigateTo('/login');
            } else {
                throw new Error('Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration: ' + error.message);
        }
    }

    async function logout() {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                currentUser = null;
                updateNavigation();
                navigateTo('/');
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during logout: ' + error.message);
        }
    }

    // Create a post (self-all)
    async function createPost(e) {
        e.preventDefault(); // Prevent form submission from refreshing the page
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            if (response.ok) {
                showPosts();
            } else {
                throw new Error('Failed to create post');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the post: ' + error.message);
        }
    }

    // Delete a post (admin/moderator/self)
    window.deletePost = async function (id) {
        try {
            const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showPosts();
            } else {
                throw new Error('Failed to delete post');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while deleting the post: ' + error.message);
        }
    }

    // Delete a user (admin or moderator action)
    window.deleteUser = async function (id) {
        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showUsers();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while deleting the user: ' + error.message);
        }
    }

    // Promote a user to moderator (admin action)
    window.promoteUser = async function (id) {
        try {
            const response = await fetch(`/api/users/${id}/promote`, { method: 'POST' });
            if (response.ok) {
                showUsers();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to promote user');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while promoting the user: ' + error.message);
        }
    }

    // Demote a user to a regular user (admin action)
    window.demoteUser = async function (id) {
        try {
            const response = await fetch(`/api/users/${id}/demote`, { method: 'POST' });
            if (response.ok) {
                showUsers();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to demote user');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while demoting the user: ' + error.message);
        }
    }

    // Fetch the current user and handle the initial location
    await getCurrentUser();
    updateNavigation();
    handleLocation();
});

