import { SessionProvider } from 'next-auth/react';
import Layout from '../components/Layout';
import '../styles/globals.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { CartProvider } from '../context/CartContext';
import { getSession } from 'next-auth/react'; // <--- استيراد getSession

function MyApp({ Component, pageProps }) { // <--- لا تقم بـ destructure هنا، مرر pageProps كاملة
  console.log("MyApp session:", pageProps.session); // للتأكد من أنها لم تعد undefined
  return (
    <SessionProvider session={pageProps.session}> {/* <--- تمرير pageProps.session */}
     <CartProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      </CartProvider>
    </SessionProvider>
  );
}

// <--- إضافة getInitialProps لجلب الجلسة على جانب الخادم
MyApp.getInitialProps = async (context) => {
  const session = await getSession(context); // جلب الجلسة
  return {
    pageProps: {
      session, // تمرير الجلسة التي تم جلبها إلى pageProps
    },
  };
};

export default MyApp;
