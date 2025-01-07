
# ELEGANT CASE STUDY
The backend is built with NestJS using Express as the HTTP framework, PostgreSQL as the database, and Redis for caching. The project uses TypeORM for database mappings, and Swagger is included for providing APIs to the frontend.

## Tables

- **hotels**: Managa hotel information such as title and country..
- **rooms**: Manage room' information such as hotel_id,price and room type.
- **Users,user_verifications**: Manage user accounts with permissions.
  
## Tech Stack

- **Backend**: NestJS, Express
- **Database**: PostgreSQL
- **Caching**: Redis
- **ORM**: TypeORM
- **API Documentation**: Swagger
- **Authentication**: Session authorization logic
- **Code Formatting**: Prettier, ESLint
- **Commit Formatting**: Commitizen with husky

## Setup Instructions

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone git@github.com:cibilex/elegant-backend-task.git
cd elegant-backend-task
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Docker containers

- you can set up PostgreSQL and Redis containers using the docker-compose.yml file in the project directory:

```bash
docker compose up -d
```

### 3.Set up your environment variables and running the project:

1. Create a .env.dev file for development configuration : `npm run start:dev`
2. Create a .env.prod file for production configuration: `npm run start:prod`
   he project uses the `@nestjs/config ` library, which automatically loads environment variables based on the NODE_ENV variable.

# Notes

1. The application automatically creates an Admin user on startup if one does not exist. The Admin credentials are read from the environment files.


### Frontend Link
[link](http://elegant-task.surge.sh): http://elegant-task.surge.sh         
frontend github [link](https://github.com/cibilex/elegant-frontend-task) : https://github.com/cibilex/elegant-frontend-task
