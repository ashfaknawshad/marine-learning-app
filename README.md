# 🌊 Marine Learning Hub

A modern, AI-powered single-page application designed to help marine science students log their daily learnings, manage study topics, and generate interactive quizzes and flashcards automatically.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Marine Learning Hub Screenshot](https://i.imgur.com/7HkY4eA.png)

## ✨ Features

*   **🔐 Full User Authentication:** Secure sign-up/sign-in with email verification.
*   **👤 Complete Profile System:** Users can manage their full name, bio, and upload a custom avatar.
*   **🎨 Light & Dark Mode:** A seamless, persistent light and dark theme is available across the entire application.
*   **✍️ Daily Learning Logs:** A dedicated page to log what you learned, with the option to upload reference images for specimens.
*   **🗂️ Dynamic Content Management:** A powerful dashboard to create, read, edit, and delete your custom `Departments` and `Modules` of study.
*   **🧠 AI-Powered Flashcards:** Automatically generate a set of study flashcards from an entire module's knowledge with a single click.
*   **🐠 AI Specimen Quizzes:** Generates multiple-choice quizzes from your image uploads to practice visual identification.
*   **🔒 Secure Account Deletion:** Users can permanently delete their account and all associated data.

## 🛠️ Tech Stack

*   **Frontend:** [React](https://reactjs.org/) (with Vite)
*   **State Management:** [React Context API](https://reactjs.org/docs/context.html)
*   **Backend & Database:** [Supabase](https://supabase.io/)
    *   PostgreSQL Database & User Authentication
    *   Object Storage (for images and avatars)
    *   Edge Functions (Deno runtime)
*   **AI:** [Google Gemini API](https://makersuite.google.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Routing:** [React Router DOM](https://reactrouter.com/)

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

*   [Git](https://git-scm.com/downloads)
*   [Node.js](https://nodejs.org/en/) (which includes `npm`)
*   A free [Supabase](https://app.supabase.com) account
*   A [Google Gemini API Key](https://makersuite.google.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ashfaknawshad/marine-learning-app.git
    cd marine-learning-app
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up Local Environment Variables:**
    *   Create a new file named `.env.local` in the project's root directory.
    *   Add your Supabase Project URL and `anon` key to this file. Vite requires the `VITE_` prefix for these variables to be exposed to the browser.
    ```.env.local
    VITE_SUPABASE_URL=https://your-project-url.supabase.co
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Set up Supabase Backend:**
    *   In your Supabase project's SQL Editor, run the necessary SQL commands to create the `profiles`, `departments`, `modules`, and `learning_logs` tables.
    *   Set up your Storage buckets for `avatars` and `learning-images`.
    *   Set up the database trigger that creates a new user profile upon signup.

5.  **Link and Configure Supabase CLI:**
    *   Log in to the Supabase CLI:
        ```bash
        npx supabase login
        ```
    *   Link your project (find your Project REF in your Supabase dashboard URL):
        ```bash
        npx supabase link --project-ref YOUR_PROJECT_REF
        ```
    *   Set your Gemini API key as a secret for your Edge Functions:
        ```bash
        npx supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```

6.  **Deploy Edge Functions:**
    ```bash
    npx supabase functions deploy flashcard-generator
    npx supabase functions deploy quiz-generator
    npx supabase functions deploy delete-user
    ```

7.  **Run the application locally:**
    ```bash
    npm run dev
    ```
    Your application should now be running on `http://localhost:5173`.

## 🚢 Deployment

This application is deployed on **Vercel** with automatic deployments from the `main` branch. For a successful deployment, the following Environment Variables must be set in the Vercel project settings:

*   `VITE_SUPABASE_URL`
*   `VITE_SUPABASE_ANON_KEY`
*   `GEMINI_API_KEY` (if used by Vercel-hosted functions, otherwise it's handled by Supabase secrets)

## 💡 Future Enhancements

*   **Spaced Repetition System (SRS):** Implement an algorithm to schedule flashcard reviews for optimal learning.
*   **Progress Analytics:** A visual dashboard to track learning streaks, quiz scores, and module mastery.
*   **Public/Shared Decks:** Allow users to share their flashcard decks.
*   **More Quiz Types:** Add "fill-in-the-blank" or "type the answer" quizzes.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by Ashfak.