const express = require('express');
const session = require('express-session');
const app = express();
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require('body-parser');
const morgan = require('morgan'); // for logging
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const plaintextPassword = 'password123';
const PORT = 3000;

// Importing the v4 function from the uuid library to generate a unique secret key
const { v4: uuidv4 } = require('uuid');

// Middleware to log requests
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});


// Session configuration (will update to make sure user isn't timed out randomly)
app.use(session({
    secret: 'cad22c14-0b2d-49c7-8dfe-90337a0362fe',
    resave: false,
    saveUninitialized: false,
    name: 'my-session-id', 
    cookie: { 
      secure: false, 
      httpOnly: true, 
      maxAge: 60000, // Set cookie expiration time to 1 minute
      path: '/', // The path for the cookie
      sameSite: 'strict' // Protection against CSRF attacks
}
})
);

// Generating a secret key using the uuidv4 function
const secretKey = uuidv4();
console.log('Secret Key:', secretKey);

app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.get('/', (req, res) => {
    res.render('index'); 
});

app.get('/contact', (req, res) => {
    res.render('contact-us'); 
});

app.get('/signup', (req, res) => {
    res.render('signup'); 
});

app.get('/login', (req, res) => {
    res.render('login'); 
});

app.get('/about', (req, res) => {
    res.render('about'); 
});

app.get('/tracker', (req, res) => {
    res.render('tracker'); 
});

app.get('/travel', (req, res) => {
    res.render('travel'); 
});

//invalid route
app.get('/deals-service', (req, res) => {  
});

// Route to render the page for updating user profile
app.get('/updateprofile', (req, res) => {
    res.render('crud/updateprofile'); 
});

// Route to render the search form page
app.get('/searchform', (req, res) => {
    res.render('crud/searchform'); 
});

// Define the route for editing bookings
app.get('/editbooking', (req, res) => {
    // Render the edit booking page
    res.render('crud/editbooking'); 
});

// Route to render the search form page
app.get('/checkin', (req, res) => {
    res.render('crud/checkin');
});

// Route to render the search form page
app.get('/flightstatus', (req, res) => {
    res.render('crud/flightstatus'); 
});

// Route to render the search form page
app.get('/mybookings', (req, res) => {
    res.render('crud/mybookings'); 
});

//database connection
const dbPath = path.join(__dirname, 'data', 'flightdb.sqlite3');

const db = new sqlite3.Database(dbPath, ':memory', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database');
    }
});

// Create contacts table if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS ContactForm (contact_id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Email TEXT, Message TEXT)', (err) => {
    if (err) {
        console.log('Table already exists');
    } else {
        // Create index on the contact_id column
        db.run('CREATE INDEX IF NOT EXISTS idx_contact_id ON ContactForm (contact_id)', (err) => {
            if (err) {
                console.log('Error creating index:', err.message);
            } else {
                console.log('Index created on contact_id for ContactForm table');
            }
        });
        console.log('Table created');
    }
});

// Function to add a contact to the contacts table
function addContact(name, email, message) {
    return new Promise((resolve, reject) => {
        const insert = 'INSERT INTO ContactForm (name, email, message) VALUES (?, ?, ?)';
        // Error handling for database operations
        db.run(insert, [name, email, message], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log(`A contact has been inserted with contact_id ${this.lastID}`);
                resolve(); 
            }
        });
    });
}

// Route to add a new contact
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    // Validate inputs
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    function isValidEmail(email) {
        // Regular expression to validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Additional email validation
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

   // Add contact to the database
   addContact(name, email, message)
   .then(() => {
       // Render the form-submitted view with success message
       res.render('form-submitted', { name, email, message });
   })
   .catch(err => {
       console.error('Failed to add contact:', err);
       res.status(500).json({ error: 'Failed to add contact' });
   });
});

// Route to render the contacts page
app.get('/contacts', (req, res) => {
    const sql = 'SELECT * FROM ContactForm';
    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve contacts' });
        }
        res.render('contacts', { contacts: rows });
    });
});

