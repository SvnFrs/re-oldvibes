

## UC_66: Show Report

```plantuml
@startuml Show Report
title Sequence Diagram: Show Report

actor Admin
boundary "Client" as Client
boundary "Report Route" as Route
control "Report Controller" as Controller
participant ":Report Service" as Service
entity "Report Model" as Model
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Navigate to Reports page
activate Client
Client -> Route : 2. GET /api/report\n(credentials: include)
activate Route
Route -> Controller : 3. getReports(req, res)
activate Controller
Controller -> Controller : 4. Extract query params\n(userId, vibeId, reportType, limit, offset)
Controller -> Controller : 5. Build filters object
Controller -> Service : 6. getReports(filters)
activate Service
Service -> Model : 7. getReports(filters)
activate Model
Model -> Model : 8. Build MongoDB query
Model -> Database : 9. Find Report documents\n(query, populate userId, vibeId, sort, skip, limit)
activate Database
Database -> Model : 10. Return reports array
deactivate Database
Model -> Model : 11. Format report responses
Model -> Service : 12. Return formatted reports array
deactivate Model
Service -> Controller : 13. Return formatted reports array
deactivate Service
Controller -> Controller : 14. Build response object
Controller -> Route : 15. res.json({ reports, count })
deactivate Controller
Route -> Client : 16. Return reports + count (200 OK)
deactivate Route
Client -> Client : 17. Set reports state
Client -> Admin : 18. Display reports list
deactivate Client
deactivate Admin
@enduml
```

## UC_67: Show Report Detail

```plantuml
@startuml Show Report Detail
title Sequence Diagram: Show Report Detail

actor Admin
boundary "Client" as Client
boundary "Report Route" as Route
control "Report Controller" as Controller
participant ":Report Service" as Service
entity "Report Model" as Model
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Click report item
activate Client
Client -> Route : 2. GET /api/report/:id\n(credentials: include)
activate Route
Route -> Controller : 3. getReportById(req, res)
activate Controller
Controller -> Controller : 4. Extract reportId from params
Controller -> Controller : 5. Validate reportId
Controller -> Service : 6. getReportById(reportId)
activate Service
Service -> Model : 7. getReportById(reportId)
activate Model
Model -> Database : 8. Find Report by ID\n(populate userId, vibeId)
activate Database
Database -> Model : 9. Return report document
deactivate Database

alt Report found
    Model -> Model : 9.1. Format report response
    Model -> Service : 9.1.1. Return formatted report
    Service -> Controller : 9.1.2. Return formatted report
    Controller -> Controller : 9.1.3. Build response object
    Controller -> Route : 9.1.4. res.json({ report })
    Route -> Client : 9.1.5. Return report details (200 OK)
    Client -> Client : 9.1.6. Set selected report state
    Client -> Admin : 9.1.7. Show report detail modal
else Report not found
    Model -> Service : 9.2. Return null
    deactivate Model
    Service -> Controller : 9.2.1. Return null
    deactivate Service
    Controller -> Route : 9.2.2. res.status(404).json({ message })
    deactivate Controller
    Route -> Client : 9.2.3. Return error (404)
    deactivate Route
    Client -> Admin : 9.2.4. Show error message
end

deactivate Client
deactivate Admin
@enduml

```

## UC_68: Create Banner

