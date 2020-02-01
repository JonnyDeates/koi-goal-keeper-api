# Koi Goal Keeper Api

#### Created by Jonny Deates

# About
Server is used for all access points for the koigoalkeeper.com site. 

### [Live Page](https://koigoalkeeper.com/)

## Technoligies Used
Client side: React, Javascript, Zeit, HTML and CSS.

Server side: Express.js, Node.js, PostgreSQL and Heroku. 

[Client](https://github.com/JonnyDeates/koi-goal-keeper.git) |
[Server](https://github.com/JonnyDeates/koi-goal-keeper-api.git)

## URL/ Endpoints: 

## /auth/login/
POST: responds with JWT auth token using secrete when user enters valid user credentials.

PUT: Re-authenticates the user, refreshes token. 

        {
            username: String,
            password: String
        }

            res.body
        {
            authToken: String,
            username: user.username
            nickname: user.nickname
            email: user.email
            autoArchiving: user.autoArchiving
            notifications: user.notifications
        }

## /goals
GET: Gets All Goal Lists in the Database for the User

POST: Submits a Goal List as an object and stores it in the database 

### /goals/:id
GET: Gets a single Goal List in the database by id

DELETE: Allows user to delete a Goal List by id. 

PATCH :  Allows user to edit field in a Goal List by id. 

## /objectives
POST: Submits an Objective as an object ties it to a Goal List and stores it in the database 

### /objectives/:id
GET: Gets a single Objective in the database by id

DELETE: Allows user to delete a Objective by id. 

PATCH :  Allows user to edit field in a Objective by id. 

### /objectives/goal-list/:id
GET: Gets all Objectives in the database by Goal List id

### /objectives/toggle/:id
GET: Gets a single Objective in the database with a toggled Checked Value by id


## /past/goals
GET: Gets All Past Goal Lists in the Database for the User

POST: Submits a Past Goal List as an object and stores it in the database 

### /past/goals/:id
GET: Gets a single Past Goal List in the database by id

DELETE: Allows user to delete a Past Goal List by id. 

PATCH :  Allows user to edit field in a Past Goal List by id. 

## /past/objectives
POST: Submits an Objective as an object ties it to a Past Goal List and stores it in the database 

### /past/objectives/:id
GET: Gets a single Past Objective in the database by id

DELETE: Allows user to delete a Past Objective by id. 

PATCH :  Allows user to edit field in a Past Objective by id. 

### /past/objectives/goal-list/:id
GET: Gets all Past Objectives in the database by Past Goal List id

### /past/objectives/toggle/:id
GET: Gets a single Past Objective in the database with a toggled Checked Value by id

## /users
POST: Lets user register for an account and posts data into the database so user can login next time.
        {
        username: String,
        email: String,
        nickname: String,
        password: String
        }
### /users/:id
Get: Lets the access of a logged in user to see their data: email, nickname, auto archiver, notifications, username

Delete: Lets the user delete their account

Patch: Lets the user update their information everything but the password

### /users/auth/:id
Patch: Lets the user update their password, requiring the old password, and new one in the body. 
 
