import express from 'express';
import ollama from 'ollama';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Function to read and store the text from a document
const readTxtFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf-8');
};

const getDocumentText = async () => {
    const txtText = readTxtFile('UNZA_CHATBOT.txt');
    return `${txtText}`;
};

// Define a route for the root URL "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.post('/api/ask-query', async (req, res) => {
    const { query } = req.body;

    try {
        const documentText = await getDocumentText();

        // Prepend document text to the query
        const augmentedQuery = `${documentText}\n\nBased on the above information, answer the following question: ${query}`;

        const response = await ollama.chat({
            model: 'llama3.1',
            messages: [{ role: 'user', content: augmentedQuery }],
        });

        res.json({ reply: response.message.content });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
