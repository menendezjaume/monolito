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