```plantuml
@startuml Create Banner
title Sequence Diagram: Create Banner

actor Admin
boundary "Client" as Client
boundary "Banner Route" as Route
control "Upload Middleware" as UploadMiddleware
control "Banner Controller" as Controller
participant ":Banner Service" as Service
entity "Banner Model" as Model
participant "AWS S3" as S3
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Fill banner form\n(upload image, title, description, isActive)
activate Client
Client -> Client : 2. Validate form
Client -> Route : 3. POST /api/banner\n(FormData: image, title, description, isActive)
activate Route

Route -> UploadMiddleware : 4. uploadBannerImage.single("image")
activate UploadMiddleware
alt File valid
    UploadMiddleware -> S3 : 4.1. Upload file to S3 (bucket: banners/)
    activate S3
    S3 -> UploadMiddleware : 4.1.1. Return S3 URL (file.location)
    deactivate S3
    UploadMiddleware -> Route : 4.1.2. File uploaded, req.file set
else File invalid
    UploadMiddleware -> Route : 4.2. Return error (file validation failed)
    Route -> Client : 4.2.1. Return error (400)
    Client -> Admin : 4.2.2. Show file error message
end
deactivate UploadMiddleware

Route -> Controller : 5. createBanner(req, res)
activate Controller
Controller -> Controller : 6. Extract & validate form data (file, title, description, isActive)
alt Validation passed
    Controller -> Service : 6.1. createBanner(bannerData)
    activate Service
    Service -> Service : 6.1.1. Check isActive & calculate displayOrder
    alt Banner is active
        Service -> Model : 6.1.1.1. Count active banners
        activate Model
        Model -> Database : 6.1.1.1.1. Count active banners ({ isActive: true })
        activate Database
        Database -> Model : 6.1.1.1.2. Return active banner count
        deactivate Database
        Model -> Service : 6.1.1.1.3. Return active banner count
        deactivate Model
        Service -> Service : 6.1.1.1.4. Calculate displayOrder = count + 1
    else Banner is inactive
        Service -> Service : 6.1.1.2. Set displayOrder = 0
    end
    Service -> Model : 6.1.2. createBanner(bannerData, displayOrder)
    activate Model
    Model -> Database : 6.1.3. Create Banner document (bannerData, displayOrder)
    activate Database
    Database -> Model : 6.1.4. Return created banner document
    deactivate Database
    Model -> Service : 6.1.5. Return banner document
    deactivate Model
    Service -> Controller : 6.1.6. Return banner document
    deactivate Service
    Controller -> Route : 6.1.7. res.status(201).json({ message, banner })
    Route -> Client : 6.1.8. Return banner data (201 Created)
    Client -> Client : 6.1.9. Set banners state
    Client -> Admin : 6.1.10. Show success message + refresh list
else Validation failed
    Controller -> Route : 6.2. res.status(400).json({ message })
    deactivate Controller
    Route -> Client : 6.2.1. Return error (400)
    deactivate Route
    Client -> Admin : 6.2.2. Show validation error
end

deactivate Client
deactivate Admin
@enduml
```

## UC_69: Show Banner for Admin

```plantuml
@startuml Show Banner for Admin
title Sequence Diagram: Show Banner for Admin

actor Admin
boundary "Client" as Client
boundary "Banner Route" as Route
control "Banner Controller" as Controller
participant ":Banner Service" as Service
entity "Banner Model" as Model
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Navigate to Banner Management
activate Client
Client -> Route : 2. GET /api/banner\n(credentials: include)
activate Route
Route -> Controller : 3. getBanners(req, res)
activate Controller
Controller -> Controller : 4. Extract query params (isActive, search, limit, offset)
Controller -> Controller : 5. Build filters object
Controller -> Service : 6. getAllBanners(filters)
activate Service
Service -> Model : 7. getAllBanners(filters)
activate Model
Model -> Model : 8. Build MongoDB query (no date filtering for admin)
Model -> Database : 9. Find Banner documents\n(query, sort by createdAt desc, skip, limit)
activate Database
Database -> Model : 10. Return banners array
deactivate Database
Model -> Service : 11. Format banner responses
deactivate Model
Service -> Controller : 12. Return formatted banners array
deactivate Service
Controller -> Controller : 13. Build response object
Controller -> Route : 14. res.json({ banners, count })
deactivate Controller
Route -> Client : 15. Return banners + count (200 OK)
deactivate Route
Client -> Client : 16. Set banners state
Client -> Admin : 17. Display banners list (active + inactive)
deactivate Client
deactivate Admin
@enduml
```

## UC_70: Update Banner

