# Inventory & Order Management System

A full-stack, containerized Inventory & Order Management System built with a React frontend, a FastAPI Python backend, and a PostgreSQL database.

## System Architecture

```
                 +-----------------------+
                 |    React Frontend     |
                 |      (Nginx / JS)     |
                 +-----------+-----------+
                             |
                      HTTP   |   REST / JSON
                             v
                 +-----------+-----------+
                 |    FastAPI Backend    |
                 |       (Python)        |
                 +-----------+-----------+
                             |
                  SQLAlchemy |   psycopg2
                             v
                 +-----------+-----------+
                 |  PostgreSQL Database  |
                 |      (Data Volume)    |
                 +-----------------------+
```

---

## Features

- **Product Catalog Management**: View, add, update, and delete products (SKU code, name, price, stock). SKU is guaranteed unique.
- **Customer Directory**: Add and delete customers (name, unique email, phone).
- **Order Management**: Create orders for customers with multiple products. Automatically calculates order totals, validates and reduces stock inventory, and offers order deletion (cancelling) with automatic stock replenishment.
- **Dynamic Dashboard**: Monitors total products, total customers, total orders, and provides a real-time low stock warning list.
- **Modern Premium Design**: Vanilla CSS with full dark theme, micro-animations, glassmorphism elements, and fully responsive layouts.

---

## Getting Started (Local Setup)

### Prerequisites
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Running with Docker Compose
To build and run all services (Database, Backend, Frontend) in containerized mode, execute:

```bash
docker compose up --build
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Configuration

Environment variables can be customized in the `.env` file at the project root:

- `POSTGRES_USER`: PostgreSQL database owner username.
- `POSTGRES_PASSWORD`: PostgreSQL database user password.
- `POSTGRES_DB`: PostgreSQL database name.
- `VITE_API_URL`: Backend API URL targeted by the frontend React application.
