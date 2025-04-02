FROM node:slim AS runner

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN touch .env
RUN npx tsc

EXPOSE 3000
CMD ["node", "dist/index.js"]