# Readme

## Consideraciones

Para que postgres acepte conexiones remotas, hay que añadir los siguientes comandos a docker:

```
echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf && \
echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf && \
```

Esto modificará los ficheros de configuración de postgres para permitir contraseñas cifradas con md5 (por defecto en la dependencia pg de node) y aceptar conexiones remotas.

## Pasos para el despliegue de la arquitectura de dos capas

### Creamos una red

```
docker network create mi_red
```

### Ejecutamos el contenedor 'base de datos'

```
docker run -d --network mi_red --name mi_base_de_datos app_bbdd:1
```

### Ejecutamos el contenedor 'app'

```
docker run -d -P --network mi_red --env DB_HOST=mi_base_de_datos app_node:1
```

Pasos:

Crear el volume:
```
docker volume create datos_postgres
```

Build de imagen de bases de datos:
```
cd bbdd
docker build -t app_postgres .
```

Build de imagen de aplicación:

```
cd app
docker build -t app_node .
```

Run de imagen de bbdd 1:

```
docker run -d --network mi_red -v datos_postgres:/var/lib/postgresql/data --name "contenedor_postgres_1" app_postgres
```

Run de imagen de bbdd 2:

```
docker run -d --network mi_red2 -v datos_postgres:/var/lib/postgresql/data --name "contenedor_postgres_2" app_postgres
```

Run de la imagen de app 1:
```
docker run -d -P --network mi_red --env DB_HOST="contenedor_postgres_1" --name "contenedor_app_1" app_node
```

Run de la imagen de app 2:
```
docker run -d -P --network mi_red2 --env DB_HOST="contenedor_postgres_2" --name "contenedor_app_2" app_node
```
