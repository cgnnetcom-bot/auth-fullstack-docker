FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN apt-get update -y && apt-get install -y openssl
RUN npm install

# Copia o schema do Prisma para gerar o client
COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

# Compila o código TypeScript para JavaScript, criando o diretório 'dist'
RUN npm run build

EXPOSE 4000