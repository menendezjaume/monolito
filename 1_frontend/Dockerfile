# usar la imagen oficial de node como base
FROM node:22-alpine
# establecer el directorio de trabajo en /app
WORKDIR /app
# copiar los archivos del proyecto al contenedor
COPY . .
# instalar las dependencias del proyecto
RUN npm install
# exponer el puerto 4200 para la aplicación frontend
EXPOSE 4201
# buildear la aplicación para producción
RUN npm run build --prod
# instalar un servidor web ligero para servir la aplicación
RUN npm install -g http-server
# comando para ejecutar la aplicación
CMD http-server dist/frontend/browser -p 4201 -P http://localhost:4201