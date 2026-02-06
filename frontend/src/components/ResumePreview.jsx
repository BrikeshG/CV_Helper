import React, { useState, useEffect } from 'react';
import { Mail, Phone, Linkedin, Globe, MapPin, Download, Edit2, Check, Lock, Unlock } from 'lucide-react';

const ResumePreview = ({ data, setData, loading, lockedSections = {}, setLockedSections = () => { }, modernStyle = false, sourceText = '' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState(data);

    useEffect(() => {
        setLocalData(data);
    }, [data]);

    const handleUpdate = () => {
        setData(localData);
        setIsEditing(false);
    };

    const handleChange = (section, field, value, index = null, subField = null, subIndex = null) => {
        const newData = { ...localData };

        if (section === 'personalInfo') {
            newData.personalInfo[field] = value;
        } else if (section === 'summary') {
            newData.summary = value;
        } else if (section === 'skills') {
            // Treat as array
        } else if (index !== null) {
            if (subField === 'description' && subIndex !== null) {
                newData[section][index][subField][subIndex] = value;
            } else if (subField) {
                newData[section][index][subField] = value;
            }
        }
        setLocalData(newData);
    };

    const updateField = (section, index, key, value) => {
        // Wrapper for simpler usage in render
        // For personal info: section='personalInfo', index=null, key='fullName', value=...
        if (section === 'personalInfo') handleChange(section, key, value);
        if (section === 'summary') handleChange(section, null, value);
    }

    // Helper for simple text inputs
    const EditableText = ({ value, onChange, className, multiline = false }) => {
        if (!isEditing || !onChange) return <span className={className}>{value}</span>;

        if (multiline) {
            return (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full border border-blue-400 bg-blue-50 p-1 rounded resize-none overflow-hidden ${className}`}
                    rows={Math.max(2, value.split('\n').length)}
                />
            );
        }
        return (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={`border-b border-blue-400 bg-blue-50 px-1 ${className} min-w-[200px]`}
            />
        );
    };

    const SectionHeader = ({ title, sectionKey }) => (
        <div className={`flex justify-between items-end border-b-2 mb-4 pb-1 ${modernStyle ? 'border-indigo-600' : 'border-gray-800'}`}>
            <h2 className={`text-xl font-bold uppercase tracking-wider ${modernStyle ? 'text-indigo-700' : 'text-gray-800'}`}>{title}</h2>

            {/* Lock Button (Only visible if we have data) */}
            {sectionKey && (
                <button
                    onClick={() => setLockedSections({ ...lockedSections, [sectionKey]: !lockedSections[sectionKey] })}
                    className={`p-1 rounded-full ${lockedSections[sectionKey] ? 'bg-red-100 text-red-600' : 'text-gray-300 hover:text-gray-500'} transition-all`}
                    title={lockedSections[sectionKey] ? "Section Locked (will not change on regenerate)" : "Click to Lock Section"}
                >
                    {lockedSections[sectionKey] ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
                    <p>Generating your professional CV...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-4">
                <p>Enter your details and click Generate to see the preview.</p>
            </div>
        );
    }

    const { personalInfo, summary, skills, experience, education, projects } = localData;

    // Hallucination Check: Find skills in Output that are NOT in Source (Input)
    // We pass 'sourceText' prop to ResumePreview to do this
    const getNewSkills = () => {
        if (!skills || !sourceText) return [];
        const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const sourceNormalized = normalize(sourceText);

        return skills.filter(skill => {
            // Check if strict normalized, or at least partial match exists
            const skillNorm = normalize(skill);
            // Simple check: is the skill present in the source text?
            return !sourceNormalized.includes(skillNorm);
        });
    };

    const newSkills = getNewSkills();

    return (
        <div className="relative">
            {/* Edit Toggle */}
            <div className="absolute -top-12 right-0 flex gap-2">
                {isEditing ? (
                    <button
                        onClick={handleUpdate}
                        className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded shadow flex items-center gap-1 text-sm font-bold"
                    >
                        <Check size={14} /> Done Editing
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded shadow flex items-center gap-1 text-sm font-bold"
                    >
                        <Edit2 size={14} /> Edit Content
                    </button>
                )}
            </div>

            <div id="resume-preview" className={`bg-white shadow-lg mx-auto p-8 max-w-[210mm] min-h-[297mm] text-sm leading-relaxed ${modernStyle ? 'font-sans text-slate-700' : 'font-serif text-gray-900'} transition-all mt-4 mb-8`}>

                {/* Analysis Dashboard (Not printed in PDF usually) */}
                {localData.analysis && (
                    <div className="mb-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg no-print">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                🎯 Match Score: {localData.analysis.matchScore}%
                            </h3>
                            <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full uppercase font-bold tracking-wide">AI Feedback</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{localData.analysis.rationale}</p>

                        {localData.analysis.missingKeywords && localData.analysis.missingKeywords.length > 0 && (
                            <div className="bg-white p-3 rounded border border-red-100">
                                <span className="text-red-600 font-bold text-xs uppercase tracking-wide block mb-1">Missing Keywords (Gap Analysis):</span>
                                <div className="flex flex-wrap gap-2">
                                    {localData.analysis.missingKeywords.map((kw, i) => (
                                        <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hallucination Warning */}
                        {newSkills.length > 0 && (
                            <div className="bg-white p-3 rounded border border-orange-100 mt-2">
                                <span className="text-orange-600 font-bold text-xs uppercase tracking-wide block mb-1">
                                    ⚠️ Unverified Skills (Not in Master CV):
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {newSkills.map((skill, i) => (
                                        <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100 flex items-center gap-1">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">*Check manually. The AI might have inferred these or made them up.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Header */}
                <header className={`border-b-2 pb-4 mb-6 ${modernStyle ? 'border-indigo-600' : 'border-gray-800'}`}>
                    <h1 className={`text-3xl font-bold uppercase tracking-wide ${modernStyle ? 'text-indigo-800' : 'text-gray-900'}`}>
                        <EditableText
                            value={personalInfo.fullName}
                            onChange={isEditing ? (v) => updateField('personalInfo', null, 'fullName', v) : null}
                        />
                    </h1>
                    <div className="flex flex-wrap gap-4 mt-3 text-gray-700 text-xs">
                        {personalInfo.email && (
                            <div className="flex items-center gap-1">
                                <span className="font-bold">Email:</span>
                                <EditableText value={personalInfo.email} onChange={isEditing ? (v) => updateField('personalInfo', null, 'email', v) : null} />
                            </div>
                        )}
                        {personalInfo.phone && (
                            <div className="flex items-center gap-1">
                                <span className="font-bold">Phone:</span>
                                <EditableText value={personalInfo.phone} onChange={isEditing ? (v) => updateField('personalInfo', null, 'phone', v) : null} />
                            </div>
                        )}
                        {personalInfo.linkedin && (
                            <div className="flex items-center gap-1">
                                <span className="font-bold">LinkedIn:</span>
                                <EditableText value={personalInfo.linkedin} onChange={isEditing ? (v) => updateField('personalInfo', null, 'linkedin', v) : null} />
                            </div>
                        )}
                        {personalInfo.location && (
                            <div className="flex items-center gap-1">
                                <span className="font-bold">Location:</span>
                                <EditableText value={personalInfo.location} onChange={isEditing ? (v) => updateField('personalInfo', null, 'location', v) : null} />
                            </div>
                        )}
                    </div>
                </header>

                {/* Summary */}
                {summary && (
                    <section className="mb-6">
                        <SectionHeader title="Professional Summary" sectionKey="summary" />
                        <EditableText
                            value={summary}
                            onChange={isEditing ? (v) => updateField('summary', null, null, v) : null}
                            multiline
                            className="text-justify"
                        />
                    </section>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                    <section className="mb-6">
                        <SectionHeader title="Skills" />
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                                <span key={index} className={`px-2 py-1 text-xs font-bold rounded ${modernStyle ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {experience && experience.length > 0 && (
                    <section className="mb-6">
                        <SectionHeader title="Experience" sectionKey="experience" />
                        <div className="space-y-4">
                            {experience.map((exp, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`text-lg font-bold ${modernStyle ? 'text-indigo-900' : 'text-gray-900'}`}>{exp.role}</h3>
                                        <span className="text-xs font-bold text-gray-500 whitespace-nowrap">{exp.duration}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-gray-700">{exp.company}</span>
                                        <span className="text-xs text-gray-500 italic">{exp.location}</span>
                                    </div>
                                    <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700 marker:text-gray-400">
                                        {exp.bullets && exp.bullets.map((bullet, i) => (
                                            <li key={i}>{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects && projects.length > 0 && (
                    <section className="mb-6">
                        <SectionHeader title="Key Projects" sectionKey="projects" />
                        <div className="space-y-4">
                            {projects.map((proj, index) => (
                                <div key={index}>
                                    <h3 className={`text-lg font-bold ${modernStyle ? 'text-indigo-900' : 'text-gray-900'}`}>{proj.name}</h3>
                                    <p className="text-gray-700 mb-1">{proj.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {proj.technologies && proj.technologies.map((tech, i) => (
                                            <span key={i} className="text-xs text-gray-500 italic">#{tech}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}


                {/* Education */}
                {education && education.length > 0 && (
                    <section className="mb-6">
                        <SectionHeader title="Education" />
                        <div className="space-y-2">
                            {education.map((edu, index) => (
                                <div key={index} className="flex justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                                        <p className="text-gray-700">{edu.institution}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-500">{edu.year}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};

export default ResumePreview;
