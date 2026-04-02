FROM node:20-alpine

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json* ./
RUN npm ci || npm i

COPY . .

EXPOSE 3000
CMD ["npm","run","dev","--","-p","3000","-H","0.0.0.0"]
