# Personal Bookkeeping Backend

A simple Flask backend for managing personal financial transactions.

## Features

- **Transaction Management**: Create, read, and delete transactions
- **Financial Statistics**: Calculate income, expenses, and balance
- **Data Validation**: Input validation for all transaction fields
- **CORS Support**: Cross-origin requests for frontend integration
- **Health Check**: Monitor backend status

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction
- `DELETE /api/transactions/<id>` - Delete a transaction by ID

### Statistics
- `GET /api/statistics` - Get financial statistics

### Health
- `GET /api/health` - Health check endpoint

## Transaction Data Structure

```json
{
  "id": 1,
  "date": "2026-01-25",
  "amount": 100.50,
  "currency": "CNY",
  "type": "餐饮",
  "note": "午餐费用",
  "created_at": "2026-01-25T16:00:00.000000"
}
```

## Running the Backend

### Method 1: Direct execution
```bash
cd backend
python app.py
```

### Method 2: Using the runner
```bash
cd backend
python run.py
```

### Method 3: Using Flask command
```bash
cd backend
flask run
```

## Configuration

Environment variables:
- `SECRET_KEY`: Flask secret key (default: 'dev-secret-key-change-in-production')
- `FLASK_DEBUG`: Enable debug mode (default: 'True')

## Development Setup

1. Activate virtual environment:
```bash
cd backend
..\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

## Testing

You can test the API using curl or any API client:

### Create a transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-25",
    "amount": 50.00,
    "currency": "CNY",
    "type": "餐饮",
    "note": "午餐"
  }'
```

### Get all transactions
```bash
curl http://localhost:5000/api/transactions
```

### Get statistics
```bash
curl http://localhost:5000/api/statistics
```

## Production Considerations

- Replace in-memory storage with a database (SQLite, PostgreSQL, etc.)
- Add user authentication and authorization
- Implement proper error logging
- Add input sanitization and security measures
- Set up proper CORS policies for production domains
- Add API rate limiting
- Implement data validation and constraints

## Frontend Integration

The backend is configured to work with the frontend at `http://localhost:8000`. Make sure both servers are running for full functionality.
