FROM node:18-alpine

WORKDIR /app

# Cai dat dependencies truoc de tan dung Docker cache layer
COPY package*.json ./
RUN npm install --omit=dev

# Copy toan bo source code vao container
COPY server.js ./
COPY README.md ./
COPY public/ ./public/
COPY docs/ ./docs/

# Tao thu muc logs va database neu ung dung can ghi du lieu
RUN mkdir -p /app/logs /app/database

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]
