import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/cart.module.css';
import { useSession } from 'next-auth/react';
import withAuth from '../components/withAuth';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const CartPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [promoCode, setPromoCode] = useState('');
    const [deliveryFee, setDeliveryFee] = useState(0.00);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [error, setError] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [visaNumber, setVisaNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');
    const [storeAddress, setStoreAddress] = useState('');

    useEffect(() => {
        if (session?.user?.accessToken) {
            axios.get('http://localhost:8000/api/cart/', {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            })
            .then(response => {
                setCartItems(response.data.items);
                if (response.data.items.length > 0) {
                    setStoreAddress(response.data.items[0].product.store.address);
                }
            })
            .catch(error => console.error('Failed to fetch cart:', error));
        }
    }, [session]);

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        axios.put(`http://localhost:8000/api/cart/`, {
            product_id: productId,
            quantity: quantity
        }, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`
            }
        })
        .then(response => {
            setCartItems(response.data.items);
        })
        .catch(error => {
            console.error('Failed to update quantity:', error);
            setError('Failed to update quantity');
        });
    };

    const removeItem = (productId) => {
        axios.delete(`http://localhost:8000/api/cart/`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`
            },
            data: {
                product_id: productId
            }
        })
        .then(response => {
            setCartItems(response.data.items);
        })
        .catch(error => {
            console.error('Failed to remove item:', error);
            setError('Failed to remove item');
        });
    };

    const applyPromoCode = () => {
        axios.post('http://localhost:8000/api/promo-codes/apply/', {
            promo_code: promoCode
        }, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`
            }
        })
        .then(response => {
            setPromoDiscount(response.data.discount_percentage);
            setError('');
        })
        .catch(error => {
            console.error('Failed to apply promo code:', error);
            setError('Invalid promo code');
        });
    };

    const calculateTotal = () => {
        const subtotal = cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);
        const discountAmount = (promoDiscount / 100) * subtotal;
        return subtotal - discountAmount + deliveryFee;
    };

    const handleCheckout = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/checkout/', {
                address,
                phone_number: phoneNumber,
                payment_method: paymentMethod,
                visa_number: paymentMethod === 'visa' ? visaNumber : undefined,
                expiry_date: paymentMethod === 'visa' ? expiryDate : undefined,
                cvc: paymentMethod === 'visa' ? cvc : undefined,
                delivery_fee: deliveryFee
            }, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });

            alert('Order submitted successfully!');
            setCartItems([]);
            setPromoCode('');
            setPromoDiscount(0);
            setDeliveryFee(5.00);
            router.push('/orders');
        } catch (error) {
            console.error('Failed to submit order:', error);
            setError('Failed to submit order');
        }
    };

    const handleAddressBlur = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/calculate-delivery-fee/', {
                address,
                store_address: storeAddress
            }, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });
            setDeliveryFee(response.data.delivery_fee);
        } catch (error) {
            console.error('Failed to calculate delivery fee:', error);
            setError('Failed to calculate delivery fee');
        }
    };

    return (
        <motion.div className={styles.cartContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h1 className={styles.headerTitle}>Your Cart</h1>
            <div className={styles.itemsList}>
                {cartItems.length > 0 ? cartItems.map(item => (
                    <motion.div key={item.id} className={styles.item} initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 100 }}>
                        <img src={`http://localhost:8000${item.product.image}`} alt={item.product.name} className={styles.productImage} />
                        <div className={styles.itemInfo}>
                            <h3 className={styles.headerSubTitle}>{item.product.name}</h3>
                            <p className={styles.textParagraph}>Seller: {item.product.store.name}</p>
                            <p className={styles.textParagraph}>Quantity: 
                                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                                {item.quantity} Kg
                                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                            </p>
                            <p className={styles.textParagraph}>Price: ILS{item.product.price}</p>
                            <p className={styles.textParagraph}>Total: ILS{item.quantity * item.product.price}</p>
                            <button onClick={() => removeItem(item.product.id)} className={styles.removeItemButton}>Remove</button>
                        </div>
                    </motion.div>
                )) : <p className={styles.textParagraph}>Your cart is empty.</p>}
            </div>
            {cartItems.length > 0 && (
                <div className={styles.checkoutSection}>
                    <input 
                        type="text" 
                        value={promoCode} 
                        onChange={(e) => setPromoCode(e.target.value)} 
                        placeholder="Enter promo code" 
                        className={styles.promoInput}
                    />
                    <button onClick={applyPromoCode} className={styles.applyButton}>Apply</button>
                    {error && <p className={styles.errorText}>{error}</p>}
                    <div className={styles.orderSummary}>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            onBlur={handleAddressBlur}
                            placeholder="Enter your address"
                            className={styles.addressInput}
                        />
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter your phone number"
                            className={styles.phoneInput}
                        />
                        <div className={styles.paymentMethodSection}>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className={styles.paymentDropdown}
                            >
                                <option value="cash">Cash</option>
                                <option value="visa">Visa</option>
                            </select>
                        </div>
                        {paymentMethod === 'visa' && (
                            <div className={styles.visaInfo}>
                                <input
                                    type="text"
                                    value={visaNumber}
                                    onChange={(e) => setVisaNumber(e.target.value)}
                                    placeholder="Visa Number"
                                    className={styles.visaInput}
                                />
                                <input
                                    type="text"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    placeholder="MM/YY"
                                    className={styles.visaInput}
                                />
                                <input
                                    type="text"
                                    value={cvc}
                                    onChange={(e) => setCvc(e.target.value)}
                                    placeholder="CVC"
                                    className={styles.visaInput}
                                />
                            </div>
                        )}
                        <p>Store Address: {storeAddress}</p>
                        <p>Subtotal: ILS{cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0)}</p>
                        <p>Promo Discount: -ILS{((promoDiscount / 100) * cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0)).toFixed(2)}</p>
                        <p>Delivery Fee: ILS{deliveryFee}</p>
                        <h2>Total: ILS{calculateTotal().toFixed(2)}</h2>
                        <button onClick={handleCheckout} className={styles.checkoutButton}>Checkout</button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default withAuth(CartPage);
