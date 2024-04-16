# Project Name: Orizon

## Description
[From Basics to Debugging ]

## Installation
To install the dependencies for this project, follow these steps:

1. **Navigate to the Project Directory**: Open your terminal or command prompt and navigate to the directory where the `package.json` file is located.

2. **Install Dependencies**: Run the following command to install the dependencies listed in the `package.json` file:

 - npm install

3. **Wait for Installation to Complete**: Wait for npm to download and install all the required dependencies. This process may take a few moments.

4. **Verify Installation**: Once the installation is complete, verify that the `node_modules` directory has been created in your project directory. This directory contains all the installed dependencies.

By following these steps, you'll be able to install the necessary dependencies for the project.

5. **Start the server**:
node server.js / node --watch server.js

## Github Usage
[Installation:
1. Clone the repository to your local machine: `git clone https://github.com/tashelreddy/orizonairline`
2. Navigate to the project directory: `cd project-directory`
3. Install dependencies: `npm install`
]

## License
This project is licensed under the FlyOrizon License.


                                                                     Implementation Overview

Project Structure
The project follows the Node.js/Express.js framework with EJS templating for HTML content layout. The main components of the project include:
1. Set Up Your Node.js Environment and Express Application:
Node.js: The server-side JavaScript runtime environment. running 'npm init -y' to create package.json. 
Express.js:  Using 'npm install' express to get all node module dependencies in my project.

Server.js: To create the server, in VScode I create a server.js file and imported express.js by adding 'const express = require('express)', called it and defined page routes for the client side.

Watch Server: To start the server to make sure it was running I ran 'node server.js'
EJS: To install ejs I ran the command 'npm install ejs', set it up in the express appplication and Set EJS as the view engine.


2. Develop a Multi-Page Web Application:
Views: EJS templates are used to generate HTML views based on data provided by the server. These templates allow for the inclusion of JavaScript logic directly within the HTML markup.

3. Implement routes
Routes: Express.js routes define the endpoints and handle incoming HTTP requests. Each route corresponds to a specific URL path and HTTP method (GET, USE, POST).

4. Create and Process a User Input Form
Create a form: On the contact page I created a form witht he appropriate input and textarea for user input, also ensured a submit button to allow users to submit.

Handle Form Submission: I set up a form-submitted.ejs file and a route in my application to handle POST requests from the contact form. Using middleware 'body-parser' to parse data from the request body, get the submitted name, email and message from the request processing them as needed.

Display Submitted Information: after processing the form submission on the server-side, a new page was rendered to show confirmation page. The message is rendered in '/contact' 

5. Error Handling and invalid routes: Implement and define a catch route handler using middleware,inside the route I send an error response: 'app.use((req, res, next) => {
    res.status(404).send("Sorry, the page you are looking for does not exist.");
});', next I tested it by causing intentional errors to make sure the page does not exist message would be sent.

6. Introduce a Deliberate Bug or Error: Two errors introduced in the login.ejs file using the form action attribute and the ID attribute for unexpected behaviour. The errors were documented using text file, including details of their inpact. Tools and process for debugging and resolution were described.