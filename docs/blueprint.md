# **App Name**: IGCSE Gemini Generator

## Core Features:

- Question Generation: Generates IGCSE-style exam questions (MCQ and theory) using the Gemini API, tailored to Mathematics, Biology, Physics, and Chemistry.
- Forces Focus (Physics): Prioritizes question generation on forces for Physics, including Newton’s laws and resultant force concepts, acting as a configuration tool.
- Diagram Generation: Generates simple diagrams (e.g., force arrows, cell outlines) using Matplotlib, with text descriptions for complex visuals.
- Subject Selection: Allows users to select a subject (Mathematics, Biology, Physics, Chemistry) for question generation.
- Question Type Selection: Allows users to select the question type (MCQ or theory).
- Number of Questions Input: Allows users to specify the number of questions (1-10) to generate.
- Gemini API Key Input: Provides a field in the Streamlit sidebar for users to enter their Gemini API key.

## Style Guidelines:

- Primary color: Vibrant blue (#29ABE2) to evoke a sense of knowledge and confidence.
- Background color: Light gray (#F0F2F6), for a clean and neutral backdrop.
- Accent color: Green (#90EE90) to highlight important information or interactive elements, drawing focus where needed.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text. The code font will be 'Source Code Pro' (monospace).
- Use clear and concise icons to represent different subjects (e.g., a calculator for math, a leaf for biology, gears for physics, a flask for chemistry).
- A clean, user-friendly layout with clear sections for input (subject, question type, number of questions, API key) and output (generated questions with diagrams).
- Subtle animations for feedback (e.g., loading spinner while questions are being generated) to improve user experience.