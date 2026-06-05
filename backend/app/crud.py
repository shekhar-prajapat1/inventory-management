from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app import models, schemas

# --- PRODUCT CRUD ---

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = get_product_by_sku(db, product.sku)
    if db_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product SKU/code '{product.sku}' already exists."
        )
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    
    update_data = product_update.model_dump(exclude_unset=True)
    
    if "sku" in update_data and update_data["sku"] != db_product.sku:
        existing_sku = get_product_by_sku(db, update_data["sku"])
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product SKU/code '{update_data['sku']}' already exists."
            )
            
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    # Check if product is linked to any order items
    linked_items = db.query(models.OrderItem).filter(models.OrderItem.product_id == product_id).first()
    if linked_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product because it is associated with existing orders."
        )
    db.delete(db_product)
    db.commit()
    return db_product


# --- CUSTOMER CRUD ---

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = get_customer_by_email(db, customer.email)
    if db_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email '{customer.email}' already exists."
        )
    new_customer = models.Customer(**customer.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found."
        )
    db.delete(db_customer)
    db.commit()
    return db_customer


# --- ORDER CRUD ---

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def create_order(db: Session, order_in: schemas.OrderCreate):
    # Verify customer exists
    customer = get_customer(db, order_in.customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_in.customer_id} does not exist."
        )
    
    total_amount = 0.0
    items_to_create = []
    products_to_update = []

    # Verify inventory and calculate totals
    for item in order_in.items:
        product = get_product(db, item.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} does not exist."
            )
        
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). Requested: {item.quantity}, Available: {product.quantity}"
            )
        
        item_total = product.price * item.quantity
        total_amount += item_total
        
        # Deduct stock
        product.quantity -= item.quantity
        products_to_update.append(product)
        
        items_to_create.append(
            models.OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price_at_order=product.price
            )
        )

    # Save to database in a single transaction
    new_order = models.Order(
        customer_id=order_in.customer_id,
        total_amount=total_amount
    )
    db.add(new_order)
    db.flush()  # to get new_order.id

    for order_item in items_to_create:
        order_item.order_id = new_order.id
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return new_order

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )
    
    # Restore product inventory when cancelling/deleting order
    for item in db_order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity
            
    db.delete(db_order)
    db.commit()
    return db_order


# --- DASHBOARD STATS ---

def get_dashboard_stats(db: Session):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    
    # Let's define low stock threshold as less than 10 units
    low_stock_products = db.query(models.Product).filter(models.Product.quantity < 10).all()
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_products
    }
