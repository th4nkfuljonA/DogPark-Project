# 🚗 CertifiedCityWhips — Complete Server & Database Guide

Welcome! This guide will walk you through **everything** about how this website is set up,
how to run it, and how to connect it to your Red Hat database server.

---

## 📁 Project Structure

Here's how the project is organized. Each folder has a specific purpose:

```
DogPark-Project-main/
│
├── 📄 README.md              ← You are here! This guide.
│
├── 📂 pages/                 ← All the website HTML pages
│   ├── index.html            (Homepage)
│   ├── shop.html             (Product shop)
│   ├── services.html         (Services page)
│   ├── car-detail.html       (Vehicle detail view)
│   ├── checkout.html         (Shopping cart checkout)
│   ├── login.html            (User login)
│   ├── dashboard.html        (User dashboard)
│   ├── search-results.html   (Search results)
│   ├── about.html            (About us)
│   ├── careers.html          (Careers page)
│   ├── faq.html              (FAQ)
│   ├── privacy.html          (Privacy policy)
│   ├── terms.html            (Terms of service)
│   ├── exotics.html          (Exotic vehicles)
│   ├── sedans.html           (Sedans fleet)
│   └── suvs.html             (SUVs fleet)
│
├── 📂 css/                   ← Stylesheets (how the site looks)
│   ├── ccw-new.css           (Main stylesheet)
│   └── fleet-page.css        (Fleet page specific styles)
│
├── 📂 js/                    ← JavaScript (how the site works)
│   ├── app.js                (Main application logic)
│   ├── auth.js               (Login/authentication)
│   ├── cart.js               (Shopping cart)
│   ├── ccw-new.js            (UI interactions)
│   ├── fleet-page.js         (Fleet page logic)
│   ├── cars-db.js            (Fetches vehicle data from API)
│   └── products-db.js        (Fetches product data from API)
│
├── 📂 images/                ← Image files
│   └── hero-car.png          (Homepage hero image)
│
├── 📂 server/                ← Node.js API backend (runs on THIS machine)
│   ├── server.js             (Express web server — serves the site + API)
│   ├── db.js                 (Database connection setup)
│   ├── .env                  (⚠️ YOUR CONFIG — edit this file!)
│   ├── .env.example          (Template for .env)
│   ├── package.json          (Node.js dependencies)
│   └── node_modules/         (Installed packages — don't touch)
│
├── 📂 database/              ← SQL files (for the Red Hat server)
│   └── schema.sql            (Creates all tables + inserts all data)
│
└── 📂 docs/                  ← Documentation screenshots
```

---

## 🖥️ How It Works

This website uses **two servers** working together:

```
 YOU (browser)
     │
     │  Visits http://your-server-ip:8080
     ▼
 ┌────────────────────────────────┐
 │   WINDOWS SERVER (this PC)     │
 │                                │
 │   Node.js Express on port 8080 │
 │   • Serves all HTML/CSS/JS    │
 │   • Handles /api/* requests   │
 │                                │
 └──────────┬─────────────────────┘
            │
            │  Connects over network (port 3306)
            ▼
 ┌────────────────────────────────┐
 │   RED HAT SERVER               │
 │                                │
 │   MariaDB Database             │
 │   • Stores all products       │
 │   • Stores all vehicles       │
 │   • Stores locations, etc.    │
 │                                │
 └────────────────────────────────┘
```

**Why two servers?**
- The **Windows server** hosts the website that people visit
- The **Red Hat server** stores all the data (products, vehicles, etc.)
- This way, multiple websites or apps can share the same database
- You can update data in one place and it shows up everywhere

---

## 🚀 How to Start the Website

### Option 1: Quick Start (temporary — stops when you close the terminal)

Open **PowerShell** on this Windows server and run:

```powershell
cd C:\Users\Administrator\Desktop\DogPark-Project-main\server
node server.js
```

You should see:
```
╔══════════════════════════════════════════════╗
║  CertifiedCityWhips API Server               ║
║  Running on http://localhost:8080             ║
╚══════════════════════════════════════════════╝
```

Now open a browser and go to **http://localhost:8080**

### Option 2: Run Permanently (keeps running even after you close the terminal)

```powershell
npm install -g pm2
cd C:\Users\Administrator\Desktop\DogPark-Project-main\server
pm2 start server.js --name ccw
pm2 save
```

**Useful pm2 commands:**
| Command | What It Does |
|---|---|
| `pm2 status` | Check if server is running |
| `pm2 logs ccw` | View server logs |
| `pm2 restart ccw` | Restart the server |
| `pm2 stop ccw` | Stop the server |
| `pm2 start ccw` | Start it again |

---

## 🗄️ Setting Up the Red Hat Database Server

This is the server that stores all the product and vehicle data.
You only need to do this **once**.

### Step 1: Install MariaDB

SSH into your Red Hat server and run:

