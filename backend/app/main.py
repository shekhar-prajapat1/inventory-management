from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, crud
from app.database import engine, get_db

# Create the database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management System API",
    description="Backend API for managing products, customers, and orders.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Inventory & Order Management System API"}


# --- PRODUCTS ENDPOINTS ---

@app.post("/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)


@app.get("/products", response_model=List[schemas.ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db=db, skip=skip, limit=limit)


@app.get("/products/{id}", response_model=schemas.ProductResponse)
def read_product(id: int, db: Session = Depends(get_db)):
    db_product = crud.get_product(db=db, product_id=id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return db_product


@app.put("/products/{id}", response_model=schemas.ProductResponse)
def update_product(id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    return crud.update_product(db=db, product_id=id, product_update=product)


@app.delete("/products/{id}", response_model=schemas.ProductResponse)
def delete_product(id: int, db: Session = Depends(get_db)):
    return crud.delete_product(db=db, product_id=id)


# --- CUSTOMERS ENDPOINTS ---

@app.post("/customers", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return crud.create_customer(db=db, customer=customer)


@app.get("/customers", response_model=List[schemas.CustomerResponse])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_customers(db=db, skip=skip, limit=limit)


@app.get("/customers/{id}", response_model=schemas.CustomerResponse)
def read_customer(id: int, db: Session = Depends(get_db)):
    db_customer = crud.get_customer(db=db, customer_id=id)
    if not db_customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return db_customer


@app.delete("/customers/{id}", response_model=schemas.CustomerResponse)
def delete_customer(id: int, db: Session = Depends(get_db)):
    return crud.delete_customer(db=db, customer_id=id)


# --- ORDERS ENDPOINTS ---

@app.post("/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    return crud.create_order(db=db, order_in=order)


@app.get("/orders", response_model=List[schemas.OrderResponse])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_orders(db=db, skip=skip, limit=limit)


@app.get("/orders/{id}", response_model=schemas.OrderResponse)
def read_order(id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db=db, order_id=id)
    if not db_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return db_order


@app.delete("/orders/{id}", response_model=schemas.OrderResponse)
def delete_order(id: int, db: Session = Depends(get_db)):
    return crud.delete_order(db=db, order_id=id)


# --- DASHBOARD STATS ENDPOINT ---

@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db=db)
