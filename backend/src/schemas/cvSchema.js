const { z } = require("zod");

const cvSchema = z.object({
    personalInfo: z.object({
        fullName: z.string().describe("The user's full name"),
        email: z.string().email().describe("The user's email address"),
        phone: z.string().describe("The user's phone number").optional(),
        linkedin: z.string().describe("LinkedIn profile URL").optional(),
        website: z.string().describe("Personal website or portfolio URL").optional(),
        location: z.string().describe("City, Country").optional(),
    }),
    summary: z.string().describe("A professional summary (2-3 sentences) tailored to the job description."),

    // Skills V2: Categorized
    skills: z.array(z.object({
        category: z.string().describe("e.g. 'Languages', 'Frameworks', 'Tools'"),
        items: z.array(z.string()).describe("List of skills in this category")
    })).describe("Technical and soft skills grouped by category."),

    experience: z.array(
        z.object({
            company: z.string(),
            role: z.string(),
            location: z.string().optional(),
            startDate: z.string().describe("Format: MMM YYYY"),
            endDate: z.string().describe("Format: MMM YYYY or 'Present'"),
            description: z.array(z.string()).max(5).describe("3-5 bullet points focusing on impact. Start with heavy action verbs."),
        })
    ).describe("Professional experience in reverse chronological order."),

    // Education V2: Detailed
    education: z.array(
        z.object({
            institution: z.string(),
            degree: z.string(),
            location: z.string().optional(),
            graduationDate: z.string().describe("Format: MMM YYYY"),
            gpa: z.string().optional().describe("e.g. '3.8/4.0' if impressive, else omit"),
            honors: z.array(z.string()).optional().describe("List of academic honors (e.g. Dean's List, Cum Laude)"),
            coursework: z.array(z.string()).optional().describe("Relevant coursework if recent grad"),
        })
    ).describe("Educational background."),

    projects: z.array(
        z.object({
            name: z.string(),
            description: z.string(),
            technologies: z.array(z.string()),
            link: z.string().optional(),
        })
    ).optional(),

    // New V2 Sections
    certifications: z.array(z.object({
        name: z.string(),
        issuer: z.string(),
        date: z.string().optional()
    })).optional(),

    languages: z.array(z.string()).optional().describe("Spoken languages if relevant (e.g. 'English (Native)', 'Spanish (B2)')"),

    awards: z.array(z.object({
        title: z.string(),
        issuer: z.string(),
        date: z.string().optional()
    })).optional(),

    analysis: z.object({
        matchScore: z.number().min(0).max(100),
        missingKeywords: z.array(z.string()),
        rationale: z.string(),
    })
});

const coverLetterSchema = z.object({
    recipientName: z.string().optional().describe("Hiring Manager's name if known, else 'Hiring Manager'"),
    companyName: z.string(),
    letterContent: z.array(z.object({
        paragraph: z.string().describe("A paragraph of the cover letter.")
    })).describe("Structured paragraphs of the cover letter including intro, body, and conclusion."),
});

module.exports = { cvSchema, coverLetterSchema };