```bash
sudo dnf install mariadb-server -y
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### Step 2: Secure the Installation

```bash
sudo mysql_secure_installation
```

It will ask you questions — answer them like this:
- Set root password? → **Yes** (choose a strong password)
- Remove anonymous users? → **Yes**
- Disallow root login remotely? → **Yes**
- Remove test database? → **Yes**
- Reload privilege tables? → **Yes**

### Step 3: Import the Database

First, copy `database/schema.sql` from this Windows machine to your Red Hat server.
You can use SCP, USB drive, or paste the contents manually.

Then run:

```bash
mysql -u root -p < schema.sql
```

This creates:
- `certifiedcitywhips` database
- `products` table (15 products: tires, detailing, accessories)
- `vehicles` table (15 vehicles: rentals + for sale)
- `locations` table (3 locations)
- `vehicle_classes` table (8 vehicle types)
- `product_categories` table (3 categories)
- `services` table (6 services)
- `ccw_app` user (the account the website uses to connect)

### Step 4: Set the App User Password

```bash
mysql -u root -p -e "ALTER USER 'ccw_app'@'%' IDENTIFIED BY 'PICK_A_STRONG_PASSWORD'; FLUSH PRIVILEGES;"
```

⚠️ **Remember this password!** You'll need it for the next section.

### Step 5: Allow Remote Connections

Edit the MariaDB config:

```bash
sudo vi /etc/my.cnf.d/mariadb-server.cnf
```

Find the `[mysqld]` section and add this line:

```
bind-address = 0.0.0.0
```

Open the firewall and restart:

```bash
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
sudo systemctl restart mariadb
```

### Step 6: Test the Connection

From the Red Hat server itself, verify it works:

```bash
mysql -u ccw_app -p certifiedcitywhips -e "SELECT COUNT(*) FROM products;"
```

It should return `15`.

---

## ⚙️ Configuring the Windows Server

Now tell the Windows server how to find the Red Hat database.

### Edit the `.env` File

Open `server/.env` in a text editor and fill in your details:

```
# ── Database Connection ──────────────────────────
# Replace with your Red Hat server's IP address
DB_HOST=192.168.1.100
DB_PORT=3306
DB_USER=ccw_app
DB_PASSWORD=the_password_you_picked_above
DB_NAME=certifiedcitywhips

# ── API Server ───────────────────────────────────
API_PORT=8080
```

**How to find your Red Hat server's IP:**
Run this on the Red Hat server:
```bash
hostname -I
```

After editing `.env`, restart the server:
```powershell
pm2 restart ccw
```

---

## 🌐 Accessing the Website

| Who | URL |
|---|---|
| From this Windows server | http://localhost:8080 |
| From other computers on your network | http://YOUR-WINDOWS-SERVER-IP:8080 |
| From the internet | Requires port forwarding on your router |

**How to find this server's IP:**
```powershell
ipconfig
```
Look for the `IPv4 Address` under your network adapter.

---

## 🔌 API Endpoints Reference

The website fetches data from these API endpoints. You can also test them directly in a browser.

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | All active products |
| GET | `/api/products/3` | Single product by ID |
| GET | `/api/products/category/1` | Products in category (1=Tires, 2=Detailing, 3=Accessories) |
| GET | `/api/products/search?q=tire` | Search products |

### Vehicles
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles` | All vehicles |
| GET | `/api/vehicles/5` | Single vehicle by ID |
| GET | `/api/vehicles/rentals` | Rental vehicles only |
| GET | `/api/vehicles/sales` | Vehicles for sale only |
| GET | `/api/vehicles/search?q=toyota` | Search vehicles |
| GET | `/api/vehicles/filter/suv` | Filter by category |
| GET | `/api/vehicles/location/1` | Vehicles at a location |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/locations` | All pickup locations |
| GET | `/api/vehicle-classes` | Vehicle class types |
| GET | `/api/services` | All services |
| GET | `/api/product-categories` | Product categories |
| GET | `/api/health` | Server health check |

---

## 🔧 Troubleshooting

### "Products/vehicles not showing up on the website"
→ The Red Hat database isn't connected yet. Follow the "Setting Up the Red Hat Database Server" section above, then edit your `server/.env` file.

### "node is not recognized"
→ Node.js isn't installed. Run:
```powershell
winget install OpenJS.NodeJS.LTS
```
Then close and reopen PowerShell.

### "EACCES: permission denied, port 80"
→ Port 80 requires admin privileges. Use port 8080 instead (already configured).

### "connect ETIMEDOUT" in server logs
→ The server can't reach the Red Hat database. Check:
1. Is MariaDB running? (`sudo systemctl status mariadb`)
2. Is the IP address correct in `.env`?
3. Is the firewall open? (`sudo firewall-cmd --list-ports`)
4. Can you ping the Red Hat server from Windows? (`ping YOUR-REDHAT-IP`)

### "Access denied for user 'ccw_app'"
→ Wrong password in `.env`, or the user wasn't created. Re-run:
```bash
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'ccw_app'@'%' IDENTIFIED BY 'your_password'; GRANT ALL ON certifiedcitywhips.* TO 'ccw_app'@'%'; FLUSH PRIVILEGES;"
```
