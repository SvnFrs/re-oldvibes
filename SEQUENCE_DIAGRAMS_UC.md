# Sequence Diagrams - Use Cases (UC_64 to UC_73)

Tài liệu này chứa các sequence diagram PlantUML cho các use case từ UC_64 đến UC_73, tuân theo quy tắc đánh số interaction với dấu chấm và mô tả chi tiết flow qua các layer.

## UC_64: Show Feedback

```plantuml
@startuml Show Feedback
title Sequence Diagram: Show Feedback

actor User
boundary "Client" as Client
boundary "Feedback Route" as Route
control "Auth Middleware" as AuthMiddleware
control "Role Middleware" as RoleMiddleware
control "Feedback Controller" as Controller
entity "Feedback Model" as Model
database "MongoDB" as Database

activate User
User -> Client : 1. Navigate to Feedback page
activate Client
Client -> Route : 2. GET /api/feedback/user/:userId\n(credentials: include)
activate Route
Route -> AuthMiddleware : 3. authenticateToken()
activate AuthMiddleware
AuthMiddleware -> AuthMiddleware : 3.1. Extract token from cookie/header
AuthMiddleware -> AuthMiddleware : 3.2. Verify JWT token
alt Token valid
    AuthMiddleware -> Route : 3.3. Token verified, user authenticated
    deactivate AuthMiddleware
    Route -> RoleMiddleware : 4. requireUser()
    activate RoleMiddleware
    RoleMiddleware -> RoleMiddleware : 4.1. Check user role
    alt User role valid
        RoleMiddleware -> Route : 4.2. Role check passed
        deactivate RoleMiddleware
        Route -> Controller : 5. getUserFeedbacks(req, res)
        activate Controller
        Controller -> Controller : 5.1. Extract userId from params
        Controller -> Controller : 5.2. Extract limit, offset from query
        Controller -> Controller : 5.3. Build filters object
        Controller -> Model : 5.4. getFeedbacks(filters)
        activate Model
        Model -> Model : 5.4.1. Build MongoDB query
        Model -> Database : 5.4.2. Find Feedback documents\n(query, populate userId, sort, skip, limit)
        activate Database
        Database -> Model : 5.4.3. Return feedbacks array
        deactivate Database
        Model -> Model : 5.4.4. Format feedback responses
        Model -> Controller : 5.4.5. Return formatted feedbacks array
        deactivate Model
        Controller -> Controller : 5.5. Build response object
        Controller -> Route : 5.6. res.json({ feedbacks, count })
        deactivate Controller
        Route -> Client : 6. Return feedbacks + count (200 OK)
        deactivate Route
        Client -> Client : 7. Set feedbacks state
        Client -> User : 8. Display feedbacks list
    else User role invalid
        RoleMiddleware -> Route : 4.3. Return 403 Forbidden
        deactivate RoleMiddleware
        Route -> Client : 5. Return error (403)
        deactivate Route
        Client -> User : 6. Show access denied message
    end
else Token invalid
    AuthMiddleware -> Route : 3.4. Return 401 Unauthorized
    deactivate AuthMiddleware
    Route -> Client : 4. Return error (401)
    deactivate Route
    Client -> User : 5. Show authentication error
end
deactivate Client
deactivate User
@enduml
```

## UC_65: Show Feedback Detail

