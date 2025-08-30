AI Programmer: Chat-to-Code Playground
====================================

Split-view app where you chat on the left and get editable, syntax-highlighted code on the right. The AI responds only with raw code. Powered by Gemini.

Setup
-----

1. Install dependencies:

```bash
npm i
```

2. Configure environment:

Create a `.env.local` at the project root:

```bash
GEMINI_API_KEY=your_api_key_here
```

Obtain an API key from Google AI Studio.

3. Run the app:

```bash
npm run dev
```

Usage
-----

- Type your request in the Chat panel and press Enter or click Send.
- The right panel shows only the generated code. You can edit it directly.
- Use the language selector to hint the desired language for highlighting.

Notes
-----

- The AI is instructed to return only code (no markdown fences or text). The API additionally strips code fences if present.
- If an error occurs, the editor shows a comment with the error message.
