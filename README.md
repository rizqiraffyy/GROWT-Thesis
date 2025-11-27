<h1 align="center">📊 GROWT — Growth Recording of Weight Tracking</h1>
<p align="center">
  <strong>Thesis Project | Yogyakarta, Indonesia</strong><br>
  <em>August 2025 – Present</em>
</p>

---

## 🔍 Overview  
**GROWT (Growth Recording of Weight Tracking)** is an ongoing thesis project developing a **modern web platform** for real-time livestock weight monitoring and growth analysis using **IoT-based smart weighing devices**. The platform integrates **Next.js**, **Supabase**, and **ESP32 IoT modules**, enabling farmers to automatically record and manage livestock data through a secure and interactive dashboard.

---

## ⚙️ Tech Stack  

| Layer | Technology | Description |
|:------|:------------|:-------------|
| **Frontend** | **Next.js 14**, **TypeScript**, **shadcn/ui** | Server-side rendered web app with modular UI components and responsive design. |
| **Backend** | **Next.js API Routes**, **Supabase Auth**, **Supabase Edge Functions**, **PostgreSQL REST API** | Handles authentication, API requests, and secure communication between IoT devices and the database. |
| **Database** | **Supabase (PostgreSQL)** | Relational database for storing users, farmers, livestock, and weight data with foreign key validation. |
| **IoT Devices** | **ESP32**, **Load Cell (HX711)**, **RFID RC522** | Captures livestock ID and weight, sending data via HTTP to the Supabase REST endpoint. |
| **Deployment** | **Vercel**, **Supabase Cloud** | Fully managed hosting for both frontend and backend services. |

---

## 🧠 System Architecture  
The GROWT system integrates **IoT hardware**, **cloud services**, and a **Next.js web dashboard** in three main layers:

1. **IoT Subsystem**  
   - ESP32 reads livestock weight through the **HX711 load cell** and scans the livestock’s RFID tag.  
   - Sends the data to the Supabase database using a secure **HTTP POST request**.  

2. **Backend & Cloud Layer**  
   - **Supabase** manages authentication, database operations, and API requests.  
   - **Supabase Auth** ensures each user only accesses their own livestock data.  
   - **Edge Functions** handle logic such as verification, data formatting, and processing before saving records.  

3. **Web Subsystem**  
   - Built with **Next.js** for SSR (Server-Side Rendering) and API routing.  
   - Displays livestock data, growth records, and history dynamically from the Supabase database.  
   - Styled using **shadcn/ui** for consistent, modern design components.

**System Architecture Diagram:**  
![System Architecture](./media/readme/system-architecture.jpg)

---

## 🗄️ Database Schema  

| Table | Description | Primary Key | Foreign Key(s) |
|:------|:-------------|:-------------|:---------------|
| **auth.users** | Stores user account credentials and metadata managed by Supabase Auth. | `id` | — |
| **peternak** | Contains farmer details linked to authenticated users. | `farmer_id` | `user_id → auth.users.id` |
| **ternak** | Holds livestock records including RFID, species, and ownership. | `livestock_id` | `farmer_id → peternak.farmer_id` |
| **berat** | Stores livestock weight measurements over time. | `id` | `livestock_id → ternak.livestock_id` |

**Database Schema:**  
![Database Schema](./media/readme/database-schema.jpg)

---

## 💡 Key Features (In Development)  
- Real-time livestock weight tracking through IoT devices  
- Secure authentication and access control via **Supabase Auth**  
- Automatic linking between farmer and livestock data  
- Responsive dashboard UI with **shadcn/ui**  
- Scalable backend built with **Next.js API routes** and **Edge Functions**  

---

## 🚧 Current Status  
The database and IoT connection have been established and tested.  
The Next.js dashboard and data visualization modules are under active development.  

---

## 📈 Future Plans  
- Implement interactive data visualization (library pending)  
- Add predictive livestock growth analytics  
- Enable live dashboard updates via WebSocket integration  
- Expand multi-user and multi-farm management features  

---

## 🧾 License  
This project is released under the **MIT License**.  
See the [LICENSE](./LICENSE) file for more details.

---

<p align="center">
  <strong>Developed by</strong><br>
  <b>Rizqi Raffy Imam Malik</b><br>
  <em>Thesis Project — Data Visualization for IoT-based Livestock Weighing Systems</em><br>
  📍 Yogyakarta, Indonesia  
  <br>📧 <a href="mailto:rizqiraffy@gmail.com">rizqiraffy@gmail.com</a>  
  <br>🔗 <a href="https://www.linkedin.com/in/rizqiraffy/">linkedin.com/in/rizqiraffy</a>
</p>