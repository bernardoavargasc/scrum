# PLADIEX HUB API

API REST del sistema PLADIEX SCRUM, hecha con Node.js y Express sobre MariaDB,
siguiendo el patrón Modelo-Vista-Controlador (MVC).

## Estructura

```
src/
├── config/        Conexión a la base de datos (MariaDB con mysql2)
├── models/        Acceso a datos: una clase por entidad
├── controllers/   Lógica de cada endpoint
├── routes/        Rutas de la API
├── middlewares/   Manejo de errores
├── utils/         Utilidades (manejo de contraseñas)
└── app.js         Configuración de Express
server.js          Arranque del servidor
```

## Puesta en marcha

1. Importar la base en MariaDB:
   `mariadb -u root -p < pladiex_mariadb.sql`
2. Configurar credenciales en el archivo `.env` (DB_USER, DB_PASSWORD, etc.)
3. Instalar dependencias: `npm install`
4. Levantar el servidor: `npm start` (o `npm run dev` para recarga automática)

La API queda en http://localhost:3000/api (prueba: GET /api/health).

## Endpoints

- /api/proyectos      (GET, POST, PUT, DELETE)
- /api/tareas         (GET, POST, PUT, DELETE)
- /api/sprints        (GET, POST, PUT, DELETE)
- /api/hitos          (GET, POST, PUT, DELETE)
- /api/usuarios       (GET, POST, PUT, DELETE)
- /api/roles          (GET)
- /api/login, /api/recuperar, /api/cambiar-pass
- /api/mensajes       (GET, POST)
- /api/notificaciones (GET, POST, PUT)
- /api/reportes/sprint/:id  (PDF del sprint)
- /api/health
