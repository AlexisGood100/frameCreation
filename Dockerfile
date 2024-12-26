# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app/frameCreation

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code to the container
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Specify the command to run the application
CMD ["node", "index.js"]
