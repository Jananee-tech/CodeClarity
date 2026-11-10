# CodeClarity

**Understand code. Learn smarter.**

CodeClarity is an AI-powered Visual Studio Code extension that helps developers understand selected code through clear, beginner-friendly explanations.

Instead of simply displaying what code does, CodeClarity aims to explain the logic behind it and adapt the explanation based on the complexity of the selected code.

## Features

- **AI-Powered Explanations:** Generates explanations using the Groq API.
- **Adaptive Explanations:** Keeps simple code explanations concise and provides deeper walkthroughs for complex code.
- **Selected Code Display:** Shows the code alongside its explanation.
- **Beginner-Friendly:** Uses simple language to make programming concepts easier to understand.
- **Error Handling:** Provides feedback when the API key is missing or an API request fails.

## Tech Stack

- JavaScript
- Visual Studio Code Extension API
- Groq API
- OpenAI GPT-OSS 20B model (through Groq)
- Node.js

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Jananee-tech/CodeClarity.git
cd CodeClarity
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your API key

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Obtain your API key through the Groq developer platform.

**Important:** Never commit your `.env` file or expose your API key.

### 4. Run the extension

1. Open the project in Visual Studio Code.
2. Press `F5`.
3. A new Extension Development Host window will open.
4. Open a code file and select a snippet.
5. Run **CodeClarity: Explain Selected Code** from the Command Palette.

## Project Structure

```text
CodeClarity/
├── extension.js
├── package.json
├── package-lock.json
├── .gitignore
├── .vscodeignore
└── README.md
```

## Future Improvements

- Improved explanation formatting.
- More robust API error handling.
- Additional programming language support.
- Context-aware code explanations.
- Further usability and performance improvements.

## Author

**Jananee M R**

AI & Data Science Learner | Student Developer

---

*CodeClarity is a learning-focused project built to make understanding code easier for developers.*