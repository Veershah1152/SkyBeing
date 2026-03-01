import { useState, useEffect } from 'react';
import { Search, Loader2, User, ShieldAlert, ShieldCheck, Mail, Calendar, Ban } from 'lucide-react';
import api from '../../api/axios';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState('idle');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setStatus('loading');
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data.users);
            setStatus('succeeded');
        } catch (error) {
            console.error(error);
            setStatus('failed');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleBlockStatus = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/block`);
            // Optimistic update
            setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
        } catch (error) {
            alert('Failed to toggle block status');
        }
    };

    const toggleRole = async (userId) => {
        if (!window.confirm("Are you sure you want to change this user's role?")) return;

        try {
            await api.put(`/admin/users/${userId}/role`);
            // Optimistic update
            setUsers(users.map(u => u._id === userId ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u));
        } catch (error) {
            alert('Failed to change user role');
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            await api.delete(`/admin/users/${userId}`);
            // Optimistic update
            setUsers(users.filter(u => u._id !== userId));
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Users <span className="text-gray-400 text-lg font-normal mb-1 ml-2">({users.length})</span></h1>
                    <p className="mt-1 text-sm text-gray-500">Manage customers, administrators, and account access.</p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-skyGreen focus:ring-2 focus:ring-skyGreen/20 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {status === 'loading' ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-skyGreen" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className={`hover:bg-green-50/30 transition-colors group ${user.isBlocked ? 'opacity-75 bg-red-50/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${user.role === 'admin' ? 'bg-skyGreen/10 text-skyGreen' : 'bg-gray-100 text-gray-500'}`}>
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                        {user.name}
                                                        {user.role === 'admin' && <ShieldCheck className="w-4 h-4 text-skyGreen" title="Admin Verified" />}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => toggleRole(user._id)}
                                                    className="p-2 text-gray-400 hover:text-skyGreen hover:bg-green-50 rounded-lg transition-colors group-hover:block sm:hidden"
                                                    title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => toggleBlockStatus(user._id)}
                                                    className={`p-2 text-gray-400 rounded-lg transition-colors ${user.isBlocked ? 'hover:text-green-500 hover:bg-green-50' : 'hover:text-orange-500 hover:bg-orange-50'}`}
                                                    title={user.isBlocked ? "Unblock User" : "Block User"}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => deleteUser(user._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Permanently Delete"
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span className="sr-only">Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