// Define routes
app.get('/form-submitted', (req, res) => {
    res.render('form-submitted'); 
});

// Create bookings table if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS booked (booking_id INTEGER PRIMARY KEY AUTOINCREMENT, FirstName TEXT, LastName TEXT , DepartureCity TEXT, ArrivalCity TEXT, DepartureDate DATE, ReturnDate DATE, Passengers INTEGER, Class TEXT, TripType TEXT)', (err) => {
    if (err) {
        console.log('Error creating table:', err.message);
    } else {
        // Create index on the booking_id column with error handling for database operations
        db.run('CREATE INDEX IF NOT EXISTS idx_booking_id ON booked (booking_id)', (err) => {
            if (err) {
                console.log('Error creating index:', err.message);
            } else {
                console.log('Index created on booking_id');
            }
        });
        console.log('Table created or already exists');
    }
});

// Function to add a booking to the booked table
function addBooking(firstName, lastName, departureCity, arrivalCity, departureDate, returnDate, passengers, flightClass, tripType) {
    return new Promise((resolve, reject) => {
        const insert = 'INSERT INTO booked (FirstName, LastName, DepartureCity, ArrivalCity, DepartureDate, ReturnDate, Passengers, Class, TripType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        // Error handling for database operations
        db.run(insert, [firstName, lastName, departureCity, arrivalCity, departureDate, returnDate, passengers, flightClass, tripType], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log(`A booking has been inserted with booking_id ${this.lastID}`);
                resolve(this.lastID); 
            }
        });
    });
}

// Route to handle booking form submission
app.post('/booking', (req, res) => {
    // Extract data from request body
    const { firstName, lastName, departureCity, arrivalCity, departureDate, returnDate, passengers, class: flightClass, tripType } = req.body;
  
     // Perform input validation
     if (!firstName || !lastName || !departureCity || !arrivalCity || !departureDate || !returnDate || !passengers || !flightClass || !tripType ) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    // Insert data into the bookings table
    addBooking(firstName, lastName, departureCity, arrivalCity, departureDate, returnDate, passengers, flightClass, tripType)
    .then(bookingId => {
          // Set session variable to store booking details
          req.session.bookingDetails = {
            firstName,
            lastName,
            departureCity,
            arrivalCity,
            departureDate,
            returnDate,
            passengers,
            flightClass,
            tripType,
            bookingId 
        };
        // Redirect to the confirmation page
        res.redirect('/confirmation');
    })
    .catch(err => {
        console.error('Error inserting data:', err);
        res.status(500).send('Internal Server Error');
    });
});

// Route for confirmation page for booking
app.get('/confirmation', (req, res) => {
    // Check if booking details session variable is set
    const bookingDetails = req.session.bookingDetails;
    if (!bookingDetails) {
        // Redirect to the home page if booking details are not found
        res.redirect('/');
        return;
    }
    // Render the confirmation page with booking details
    res.render('confirmation', {
        firstName: bookingDetails.firstName,
        lastName: bookingDetails.lastName,
        departureCity: bookingDetails.departureCity,
        arrivalCity: bookingDetails.arrivalCity,
        departureDate: bookingDetails.departureDate,
        returnDate: bookingDetails.returnDate,
        passengers: bookingDetails.passengers,
        flightClass: bookingDetails.flightClass,
        tripType: bookingDetails.tripType,
        bookingId: bookingDetails.bookingId
    });
});

// Route to handle search for a booking by ID 
app.get('/editsearch', (req, res) => {
    const bookingId = req.query.booking_id;

    // SQL query to retrieve booking data based on booking ID
    const sql = `SELECT * FROM booked WHERE booking_id = ?`;

    // Execute the query with the booking ID parameter
    db.get(sql, [bookingId], (err, row) => {
        if (err) {
            console.error('Error retrieving booking data:', err);
            res.status(500).send('An error occurred while fetching booking data');
        } else {
            if (row) {
                // Send the retrieved booking data to the client-side
                res.json(row);
            } else {
                // Booking not found, send appropriate response
                res.status(404).send('Booking not found');
            }
        }
    });
});

