FROM node:18.04-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs with environment variable
EXPOSE 3000

# Run the app with npm start command
CMD [ "npm", "start" ]