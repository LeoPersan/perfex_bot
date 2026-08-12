FROM node:20-alpine

WORKDIR /app

# Copia arquivos de pacotes para instalar dependências
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies para hot-reload e tsx)
RUN npm install

# O código-fonte será montado dinamicamente via volume no docker-compose.yml
CMD ["npm", "run", "dev"]
