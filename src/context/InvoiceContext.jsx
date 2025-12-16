import { createContext, useContext, useState, useEffect } from 'react';

const InvoiceContext = createContext();

export const useInvoices = () => {
    const context = useContext(InvoiceContext);
    if (!context) throw new Error('useInvoices must be used within an InvoiceProvider');
    return context;
};

export const InvoiceProvider = ({ children }) => {
    const [invoices, setInvoices] = useState(() => {
        const saved = localStorage.getItem('invoices');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('invoices', JSON.stringify(invoices));
    }, [invoices]);

    const addInvoice = async (invoice) => {
        // Optimistic UI update
        setInvoices(prev => [invoice, ...prev]);

        try {
            const res = await fetch('/api/bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoice)
            });
            if (!res.ok) throw new Error('Failed to save to DB');
        } catch (error) {
            console.error('Error saving invoice:', error);
            // In a real app, show error toast
        }
    };

    const getStats = () => {
        const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
        const totalInvoices = invoices.length;

        // Get sales for today (IST)
        const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
        const todaySales = invoices
            .filter(inv => {
                const invDate = new Date(inv.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
                return invDate === today;
            })
            .reduce((acc, inv) => acc + inv.total, 0);

        return { totalRevenue, totalInvoices, todaySales };
    };

    return (
        <InvoiceContext.Provider value={{ invoices, addInvoice, getStats }}>
            {children}
        </InvoiceContext.Provider>
    );
};
