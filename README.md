# 🌊 Marine Learning Hub

A modern, AI-powered single-page application designed to help marine science students log their daily learnings, manage study topics, and generate interactive quizzes and flashcards automatically.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

*   **🔐 Secure User Authentication:** Full login/signup functionality. All user data is protected and private.
*   **✍️ Daily Learning Logs:** A dedicated page to log what you learned in natural language, with the option to upload reference images for specimens.
*   **🗂️ Dynamic Content Management:** A powerful dashboard to create, read, edit, and delete your custom `Departments` and `Modules` of study.
*   **🧠 AI-Powered Flashcards:** Automatically generate a comprehensive set of study flashcards from the combined knowledge of an entire module with a single click.
*   **🐠 "Guess the Specimen" Quizzes:** AI generates multiple-choice quizzes from your image uploads, helping you practice visual identification.
*   **🎨 Colorful & Interactive UI:** Built with Tailwind CSS for a professional, highly interactive, and responsive user experience.

## 📸 Screenshots

*(**Action Required:** Replace these placeholders with actual screenshots of your app!)*

| Dashboard                                   | Learn Today Page                            | Flashcards View                             |
| ------------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| *[Screenshot of your Dashboard page here]* | *[Screenshot of your Learn Today page here]* | *[Screenshot of your Flashcards page here]* |

| Specimen Quiz                               |
| ------------------------------------------- |
| *[Screenshot of your Specimen Quiz here]*  |

## 🛠️ Tech Stack

*   **Frontend:** [React](https://reactjs.org/) (with Vite)
*   **Backend & Database:** [Supabase](https://supabase.io/)
    *   PostgreSQL Database
    *   User Authentication
    *   Object Storage
    *   Edge Functions (Deno runtime)
*   **AI:** [Google Gemini API](https://makersuite.google.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Routing:** [React Router DOM](https://reactrouter.com/)

## 🚀 Getting Started

Follow these instructions to get a local copy up and running on your machine for development and testing purposes.

### Prerequisites

You will need the following software installed on your computer:
*   [Git](https://git-scm.com/downloads)
*   [Node.js](https://nodejs.org/en/) (which includes `npm`)
*   A free [Supabase](https://app.supabase.com) account
*   A [Google Gemini API Key](https://makersuite.google.com/)

### Installation & Setup

1.  **Clone the repository** to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    cd YOUR_REPO_NAME
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up your Supabase project:**
    *   Create a new project on your Supabase dashboard.
    *   In your Supabase project, go to `Project Settings > API` and find your **Project URL** and **`anon` public key**.
    *   Go to your `supabaseClient.js` file and replace the placeholder values with your URL and key.
    *   **(Important!)** In the Supabase SQL Editor, run the SQL commands to create the `departments`, `modules`, and `learning_logs` tables with their respective `user_id` columns and foreign key relationships with `CASCADE` on delete.

4.  **Link your local project to Supabase:**
    *   Log in to the Supabase CLI:
        ```bash
        npx supabase login
        ```
    *   Link your project (get the Project REF from your Supabase dashboard URL):
        ```bash
        npx supabase link --project-ref YOUR_PROJECT_REF
        ```

5.  **Set up the Gemini API Key:**
    *   This project uses a secret key for the AI service. Set it using the Supabase CLI (this will not expose the key in your code):
        ```bash
        npx supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```

6.  **Deploy Edge Functions:**
    *   Push the server-side AI logic to Supabase:
        ```bash
        npx supabase functions deploy flashcard-generator
        npx supabase functions deploy quiz-generator
        ```

7.  **Run the application:**
    ```bash
    npm run dev
    ```
    Your application should now be running locally on `http://localhost:5173`.

## 💡 Future Enhancements

*   **Spaced Repetition System (SRS):** Implement an algorithm (like SM-2) to schedule flashcard reviews for optimal learning.
*   **Progress Analytics:** Create a visual dashboard to track learning streaks, quiz scores, and module mastery.
*   **Public/Shared Decks:** Allow users to share their flashcard decks with others.
*   **More Quiz Types:** Add "fill-in-the-blank" or "type the answer" quizzes.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by Ashfak.