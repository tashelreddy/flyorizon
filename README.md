# Flight Booking Application

This is a simple flight booking application built using Node.js, Express.js, and SQLite. Users can submit a contact form, sign up, log in, and book flights, search to retrieve, update and delete bookings.

## Setup and Run

1. Install dependencies using `npm install`.
2. Install SQLite `brew install sqlite3` (on macOS), `brew install sqlite3` on windows
3. npm install sqlite3 Node.Js package
4. Run the application using `npm start`.
5. Access the application in your web browser at `http://localhost:3000`.

Ensure you have Node.js and npm installed on your system. Then, navigate to the root directory of your project in the terminal and run the following command to install all dependencies listed in `package.json`:

## Database Schema

The database schema consists of three tables:

1. **ContactForm**: This schema stores information submitted via the contact form.
   - `contact_id` (Primary Key): Unique identifier for each contact form submission.
   - `Name`: Name of the person submitting the contact form.
   - `Email`: Email address of the person submitting the contact form.
   - `Message`: Message submitted via the contact form.

2. **RegisteredUsers**: This schema stores information about registered users.
   - `user_id` (Primary Key): Unique identifier for each user.
   - `FirstName`: First name of the user.
   - `LastName`: Last name of the user.
   - `Email`: Email address of the user.
   - `Password`: Hashed password of the user.
   - `contact_id`: Foreign key referencing the `contact_id` column in the `ContactForm` table.

In the `RegisteredUsers` table, the `contact_id` column is a foreign key that references the `contact_id` column in the `ContactForm` table. This establishes a relationship between the two tables.

3. **booked**: This schema stores information about booked flights.
   - `booking_id` (Primary Key): Unique identifier for each booking.
   - `FirstName`: First name of the passenger.
   - `LastName`: Last name of the passenger.
   - `DepartureCity`: City of departure.
   - `ArrivalCity`: City of arrival.
   - `DepartureDate`: Date of departure.
   - `ReturnDate`: Date of return (if applicable).
   - `Passengers`: Number of passengers.
   - `Class`: Class of the flight (e.g., economy, business).
   - `TripType`: Type of trip (e.g., one-way, round-trip).

## Search Functionality

The application provides a search feature to retrieve bookings based on specific criteria. Users can search for bookings by providing the following parameters:

- `firstName`: First name of the passenger.
- `lastName`: Last name of the passenger.
- `booking_id`: Unique identifier of the booking.

The search function constructs SQL queries dynamically based on the provided parameters. If no parameters are provided, the application returns a 400 Bad Request response indicating that at least one search parameter is required.


## Rationale

- **bcrypt for Password Hashing**: User passwords are hashed using bcrypt before being stored in the database. This ensures that sensitive information is securely stored, reducing the risk of unauthorized access or data breaches. bcrypt is a widely-used and trusted library for password hashing, known for its robust security features.

- **Express Session for User Authentication**: The Express session middleware is used to manage user sessions and store session data securely on the server. This enables the application to authenticate users and maintain their login state across multiple requests, providing a seamless and secure user experience.

- **Express Layouts for Templating**: Express Layouts simplifies the process of creating and managing layout templates for views. It allows for the creation of reusable layout structures that can be applied to multiple views, enhancing code organization and maintainability.

- **Body Parser for Form Data Parsing**: The Body Parser middleware is used to parse incoming request bodies, particularly useful for handling form data submitted by users. It extracts form data and makes it accessible in the request object, facilitating the processing of user input and data validation.

- **Foreign Key Constraint**: The use of foreign key constraints ensures data integrity and maintains referential integrity between related tables. By establishing relationships between the RegisteredUsers and ContactForm tables, the database enforces consistency and prevents orphaned records, enhancing data quality and reliability.

- **Dynamic SQL Queries for Search Functionality**: The search functionality actively constructs SQL queries based on user-provided parameters, enabling flexible and efficient searching of booking records. This approach allows users to retrieve relevant bookings based on specific criteria, enhancing usability and accessibility of the application.

- **SQLite Database**: SQLite was chosen as the database management system due to its simplicity and lightweight nature, making it ideal for small to medium-sized applications like this flight booking system. It offers ACID transactions, relational database capabilities, and requires minimal configuration, making it easy to set up and use.

Example where ACID transactions was used: line 348 in server.js */ updateBookingWithTransaction function, specifically where the transaction begins, SQL queries are executed, and the transaction is committed or rolled back based on the outcome of the operation.*/

<!--// Function to update booking details within a transaction
function updateBookingWithTransaction(bookingId, newData) {
    db.beginTransaction((err, transaction) => {
        if (err) {
            console.error('Error beginning transaction:', err);
            // Handle error appropriately
            return;
        }
        // SQL query to update the booking record
        const sql = `UPDATE booked SET ... WHERE booking_id = ?`;
        // Execute the SQL query within the transaction
        transaction.run(sql, [newData, bookingId], (err) => {
            if (err) {
                console.error('Error updating booking:', err);
                // Rollback the transaction
                transaction.rollback(() => {
                    // Handle rollback
                });
            } else {
                console.log('Booking updated successfully');
                // Commit the transaction
                transaction.commit((err) => {
                    if (err) {
                        console.error('Error committing transaction:', err);
                        // Handle error during commit
                    }
                });
            }
        });
    });
}
-->




