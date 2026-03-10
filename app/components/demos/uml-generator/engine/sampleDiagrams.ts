export interface SampleDiagram {
  id: string;
  title: string;
  description: string;
  plantumlCode: string;
}

export const SAMPLE_DIAGRAMS: SampleDiagram[] = [
  {
    id: "class-ecommerce",
    title: "E-Commerce System",
    description: "Class diagram with User, Product, and Order relationships",
    plantumlCode: `@startuml
class User {
  +String username
  +String email
  +login(): boolean
  +register(): void
}

class Product {
  +String name
  +Decimal price
  +int stock
  +getDetails(): String
}

class Order {
  +Date orderDate
  +Decimal total
  +String status
  +calculateTotal(): Decimal
}

class CartItem {
  +int quantity
  +Decimal subtotal
}

User "1" --> "*" Order : places
Order "1" *-- "*" CartItem : contains
CartItem "*" --> "1" Product : references
@enduml`,
  },
  {
    id: "sequence-auth",
    title: "Authentication Flow",
    description: "Sequence diagram showing a login authentication flow",
    plantumlCode: `@startuml
actor User
participant "Web App" as App
participant "Auth Service" as Auth
database "User DB" as DB

User -> App: Enter credentials
App -> Auth: POST /login
Auth -> DB: Query user
DB --> Auth: User record
Auth -> Auth: Validate password
alt Valid credentials
  Auth --> App: JWT token
  App --> User: Redirect to dashboard
else Invalid credentials
  Auth --> App: 401 Unauthorized
  App --> User: Show error message
end
@enduml`,
  },
  {
    id: "state-order",
    title: "Order State Machine",
    description: "State diagram for an order lifecycle",
    plantumlCode: `@startuml
[*] --> Pending : Order placed
Pending --> Processing : Payment received
Processing --> Shipped : Items dispatched
Shipped --> Delivered : Package received
Delivered --> [*]

Pending --> Cancelled : User cancels
Processing --> Refunded : Refund requested
Cancelled --> [*]
Refunded --> [*]
@enduml`,
  },
  {
    id: "component-microservice",
    title: "Microservice Architecture",
    description: "Component diagram of a microservice system",
    plantumlCode: `@startuml
package "Frontend" {
  [Web App]
  [Mobile App]
}

package "API Gateway" {
  [Gateway]
}

package "Services" {
  [User Service]
  [Order Service]
  [Product Service]
}

package "Data" {
  database "User DB"
  database "Order DB"
  database "Product DB"
}

[Web App] --> [Gateway]
[Mobile App] --> [Gateway]
[Gateway] --> [User Service]
[Gateway] --> [Order Service]
[Gateway] --> [Product Service]
[User Service] --> [User DB]
[Order Service] --> [Order DB]
[Product Service] --> [Product DB]
@enduml`,
  },
];
