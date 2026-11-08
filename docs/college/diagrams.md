# Study Plans API diagrams

Implemented structure. See DEMO.md for the running application and validation commands.

## Architecture

```mermaid
flowchart LR
  Client[Browser or API client] --> Controller[StudyPlanController]
  Auth[Existing session authentication] --> Controller
  Controller --> Service[StudyPlanService]
  Service --> Entity[StudyPlan entity]
  Service --> Port[StudyPlanRepository interface]
  Adapter[D1StudyPlanRepository] -. implements .-> Port
  Adapter --> DB[(Cloudflare D1)]
```

## Class diagram

```mermaid
classDiagram
  class StudyPlan {
    -PlanRecord record
    +constructor(record)
    +toJSON() PlanRecord
  }
  class StudyPlanController {
    -auth
    -StudyPlanService service
    +routes() Hono
  }
  class StudyPlanService {
    -StudyPlanRepository repository
    +list(ownerId, query)
    +get(ownerId, id)
    +create(ownerId, input)
    +replace(ownerId, id, input)
    +delete(ownerId, id)
  }
  class StudyPlanRepository {
    <<interface>>
    +list(ownerId, query)
    +get(ownerId, id)
    +create(plan)
    +replace(ownerId, id, input, updatedAt)
    +delete(ownerId, id)
  }
  class D1StudyPlanRepository {
    -StudyPlanDatabase db
  }
  StudyPlanController --> StudyPlanService
  StudyPlanService --> StudyPlan
  StudyPlanService --> StudyPlanRepository
  D1StudyPlanRepository ..|> StudyPlanRepository

```

## Entity relationship

```mermaid
erDiagram
  USER ||--o{ STUDY_PLAN : owns
  USER {
    string id PK
  }
  STUDY_PLAN {
    string id PK
    string owner_id FK
    string slug
    string title
    string description
    int weekly_minutes
    string status
    int created_at
    int updated_at
  }
```

## Create request sequence

```mermaid
sequenceDiagram
  actor Client
  participant Controller as StudyPlanController
  participant Service as StudyPlanService
  participant Repository as D1StudyPlanRepository
  participant DB as D1 database
  Client->>Controller: POST JSON with session and Origin
  Controller->>Controller: Authenticate and validate
  Controller->>Service: create(ownerId, input)
  Service->>Repository: create(plan)
  Repository->>DB: INSERT with bound values
  alt Created
    DB-->>Repository: Inserted row
    Repository-->>Service: StudyPlan
    Service-->>Controller: StudyPlan
    Controller-->>Client: 201 with Location and JSON
  else Duplicate owner and slug
    DB-->>Repository: No row returned (ON CONFLICT DO NOTHING)
    Repository-->>Service: null
    Service-->>Controller: null
    Controller-->>Client: 409 error envelope
  end
```
