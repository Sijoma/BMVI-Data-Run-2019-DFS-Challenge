import redis
import time

def mock_tile38():
    client = redis.Redis(host='tile38', port=9851)
    
    for i in range(0,25):
        result = client.execute_command('set', 'fleet', 'truck1', 'point', '33.5{0}'.format(str(i).zfill(2)), -112.27)
        time.sleep(1)

if __name__ == '__main__':
    mock_tile38()