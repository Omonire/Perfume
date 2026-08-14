import os
import base64
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'perfume_luxury_secret_key_2025'

# Database configuration: support Vercel serverless /tmp fallback and local sqlite file
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'perfume_store.db')

# On Vercel / read-only filesystem, fallback to /tmp or memory
if os.environ.get('VERCEL'):
    tmp_db = os.path.join('/tmp', 'perfume_store.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{tmp_db}'
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max

db = SQLAlchemy(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    tagline = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=10)
    fragrance_notes = db.Column(db.String(300), nullable=True) # e.g. "Bergamot, Sandalwood, Amber"
    bottle_color = db.Column(db.String(30), nullable=False, default='#8b5cf6') # Hex color for 3D render
    liquid_color = db.Column(db.String(30), nullable=False, default='#c084fc')
    accent_color = db.Column(db.String(30), nullable=False, default='#f59e0b')
    image_url = db.Column(db.Text, nullable=True) # URL or uploaded image relative path/base64 data

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'tagline': self.tagline or '',
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'fragrance_notes': self.fragrance_notes or '',
            'bottle_color': self.bottle_color,
            'liquid_color': self.liquid_color,
            'accent_color': self.accent_color,
            'image_url': self.image_url or ''
        }


def seed_database():
    if Product.query.count() == 0:
        sample_products = [
            Product(
                name="Élixir de Nuit",
                tagline="Hauntingly seductive & mysterious",
                description="A dark, voluptuous fragrance crafted for twilight moments. Opens with succulent dark plum and midnight jasmine, settling into a deep velvet base of black amber and rare vanilla orchid.",
                price=240.00,
                stock=15,
                fragrance_notes="Dark Plum, Midnight Jasmine, Black Amber, Vanilla Orchid",
                bottle_color="#3b0764", # Deep violet
                liquid_color="#9333ea", # Glowing purple
                accent_color="#fbbf24", # Gold cap
                image_url="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"
            ),
            Product(
                name="Aurum Botanica",
                tagline="Sun-drenched royalty in gold",
                description="Sun-drenched Calabrian bergamot and radiant saffron woven with rare Moroccan rose petals and rich royal oud wood. An opulent aura of warm light and gold.",
                price=310.00,
                stock=8,
                fragrance_notes="Calabrian Bergamot, Golden Saffron, Moroccan Rose, Royal Oud Wood",
                bottle_color="#78350f", # Amber wood
                liquid_color="#f59e0b", # Warm amber gold
                accent_color="#fef08a", # Bright gold
                image_url="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800"
            ),
            Product(
                name="L'Ombre Bleue",
                tagline="Crisp ocean mist & cool metallic iris",
                description="Crisp marine ocean mist cascading over crushed cedar leaves and cool, luminous blue iris. Clean, exhilarating, and intensely memorable.",
                price=195.00,
                stock=22,
                fragrance_notes="Ocean Mist, Cedar Leaves, Blue Iris, Ambergris, White Musk",
                bottle_color="#0f172a", # Deep navy
                liquid_color="#0284c7", # Ocean blue
                accent_color="#e2e8f0", # Silver cap
                image_url="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800"
            ),
            Product(
                name="Velours Supérieure",
                tagline="Decadent gourmand warmth",
                description="An intoxicating gourmand masterpiece blending roasted tonka bean, bittersweet dark cocoa, and creamy Mysore sandalwood finished with spicy cardamom.",
                price=280.00,
                stock=12,
                fragrance_notes="Roasted Tonka, Dark Cocoa, Mysore Sandalwood, Cardamom",
                bottle_color="#451a03", # Dark chocolate
                liquid_color="#d97706", # Warm caramel
                accent_color="#f59e0b", # Polished brass
                image_url="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800"
            )
        ]
        db.session.bulk_save_objects(sample_products)
        db.session.commit()


with app.app_context():
    db.create_all()
    seed_database()


# Routes
@app.route('/')
def home():
    featured_products = Product.query.limit(4).all()
    return render_template('index.html', products=featured_products)


@app.route('/products')
def products_list():
    all_products = Product.query.order_by(Product.id.desc()).all()
    return render_template('products.html', products=all_products)


@app.route('/product/<int:product_id>')
def product_detail(product_id):
    product = db.session.get(Product, product_id) or db.first_or_404(db.select(Product).filter_by(id=product_id))
    related_products = Product.query.filter(Product.id != product_id).limit(3).all()
    return render_template('product_detail.html', product=product, related_products=related_products)


@app.route('/cart')
def cart():
    cart_items = session.get('cart', {})
    cart_products = []
    total_price = 0.0
    for prod_id_str, qty in cart_items.items():
        prod = db.session.get(Product, int(prod_id_str))
        if prod:
            subtotal = prod.price * qty
            total_price += subtotal
            cart_products.append({
                'product': prod,
                'quantity': qty,
                'subtotal': subtotal
            })
    return render_template('cart.html', cart_products=cart_products, total_price=total_price)


