const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");

const generateDOCX = async (cvData) => {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Header: Name
                new Paragraph({
                    text: cvData.personalInfo?.name || "Your Name",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                }),
                // Contact Info
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({ text: `${cvData.personalInfo?.email || ""} | ${cvData.personalInfo?.phone || ""} | ${cvData.personalInfo?.linkedin || ""}`, size: 20 }),
                    ],
                }),
                new Paragraph({ text: "", spacing: { after: 200 } }), // Spacer

                // Summary Criteria
                new Paragraph({
                    text: "Professional Summary",
                    heading: HeadingLevel.HEADING_1,
                    thematicBreak: true,
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: cvData.summary || "No summary provided.", size: 24 }),
                    ],
                    spacing: { after: 200 },
                }),

                // Skills
                new Paragraph({
                    text: "Skills",
                    heading: HeadingLevel.HEADING_1,
                    thematicBreak: true,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: (cvData.skills || []).join(" • "),
                            size: 24
                        }),
                    ],
                    spacing: { after: 200 },
                }),

                // Experience
                new Paragraph({
                    text: "Experience",
                    heading: HeadingLevel.HEADING_1,
                    thematicBreak: true,
                }),
                ...(cvData.experience || []).flatMap(job => [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_3,
                        children: [
                            new TextRun({ text: job.role, bold: true }),
                            new TextRun({ text: ` at ${job.company}`, italics: true }),
                        ],
                    }),
                    new Paragraph({
                        text: job.duration,
                        alignment: AlignmentType.RIGHT,
                    }),
                    ...(job.keyAchievements || []).map(bullet =>
                        new Paragraph({
                            text: typeof bullet === 'string' ? bullet : bullet.description || "",
                            bullet: { level: 0 },
                        })
                    ),
                    new Paragraph({ text: "", spacing: { after: 100 } }),
                ]),

                // Projects
                new Paragraph({
                    text: "Projects",
                    heading: HeadingLevel.HEADING_1,
                    thematicBreak: true,
                }),
                ...(cvData.projects || []).flatMap(proj => [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_3,
                        children: [
                            new TextRun({ text: proj.name, bold: true }),
                        ],
                    }),
                    new Paragraph({
                        text: proj.techStack ? `Tech: ${proj.techStack}` : "",
                        italics: true,
                    }),
                    new Paragraph({
                        text: proj.description,
                    }),
                    new Paragraph({ text: "", spacing: { after: 100 } }),
                ]),

                // Education
                new Paragraph({
                    text: "Education",
                    heading: HeadingLevel.HEADING_1,
                    thematicBreak: true,
                }),
                ...(cvData.education || []).flatMap(edu => [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_3,
                        children: [
                            new TextRun({ text: edu.degree, bold: true }),
                            new TextRun({ text: ` | ${edu.institution}`, italics: true }),
                        ],
                    }),
                    new Paragraph({
                        text: edu.year,
                    }),
                    new Paragraph({ text: "", spacing: { after: 100 } }),
                ]),
            ],
        }],
    });

    return await Packer.toBuffer(doc);
};

module.exports = { generateDOCX };
