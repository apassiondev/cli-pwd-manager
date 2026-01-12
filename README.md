# READ ME

## 1. Setup MongoDB Database

### Attention

- You need to have access to MongoDB server as a `root` user.
- You need to perform correct commands in Mongo Shell for specific users in the right context - **which commands should be executed by who (admin or a specific user)**

### How to create a new user and assign it expected roles

**Context:**

- Performed by the admin (default to `root`) user.

**Procedures:**

1. Login as MongoDB server's `admin or root` user.
2. Create a new database.
3. Create a new database user with expected roles.
4. Verify if the new user is successfully created.
5. Create your fist db collection, and why should we do that?

```Shell

# 1. Login as MongoDB server's `admin or root` user
# Use Mongo Shell from Docker Desktop
# mongosh <authentication_database> -u <admin_username> -p <admin_password>
# or
# docker exec -it <docker_container_name> mongosh <authentication_database> -u <admin_username> -p <admin_password>
mongosh admin -u "root" -p "root_password"

# 2. Create a new database
# First, create a nwe database
# use <database_name>
use passwordsdb

# You will see the message saying that
# > switched to `passwordsdb`

# 3. Create a new database user with expected roles
db.createUser({
    user: "db_username",
    pwd: "db_password",
    roles: [
        {
            role: "readWrite",
            db: "passwordsdb"
        },
        {
            role: "dbAdmin",
            db: "passwordsdb"
        }
    ]
})

# 4. Verify if the new user is successfully created
# Back to the database "admin"
use admin
# Check if the new user exists and gets roles assigned
db.system.users.find({ user: "your_db_username" })
```