```plantuml
@startuml Update Banner
title Sequence Diagram: Update Banner

actor Admin
boundary "Client" as Client
boundary "Banner Route" as Route
control "Upload Middleware" as UploadMiddleware
control "Banner Controller" as Controller
participant ":Banner Service" as Service
entity "Banner Model" as Model
participant "AWS S3" as S3
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Click edit banner
activate Client
Client -> Client : 2. Load current banner data
Admin -> Client : 3. Modify banner data\n(image?, title, description, isActive)
Client -> Client : 4. Validate form input
Client -> Route : 5. PUT /api/banner/:id\n(FormData: image?, title, description, isActive)
activate Route

Route -> UploadMiddleware : 6. uploadBannerImage.single("image")
activate UploadMiddleware
alt Image file provided
    UploadMiddleware -> UploadMiddleware : 6.1. Validate file type & size
    alt Valid file
        UploadMiddleware -> S3 : 6.1.1. Upload to S3 (bucket: banners/)
        activate S3
        S3 -> UploadMiddleware : 6.1.1.2. Return S3 URL
        deactivate S3
        UploadMiddleware -> Route : 6.1.1.3. File uploaded\n(req.file = S3 URL)
    else Invalid file
        UploadMiddleware -> Route : 6.1.2. Return 400 (file error)
        Route -> Client : 6.1.2.1. Show file error message
    end
else No image file
    UploadMiddleware -> Route : 6.2. No upload (req.file = undefined)
end
deactivate UploadMiddleware

Route -> Controller : 7. updateBanner(req, res)
activate Controller
Controller -> Controller : 8. Extract params & form data\n(bannerId, title, description, isActive, dates)
Controller -> Controller : 9. Validate bannerId & fields
alt Validation passed
    Controller -> Service : 9.1. updateBanner(bannerId, updateData)
    activate Service
    Service -> Model : 9.1.1. Find banner by ID
    activate Model
    Model -> Database : 9.1.2. Find banner by ID
    activate Database
    Database -> Model : 9.1.1.3. Return current banner
    deactivate Database
    Model -> Service : 9.1.1.4. Return current banner
    deactivate Model
    alt Banner found
        Service -> Service : 9.1.1.4.1. Handle isActive / displayOrder update logic
        Service -> Model : 9.1.1.4.1.1 Update banner (findByIdAndUpdate)
        activate Model
        Model -> Database : 9.1.1.4.1.2. Update banner (findByIdAndUpdate)
        activate Database
        Database -> Model : 9.1.1.4.1.4. Return updated banner
        deactivate Database
        Model -> Service : 9.1.1.4.1.5. Return updated banner
        deactivate Model
        Service -> Service : 9.1.1.4.1.6. Format response
        Service -> Controller : 9.1.1.4.1.7. Return formatted banner
        Controller -> Route : 9.1.1.4.1.8. res.json({ message, banner })
        Route -> Client : 9.1.1.4.1.9. Return 200 OK + updated banner
        Client -> Client : 9.1.1.4.1.10. Update local state
        Client -> Admin : 9.1.1.4.1.11. Show success message + refresh list
    else Banner not found
        Service -> Controller : 9.1.1.4.2. Return null
        deactivate Service
        Controller -> Route : 9.1.1.4.2.1. res.status(404).json({ message })
        Route -> Client : 9.1.1.4.2.2 Return 404 Not Found
        Client -> Admin : 9.1.1.4.2.3. Show error message
    end
else Validation failed
    Controller -> Route : 9.2. Return 400 Bad Request
    deactivate Controller
    Route -> Client : 9.2.1. Return error (400)
    deactivate Route
    Client -> Admin : 9.2.2. Show validation error
end

deactivate Route
deactivate Client
deactivate Admin
@enduml
```

## UC_71: Delete Banner

