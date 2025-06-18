import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import withAuth from '../../components/withAuth';
import { useSession } from 'next-auth/react';
import styles from './styles/AdminDashboard.module.css';

const Dashboard = () => {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentStoreRequests, setRecentStoreRequests] = useState([]);
    const [stores, setStores] = useState([]);
    const [filteredStores, setFilteredStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const [salesData, setSalesData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!session?.user?.accessToken) {
                setError('Access token is missing');
                setLoading(false);
                return;
            }
            try {
                const [statsResponse, ordersResponse, usersResponse, storeRequestsResponse, storesResponse, salesResponse] = await Promise.all([
                    axios.get('http://localhost:8000/api/dashboard-stats/', {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    }),
                    axios.get('http://localhost:8000/api/orders/recent/', {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    }),
                    axios.get('http://localhost:8000/api/users/recent/', {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    }),
                    axios.get('http://localhost:8000/api/store-requests/recent/', {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    }),
                    axios.get('http://localhost:8000/api/stores/', {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    }),
                    axios.get('http://localhost:8000/api/reports/sales/', {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    })
                ]);
                setStats(statsResponse.data);
                setRecentOrders(ordersResponse.data.slice(0, 5));
                setRecentUsers(usersResponse.data.slice(0, 5));
                setRecentStoreRequests(storeRequestsResponse.data.slice(0, 5));
                setStores(storesResponse.data);
                setFilteredStores(storesResponse.data);
                setSalesData(salesResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error.response ? error.response.data : error.message);
                setError('Failed to fetch dashboard data');
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchStats();
        }
    }, [session, status]);

    const handleStoreChange = (event) => {
        setSelectedStore(event.target.value);
    };

    const handleSearchChange = (event) => {
        const searchValue = event.target.value.toLowerCase();
        const filtered = stores.filter(store => store.name.toLowerCase().includes(searchValue));
        setFilteredStores(filtered);
    };

    const calculatePercentage = (value, total) => {
        return ((value / total) * 100).toFixed(2);
    };

    if (loading) {
        return <div className={styles.container}><div className={styles.loading}></div></div>;
    }

    if (error) {
        return <div className={styles.container}><h6>{error}</h6></div>;
    }

    if (!stats) {
        return <div className={styles.container}><h6>No stats available</h6></div>;
    }

    const selectedStoreData = salesData.find(store => store.store__name === selectedStore);
    const totalSales = salesData.reduce((acc, store) => acc + store.total_sales, 0);

    const storeStats = selectedStoreData ? [
        { name: 'Sales', value: selectedStoreData.total_sales },
        { name: 'Other Sales', value: totalSales - selectedStoreData.total_sales }
    ] : [];

    const COLORS = ['#0088FE', '#FFBB28'];

    const top3Stores = salesData.slice(0, 3);
    const bottom3Stores = salesData.slice(-3).filter(store => store.total_sales >= 0);

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.container}>
                <h1 className={styles.dashboardTitle}>Dashboard</h1>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>General Statistics</h2>
                            <p className={styles.statItem}>Users: {stats.users_count}</p>
                            <p className={styles.statItem}>Products: {stats.products_count}</p>
                            <p className={styles.statItem}>Orders: {stats.orders_count}</p>
                            <p className={styles.statItem}>Total Sales: ILS {stats.total_sales}</p>
                        </div>
                    </div>
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <div className={styles.cardContent}>
                                <h2 className={styles.cardTitle}>Top 3 Stores</h2>
                                {top3Stores.map(store => (
                                    <p className={styles.statItem} key={store.store__name}>
                                        {store.store__name}: ILS {store.total_sales}
                                    </p>
                                ))}
                            </div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardContent}>
                                <h2 className={styles.cardTitle}>Bottom 3 Stores</h2>
                                {bottom3Stores.map(store => (
                                    <p className={styles.statItem} key={store.store__name}>
                                        {store.store__name}: ILS {store.total_sales}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardContent}>
                            <label htmlFor="storeSelect">Select a Store</label>
                            <select 
                                id="storeSelect" 
                                className={styles.dropdown} 
                                value={selectedStore} 
                                onChange={handleStoreChange}
                            >
                                <option value="" disabled>Select a Store</option>
                                {filteredStores.map(store => (
                                    <option key={store.id} value={store.name}>{store.name}</option>
                                ))}
                            </select>
                        </div>
                        {selectedStore && (
                            <div className={styles.card}>
                                <div className={styles.cardContent}>
                                    <h2 className={styles.cardTitle}>Store Statistics</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={storeStats}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                fill="#8884d8"
                                                label={({ name, value }) => `${name}: ${calculatePercentage(value, totalSales)}%`}
                                            >
                                                {storeStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${calculatePercentage(value, totalSales)}%`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>Recent Orders</h2>
                            <div className={styles.itemList}>
                                {recentOrders.map(order => (
                                    <div key={order.id} className={styles.dashboardItem}>
                                        <p>Order #{order.id}</p>
                                        <p>Total: ILS {order.total_amount}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>Recent Users</h2>
                            <div className={styles.itemList}>
                                {recentUsers.map(user => (
                                    <div key={user.id} className={styles.dashboardItem}>
                                        <p>{user.username}</p>
                                        <p>Email: {user.email}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>Recent Store Requests</h2>
                            <div className={styles.itemList}>
                                {recentStoreRequests.map(request => (
                                    <div key={request.id} className={styles.dashboardItem}>
                                        <p>Request #{request.id}</p>
                                        <p>Store Name: {request.store_name}</p>
                                        <p>Status: {request.status}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuth(Dashboard);