@app.route('/cart/add', methods=['POST'])
def add_to_cart():
    product_id = request.form.get('product_id')
    quantity = int(request.form.get('quantity', 1))
    if 'cart' not in session:
        session['cart'] = {}

    cart = session['cart']
    cart[str(product_id)] = cart.get(str(product_id), 0) + quantity
    session['cart'] = cart
    flash('Item successfully added to your luxury shopping bag.', 'success')
    return redirect(request.referrer or url_for('products_list'))


@app.route('/cart/clear', methods=['POST'])
def clear_cart():
    session.pop('cart', None)
    flash('Cart cleared.', 'info')
    return redirect(url_for('cart'))


# Admin Routes
@app.route('/admin')
def admin_dashboard():
    products = Product.query.order_by(Product.id.desc()).all()
    return render_template('admin/dashboard.html', products=products)


@app.route('/admin/products/new', methods=['GET', 'POST'])
def admin_create_product():
    if request.method == 'POST':
        name = request.form.get('name')
        tagline = request.form.get('tagline')
        description = request.form.get('description')
        price = float(request.form.get('price', 0.0))
        stock = int(request.form.get('stock', 0))
        fragrance_notes = request.form.get('fragrance_notes')
        bottle_color = request.form.get('bottle_color', '#8b5cf6')
        liquid_color = request.form.get('liquid_color', '#c084fc')
        accent_color = request.form.get('accent_color', '#f59e0b')
        image_url = request.form.get('image_url')

        # Handle file upload if present
        if 'image_file' in request.files:
            file = request.files['image_file']
            if file and file.filename != '':
                filename = secure_filename(file.filename)
                save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                try:
                    file.save(save_path)
                    image_url = url_for('static', filename=f'uploads/{filename}')
                except Exception:
                    # Serverless fallback: read file as Base64 data URL
                    file.seek(0)
                    file_bytes = file.read()
                    encoded = base64.b64encode(file_bytes).decode('utf-8')
                    mime = file.content_type or 'image/png'
                    image_url = f"data:{mime};base64,{encoded}"

        if not image_url:
            image_url = "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"

        new_prod = Product(
            name=name,
            tagline=tagline,
            description=description,
            price=price,
            stock=stock,
            fragrance_notes=fragrance_notes,
            bottle_color=bottle_color,
            liquid_color=liquid_color,
            accent_color=accent_color,
            image_url=image_url
        )
        db.session.add(new_prod)
        db.session.commit()
        flash(f'Perfume "{name}" added successfully.', 'success')
        return redirect(url_for('admin_dashboard'))

    return render_template('admin/product_form.html', product=None, action_url=url_for('admin_create_product'))


@app.route('/admin/products/<int:product_id>/edit', methods=['GET', 'POST'])
def admin_edit_product(product_id):
    product = db.session.get(Product, product_id) or db.first_or_404(db.select(Product).filter_by(id=product_id))
    if request.method == 'POST':
        product.name = request.form.get('name')
        product.tagline = request.form.get('tagline')
        product.description = request.form.get('description')
        product.price = float(request.form.get('price', 0.0))
        product.stock = int(request.form.get('stock', 0))
        product.fragrance_notes = request.form.get('fragrance_notes')
        product.bottle_color = request.form.get('bottle_color', '#8b5cf6')
        product.liquid_color = request.form.get('liquid_color', '#c084fc')
        product.accent_color = request.form.get('accent_color', '#f59e0b')

        if request.form.get('image_url'):
            product.image_url = request.form.get('image_url')

        if 'image_file' in request.files:
            file = request.files['image_file']
            if file and file.filename != '':
                filename = secure_filename(file.filename)
                save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                try:
                    file.save(save_path)
                    product.image_url = url_for('static', filename=f'uploads/{filename}')
                except Exception:
                    file.seek(0)
                    file_bytes = file.read()
                    encoded = base64.b64encode(file_bytes).decode('utf-8')
                    mime = file.content_type or 'image/png'
                    product.image_url = f"data:{mime};base64,{encoded}"

        db.session.commit()
        flash(f'Perfume "{product.name}" updated successfully.', 'success')
        return redirect(url_for('admin_dashboard'))

    return render_template('admin/product_form.html', product=product, action_url=url_for('admin_edit_product', product_id=product.id))


@app.route('/admin/products/<int:product_id>/delete', methods=['POST'])
def admin_delete_product(product_id):
    product = db.session.get(Product, product_id) or db.first_or_404(db.select(Product).filter_by(id=product_id))
    name = product.name
    db.session.delete(product)
    db.session.commit()
    flash(f'Perfume "{name}" was deleted.', 'danger')
    return redirect(url_for('admin_dashboard'))


# API endpoint for 3D Viewer product color data
@app.route('/api/products/<int:product_id>')
def api_product_data(product_id):
    product = db.session.get(Product, product_id) or db.first_or_404(db.select(Product).filter_by(id=product_id))
    return jsonify(product.to_dict())


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
