# Use an official Node.js runtime as a base image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application source code to the working directory
COPY . .

# Copy the environment file to the working directory
COPY .env ./

# Expose the port on which the application will run
EXPOSE 3000

# Define the command to run your application
CMD ["node", "api/index.js"]
