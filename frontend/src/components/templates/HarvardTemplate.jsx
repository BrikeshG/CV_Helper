import React from 'react';

const HarvardTemplate = ({ data, fontClass = 'font-serif' }) => {
    const { personalInfo, summary, skills, experience, education, projects, certifications, awards, languages } = data;

    return (
        <div className={`p-10 max-w-[210mm] min-h-[297mm] mx-auto bg-white text-black ${fontClass} leading-snug`}>
            {/* Header: Centered, Caps, Clean */}
            <header className="text-center border-b border-black pb-4 mb-4">
                <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">{personalInfo.fullName}</h1>
                <div className="text-sm flex justify-center flex-wrap gap-x-4">
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.email && <span className="underline">{personalInfo.email}</span>}
                    {personalInfo.linkedin && <span className="underline">{personalInfo.linkedin}</span>}
                    {personalInfo.website && <span className="underline">{personalInfo.website}</span>}
                </div>
            </header>

            {/* Content Sections: Uppercase small headers, horizontal rule */}

            {/* Summary */}
            {summary && (
                <section className="mb-4">
                    <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Professional Summary</h2>
                    <p className="text-sm text-justify">{summary}</p>
                </section>
            )}

            {/* Education (Harvard puts this top for students/academics, but we can stick to standard order or make it dynamic. I'll put it after summary for now or top if recent grad logic exists. Let's stick to standard order.) */}
            {education && education.length > 0 && (
                <section className="mb-4">
                    <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Education</h2>
                    {education.map((edu, idx) => (
                        <div key={idx} className="mb-2">
                            <div className="flex justify-between font-bold text-sm">
                                <span>{edu.institution}, {edu.location}</span>
                                <span>{edu.graduationDate}</span>
                            </div>
                            <div className="flex justify-between text-sm italic">
                                <span>{edu.degree}</span>
                                {edu.gpa && <span>GPA: {edu.gpa}</span>}
                            </div>
                            {edu.honors && edu.honors.length > 0 && (
                                <div className="text-sm mt-1">
                                    <span className="font-semibold">Honors: </span>{edu.honors.join(', ')}
                                </div>
                            )}
                            {edu.coursework && edu.coursework.length > 0 && (
                                <div className="text-sm mt-1">
                                    <span className="font-semibold">Relevant Coursework: </span>{edu.coursework.join(', ')}
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
                <section className="mb-4">
                    <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Experience</h2>
                    {experience.map((exp, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex justify-between font-bold text-sm">
                                <span>{exp.company}</span>
                                <span>{exp.startDate} – {exp.endDate}</span>
                            </div>
                            <div className="flex justify-between text-sm italic mb-1">
                                <span>{exp.role}</span>
                                <span>{exp.location}</span>
                            </div>
                            <ul className="list-disc list-outside ml-5 text-sm space-y-0.5">
                                {exp.description && exp.description.map((bullet, bIdx) => (
                                    <li key={bIdx} className="text-justify">{bullet}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
                <section className="mb-4">
                    <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Key Projects</h2>
                    {projects.map((proj, idx) => (
                        <div key={idx} className="mb-2">
                            <div className="flex justify-between font-bold text-sm">
                                <span>{proj.name}</span>
                                {proj.link && <span className="font-normal underline text-xs">{proj.link}</span>}
                            </div>
                            <div className="text-sm italic mb-1">
                                {proj.technologies && proj.technologies.join(', ')}
                            </div>
                            <p className="text-sm text-justify">{proj.description}</p>
                        </div>
                    ))}
                </section>
            )}

            {/* Categorized Skills */}
            {skills && skills.length > 0 && (
                <section className="mb-4">
                    <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Skills</h2>
                    <div className="text-sm space-y-1">
                        {Array.isArray(skills) && typeof skills[0] === 'object' ? (
                            skills.map((cat, idx) => (
                                <div key={idx} className="flex">
                                    <span className="font-bold min-w-[120px]">{cat.category}:</span>
                                    <span>{cat.items.join(', ')}</span>
                                </div>
                            ))
                        ) : (
                            // Fallback for old string[] format
                            <div><span className="font-bold">Technical:</span> {skills.join(', ')}</div>
                        )}
                    </div>
                </section>
            )}

            {/* Additional Sections */}
            {(certifications || languages || awards) && (
                <section className="mb-4">
                    <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Additional Information</h2>

                    {certifications && (
                        <div className="text-sm flex mb-1">
                            <span className="font-bold min-w-[120px]">Certifications:</span>
                            <span>{certifications.map(c => `${c.name} (${c.issuer})`).join(', ')}</span>
                        </div>
                    )}

                    {languages && (
                        <div className="text-sm flex mb-1">
                            <span className="font-bold min-w-[120px]">Languages:</span>
                            <span>{languages.join(', ')}</span>
                        </div>
                    )}

                    {awards && (
                        <div className="text-sm flex">
                            <span className="font-bold min-w-[120px]">Awards:</span>
                            <span>{awards.map(a => `${a.title}`).join(', ')}</span>
                        </div>
                    )}
                </section>
            )}

        </div>
    );
};

export default HarvardTemplate;
