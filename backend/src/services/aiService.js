const OpenAI = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");
const { cvSchema, coverLetterSchema } = require("../schemas/cvSchema");

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a structured CV based on user input and job description.
 * @param {string} userText - The messy text or notes provided by the user.
 * @param {string} jobDescription - The target job description.
 * @returns {Promise<object>} - The structured CV JSON.
 */
async function generateCVAndCoverLetter(userText, jobDescription, tone = 'Professional', length = 'Short') {

    const toneInstructions = {
        'Professional': "Use formal, corporate vocabulary. Avoid slang or overly casual flowery language.",
        'Standard': "Use clear, standard professional English. Balanced and safe.",
        'Impactful': "Use strong, dynamic action verbs. Focus on results and achievements. Be bold."
    };

    const lengthInstructions = {
        'Short': "Keep the output CONCISE. Optimize for a strict 1-page layout. Limit bullet points to the top 3-4 per role. Be ruthless with cutting fluff.",
        'Detailed': "Provide comprehensive details. You can include up to 6 bullet points per role if relevant. Optimize for a thorough 2-page layout."
    };

    const prompt = `
    You are an expert CV writer.
    
    Here is the candidate's unstructured experience (Master CV):
    """${userText}"""

    Here is the Target Job Description:
    """${jobDescription}"""
    
    Task:
    1. Analyze the User's Master CV to extract the truth of their experience.
    2. REWRITE the "Summary" and "Experience" bullet points to specifically target the keywords and requirements in the Job Description.
    
    3. **HARVARD STYLE BULLETS ENFORCEMENT**:
       - Each bullet MUST start with a strong Action Verb (e.g., Led, Engineered, Optimized).
       - Each bullet MUST contain a verifiable RESULT or METRIC if possible (e.g., "reduced latency by 20%", "managed $50k budget").
       - Format: [Action Verb] [Task/Context] resulting in [Quantifiable Outcome].
       - LIMIT: Strict maximum of 4-5 high-impact bullets per role. Remove weak points.

    4. **SKILLS CATEGORIZATION**:
       - Group skills into logical categories (e.g., "Programming Languages", "Frameworks & Libraries", "Cloud & DevOps", "Soft Skills").
       
    5. **EDUCATION & EXTRAS**:
       - Extract GPA, Honors, and relevant Coursework if present.
       - Extract Certifications, Awards, and Languages into their respective sections.

    6. CRITICAL: DO NOT INVENT FACTS. Do not add companies, dates, or degrees that are not in the Master CV.
    7. CRITICAL: Scoring & Analysis. Calculate a "Match Score" (0-100) based on how well the user's *actual* experience fits the JD.
    8. STYLE CONTROL - TONE: ${toneInstructions[tone] || toneInstructions['Professional']}
    9. STYLE CONTROL - LENGTH: ${lengthInstructions[length] || lengthInstructions['Short']}
    10. Return strict JSON matching the schema, including the \`analysis\` section.
    11. CRITICAL: Ensure the content is optimized for ATS parsing.
  `;

    try {
        const completion = await openai.beta.chat.completions.parse({
            model: "gpt-4o-mini", // Switch to Mini for better availability/speed
            messages: [
                { role: "system", content: "You are a helpful assistant that generates structured resumes." },
                { role: "user", content: prompt },
            ],
            response_format: zodResponseFormat(cvSchema, "cv"),
        });

        return completion.choices[0].message.parsed;
    } catch (error) {
        console.error("Error generating CV:", error);
        throw error; // Propagate original error to server.js
    }
}

/**
 * Generates a structured Cover Letter.
 * @param {object} cvData - The structured CV data (for context).
 * @param {string} jobDescription - The target job description.
 * @returns {Promise<object>} - The structured Cover Letter JSON.
 */
async function generateCoverLetter(cvData, jobDescription) {
    const prompt = `
    Write a compelling cover letter for:
    User: ${cvData.personalInfo.fullName}
    Role/Company Context: Use the job description below.
    
    Job Description:
    ${jobDescription}
    
    Key Highlights from CV:
    ${JSON.stringify(cvData.experience.slice(0, 2))} (Top 2 roles)
    
    Task:
    1. Write a professional cover letter.
    2. Hook the reader in the first paragraph.
    3. Connect the user's past experience (from CV) to the job requirements.
    4. Keep it concise (3-4 paragraphs max).
  `;

    try {
        const completion = await openai.beta.chat.completions.parse({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert career coach writing a cover letter." },
                { role: "user", content: prompt },
            ],
            response_format: zodResponseFormat(coverLetterSchema, "cover_letter"),
        });

        return completion.choices[0].message.parsed;
    } catch (error) {
        console.error("Error generating Cover Letter:", error);
        throw error; // Propagate original error
    }
}

module.exports = { generateCVAndCoverLetter, generateCoverLetter };
