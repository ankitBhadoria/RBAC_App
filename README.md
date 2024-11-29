# RBAC_App
This project is a Role-Based Access Control (RBAC) system implemented using Node.js, Express, MongoDB, and vanilla JavaScript for the frontend.

## Features
- User authentication (register, login, logout) using JWT
- Role-based access control (Admin, Moderator, User)
- User management (for Admin and Moderator roles)
- Post creation and management

## brief
  auth : To achieve authentication, I used JWT (JSON Web Tokens) for secure token-based login, bcrypt for password hashing, and middleware to verify the token on protected routes. The token is stored in 
         localStorage on the client side and is sent in the x-auth-token header for each request.

  RBAC:
       admin can view all users on app (Admin, Moderator, User)  promote,demote and delete any user & moderator and can create post himself and delete any post on the app including their own,
       moderato can view all users on app (Admin, Moderator, User) can delete any user and his post and can create post himself and delete it,
       user can simply post and delete their post.
       I decide that admin-admin ,moderator-moderator,user-user cannot do anything to one another and the hierarcy of control is admin > moderator > user in terms of power and control for this app.

## Prerequisites
- Node.js (v14 or later)
- MongoDB
- Git Bash

## Installation
1. download the repository:
2. using mongosh connect to MongoDB database:  'mongodb://localhost:27017/rbac_system'
3. open gitbash in the directory where package.json is and do: npm install
4. start the server: node server.js
5. go to http://localhost:3000 to view and interact with the app.


