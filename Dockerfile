FROM node:20.11-slim AS runner

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN touch .env
RUN npx tsc

WORKDIR /app/page
RUN npm install
RUN npx ng build

WORKDIR /app

EXPOSE 3000
CMD ["node", "dist/index.js"]