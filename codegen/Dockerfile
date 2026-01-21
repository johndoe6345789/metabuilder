FROM node:lts-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=optional

COPY . .

RUN npm run build

FROM node:lts-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=optional --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 80

ENV PORT=80
ENV VITE_FLASK_API_URL=""

CMD ["npm", "run", "preview"]
