import React, { useState } from 'react';
import axiosInstance from '../../../lib/axios';
import styles from '../styles/PromoCodes.module.css';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const CreatePromoCode = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        code: '',
        discount_percentage: '',
        valid_from: '',
        valid_to: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('http://127.0.0.1:8000/api/admin/promo-codes/', formData, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });
            router.push('/admin/promo-codes');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError(error.response.data.code[0]);
            } else {
                console.error('Failed to create promo code:', error);
                setError('Failed to create promo code');
            }
        }
    };

    return (
        <div className={styles.container}>
            <h1>Create Promo Code</h1>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Code"
                    required
                    className={styles.inputField}
                />
                <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    placeholder="Discount Percentage"
                    required
                    className={styles.inputField}
                />
                <input
                    type="datetime-local"
                    name="valid_from"
                    value={formData.valid_from}
                    onChange={handleInputChange}
                    required
                    className={styles.inputField}
                />
                <input
                    type="datetime-local"
                    name="valid_to"
                    value={formData.valid_to}
                    onChange={handleInputChange}
                    required
                    className={styles.inputField}
                />
                <button type="submit" className={styles.createButton}>Create</button>
            </form>
        </div>
    );
};

export default CreatePromoCode;
