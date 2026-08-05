FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY src ./src/
COPY .env ./

# Ensure the uploads/resources directory exists
RUN mkdir -p /usr/src/app/resources

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0
ENV PORT=5005

# Expose port
EXPOSE 5005

# Start the application
CMD [ "npm", "start" ]
