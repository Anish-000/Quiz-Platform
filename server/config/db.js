const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false
    }
});

const promisePool = pool.promise();

// Auto-create answers table if not exists
async function createAnswersTable() {
    try {
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS answers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                attempt_id INT NOT NULL,
                question_id INT NOT NULL,
                selected_option_id INT,
                is_correct BOOLEAN DEFAULT false,
                FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id),
                FOREIGN KEY (question_id) REFERENCES questions(id),
                FOREIGN KEY (selected_option_id) REFERENCES options(id)
            )
        `);
        console.log('Answers table ready!');
    } catch (error) {
        console.error('Error creating answers table:', error);
    }
}

createAnswersTable();

module.exports = promisePool;