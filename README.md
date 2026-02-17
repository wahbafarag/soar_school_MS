### Setup Instructions

School Management System Implemented for Soar, Followed the existing project template structure

### API Features

- School , Classroom, and Student management(CrUD operations)
- Input validation , error handling/codes , HTTP status codes
- JWT-based authentication and role-based access control (RBAC)
- DB schema design for MongoDB
- Swagger API documentation
- Unit Testing
- Rate limiting

### Testing the service :

- If the DB is empty , you will be able to create a super admin for the first time via "/user/createSuperAdmin" without any tokens , after that tokens required , to get that login with the super admin credentials and use the returned token for other requests
- head to /api-docs for the swagger documentation and testing the endpoints

### Schema Design assumptions:

- Classroom will have a reference to the school it belongs to, not the opposite "MongoDB array size issue"
- Student will have a reference to the classroom they belong to, not the opposite "MongoDB array size issue"
- Super admin can manage all schools and their resources, while school administrators can only manage their assigned school's resources

#### Prerequisites

- Node.js
- npm
- MongoDB or Redis

#### Installation Steps

1. Clone the repository:
   ```bash
   git clone
   ```
2. Navigate to the project directory:
   ```bash
    cd project-directory
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure environment variables:
   - Create a `.env` file in the root directory based on `example.env`
   - Set the required environment variables
   - Ensure MongoDB or Redis is running and accessible
