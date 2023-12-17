# Langbuddy - English Web App powered by ChatGPT

## Introduction

Langbuddy is a web application tailored for English as a Foreign Language (EFL) learners. Leveraging the capabilities of ChatGPT, LangBuddy aims to enrich the English
learning experience and facilitate effective study journal management. The chatbots integrate translation, voice recognition, and voice synthesis functions with a learning progress monitoring system using the spaced repetition strategy.

Please find the introduction video here: https://youtu.be/dorQoczBExk

## Features

**Study Plan System**: The user can create study items with tailored schedules.

**Review System with spaced repetition strategy**: When the study items are finished, they can be transformed into review items in a selected spaced repetition pattern to consolidate the learning outcome.

**Chatbots with translation and voice function**: Four chatbots powered by ChatGPT are built with translation, voice recognition and voice synthesis functions.

**Integration among study systems and chatbots**: The above three systems are integrated seamlessly. The study item can be transferred to review items with a selected pattern. Furthermore, there is another learning area which gives users opportunities to view the study task and review tasks scheduled for today and interact with the Chatbots at the same time. The chat content can also be added to the review systems when needed.

### Prerequisites

- **npm**

  - Install the latest version of npm globally:
    ```sh
    npm install npm@latest -g
    ```

- **PostgreSQL**

  - Ensure PostgreSQL is installed and running on your machine.

- **You also need the OpenAI API Key, Azure translator API key and Azure speech synthesis API key.**

### Installation

1. **Clone the Repository**

   - Use the following command to clone the repo:
     ```sh
     git clone https://github.com/TianshengC/Langbuddy.git
     ```

2. **Install NPM Packages**

   - Install npm packages in both the frontend and backend folders:
     ```sh
     cd frontend
     npm install
     cd ../backend
     npm install
     ```

3. **Create .env Files**

   - Create `.env` files in both the frontend and backend folders.

4. **Set Up Environment Variables in Backend**

   - In the backend `.env` file, set the following variables:

     ````sh
     PORT=8000
     DB_USERNAME=postgres
     DB_PASSWORD=yourpassword
     HOST=localhost
     DB_PORT=5432
     JWT_SECRET=yoursecret
     NODE_ENV=development
     OPENAI_API_KEY= yourkey
     TRANSLATOR_API_KEY= yourkey
     SYNTHESIS_API_KEY= yourkey
         ```
     ````

   - In the frontend `.env` file, set the following variables:

     ```sh
     REACT_APP_BACKEND_URL=http://localhost:8000
     ```

   - Adjust these variables based on your setting.

### Running the Project Locally

To start the project:

1. **Frontend**

   - In the frontend directory, run:
     ```sh
     npm start
     ```

2. **Backend**

   - In the backend directory, run:
     ```sh
     npm start
     ```

3. **Access the App**
   - Open your browser and go to:
     ```
     http://localhost:3000/
     ```

To stop the project:

- Use `Ctrl + C` in the terminal.

## Tech Stack

To develop the Langbuddy app, the following stack of technologies are used:

## Frontend Technologies

- [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
- [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [React](https://reactjs.org/)

## Backend Technologies

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)

## APIs Used

- [OpenAI API](https://openai.com/api/)
- [Azure Translation API](https://azure.microsoft.com/en-us/services/cognitive-services/translator/)
- [Azure Text-to-Voice API](https://azure.microsoft.com/en-us/services/cognitive-services/text-to-speech/)

## Deployment

- Not Deployment yet. But you can run locally :)

## Future Enhancements

- **Assistant API**: Because OpenAI has announced the new Assistant API in November 2023 which may be more suitable for this project. I am investigating how this change can improve the performance of chatbots.
- **User Experiences**: Some of the user experiences can be improved including pagination, displaying articles, account settings and etc..
