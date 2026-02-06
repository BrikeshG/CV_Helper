import React from 'react';
import { MapPin, Mail, Phone, Globe, Linkedin, Award, Book, Code } from 'lucide-react';

const TealTemplate = ({ data, fontClass = 'font-sans' }) => {
    const { personalInfo, summary, skills, experience, education, projects, certifications, awards, languages } = data;

    return (
        <div className={`p-8 max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-800 ${fontClass} text-[13px] leading-normal`}>

            {/* Header: Modern Left-Aligned with Accent */}
            <header className="flex justify-between items-start border-l-4 border-teal-500 pl-6 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{personalInfo.fullName}</h1>
                    <div className="flex flex-wrap gap-4 text-slate-500 font-medium">
                        {personalInfo.location && <div className="flex items-center gap-1"><MapPin size={12} /> {personalInfo.location}</div>}
                        {personalInfo.email && <div className="flex items-center gap-1"><Mail size={12} /> {personalInfo.email}</div>}
                        {personalInfo.phone && <div className="flex items-center gap-1"><Phone size={12} /> {personalInfo.phone}</div>}
                        {personalInfo.linkedin && <div className="flex items-center gap-1"><Linkedin size={12} /> LinkedIn</div>}
                        {personalInfo.website && <div className="flex items-center gap-1"><Globe size={12} /> Portfolio</div>}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">

                {/* Main Column (Experience & Projects) */}
                <div className="col-span-8 space-y-6">

                    {/* Summary */}
                    {summary && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-teal-700 mb-3 flex items-center gap-2">
                                Professional Profile
                            </h2>
                            <p className="text-justify text-slate-600 leading-relaxed">{summary}</p>
                        </section>
                    )}

                    {/* Experience */}
                    {experience && experience.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-teal-700 mb-4 flex items-center gap-2">
                                Work Experience
                            </h2>
                            <div className="space-y-6">
                                {experience.map((exp, idx) => (
                                    <div key={idx} className="relative border-l-2 border-slate-100 pl-4 py-1">
                                        <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-teal-200"></div>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-lg text-slate-800">{exp.role}</h3>
                                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{exp.startDate} – {exp.endDate}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-500 mb-2">{exp.company} | {exp.location}</div>
                                        <ul className="space-y-2">
                                            {exp.description && exp.description.map((bullet, bIdx) => (
                                                <li key={bIdx} className="text-slate-600 pl-1 relative">
                                                    <span className="absolute -left-3 top-1.5 w-1 h-1 rounded-full bg-slate-300"></span>
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {projects && projects.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-teal-700 mb-4 mt-8 flex items-center gap-2">
                                Key Projects
                            </h2>
                            <div className="grid gap-4">
                                {projects.map((proj, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <div className="flex justify-between font-bold text-slate-800 mb-1">
                                            <span>{proj.name}</span>
                                        </div>
                                        <p className="text-slate-600 mb-2">{proj.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {proj.technologies && proj.technologies.map((tech, i) => (
                                                <span key={i} className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded-md">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Column (Skills, Education, Extras) */}
                <div className="col-span-4 space-y-8">

                    {/* Skills */}
                    {skills && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Code size={14} /> Technical Skills
                            </h2>
                            <div className="space-y-4">
                                {Array.isArray(skills) && typeof skills[0] === 'object' ? (
                                    skills.map((cat, idx) => (
                                        <div key={idx}>
                                            <h4 className="font-bold text-xs text-slate-700 mb-2">{cat.category}</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {cat.items.map((item, i) => (
                                                    <span key={i} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-md">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((s, i) => (
                                            <span key={i} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-md">{s}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {education && education.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Book size={14} /> Education
                            </h2>
                            <div className="space-y-4">
                                {education.map((edu, idx) => (
                                    <div key={idx}>
                                        <div className="font-bold text-slate-800">{edu.degree}</div>
                                        <div className="text-slate-600 text-xs">{edu.institution}</div>
                                        <div className="text-slate-400 text-xs mt-1">{edu.graduationDate}</div>
                                        {edu.gpa && <div className="text-teal-600 text-xs font-bold mt-1">GPA: {edu.gpa}</div>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certs & Awards */}
                    {(certifications || awards) && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Award size={14} /> Distinctions
                            </h2>
                            <div className="space-y-3">
                                {certifications && certifications.map((c, i) => (
                                    <div key={i} className="text-xs">
                                        <div className="font-bold text-slate-700">{c.name}</div>
                                        <div className="text-slate-500">{c.issuer}</div>
                                    </div>
                                ))}
                                {awards && awards.map((a, i) => (
                                    <div key={i} className="text-xs border-t border-slate-100 pt-2 mt-2">
                                        <div className="font-bold text-slate-700">{a.title}</div>
                                        <div className="text-slate-500">{a.issuer}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TealTemplate;
