# workshop-commerce-with-Nodejs

This project is to develop a backend system of an application commerce that uses Node.js with mongoDB is database
## Recommended IDE Setup
[VSCode](https://code.visualstudio.com/) + [JavaScripts](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.JavaScriptSnippetPack) 

## Project Setups Guide
This guide will walk you through the steps to set up your Node.js environment and install dependencies

### Step 1: Setup path using mongoDB
```bash
Open environment variables for your account -> User variables -> Add new path C:\Users\<your_username>\mongoDB
```

### Step 2: Create project with express-generator
```bash
npx express-generator
```

### Step 3: Install node modules
```bash
npm i
```

### Step 4: Test run the project
```bash
npm start
```

### Step 5: Install basic library
#### The cors library is used to set access permissions from various services
```bash
npm i cors
```

#### The nodemon library is used to execute code at runtime when edited or saved
```bash
npm i nodemon
```

#### mongoose library for mongoDB ODM
```bash
npm i mongoose
```

#### Manage password storage
```bash
npm i bcrypt
```

#### Generate and validate JSON Web Tokens (JWTs), Used in systems that require authentication and authorization
```bash
npm i jsonwebtoken
```

