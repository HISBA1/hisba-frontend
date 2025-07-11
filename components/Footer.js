import React from 'react';
import styles from '../styles/Footer.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles.column}>
            <h3>About Us</h3>
            <p>We are a platform dedicated to providing the best services to our users. Our mission is to make your life easier and more convenient.</p>
          </div>
          <div className={styles.column}>
            <h3>Quick Links</h3>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/register">Register</Link></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h3>Follow Us</h3>
            <div className={styles.socialIcons}>
              <Link href="https://www.facebook.com"><FontAwesomeIcon icon={faFacebook} /></Link>
              <Link href="https://www.twitter.com"><FontAwesomeIcon icon={faTwitter} /></Link>
              <Link href="https://www.instagram.com"><FontAwesomeIcon icon={faInstagram} /></Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 HISBA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