```plantuml
@startuml Delete Banner
title Sequence Diagram: Delete Banner

actor Admin
boundary "Client" as Client
boundary "Banner Route" as Route
control "Banner Controller" as Controller
participant ":Banner Service" as Service
entity "Banner Model" as Model
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Click delete banner
activate Client
Client -> Client : 2. Show confirmation dialog
Admin -> Client : 3. Confirm deletion
Client -> Route : 4. DELETE /api/banner/:id\n(credentials: include)
activate Route

Route -> Controller : 5. deleteBanner(req, res)
activate Controller
Controller -> Controller : 6. Extract bannerId from params
Controller -> Controller : 7. Validate bannerId
Controller -> Service : 8. getBannerById(bannerId)
activate Service
Service -> Model : 9. getBannerById(bannerId)
activate Model
Model -> Database : 10. Find Banner by ID
activate Database
Database -> Model : 11. Return banner document
deactivate Database
Model -> Service : 12. Return banner document
deactivate Model

alt Banner found
    Service -> Controller : 12.1. Return banner document
    deactivate Service
    Controller -> Service : 12.1.1. deleteBanner(bannerId)
    activate Service
    Service -> Model : 12.1.2. Delete banner by ID
    activate Model
    Model -> Database : 12.1.3. findByIdAndDelete
    activate Database
    Database -> Model : 12.1.4. Return deleted banner document
    deactivate Database
    Model -> Service : 12.1.5. Return deleted banner
    deactivate Model
    Service -> Controller : 12.1.6. Return deleted banner
    deactivate Service
    Controller -> Controller : 12.1.7. Build response object
    Controller -> Route : 12.1.8. res.json({ message: "Banner deleted" })
    deactivate Controller
    Route -> Client : 12.1.9. Return success message (200 OK)
    deactivate Route
    Client -> Client : 12.1.10. Remove banner from state
    Client -> Admin : 12.1.11. Show success message + refresh list
else Banner not found
    Service -> Controller : 12.2. Return null
    deactivate Service
    Controller -> Route : 12.2.1. res.status(404).json({ message })
    deactivate Controller
    Route -> Client : 12.2.2. Return error (404)
    deactivate Route
    Client -> Admin : 12.2.3. Show error message
end

deactivate Client
deactivate Admin
@enduml
```

## UC_72: Search Banner

```plantuml
@startuml Search Banner
title Sequence Diagram: Search Banner

actor Admin
boundary "Client" as Client
boundary "Banner Route" as Route
control "Banner Controller" as Controller
entity "Banner Model" as Model
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Enter search query
activate Client
Client -> Client : 2. Update search input state
Admin -> Client : 3. Submit search
Client -> Route : 4. GET /api/banner?search=query\n(credentials: include)
activate Route

Route -> Controller : 5. getBanners(req, res)
activate Controller
Controller -> Controller : 5.1. Extract query params\n(search, isActive, limit, offset)
Controller -> Controller : 5.2. Build filters object\n(search term included)
Controller -> Service : 5.3. getAllBanners(filters)
activate Service
Service -> Model : 5.4. getAllBanners(filters)
activate Model
Model -> Model : 5.5. Build MongoDB query\n(title, description regex search)
Model -> Database : 5.6. Find Banner documents\n(query with regex, sort, skip, limit)
activate Database
Database -> Model : 5.7. Return matching banners array
deactivate Database
Model -> Model : 5.8. Format banner responses
Model -> Service : 5.9. Return formatted banners array
deactivate Model
Service -> Controller : 5.10. Return formatted banners array
deactivate Service
Controller -> Controller : 5.11. Build response object
Controller -> Route : 5.12. res.json({ banners, count })
deactivate Controller
Route -> Client : 5.13. Return filtered banners + count (200 OK)
deactivate Route
Client -> Client : 5.14. Set filtered banners state
Client -> Admin : 5.15. Display search results

deactivate Client
deactivate Admin
@enduml
```

## UC_73: Show Banner for User

