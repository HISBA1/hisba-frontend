import Link from 'next/link';
import styles from './adminStyles/AdminNavbar.module.css'; // أساليب CSS الخاصة بالنافبار
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faBars, faTachometerAlt, faUser, faBox, faTicketAlt , faStore, faChartLine, faClipboardList, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const AdminNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await signOut();
    router.push('/login'); // Redirect to login page after logout
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/admin/dashboard" legacyBehavior><Link>Hisba Admin</Link></Link>
      </div>
      <div className={styles.links}>
        <Link href="/admin/dashboard" legacyBehavior><a><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard</a></Link>
        <Link href="/admin/users" legacyBehavior><a><FontAwesomeIcon icon={faUser} /> Users</a></Link>
        <Link href="/admin/adminProducts" legacyBehavior><a><FontAwesomeIcon icon={faBox} /> Products</a></Link>
        <Link href="/admin/stores" legacyBehavior><a><FontAwesomeIcon icon={faStore} /> Stores</a></Link>
        
        <div className={styles.navItemDropdown} onClick={toggleDropdown} ref={dropdownRef}>
          <Link className={styles.navItem}><FontAwesomeIcon icon={faBars} /></Link>
          {isDropdownOpen && (
            <ul className={styles.dropdownMenu}>
              <li><Link href="/profile" className={styles.dropdownItem}><FontAwesomeIcon icon={faUser} /> My Profile</Link></li>
              <li><Link href="/admin/stores" className={styles.dropdownItem}><FontAwesomeIcon icon={faStore} /> Stores</Link></li>
              <li><Link href="/admin/orders" className={styles.dropdownItem}><FontAwesomeIcon icon={faClipboardList} /> Orders</Link></li>
              <li><Link href="/admin/store-requests" className={styles.dropdownItem}><FontAwesomeIcon icon={faFileAlt} /> Store Requests</Link></li>
              <li><Link href="/admin/promo-codes" className={styles.dropdownItem}><FontAwesomeIcon icon={faTicketAlt} /> Promo Code</Link></li>
              <li><Link href="/admin/reports" className={styles.dropdownItem}><FontAwesomeIcon icon={faChartLine} /> Reports</Link></li>
              <li><button onClick={handleLogout} className={styles.logoutButton}><FontAwesomeIcon icon={faSignOutAlt} /> Log out</button></li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
