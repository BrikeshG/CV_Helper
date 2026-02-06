import React, { useState, useEffect } from 'react';
import { Trash2, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';

const ApplicationTracker = () => {
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('cv_app_tracker');
        if (saved) {
            setApplications(JSON.parse(saved));
        }
    }, []);

    const deleteApp = (id) => {
        const newApps = applications.filter(app => app.id !== id);
        setApplications(newApps);
        localStorage.setItem('cv_app_tracker', JSON.stringify(newApps));
    };

    const updateStatus = (id, newStatus) => {
        const newApps = applications.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        );
        setApplications(newApps);
        localStorage.setItem('cv_app_tracker', JSON.stringify(newApps));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return 'bg-yellow-100 text-yellow-800';
            case 'Interviewing': return 'bg-blue-100 text-blue-800';
            case 'Offer': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📊 Application Tracker
            </h2>

            {applications.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>No applications tracked yet.</p>
                    <p className="text-sm">Generate a CV and click "Save to Tracker" to start.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold border-b">
                            <tr>
                                <th className="p-4">Company</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Match Score</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {applications.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{app.company}</td>
                                    <td className="p-4 text-gray-600">{app.role}</td>
                                    <td className="p-4 text-gray-500">{new Date(app.date).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        {app.score ? (
                                            <span className={`font-bold ${app.score > 75 ? 'text-green-600' : 'text-orange-500'}`}>
                                                {app.score}%
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={app.status || 'Applied'}
                                            onChange={(e) => updateStatus(app.id, e.target.value)}
                                            className={`px-2 py-1 rounded text-xs font-bold border border-transparent hover:border-gray-300 cursor-pointer ${getStatusColor(app.status || 'Applied')}`}
                                        >
                                            <option value="Applied">Applied</option>
                                            <option value="Interviewing">Interviewing</option>
                                            <option value="Offer">Offer</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => deleteApp(app.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ApplicationTracker;
