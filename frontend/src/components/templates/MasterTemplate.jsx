import React from 'react';

const MasterTemplate = ({ data }) => {
    if (!data) return null;

    const { personalInfo, summary, tools, skills, experience, education, projects, certifications, languages, awards } = data;

    return (
        <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black font-serif p-8 md:p-12 text-[10.5pt] leading-relaxed shadow-lg print:shadow-none mx-auto">

            {/* Header */}
            <header className="border-b-2 border-black pb-4 mb-4">
                <h1 className="text-3xl font-bold uppercase tracking-wide text-center mb-2">{personalInfo?.fullName || "Your Name"}</h1>

                <div className="flex justify-between text-[10pt] mt-2 px-1">
                    <div className="text-left">
                        {personalInfo?.linkedin && (
                            <div className="flex items-center gap-1">
                                <span className="font-bold">Linkedin:</span>
                                <a href={personalInfo.linkedin} className="text-blue-700 underline">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</a>
                            </div>
                        )}
                        {personalInfo?.portfolio && (
                            <div className="flex items-center gap-1">
                                <span className="font-bold">Portfolio:</span>
                                <a href={personalInfo.portfolio} className="text-blue-700 underline">{personalInfo.portfolio.replace(/^https?:\/\//, '')}</a>
                            </div>
                        )}
                    </div>

                    <div className="text-right">
                        <div><span className="font-bold">Location:</span> {personalInfo?.location || "City, Country"}</div>
                        <div><span className="font-bold">Email:</span> {personalInfo?.email || "email@example.com"}</div>
                        <div><span className="font-bold">Mobile:</span> {personalInfo?.phone || "123-456-7890"}</div>
                    </div>
                </div>
            </header>

            {/* Sections */}
            <div className="space-y-4">

                {/* Summary */}
                {summary && (
                    <section>
                        <h2 className="text-[11pt] font-bold uppercase text-center border-b border-black mb-2 tracking-wide">Summary</h2>
                        <p className="text-justify">{summary}</p>
                    </section>
                )}

                {/* Skills */}
                {(skills?.length > 0 || tools?.length > 0) && (
                    <section>
                        <h2 className="text-[11pt] font-bold uppercase text-center border-b border-black mb-2 tracking-wide">Skills</h2>
                        <div className="pl-4">
                            {skills?.map((skill, index) => (
                                <div key={index} className="flex mb-1">
                                    <span className="font-bold whitespace-nowrap mr-2">• {skill.category}:</span>
                                    <span>{skill.items.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects?.length > 0 && (
                    <section>
                        <h2 className="text-[11pt] font-bold uppercase text-center border-b border-black mb-2 tracking-wide">Projects</h2>
                        {projects.map((proj, index) => (
                            <div key={index} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold">{proj.name}</h3>
                                </div>
                                <ul className="list-disc ml-5 space-y-0.5 mt-1">
                                    {proj.details.map((detail, i) => (
                                        <li key={i} className="pl-1">{detail}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </section>
                )}

                {/* Education */}
                {education?.length > 0 && (
                    <section>
                        <h2 className="text-[11pt] font-bold uppercase text-center border-b border-black mb-2 tracking-wide">Education</h2>
                        {education.map((edu, index) => (
                            <div key={index} className="mb-2">
                                <div className="flex justify-between font-bold">
                                    <span>{edu.institution}</span>
                                    <span>{edu.location}</span>
                                </div>
                                <div className="flex justify-between italic">
                                    <span>{edu.degree}</span>
                                    <span>{edu.graduationDate}</span>
                                </div>
                                {edu.details && edu.details.length > 0 && (
                                    <ul className="list-disc ml-5 mt-1">
                                        {edu.details.map((detail, i) => <li key={i}>{detail}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Certifications */}
                {certifications?.length > 0 && (
                    <section>
                        <h2 className="text-[11pt] font-bold uppercase text-center border-b border-black mb-2 tracking-wide">Certifications</h2>
                        {certifications.map((cert, index) => (
                            <div key={index} className="flex justify-between mb-1">
                                <span>{cert.name} — <span className="italic">{cert.issuer}</span></span>
                                <span>{cert.date}</span>
                            </div>
                        ))}
                    </section>
                )}

                {/* Languages */}
                {languages?.length > 0 && (
                    <section>
                        <h2 className="text-[11pt] font-bold uppercase text-center border-b border-black mb-2 tracking-wide">Languages</h2>
                        <div className="flex justify-between px-4">
                            {languages.map((lang, index) => (
                                <span key={index} className="font-bold">{lang}</span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience - Moved to bottom based on image structure often having EXP last for students, or just standard flow */}
                {experience?.length > 0 && (
                    <section>
                        <h2 className="text-[11pt] font-bold uppercase text-center border-b border-black mb-2 tracking-wide">Work Experience</h2>
                        {experience.map((job, index) => (
                            <div key={index} className="mb-3">
                                <div className="flex justify-between font-bold">
                                    <span>{job.company} — {job.role}</span>
                                    <span>{job.duration}</span>
                                </div>
                                <ul className="list-disc ml-5 space-y-0.5 mt-1">
                                    {job.details.map((detail, i) => (
                                        <li key={i} className="pl-1">{detail}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </section>
                )}

            </div>
        </div>
    );
};

export default MasterTemplate;