// Route to handle updating a booking
app.post('/updateBooking', (req, res) => {
    // Extract data from the request body
    const { bookingId, firstName, lastName, departureCity, arrivalCity, departureDate, returnDate, passengers, flightClass, tripType } = req.body;

    // Check if at least one field for updating is provided
    if (!bookingId || (!firstName && !lastName && !departureCity && !arrivalCity && !departureDate && !returnDate && !passengers && !flightClass && !tripType)) {
        return res.status(400).json({ error: 'At least one field for updating is required' });
    }
    // Construct the SQL query to update the booking
    const sql = `UPDATE booked SET FirstName = COALESCE(?, FirstName), LastName = COALESCE(?, LastName), DepartureCity = COALESCE(?, DepartureCity), ArrivalCity = COALESCE(?, ArrivalCity),
                 DepartureDate = COALESCE(?, DepartureDate), ReturnDate = COALESCE(?, ReturnDate), Passengers = COALESCE(?, Passengers), Class = COALESCE(?, Class), TripType = COALESCE(?, TripType)
                 WHERE booking_id = ?`;
    // Execute the SQL query with parameters and error handling
    db.run(sql, [firstName, lastName, departureCity, arrivalCity, departureDate, returnDate, passengers, flightClass, tripType, bookingId], (err) => {
        if (err) {
            console.error('Error updating booking:', err);
            return res.status(500).json({ error: 'Internal server error' });
        } else {
            // Redirect to the updatesuccess page
            return res.redirect('/updatesuccess');
        }
    });
});

// Function to update booking details within a transaction
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

// Route to handle rendering the update successful page
app.get('/updatesuccess', (req, res) => {
    const successMessage = "Booking updated successfully";
    res.render('crud/updatesuccess', { successMessage }); 
});

// Route to serve the search form page
app.get('/searchform', (req, res) => {
    res.send('Search form page.');
});


// Define the endpoint to handle DELETE requests to delete a booking
app.delete('/deleteBooking/:bookingId', (req, res) => {
    const bookingId = req.params.bookingId;

    // Validate bookingId to ensure it's a positive integer
    if (!/^\d+$/.test(bookingId)) {
        return res.status(400).send('Invalid booking ID');
    }

    // Execute the SQL command to delete the booking from the database
    const sql = `DELETE FROM booked WHERE booking_id = ?`;
    db.run(sql, [bookingId], (err) => {
        if (err) {
    // If an error occurs during the database operation, log the error and send an internal server error response
            console.error('Error deleting booking:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
 // If the database operation is successful, send a success response indicating that the booking was deleted
            res.status(200).json({ message: 'Booking deleted successfully' });
        }
    });
});

//Registered Users Table
db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run(`CREATE TABLE IF NOT EXISTS RegisteredUsers (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        FirstName TEXT,
        LastName TEXT,
        Email TEXT UNIQUE,
        Password VARCHAR(255),
        contact_id INTEGER,
        FOREIGN KEY (contact_id) REFERENCES ContactForm(id)
    )`, (err) => {
        if (err) {
            console.log('Error creating table:', err.message);
            db.run('ROLLBACK');
        } else {
            db.run('CREATE INDEX IF NOT EXISTS idx_contact_id ON RegisteredUsers (contact_id)', (err) => {
                if (err) {
                    console.log('Error creating index:', err.message);
                    db.run('ROLLBACK');
                } else {
                    console.log('Index created on contact_id for RegisteredUsers table');
                    db.run('COMMIT');
                }
            });
            console.log('Table created or already exists');
        }
    });
});


