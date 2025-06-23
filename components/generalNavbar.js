import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faBars, faSignOutAlt, faHome, faShoppingCart, faInfoCircle, faAddressCard, faBell, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import styles from './Navbar.module.css';
import axiosInstance from '../lib/axios';
import Link from 'next/link';

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (session?.user?.accessToken) {
      axiosInstance.get('/cart/', {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`
        }
      })
      .then(response => {
        setCartCount(response.data.items.length);
      })
      .catch(error => console.error('Failed to fetch cart count:', error));
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login'); // Redirect to login page after logout
  };

  const toggleSearch = () => {
    setSearchOpen(prev => !prev);
  };

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const handleSearchChange = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      try {
        const response = await axiosInstance.get(`/search/?q=${e.target.value}`);
        console.log("Search Results:", response.data); // لطباعة النتائج والتحقق منها
        setSearchResults(response.data.results || []);
      } catch (error) {
        console.error('Failed to fetch search results:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSelect = (result) => {
    setSearchQuery('');
    setSearchResults([]);
    router.push(result.url);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${searchQuery}`);
    }
  };

  return (
    <motion.nav
      className={styles.navbar}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={styles.logo}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Link href="/">HISBA</Link>
      </motion.div>
      <div className={styles.rightSection}>
        <ul className={`${styles.navList} ${menuOpen ? styles.navListOpen : ''}`}>
          <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className={styles.searchIcon}>
            <FontAwesomeIcon icon={faSearch} onClick={toggleSearch} />
          </motion.li>
          <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}><Link href="/" className={styles.navItem}><FontAwesomeIcon icon={faHome} /> </Link></motion.li>
          {session && (
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className={styles.cartIcon}>
              <Link href="/cart" className={styles.navItem}>
                <FontAwesomeIcon icon={faShoppingCart} />
                {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
              </Link>
            </motion.li>
          )}
          {session && <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}><button onClick={handleLogout} className={styles.logoutButton}><FontAwesomeIcon icon={faSignOutAlt} className={styles.navItem} /></button></motion.li>}
          {!session && (
            <>
              <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}><Link href="/register" className={styles.navItem}><FontAwesomeIcon icon={faAddressCard} /> Register</Link></motion.li>
              <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}><Link href="/login" className={styles.navItem}><FontAwesomeIcon icon={faSignInAlt} /> </Link></motion.li>
            </>
          )}
          {session && (
            <motion.li className={styles.navItemDropdown} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link href="#" className={styles.navItem}><FontAwesomeIcon icon={faBars} /> </Link>
              <ul className={styles.dropdownMenu}>
                <li><Link href="/profile" className={styles.dropdownItem}>My Profile</Link></li>
                <li><Link href="/orders" className={styles.dropdownItem}>My Order</Link></li>
{session?.user?.role === 'customer' &&( <li><Link href="/storeRequest" className={styles.dropdownItem}>Open Stall</Link></li>)}
{session?.user?.role === 'seller' && ( <li><Link href="/SellerOrders" className={styles.dropdownItem}>Incoming orders</Link></li>)}
{session?.user?.role === 'seller' && ( <li><Link href="/MyStorePage" className={styles.dropdownItem}>my stall</Link></li>)}

                <li><button onClick={handleLogout} className={styles.logoutButton}><FontAwesomeIcon icon={faSignOutAlt} />Log out </button></li>
              </ul>
            </motion.li>
          )}
        </ul>
        <div className={styles.menuIcon} onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} />
        </div>
      </div>
      {searchOpen && (
        <motion.div
          className={styles.searchContainer}
          initial={{ width: 0 }}
          animate={{ width: '50%' }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchResults.length > 0 && (
              <ul className={styles.searchResults}>
                {searchResults.map((result, index) => (
                  <li key={index} onClick={() => handleSearchSelect(result)}>
                    {result.name}
                  </li>
                ))}
              </ul>
            )}
          </form>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
