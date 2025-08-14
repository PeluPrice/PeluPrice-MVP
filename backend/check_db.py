import sqlite3

conn = sqlite3.connect('peluprice.db')
cursor = conn.cursor()

# Check tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('Available tables:', [t[0] for t in tables])

# Check devices table structure
cursor.execute('PRAGMA table_info(devices)')
device_columns = cursor.fetchall()
print('\nDevices table structure:')
for col in device_columns:
    print(f'  {col[1]} ({col[2]}) - Nullable: {not col[3]}, Default: {col[4]}')

# Check current devices
cursor.execute('SELECT * FROM devices LIMIT 5')
devices = cursor.fetchall()
print('\nCurrent devices:')
for device in devices:
    print(f'  {device}')

# Check if users table exists
try:
    cursor.execute('PRAGMA table_info(users)')
    user_columns = cursor.fetchall()
    print('\nUsers table structure:')
    for col in user_columns:
        print(f'  {col[1]} ({col[2]}) - Nullable: {not col[3]}, Default: {col[4]}')
    
    cursor.execute('SELECT * FROM users LIMIT 5')
    users = cursor.fetchall()
    print('\nCurrent users:')
    for user in users:
        print(f'  {user}')
except Exception as e:
    print(f'\nUsers table issue: {e}')

conn.close()