// Function to retrieve user by email from the database
async function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM RegisteredUsers WHERE Email = ?', [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Route to handle search
app.get('/search', (req, res) => {
    const { firstName, lastName, booking_id } = req.query;

    // Validate inputs
    if (!firstName && !lastName && !booking_id) {
        return res.status(400).send('At least one search parameter is required');
    }
    // Construct SQL query based on search parameters
    let sql = 'SELECT * FROM booked WHERE 1=1'; // 1=1 is used as a placeholder to start the query
    const params = []; 

    // Add conditions for each search parameter if they are provided
    if (firstName) {
        sql += ` AND FirstName = ?`;
        params.push(firstName); 
    }
    if (lastName) {
        sql += ` AND LastName = ?`;
        params.push(lastName); 
    }
    if (booking_id) {
        // Validate booking_id to ensure it's a positive integer
        if (!/^\d+$/.test(booking_id)) {
            return res.status(400).send('Invalid booking ID');
        }
        sql += ` AND booking_id = ?`;
        params.push(booking_id);
    }
    
    // Execute the SQL query with parameters
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error searching bookings:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Render the search results page with the retrieved bookings
        res.render('crud/searchresults', { bookings: rows });
    });
});

// Route to handle searching for results
app.post('/searchresults', (req, res) => {
   
    // Access the search criteria using req.body
    console.log('Search criteria:', req.body);
    // Respond with search results or appropriate response
    res.send('Search results.');
});

// Signup Route
app.post('/signup', async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      // Perform input validation
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).send('Please provide all required fields');
      }
      
      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Save the user to the database
      await saveUser(firstName, lastName, email, hashedPassword);
      
      // Set user session
      req.session.user = { firstName, lastName, email };
      
      // Redirect to profile page
      res.redirect('/registered');

    } catch (err) {
        console.error('An error occurred:', err);
        res.status(500).send('An error occurred. Please try again later.');
    }
  });

 // Route for /registered
app.get('/registered', (req, res) => {
    const user = req.session.user;
    res.render('registered', { user });
});

  // Function to save a user to the database
  function saveUser(firstName, lastName, email, password) {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO RegisteredUsers (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)', [firstName, lastName, email, password], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    // Check if user session exists
    if (req.session.user) {
        // User is authenticated, proceed to next middleware or route handler
        next();
    } else {
        // User is not authenticated, redirect to login page
        res.redirect('/login');
    }
}

// Login user 
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Query the database to find the user by email
        db.get("SELECT * FROM RegisteredUsers WHERE Email = ?", [email], async (err, user) => {
            // Error handling for database operations
            if (err) {
                console.error('Error finding user:', err);
                return res.status(500).send('Internal server error.');
            }

            if (!user) {
                return res.status(404).send("User not found. Please check your email.");
            }
              // Check if user data is incomplete
            if (!user || !user.FirstName || !user.LastName || !user.Email) {
                return res.status(500).send('Error: User data incomplete.');
            }

            // Compare the hashed password from the database with the plaintext password
            const isPasswordMatch = await bcrypt.compare(password, user.Password); 

            if (!isPasswordMatch) {
                return res.send("Invalid password");
            }

            // Set user session
            req.session.user = { firstName: user.FirstName, lastName: user.LastName, email: user.Email };
            
            // Redirect to the profile page
            res.redirect('/profile');
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Internal server error.');
    }
});

// Profile route
app.get('/profile', isAuthenticated, (req, res) => {
    const user = req.session.user;
    // Ensure user object exists and contains firstName and lastName fields
    if (user && user.firstName && user.lastName) {
        // Render the profile page with the user's name
        res.render('profile', { 
            welcomeMessage: `Welcome to your profile, ${user.firstName} ${user.lastName}!`,
            user: req.session.user 
        });
    } else {
        // If user object is incomplete, render an error or redirect to the login page
        res.status(500).send('Error: User data incomplete.');
    }
});


// Protected route example
app.get('/protected', isAuthenticated, (req, res) => {
    res.send('This is a protected route');
});
  // Handle logout
  app.post("/logout", (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal server error.');
        }
        // Redirect the user to the login page or any other page
        res.redirect('/login');
    });
  });
  
// Close the database connection when the application shuts down
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
            process.exit(0); // Exit the application
        }
});
});

// Error handling for invalid routes
app.use((req, res, next) => {
    res.status(404).send("Sorry, the page you are looking for does not exist.");
});



// Start the server
const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(`App listening on http://localhost:${PORT}`);
});
