import { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error('useProducts must be used within a ProductProvider');
    return context;
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('products');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
    }, [products]);

    const addProduct = (product) => {
        const newProduct = { ...product, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        setProducts(prev => [newProduct, ...prev]);
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const updateProduct = (id, updatedData) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, deleteProduct, updateProduct }}>
            {children}
        </ProductContext.Provider>
    );
};
