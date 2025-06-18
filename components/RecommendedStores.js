import React, { useEffect, useState } from 'react';
import axiosInstance from '../lib/axios';
import { useSession } from 'next-auth/react';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';
import styles from '../styles/TopRatedStores.module.css';

const RecommendedStores = () => {
    const [stores, setStores] = useState([]);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!session || !session.user || !session.user.accessToken) {
                console.error('No access token found');
                return;
            }

            try {
                const response = await axiosInstance.get('/recommend-stores/', {
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`
                    }
                });
                setStores(response.data.slice(0, 4)); // عرض 4 متاجر فقط
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            }
        };

        fetchRecommendations();
    }, [session]);

    return (
        <div className={styles.container}>
            <h2>Recommended Stores</h2>
            <div className={styles.cardsContainer}>
                {stores.map(store => (
                    <div key={store.id} className={styles.card}>
                        <img src={`http://127.0.0.1:8000${store.cover_image}`} alt={store.name} className={styles.image} />
                        <div className={styles.info}>
                            <h3>{store.name}</h3>
                            <p>{store.address}</p>
                            <p>Phone: {store.phone}</p>
                            <div className={styles.rating}>
                                {Array.from({ length: 5 }, (_, index) => (
                                    <FaStar key={index} color={index < Math.round(store.average_rating || 0) ? '#ffc107' : '#e4e5e9'} />
                                ))}
                            </div>
                            <Link href={`/store/${store.id}`} legacyBehavior>
                                <a className={styles.storeButton}>Visit Store</a>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            <Link href="/stores" legacyBehavior>
                <a className={styles.viewMoreButton}>View More Stores</a>
            </Link>
        </div>
    );
};

export default RecommendedStores;