```plantuml
@startuml Show Feedback Detail
title Sequence Diagram: Show Feedback Detail

actor User
boundary "Client" as Client
boundary "Feedback Route" as Route
control "Auth Middleware" as AuthMiddleware
control "Role Middleware" as RoleMiddleware
control "Feedback Controller" as Controller
entity "Feedback Model" as Model
database "MongoDB" as Database

activate User
User -> Client : 1. Click feedback item
activate Client
Client -> Route : 2. GET /api/feedback/:id\n(credentials: include)
activate Route
Route -> AuthMiddleware : 3. authenticateToken()
activate AuthMiddleware
AuthMiddleware -> AuthMiddleware : 3.1. Verify JWT token
AuthMiddleware -> Route : 3.2. Token verified
deactivate AuthMiddleware
Route -> RoleMiddleware : 4. requireStaff()
activate RoleMiddleware
RoleMiddleware -> RoleMiddleware : 4.1. Check user role (staff/admin)
alt Staff role verified
    RoleMiddleware -> Route : 4.2. Role check passed
    deactivate RoleMiddleware
    Route -> Controller : 5. getFeedbackById(req, res)
    activate Controller
    Controller -> Controller : 5.1. Extract feedbackId from params
    Controller -> Controller : 5.2. Validate feedbackId
    Controller -> Model : 5.3. getFeedbackById(feedbackId)
    activate Model
    Model -> Database : 5.3.1. Find Feedback by ID\n(populate userId)
    activate Database
    Database -> Model : 5.3.2. Return feedback document
    deactivate Database
    alt Feedback found
        Model -> Model : 5.3.3. Format feedback response
        Model -> Controller : 5.3.4. Return formatted feedback
        deactivate Model
        Controller -> Controller : 5.4. Build response object
        Controller -> Route : 5.5. res.json({ feedback })
        deactivate Controller
        Route -> Client : 6. Return feedback details (200 OK)
        deactivate Route
        Client -> Client : 7. Set selected feedback state
        Client -> User : 8. Show feedback detail modal
    else Feedback not found
        Model -> Controller : 5.3.5. Return null
        deactivate Model
        Controller -> Route : 5.4. res.status(404).json({ message })
        deactivate Controller
        Route -> Client : 6. Return error (404)
        deactivate Route
        Client -> User : 7. Show error message
    end
else Staff role not verified
    RoleMiddleware -> Route : 4.3. Return 403 Forbidden
    deactivate RoleMiddleware
    Route -> Client : 5. Return error (403)
    deactivate Route
    Client -> User : 6. Show access denied message
end
deactivate Client
deactivate User
@enduml
```

## UC_66: Show Report