```plantuml
@startuml Show Banner for User
title Sequence Diagram: Show Banner for User

actor Guest
boundary "Client" as Client
boundary "Banner Route" as Route
control "Banner Controller" as Controller
participant ":Banner Service" as Service
entity "Banner Model" as Model
database "MongoDB" as Database

activate Guest
Guest -> Client : 1. Visit homepage
activate Client
Client -> Client : 2. Render BannerCarousel component
Client -> Route : 3. GET /api/banner/public\n(no authentication required)
activate Route
Route -> Controller : 4. getActiveBanners(req, res)
activate Controller
Controller -> Service : 5. getActiveBanners()
activate Service
Service -> Model : 6. getActiveBanners()
activate Model
Model -> Model : 7. Build query for active banners\n(isActive: true, valid dates)
Model -> Database : 8. Find Banner documents\n(query: isActive=true, startDate<=now, endDate>=now)
activate Database
Database -> Model : 9. Return active banners array
deactivate Database
Model -> Model : 10. Sort by displayOrder (ascending)
Model -> Model : 11. Format banner responses
Model -> Service : 12. Return formatted banners array
deactivate Model
Service -> Controller : 13. Return formatted banners array
deactivate Service
Controller -> Controller : 14. Build response object
Controller -> Route : 15. res.json({ banners, count })
deactivate Controller
Route -> Client : 16. Return banners + count (200 OK)
deactivate Route
Client -> Client : 17. Set banners state
Client -> Client : 18. Initialize carousel state
Client -> Client : 19. Start auto-play timer (5s interval)
Client -> Guest : 20. Display banners carousel\n(auto-rotate every 5s)
deactivate Client
deactivate Guest
@enduml
```

## Cách sử dụng

1. Copy code PlantUML từ các section trên
2. Dán vào editor hỗ trợ PlantUML (VS Code với extension, hoặc online: http://www.plantuml.com/plantuml/uml/)
3. Hoặc sử dụng với file `.puml` và render bằng công cụ PlantUML

## Quy tắc đánh số

- **Interaction numbering**: Mọi interaction đều có số thứ tự với dấu chấm sau số (ví dụ: `1.`, `2.`, `3.`)
- **Alt block numbering**: Sử dụng số thập phân (ví dụ: `4.1.`, `4.2.`)
- **Nested alt blocks**: Sử dụng số thập phân lồng nhau (ví dụ: `4.2.1.`, `4.2.2.`)
- **Return messages**: Cũng được đánh số nhất quán theo quy tắc tương ứng
- **Activation bars**: Mọi participant được activate khi được gọi và deactivate sau khi phản hồi
- **Guest actor**: Được activate ở đầu flow và deactivate ở cuối flow
- **Title**: Không chứa số thứ tự

## Architecture Layers

- **Client (Boundary)**: Client-side React/Next.js application
- **Route (Boundary)**: Express routes, entry point for API requests
- **Auth Middleware (Control)**: JWT token authentication
- **Role Middleware (Control)**: Role-based authorization (admin, staff, user)
- **Upload Middleware (Control)**: File upload validation and S3 upload
- **Controller (Control)**: Request validation, response formatting
- **Service (Participant)**: Business logic layer
- **Model (Entity)**: Data access layer, MongoDB queries, data transformation
- **Database**: MongoDB database
- **AWS S3**: Cloud storage for files

## Flow Pattern

1. **Client** → **Route**: HTTP request
2. **Route** → **Auth Middleware**: Authentication check
3. **Route** → **Role Middleware**: Authorization check
4. **Route** → **Upload Middleware** (if file upload): File validation and upload
5. **Route** → **Controller**: Business logic
6. **Controller** → **Model**: Data access
7. **Model** → **Database**: MongoDB queries
8. **Database** → **Model**: Return data
9. **Model** → **Controller**: Formatted data
10. **Controller** → **Route**: Response
11. **Route** → **Client**: HTTP response
12. **Client**: Update state and UI

## Ghi chú

- Tất cả các flow đều có error handling với các nhánh alt
- Authentication và authorization được kiểm tra ở middleware layer
- File uploads được xử lý qua Upload Middleware trước khi đến Controller
- Business logic được xử lý ở Service layer
- MongoDB queries được thực hiện qua Model layer (Entity)
- Database operations chỉ được thực hiện thông qua Model, không trực tiếp từ Controller hoặc Service
- Client state management được cập nhật sau mỗi API response
