# โครงสร้างฐานข้อมูล (Entity-Relationship Diagram)

เอกสารนี้แสดงแผนผังโครงสร้างฐานข้อมูล (ER Diagram) ของระบบ Wae Jer Logistic ซึ่งถูกออกแบบมารองรับระบบสินค้าคงคลังหลายระดับ (Master/Van), การเก็บข้อมูลพนักงาน, ยานพาหนะ, ข้อมูลร้านค้า และการบันทึกการขาย

---

## 1. ER Diagram

```mermaid
erDiagram
    admins {
        int id PK
        varchar username
        varchar password "SHA-256 Hashed"
        varchar name
    }

    categories {
        int id PK
        varchar name
    }

    products {
        int id PK
        varchar code "MOC-XXX"
        varchar name
        int category_id FK
        decimal price
        varchar image_url
    }

    vehicles {
        varchar id PK
        varchar plate_number
        varchar code
        varchar status "ACTIVE / MAINTENANCE"
    }

    drivers {
        int id PK
        varchar name
        varchar phone
        varchar work_status "OFF_DUTY / ON_DUTY"
        varchar line_user_id "LINE LIFF ID"
        varchar vehicle_id FK
    }

    stores {
        int id PK
        varchar name
        decimal lat
        decimal lng
        varchar type
        varchar status "PENDING / SURVEYED"
        longtext photo_url
        datetime last_visited
    }

    inventory {
        int product_id PK, FK
        varchar location_id PK "e.g. 'MASTER', 'V-01'"
        varchar location_type "MASTER / VAN"
        int quantity
    }

    stock_transactions {
        int id PK
        int product_id FK
        varchar from_location
        varchar to_location
        int quantity
        varchar transaction_type "REFILL / SALE / RETURN"
        datetime created_at
    }

    sales {
        int id PK
        int store_id FK
        int driver_id FK
        decimal total_amount
        datetime created_at
    }

    sale_items {
        int id PK
        int sale_id FK
        int product_id FK
        int quantity
        decimal price
        decimal total
    }

    visits {
        int id PK
        int store_id FK
        int driver_id FK
        varchar status "PENDING / APPROVED / REJECTED"
        longtext photo_url
        text notes
        datetime visited_at
    }

    survey_targets {
        int id PK
        int store_id FK
        int driver_id FK
        date target_date
        varchar status
    }

    %% Relationships
    categories ||--o{ products : "has"
    vehicles ||--o{ drivers : "assigned to"
    products ||--o{ inventory : "stocked in"
    
    products ||--o{ stock_transactions : "logged in"
    products ||--o{ sale_items : "sold as"
    sales ||--o{ sale_items : "contains"
    
    stores ||--o{ sales : "purchases"
    drivers ||--o{ sales : "makes"
    
    stores ||--o{ visits : "receives"
    drivers ||--o{ visits : "conducts"
    
    stores ||--o{ survey_targets : "assigned for"
    drivers ||--o{ survey_targets : "assigned to"
```

---

## 2. คำอธิบายตารางหลัก

- **admins**: เก็บข้อมูลผู้ดูแลระบบและรหัสผ่านที่เข้ารหัสเพื่อความปลอดภัย
- **products & categories**: ข้อมูลสินค้าและหมวดหมู่ (อ้างอิงจากรหัส MOC)
- **inventory**: ตารางสำคัญที่สุดที่ทำหน้าที่แยกสต็อก โดยใช้ `location_id` เป็นตัวแยกว่าเป็น 'MASTER' หรือเป็น ID ของรถ ('V-01', 'V-02') `location_type` จะระบุว่าเป็น 'MASTER' หรือ 'VAN'
- **stores & visits**: `stores` เก็บข้อมูลพิกัดและรายละเอียดร้านค้า ส่วน `visits` จะเก็บข้อมูล Log ว่าใครเข้าไปเยี่ยมร้านนี้เมื่อไหร่ และอัปโหลดภาพอะไรบ้าง
- **sales & sale_items**: จัดเก็บข้อมูลบิลขายและรายละเอียดรายการสินค้าที่ขายออกไปในแต่ละบิล
- **drivers & vehicles**: จับคู่พนักงานขับรถกับยานพาหนะ โดยเชื่อม `line_user_id` เข้ากับระบบ LIFF
