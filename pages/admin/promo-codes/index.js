import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../lib/axios';
import styles from '../styles/PromoCodes.module.css';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import withAuth from '../../../components/withAuth'

const AdminPromoCodes = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [promoCodes, setPromoCodes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [codesPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingPromoCode, setEditingPromoCode] = useState(null);
    const [editFormData, setEditFormData] = useState({
        code: '',
        discount_percentage: '',
        valid_from: '',
        valid_to: ''
    });

    useEffect(() => {
        if (session?.user?.accessToken) {
            fetchPromoCodes();
        }
    }, [session]);

    const fetchPromoCodes = async () => {
        try {
            const response = await axiosInstance.get('http://127.0.0.1:8000/api/admin/promo-codes/', {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });
            setPromoCodes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch promo codes:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`http://127.0.0.1:8000/api/admin/promo-codes/${id}/`, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });
            fetchPromoCodes();
        } catch (error) {
            console.error('Failed to delete promo code:', error);
        }
    };

    const handleActivate = async (id) => {
        try {
            await axiosInstance.post(`http://127.0.0.1:8000/api/admin/promo-codes/${id}/activate/`, {}, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });
            setPromoCodes(promoCodes.map(code => code.id === id ? { ...code, active: true } : code));
        } catch (error) {
            console.error('Failed to activate promo code:', error);
            alert(`Failed to activate promo code: ${error.response ? error.response.data.error : error.message}`);
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await axiosInstance.post(`http://127.0.0.1:8000/api/admin/promo-codes/${id}/deactivate/`, {}, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });
            setPromoCodes(promoCodes.map(code => code.id === id ? { ...code, active: false } : code));
        } catch (error) {
            console.error('Failed to deactivate promo code:', error);
            alert(`Failed to deactivate promo code: ${error.response ? error.response.data.error : error.message}`);
        }
    };

    const handleEdit = (promoCode) => {
        setEditingPromoCode(promoCode.id);
        setEditFormData({
            code: promoCode.code,
            discount_percentage: promoCode.discount_percentage,
            valid_from: new Date(promoCode.valid_from).toISOString().slice(0, -1),
            valid_to: new Date(promoCode.valid_to).toISOString().slice(0, -1)
        });
    };

    const handleCancelEdit = () => {
        setEditingPromoCode(null);
        setEditFormData({
            code: '',
            discount_percentage: '',
            valid_from: '',
            valid_to: ''
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`http://127.0.0.1:8000/api/admin/promo-codes/${editingPromoCode}/`, editFormData, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });
            fetchPromoCodes();
            handleCancelEdit();
        } catch (error) {
            console.error('Failed to update promo code:', error);
        }
    };

    const indexOfLastCode = currentPage * codesPerPage;
    const indexOfFirstCode = indexOfLastCode - codesPerPage;
    const currentCodes = promoCodes.filter(code => code.code.toLowerCase().includes(searchQuery.toLowerCase())).slice(indexOfFirstCode, indexOfLastCode);
    const totalPages = Math.ceil(promoCodes.length / codesPerPage);

    return (
        <div className={styles.container}>
            <h1 className={styles.headerTitle}>Manage Promo Codes</h1>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search Promo Codes"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
                <button onClick={() => router.push('/admin/promo-codes/create')} className={styles.createButton}>
                    Create Promo Code
                </button>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Discount</th>
                        <th>Valid From</th>
                        <th>Valid To</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCodes && currentCodes.length > 0 ? (
                        currentCodes.map((code) => (
                            <tr key={code.id}>
                                <td>{code.code}</td>
                                <td>{code.discount_percentage}%</td>
                                <td>{new Date(code.valid_from).toLocaleString()}</td>
                                <td>{new Date(code.valid_to).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => handleEdit(code)} className={styles.editButton}>Edit</button>
                                    <button onClick={() => handleDelete(code.id)} className={styles.deleteButton}>Delete</button>
                                    {code.active ? (
                                        <button onClick={() => handleDeactivate(code.id)} className={styles.deactivateButton}>Deactivate</button>
                                    ) : (
                                        <button onClick={() => handleActivate(code.id)} className={styles.activateButton}>Activate</button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className={styles.noData}>No promo codes available</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {editingPromoCode && (
                <div className={styles.editContainer}>
                    <h2>Edit Promo Code</h2>
                    <form onSubmit={handleEditSubmit} className={styles.form}>
                        <input
                            type="text"
                            name="code"
                            value={editFormData.code}
                            onChange={handleEditInputChange}
                            placeholder="Code"
                            required
                            className={styles.inputField}
                        />
                        <input
                            type="number"
                            name="discount_percentage"
                            value={editFormData.discount_percentage}
                            onChange={handleEditInputChange}
                            placeholder="Discount Percentage"
                            required
                            className={styles.inputField}
                        />
                        <input
                            type="datetime-local"
                            name="valid_from"
                            value={editFormData.valid_from}
                            onChange={handleEditInputChange}
                            required
                            className={styles.inputField}
                        />
                        <input
                            type="datetime-local"
                            name="valid_to"
                            value={editFormData.valid_to}
                            onChange={handleEditInputChange}
                            required
                            className={styles.inputField}
                        />
                        <button type="submit" className={styles.saveButton}>Save</button>
                        <button type="button" onClick={handleCancelEdit} className={styles.cancelButton}>Cancel</button>
                    </form>
                </div>
            )}
            <div className={styles.pagination}>
                <button
                    className={styles.paginationButton}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className={styles.paginationText}>{currentPage} of {totalPages}</span>
                <button
                    className={styles.paginationButton}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default withAuth(AdminPromoCodes);
