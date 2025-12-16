const { Client } = require('pg');

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is missing');
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Database configuration missing' })
        };
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Neon/most cloud DBs
    });

    try {
        await client.connect();

        if (event.httpMethod === 'GET') {
            const { search } = event.queryStringParameters || {};
            let query = 'SELECT * FROM bills ORDER BY created_at DESC LIMIT 50';
            let params = [];

            if (search) {
                query = `
                    SELECT * FROM bills 
                    WHERE customer_name ILIKE $1 OR id ILIKE $1 
                    ORDER BY created_at DESC LIMIT 50
                `;
                params = [`%${search}%`];
            }

            const result = await client.query(query, params);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.rows)
            };
        }

        if (event.httpMethod === 'POST') {
            const data = JSON.parse(event.body);
            // Validation
            if (!data.id || !data.total) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
            }

            const query = `
                INSERT INTO bills (id, customer_name, subtotal, discount, tax, total, items, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;
            const values = [
                data.id,
                data.customerName || 'Walk-in Customer',
                data.subtotal,
                data.globalDiscount || 0,
                data.tax || 0,
                data.total,
                JSON.stringify(data.items),
                data.date || new Date().toISOString()
            ];

            const result = await client.query(query, values);
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(result.rows[0])
            };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

    } catch (error) {
        console.error('Database Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    } finally {
        await client.end();
    }
};