```plantuml
@startuml Show Report
title Sequence Diagram: Show Report

actor Admin
boundary "Client" as Client
boundary "Report Route" as Route
control "Auth Middleware" as AuthMiddleware
control "Role Middleware" as RoleMiddleware
control "Report Controller" as Controller
entity "Report Model" as Model
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Navigate to Reports page
activate Client
Client -> Route : 2. GET /api/report\n(credentials: include)
activate Route
Route -> AuthMiddleware : 3. authenticateToken()
activate AuthMiddleware
AuthMiddleware -> AuthMiddleware : 3.1. Verify JWT token
AuthMiddleware -> Route : 3.2. Token verified
deactivate AuthMiddleware
Route -> RoleMiddleware : 4. requireStaff()
activate RoleMiddleware
RoleMiddleware -> RoleMiddleware : 4.1. Check user role (staff/admin)
alt Staff role verified
    RoleMiddleware -> Route : 4.2. Role check passed
    deactivate RoleMiddleware
    Route -> Controller : 5. getReports(req, res)
    activate Controller
    Controller -> Controller : 5.1. Extract query params\n(userId, vibeId, reportType, limit, offset)
    Controller -> Controller : 5.2. Build filters object
    Controller -> Model : 5.3. getReports(filters)
    activate Model
    Model -> Model : 5.3.1. Build MongoDB query
    Model -> Database : 5.3.2. Find Report documents\n(query, populate userId, vibeId, sort, skip, limit)
    activate Database
    Database -> Model : 5.3.3. Return reports array
    deactivate Database
    Model -> Model : 5.3.4. Format report responses
    Model -> Controller : 5.3.5. Return formatted reports array
    deactivate Model
    Controller -> Controller : 5.4. Build response object
    Controller -> Route : 5.5. res.json({ reports, count })
    deactivate Controller
    Route -> Client : 6. Return reports + count (200 OK)
    deactivate Route
    Client -> Client : 7. Set reports state
    Client -> Admin : 8. Display reports list
else Staff role not verified
    RoleMiddleware -> Route : 4.3. Return 403 Forbidden
    deactivate RoleMiddleware
    Route -> Client : 5. Return error (403)
    deactivate Route
    Client -> Admin : 6. Show access denied message
end
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
control "Auth Middleware" as AuthMiddleware
control "Role Middleware" as RoleMiddleware
control "Report Controller" as Controller
entity "Report Model" as Model
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Click report item
activate Client
Client -> Route : 2. GET /api/report/:id\n(credentials: include)
activate Route
Route -> AuthMiddleware : 3. authenticateToken()
activate AuthMiddleware
AuthMiddleware -> AuthMiddleware : 3.1. Verify JWT token
AuthMiddleware -> Route : 3.2. Token verified
deactivate AuthMiddleware
Route -> RoleMiddleware : 4. requireStaff()
activate RoleMiddleware
RoleMiddleware -> RoleMiddleware : 4.1. Check user role (staff/admin)
alt Staff role verified
    RoleMiddleware -> Route : 4.2. Role check passed
    deactivate RoleMiddleware
    Route -> Controller : 5. getReportById(req, res)
    activate Controller
    Controller -> Controller : 5.1. Extract reportId from params
    Controller -> Controller : 5.2. Validate reportId
    Controller -> Model : 5.3. getReportById(reportId)
    activate Model
    Model -> Database : 5.3.1. Find Report by ID\n(populate userId, vibeId)
    activate Database
    Database -> Model : 5.3.2. Return report document
    deactivate Database
    alt Report found
        Model -> Model : 5.3.3. Format report response
        Model -> Controller : 5.3.4. Return formatted report
        deactivate Model
        Controller -> Controller : 5.4. Build response object
        Controller -> Route : 5.5. res.json({ report })
        deactivate Controller
        Route -> Client : 6. Return report details (200 OK)
        deactivate Route
        Client -> Client : 7. Set selected report state
        Client -> Admin : 8. Show report detail modal
    else Report not found
        Model -> Controller : 5.3.5. Return null
        deactivate Model
        Controller -> Route : 5.4. res.status(404).json({ message })
        deactivate Controller
        Route -> Client : 6. Return error (404)
        deactivate Route
        Client -> Admin : 7. Show error message
    end
else Staff role not verified
    RoleMiddleware -> Route : 4.3. Return 403 Forbidden
    deactivate RoleMiddleware
    Route -> Client : 5. Return error (403)
    deactivate Route
    Client -> Admin : 6. Show access denied message
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
control "Auth Middleware" as AuthMiddleware
control "Role Middleware" as RoleMiddleware
control "Upload Middleware" as UploadMiddleware
control "Banner Controller" as Controller
entity "Banner Model" as Model
participant "AWS S3" as S3
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Fill banner form\n(upload image, title, description, isActive)
activate Client
Client -> Client : 2. Validate form
Client -> Route : 3. POST /api/banner\n(FormData: image, title, description, isActive)\n(credentials: include)
activate Route
Route -> AuthMiddleware : 4. authenticateToken()
activate AuthMiddleware
AuthMiddleware -> AuthMiddleware : 4.1. Verify JWT token
AuthMiddleware -> Route : 4.2. Token verified
deactivate AuthMiddleware
Route -> RoleMiddleware : 5. requireStaff()
activate RoleMiddleware
RoleMiddleware -> RoleMiddleware : 5.1. Check user role (staff/admin)
alt Staff role verified
    RoleMiddleware -> Route : 5.2. Role check passed
    deactivate RoleMiddleware
    Route -> UploadMiddleware : 6. uploadBannerImage.single("image")
    activate UploadMiddleware
    UploadMiddleware -> UploadMiddleware : 6.1. Validate file type (image only)
    UploadMiddleware -> UploadMiddleware : 6.2. Validate file size (10MB max)
    alt File valid
        UploadMiddleware -> S3 : 6.3. Upload file to S3\n(bucket: banners/)
        activate S3
        S3 -> UploadMiddleware : 6.4. Return S3 URL (file.location)
        deactivate S3
        UploadMiddleware -> Route : 6.5. File uploaded, req.file set
        deactivate UploadMiddleware
        Route -> Controller : 7. createBanner(req, res)
        activate Controller
        Controller -> Controller : 7.1. Extract file from req.file
        Controller -> Controller : 7.2. Extract form data from req.body\n(title, description, isActive, startDate, endDate)
        Controller -> Controller : 7.3. Validate required fields (title)
        alt Validation passed
            Controller -> Controller : 7.4. Set imageUrl = file.location
            Controller -> Controller : 7.5. Parse isActive, startDate, endDate
            Controller -> Controller : 7.6. Build bannerData object
            Controller -> Model : 7.7. createBanner(bannerData)
            activate Model
            Model -> Model : 7.7.1. Check isActive status
            alt Banner is active
                Model -> Database : 7.7.2. Count active banners\n({ isActive: true })
                activate Database
                Database -> Model : 7.7.3. Return active banner count
                deactivate Database
                Model -> Model : 7.7.4. Calculate displayOrder = count + 1
            else Banner is inactive
                Model -> Model : 7.7.5. Set displayOrder = 0
            end
            Model -> Database : 7.7.6. Create Banner document\n(bannerData, displayOrder)
            activate Database
            Database -> Model : 7.7.7. Return created banner document
            deactivate Database
            Model -> Controller : 7.7.8. Return banner document
            deactivate Model
            Controller -> Controller : 7.8. Format response
            Controller -> Route : 7.9. res.status(201).json({ message, banner })
            deactivate Controller
            Route -> Client : 8. Return banner data (201 Created)
            deactivate Route
            Client -> Client : 9. Set banners state
            Client -> Admin : 10. Show success message + refresh list
        else Validation failed
            Controller -> Route : 7.4. res.status(400).json({ message })
            deactivate Controller
            Route -> Client : 8. Return error (400)
            deactivate Route
            Client -> Admin : 9. Show validation error
        end
    else File invalid
        UploadMiddleware -> Route : 6.6. Return error (file validation failed)
        deactivate UploadMiddleware
        Route -> Client : 7. Return error (400)
        deactivate Route
        Client -> Admin : 8. Show file error message
    end
else Staff role not verified
    RoleMiddleware -> Route : 5.3. Return 403 Forbidden
    deactivate RoleMiddleware
    Route -> Client : 6. Return error (403)
    deactivate Route
    Client -> Admin : 7. Show access denied message
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
control "Auth Middleware" as AuthMiddleware
control "Role Middleware" as RoleMiddleware
control "Banner Controller" as Controller
entity "Banner Model" as Model
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Navigate to Banner Management
activate Client
Client -> Route : 2. GET /api/banner\n(credentials: include)
activate Route
Route -> AuthMiddleware : 3. authenticateToken()
activate AuthMiddleware
AuthMiddleware -> AuthMiddleware : 3.1. Verify JWT token
AuthMiddleware -> Route : 3.2. Token verified
deactivate AuthMiddleware
Route -> RoleMiddleware : 4. requireStaff()
activate RoleMiddleware
RoleMiddleware -> RoleMiddleware : 4.1. Check user role (staff/admin)
alt Staff role verified
    RoleMiddleware -> Route : 4.2. Role check passed
    deactivate RoleMiddleware
    Route -> Controller : 5. getBanners(req, res)
    activate Controller
    Controller -> Controller : 5.1. Extract query params\n(isActive, search, limit, offset)
    Controller -> Controller : 5.2. Build filters object
    Controller -> Model : 5.3. getAllBanners(filters)
    activate Model
    Model -> Model : 5.3.1. Build MongoDB query\n(no date filtering for admin)
    Model -> Database : 5.3.2. Find Banner documents\n(query, sort by createdAt desc, skip, limit)
    activate Database
    Database -> Model : 5.3.3. Return banners array
    deactivate Database
    Model -> Model : 5.3.4. Format banner responses
    Model -> Controller : 5.3.5. Return formatted banners array
    deactivate Model
    Controller -> Controller : 5.4. Build response object
    Controller -> Route : 5.5. res.json({ banners, count })
    deactivate Controller
    Route -> Client : 6. Return banners + count (200 OK)
    deactivate Route
    Client -> Client : 7. Set banners state
    Client -> Admin : 8. Display banners list\n(active + inactive)
else Staff role not verified
    RoleMiddleware -> Route : 4.3. Return 403 Forbidden
    deactivate RoleMiddleware
    Route -> Client : 5. Return error (403)
    deactivate Route
    Client -> Admin : 6. Show access denied message
end
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
control "Auth Middleware" as AuthMiddleware
control "Role Middleware" as RoleMiddleware
control "Upload Middleware" as UploadMiddleware
control "Banner Controller" as Controller
entity "Banner Model" as Model
participant "AWS S3" as S3
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Click edit banner
activate Client
Client -> Client : 2. Load banner data to form
Admin -> Client : 3. Modify banner data\n(image?, title, description, isActive)
Client -> Client : 4. Validate form
Client -> Route : 5. PUT /api/banner/:id\n(FormData: image?, title, description, isActive)\n(credentials: include)
activate Route
Route -> AuthMiddleware : 6. authenticateToken()
activate AuthMiddleware
AuthMiddleware -> AuthMiddleware : 6.1. Verify JWT token
AuthMiddleware -> Route : 6.2. Token verified
deactivate AuthMiddleware
Route -> RoleMiddleware : 7. requireStaff()
activate RoleMiddleware
RoleMiddleware -> RoleMiddleware : 7.1. Check user role (staff/admin)
alt Staff role verified
    RoleMiddleware -> Route : 7.2. Role check passed
    deactivate RoleMiddleware
    Route -> UploadMiddleware : 8. uploadBannerImage.single("image")
    activate UploadMiddleware
    alt Image file provided
        UploadMiddleware -> UploadMiddleware : 8.1. Validate file type (image only)
        UploadMiddleware -> UploadMiddleware : 8.2. Validate file size (10MB max)
        alt File valid
            UploadMiddleware -> S3 : 8.3. Upload file to S3\n(bucket: banners/)
            activate S3
            S3 -> UploadMiddleware : 8.4. Return S3 URL (file.location)
            deactivate S3
            UploadMiddleware -> Route : 8.5. File uploaded, req.file set
            deactivate UploadMiddleware
            Route -> Controller : 9. updateBanner(req, res)
            activate Controller
            Controller -> Controller : 9.1. Extract bannerId from params
            Controller -> Controller : 9.2. Extract file from req.file (exists)
            Controller -> Controller : 9.3. Extract form data from req.body\n(title, description, isActive, startDate, endDate)
            Controller -> Controller : 9.4. Validate bannerId
            alt Validation passed
                Controller -> Controller : 9.5. Validate title length (if provided)
                Controller -> Controller : 9.6. Validate description length (if provided)
                Controller -> Controller : 9.7. Parse isActive, startDate, endDate
                Controller -> Controller : 9.8. Set imageUrl = file.location
                Controller -> Controller : 9.9. Build updateData object
                Controller -> Model : 9.10. updateBanner(bannerId, updateData)
                activate Model
                Model -> Database : 9.10.1. Find current banner by ID
                activate Database
                Database -> Model : 9.10.2. Return current banner document
                deactivate Database
                alt Banner found
                    Model -> Model : 9.10.3. Compare oldIsActive vs newIsActive
                    alt isActive status changed
                        alt Banner activated (was inactive)
                            Model -> Database : 9.10.4. Count active banners\n(excluding current banner)
                            activate Database
                            Database -> Model : 9.10.5. Return active banner count
                            deactivate Database
                            Model -> Model : 9.10.6. Set displayOrder = count + 1
                        else Banner deactivated (was active)
                            Model -> Model : 9.10.7. Set displayOrder = 0
                        end
                    else isActive unchanged
                        alt Banner is inactive
                            Model -> Model : 9.10.8. Ensure displayOrder = 0
                        else Banner is active
                            Model -> Model : 9.10.9. Keep existing displayOrder
                        end
                    end
                    Model -> Model : 9.10.10. Remove displayOrder from updateData\n(auto-calculated)
                    Model -> Model : 9.10.11. Set updatedAt = new Date()
                    Model -> Database : 9.10.12. Update Banner document\n(findByIdAndUpdate)
                    activate Database
                    Database -> Model : 9.10.13. Return updated banner document
                    deactivate Database
                    Model -> Model : 9.10.14. Format banner response
                    Model -> Controller : 9.10.15. Return formatted banner
                    deactivate Model
                    Controller -> Controller : 9.11. Build response object
                    Controller -> Route : 9.12. res.json({ message, banner })
                    deactivate Controller
                    Route -> Client : 10. Return updated banner data (200 OK)
                    deactivate Route
                    Client -> Client : 11. Update banners state
                    Client -> Admin : 12. Show success message + refresh list
                else Banner not found
                    Model -> Controller : 9.10.16. Return null
                    deactivate Model
                    Controller -> Route : 9.11. res.status(404).json({ message })
                    deactivate Controller
                    Route -> Client : 10. Return error (404)
                    deactivate Route
                    Client -> Admin : 11. Show error message
                end
            else Validation failed
                Controller -> Route : 9.5. res.status(400).json({ message })
                deactivate Controller
                Route -> Client : 10. Return error (400)
                deactivate Route
                Client -> Admin : 11. Show validation error
            end
        else File invalid
            UploadMiddleware -> Route : 8.6. Return error (file validation failed)
            deactivate UploadMiddleware
            Route -> Client : 9. Return error (400)
            deactivate Route
            Client -> Admin : 10. Show file error message
        end
    else No image file
        UploadMiddleware -> Route : 8.7. No file, req.file = undefined
        deactivate UploadMiddleware
        Route -> Controller : 9. updateBanner(req, res)
        activate Controller
        Controller -> Controller : 9.1. Extract bannerId from params
        Controller -> Controller : 9.2. Extract file from req.file (undefined)
        Controller -> Controller : 9.3. Extract form data from req.body\n(title, description, isActive, startDate, endDate)
        Controller -> Controller : 9.4. Validate bannerId
        alt Validation passed
            Controller -> Controller : 9.5. Validate title length (if provided)
            Controller -> Controller : 9.6. Validate description length (if provided)
            Controller -> Controller : 9.7. Parse isActive, startDate, endDate
            Controller -> Controller : 9.8. imageUrl not updated (no file)
            Controller -> Controller : 9.9. Build updateData object
            Controller -> Model : 9.10. updateBanner(bannerId, updateData)
            activate Model
            Model -> Database : 9.10.1. Find current banner by ID
            activate Database
            Database -> Model : 9.10.2. Return current banner document
            deactivate Database
            alt Banner found
                Model -> Model : 9.10.3. Compare oldIsActive vs newIsActive
                alt isActive status changed
                    alt Banner activated (was inactive)
                        Model -> Database : 9.10.4. Count active banners\n(excluding current banner)
                        activate Database
                        Database -> Model : 9.10.5. Return active banner count
                        deactivate Database
                        Model -> Model : 9.10.6. Set displayOrder = count + 1
                    else Banner deactivated (was active)
                        Model -> Model : 9.10.7. Set displayOrder = 0
                    end
                else isActive unchanged
                    alt Banner is inactive
                        Model -> Model : 9.10.8. Ensure displayOrder = 0
                    else Banner is active
                        Model -> Model : 9.10.9. Keep existing displayOrder
                    end
                end
                Model -> Model : 9.10.10. Remove displayOrder from updateData\n(auto-calculated)
                Model -> Model : 9.10.11. Set updatedAt = new Date()
                Model -> Database : 9.10.12. Update Banner document\n(findByIdAndUpdate)
                activate Database
                Database -> Model : 9.10.13. Return updated banner document
                deactivate Database
                Model -> Model : 9.10.14. Format banner response
                Model -> Controller : 9.10.15. Return formatted banner
                deactivate Model
                Controller -> Controller : 9.11. Build response object
                Controller -> Route : 9.12. res.json({ message, banner })
                deactivate Controller
                Route -> Client : 10. Return updated banner data (200 OK)
                deactivate Route
                Client -> Client : 11. Update banners state
                Client -> Admin : 12. Show success message + refresh list
            else Banner not found
                Model -> Controller : 9.10.16. Return null
                deactivate Model
                Controller -> Route : 9.11. res.status(404).json({ message })
                deactivate Controller
                Route -> Client : 10. Return error (404)
                deactivate Route
                Client -> Admin : 11. Show error message
            end
        else Validation failed
            Controller -> Route : 9.5. res.status(400).json({ message })
            deactivate Controller
            Route -> Client : 10. Return error (400)
            deactivate Route
            Client -> Admin : 11. Show validation error
        end
    end
else Staff role not verified
    RoleMiddleware -> Route : 7.3. Return 403 Forbidden
    deactivate RoleMiddleware
    Route -> Client : 8. Return error (403)
    deactivate Route
    Client -> Admin : 9. Show access denied message
end
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
control "Auth Middleware" as AuthMiddleware
control "Role Middleware" as RoleMiddleware
control "Banner Controller" as Controller
entity "Banner Model" as Model
database "MongoDB" as Database

activate Admin
Admin -> Client : 1. Click delete banner
activate Client
Client -> Client : 2. Show confirmation dialog
Admin -> Client : 3. Confirm deletion
Client -> Route : 4. DELETE /api/banner/:id\n(credentials: include)
activate Route
Route -> AuthMiddleware : 5. authenticateToken()
activate AuthMiddleware
AuthMiddleware -> AuthMiddleware : 5.1. Verify JWT token
AuthMiddleware -> Route : 5.2. Token verified
deactivate AuthMiddleware
Route -> RoleMiddleware : 6. requireStaff()
activate RoleMiddleware
RoleMiddleware -> RoleMiddleware : 6.1. Check user role (staff/admin)
alt Staff role verified
    RoleMiddleware -> Route : 6.2. Role check passed
    deactivate RoleMiddleware
    Route -> Controller : 7. deleteBanner(req, res)
    activate Controller
    Controller -> Controller : 7.1. Extract bannerId from params
    Controller -> Controller : 7.2. Validate bannerId
    Controller -> Model : 7.3. getBannerById(bannerId)
    activate Model
    Model -> Database : 7.3.1. Find Banner by ID
    activate Database
    Database -> Model : 7.3.2. Return banner document
    deactivate Database
    alt Banner found
        Model -> Controller : 7.3.3. Return banner document
        deactivate Model
        Controller -> Model : 7.4. deleteBanner(bannerId)
        activate Model
        Model -> Database : 7.4.1. Delete Banner document\n(findByIdAndDelete)
        activate Database
        Database -> Model : 7.4.2. Return deleted banner document
        deactivate Database
        Model -> Controller : 7.4.3. Return deleted banner
        deactivate Model
        Controller -> Controller : 7.5. Build response object
        Controller -> Route : 7.6. res.json({ message: "Banner deleted" })
        deactivate Controller
        Route -> Client : 8. Return success message (200 OK)
        deactivate Route
        Client -> Client : 9. Remove banner from state
        Client -> Admin : 10. Show success message + refresh list
    else Banner not found
        Model -> Controller : 7.3.4. Return null
        deactivate Model
        Controller -> Route : 7.4. res.status(404).json({ message })
        deactivate Controller
        Route -> Client : 8. Return error (404)
        deactivate Route
        Client -> Admin : 9. Show error message
    end
else Staff role not verified
    RoleMiddleware -> Route : 6.3. Return 403 Forbidden
    deactivate RoleMiddleware
    Route -> Client : 7. Return error (403)
    deactivate Route
    Client -> Admin : 8. Show access denied message
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
control "Auth Middleware" as AuthMiddleware
control "Role Middleware" as RoleMiddleware
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
Route -> AuthMiddleware : 5. authenticateToken()
activate AuthMiddleware
AuthMiddleware -> AuthMiddleware : 5.1. Verify JWT token
AuthMiddleware -> Route : 5.2. Token verified
deactivate AuthMiddleware
Route -> RoleMiddleware : 6. requireStaff()
activate RoleMiddleware
RoleMiddleware -> RoleMiddleware : 6.1. Check user role (staff/admin)
alt Staff role verified
    RoleMiddleware -> Route : 6.2. Role check passed
    deactivate RoleMiddleware
    Route -> Controller : 7. getBanners(req, res)
    activate Controller
    Controller -> Controller : 7.1. Extract query params\n(search, isActive, limit, offset)
    Controller -> Controller : 7.2. Build filters object\n(search term included)
    Controller -> Model : 7.3. getAllBanners(filters)
    activate Model
    Model -> Model : 7.3.1. Build MongoDB query\n(title, description regex search)
    Model -> Database : 7.3.2. Find Banner documents\n(query with regex, sort, skip, limit)
    activate Database
    Database -> Model : 7.3.3. Return matching banners array
    deactivate Database
    Model -> Model : 7.3.4. Format banner responses
    Model -> Controller : 7.3.5. Return formatted banners array
    deactivate Model
    Controller -> Controller : 7.4. Build response object
    Controller -> Route : 7.5. res.json({ banners, count })
    deactivate Controller
    Route -> Client : 8. Return filtered banners + count (200 OK)
    deactivate Route
    Client -> Client : 9. Set filtered banners state
    Client -> Admin : 10. Display search results
else Staff role not verified
    RoleMiddleware -> Route : 6.3. Return 403 Forbidden
    deactivate RoleMiddleware
    Route -> Client : 7. Return error (403)
    deactivate Route
    Client -> Admin : 8. Show access denied message
end
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
Controller -> Model : 5. getActiveBanners()
activate Model
Model -> Model : 5.1. Build query for active banners\n(isActive: true, valid dates)
Model -> Database : 5.2. Find Banner documents\n(query: isActive=true, startDate<=now, endDate>=now)
activate Database
Database -> Model : 5.3. Return active banners array
deactivate Database
Model -> Model : 5.4. Sort by displayOrder (ascending)
Model -> Model : 5.5. Format banner responses
Model -> Controller : 5.6. Return formatted banners array
deactivate Model
Controller -> Controller : 6. Build response object
Controller -> Route : 7. res.json({ banners, count })
deactivate Controller
Route -> Client : 8. Return banners + count (200 OK)
deactivate Route
Client -> Client : 9. Set banners state
Client -> Client : 10. Initialize carousel state
Client -> Client : 11. Start auto-play timer (5s interval)
Client -> Guest : 12. Display banners carousel\n(auto-rotate every 5s)
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
- **Controller (Control)**: Business logic, request validation, response formatting
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
- MongoDB queries được thực hiện qua Model layer (Entity)
- Database operations chỉ được thực hiện thông qua Model, không trực tiếp từ Controller
- Client state management được cập nhật sau mỗi API response
