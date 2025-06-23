import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import styles from '../styles/Recommendations.module.css';
import { BsCartPlus } from 'react-icons/bs';
import Link from 'next/link';
import axiosInstance from '../lib/axios';

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!session || !session.user || !session.user.accessToken) {
                console.error('No access token found');
                return;
            }

            try {
                const response = await axios.get('https://hisba-backend.onrender.com/api/recommendations/', {
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`
                    }
                });
                setRecommendations(response.data);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            }
        };

        fetchRecommendations();
    }, [session]);
    
  const addToCart = async (productId, quantity) => {
    if (!session || !session.user || !session.user.accessToken) {
      alert('Please log in to add products to your cart.');
      return;
    }

    try {
      const response = await axiosInstance.post('https://hisba-backend.onrender.com/api/cart/', {
        product_id: productId,
        quantity: quantity,
      }, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`
        }
      });

      alert('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const handleAddToCart = (productId, productQuantity, availableQuantity) => {
    if (productQuantity >= availableQuantity) {
      alert('Cannot add more than available quantity');
      return;
    }
    addToCart(productId, 1);
  };

    return (
        <div className={styles.container}>
            <h2>Products For You</h2>
            <div className={styles.cardsContainer}>
                {recommendations.slice(0, 4).map(product => ( // عرض 4 منتجات فقط
                    <div key={product.id} className={styles.card}>
                        <img src={`https://hisba-backend.onrender.com${product.image}`} alt={product.name} className={styles.image} />
                        <div className={styles.info}>
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p>ILS{product.price}</p>
                        </div>
                        <button className={styles.cartButton}   onClick={() => handleAddToCart(product.id, 1, product.quantity)} >Add to Cart</button>
                        <Link href={`/products/${product.id}`} passHref>
                        <button className={styles.detailsButton}>View Details</button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recommendations;
