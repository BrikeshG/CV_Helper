require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { generateCVAndCoverLetter, generateCoverLetter } = require("./services/aiService");
const { generatePDF } = require("./services/pdfService");
const { generateDOCX } = require("./services/docxService");

const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// Configure Multer for memory storage (we process immediately, no need to save to disk yet)
const upload = multer({ storage: multer.memoryStorage() });

const DATA_DIR = path.join(__dirname, '../data');
const CV_FILE = path.join(DATA_DIR, 'master-cv.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());

// ROUTE: Extract Text from File (PDF/DOCX/TXT)
app.post('/api/extract-text', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        let extractedText = "";
        const mimeType = req.file.mimetype;
        const buffer = req.file.buffer;

        if (mimeType === 'application/pdf') {
            const data = await pdf(buffer);
            extractedText = data.text;
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: buffer });
            extractedText = result.value;
        } else if (mimeType === 'text/plain') {
            extractedText = buffer.toString('utf8');
        } else {
            return res.status(400).json({ error: "Unsupported file type. Use PDF, DOCX, or TXT." });
        }

        res.json({ text: extractedText.trim() });
    } catch (error) {
        console.error("Text Extraction Error:", error);
        res.status(500).json({ error: "Failed to parse file content." });
    }
});

// ROUTE: Save Master CV

// ROUTE: Save Master CV
app.post('/api/master-cv', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    try {
        fs.writeFileSync(CV_FILE, JSON.stringify({ text, updatedAt: new Date() }));
        res.json({ success: true, message: "Master CV saved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save Master CV" });
    }
});

// ROUTE: Get Master CV
app.get('/api/master-cv', (req, res) => {
    try {
        if (!fs.existsSync(CV_FILE)) {
            return res.json({ text: "" });
        }
        const data = JSON.parse(fs.readFileSync(CV_FILE, 'utf8'));
        res.json({ text: data.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve Master CV" });
    }
});

// ROUTE: Generate CV JSON
app.post('/api/generate-cv', async (req, res) => {
    try {
        const { userText, jobDescription, tone, length } = req.body;
        if (!userText || !jobDescription) {
            return res.status(400).json({ error: 'User Text and Job Description are required' });
        }

        const result = await generateCVAndCoverLetter(userText, jobDescription, tone, length);
        // result contains { cvData, coverLetterData (optional) }

        res.json({ cvData: result.cvData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate CV' });
    }
});

// ROUTE: Generate Cover Letter JSON (Optional separate endpoint if needed)
app.post("/api/generate-cover-letter", async (req, res) => {
    const { cvData, jobDescription } = req.body;

    if (!cvData || !jobDescription) {
        return res.status(400).json({ error: "CV Data and Job Description are required" });
    }

    try {
        const coverLetterData = await generateCoverLetter(cvData, jobDescription);
        res.json({ coverLetterData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ROUTE: Download PDF
app.post("/api/generate-pdf", async (req, res) => {
    const { htmlContent } = req.body;

    if (!htmlContent) {
        return res.status(400).json({ error: "HTML content is required" });
    }

    try {
        const pdfBuffer = await generatePDF(htmlContent);
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=cv.pdf",
            "Content-Length": pdfBuffer.length,
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

// ROUTE: Download DOCX
app.post("/api/generate-docx", async (req, res) => {
    const { cvData } = req.body;

    if (!cvData) {
        return res.status(400).json({ error: "CV Data is required" });
    }

    try {
        const docxBuffer = await generateDOCX(cvData);
        res.set({
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": "attachment; filename=cv_optimized.docx",
            "Content-Length": docxBuffer.length,
        });
        res.send(docxBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate DOCX" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
