# Sử dụng Node.js 20 để build ứng dụng
FROM node:20 AS builder

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json để cài đặt dependencies trước
COPY package.json package-lock.json ./
RUN npm ci

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng
RUN npm run build

# Sử dụng Nginx để chạy ứng dụng
FROM nginx:alpine

# Copy file build từ container builder vào Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose cổng 80 để truy cập
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]
