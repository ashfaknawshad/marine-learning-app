# 🌊 Marine Learning Hub

A modern, AI-powered single-page application designed to help marine science students log their daily learnings, manage study topics, and generate interactive study materials automatically using Google's Gemini AI. This project was developed with the assistance of **Google AI Studio**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Marine Learning Hub Screenshot](https://i.imgur.com/7HkY4eA.png)

## ✨ Core Features

*   **🔐 Full User Authentication:** Secure sign-up and sign-in with email and password.
*   **👤 Complete Profile System:** Users can manage their full name, bio, and upload a custom avatar.
*   **✍️ Daily Learning Logs:** A dedicated page to log what you learned today, with the option to upload reference images for specimens.
*   **🗂️ Dynamic Content Management:** A powerful dashboard to create, read, edit, and delete your custom `Departments` and `Modules` of study.
*   **🧠 AI-Powered Flashcards:** Automatically generate a complete set of study flashcards from an entire module's knowledge with a single click.
*   **🐠 AI Specimen Quiz:** Start a dynamic quiz session generated from your image uploads. The app uses AI to create unique, multiple-choice questions to help practice visual identification.
*   **🚀 Optimized Quiz Experience:** All quiz questions are pre-generated upfront for a smooth, uninterrupted study session with no waiting between questions.
*   **🎨 Global Light & Dark Mode:** A seamless, persistent light and dark theme is available across the entire application, including forms and modals.
*   **📱 Fully Responsive Design:** The interface is optimized for a great user experience on both desktop and mobile devices.
*   **🔒 Secure Account Deletion:** Users can permanently delete their account and all associated data with a single action.

---

## 🛠️ Technology Stack

The application is built with a modern, decoupled architecture.

### **Frontend**
*   **Framework:** [React](https://reactjs.org/) (bootstrapped with Vite)
*   **Routing:** [React Router DOM](https://reactrouter.com/)
*   **State Management:** [React Context API](https://reactjs.org/docs/context.html) for theme and user session state.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling and responsiveness.

### **Backend**
*   **Platform:** [Supabase](https://supabase.io/)
*   **Database:** Supabase Postgres for all data storage.
*   **Authentication:** Supabase Auth for managing user sign-up and sessions.
*   **Storage:** Supabase Storage for hosting user avatars and learning log images.
*   **Serverless Functions:** [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (Deno runtime) for all secure, server-side logic.

### **AI Provider**
*   **Model:** [Google Gemini API](https://ai.google.dev/) used via Supabase Edge Functions.
*   **Prototyping & Development:** Prompts and models were tested and refined using [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

*   [Git](https://git-scm.com/downloads)
*   [Node.js](https://nodejs.org/en/) (which includes `npm`)
*   A free [Supabase](https://app.supabase.com) account
*   A [Google Gemini API Key](https://ai.google.dev/pricing)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/marine-learning-app.git
    cd marine-learning-app
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up Local Environment Variables:**
    *   Create a new file named `.env.local` in the project's root directory.
    *   Add your Supabase Project URL and `anon` key. Vite requires the `VITE_` prefix.
    ```.env.local
    VITE_SUPABASE_URL=https://your-project-url.supabase.co
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Set up Supabase Backend:**
    *   In your Supabase project's **SQL Editor**, run the SQL queries needed to create the `profiles`, `departments`, `modules`, and `learning_logs` tables.
    *   In **Storage**, set up your buckets for `avatars` and `learning-images` with the appropriate access policies.
    *   In **Database > Triggers**, set up the database trigger that creates a new user profile upon signup.

5.  **Link and Configure Supabase CLI:**
    *   Log in to the Supabase CLI:
        ```bash
        npx supabase login
        ```
    *   Link your project (find your Project REF in your Supabase dashboard URL):
        ```bash
        npx supabase link --project-ref YOUR_PROJECT_REF
        ```
    *   Set your Gemini API key as a secret for your Edge Functions. This is the secure way to store it.
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

---

## 🚢 Deployment

This application is deployed on **Vercel** with automatic deployments triggered by pushes to the `main` branch. For a successful production deployment, the following Environment Variables must be set in the Vercel project's settings:

*   `VITE_SUPABASE_URL`
*   `VITE_SUPABASE_ANON_KEY`

_Note: The `GEMINI_API_KEY` is not needed in Vercel as it is securely managed and accessed via Supabase secrets within the Edge Functions._

---

## 💡 Future Enhancements

*   **Spaced Repetition System (SRS):** Implement an algorithm to schedule flashcard reviews for optimal learning retention.
*   **Progress Analytics:** A visual dashboard to track learning streaks, quiz scores, and module mastery.
*   **Public/Shared Decks:** Allow users to make their flashcard decks public for others to study.
*   **More Quiz Types:** Add "fill-in-the-blank" or "type the answer" quizzes for more varied practice.

## 📄 License

This project is licensed under the MIT License.

---

## Author

This application was designed and developed by **Ashfak Nawshad**.

- **GitHub**: [@ashfaknawshad](https://github.com/ashfaknawshad)
- **LinkedIn**: [Your Profile URL](https://www.linkedin.com/in/ashfaknawshad/)
- **Portfolio**: [your-portfolio.com](https://your-portfolio.com)