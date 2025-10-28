import requests
import sys
import json
import os
from datetime import datetime

# Get script directory path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def main(addr):
    q1 = f"http://{addr}/debug/api/epoch_info"
    p1 = requests.get(q1)
    q2 = f"http://{addr}/debug/api/entity"
    p2 = requests.post(q2, json={"EpochInfoAggregator": None})
    j1, j2 = p1.json(), p2.json()

    # Get total validators count via RPC
    try:
        rpc_response = requests.post(
            'https://rpc.mainnet.fastnear.com',
            json={
                "jsonrpc": "2.0",
                "id": "dontcare",
                "method": "validators",
                "params": [None]
            }
        )
        validators_data = rpc_response.json()
        total_validators_count = len(validators_data.get('result', {}).get('current_validators', []))
    except Exception as e:
        print(f"Warning: Could not fetch total validators count: {e}")
        total_validators_count = None

    # Get versions from version_tracker
    versions = [entry['value'] for entry in j2['entries'] if entry['name'] == 'version_tracker'][0]
    versions = [(int(v['name']), v['value']) for v in versions['entries']]

    epoch_id = [entry['value'] for entry in j2['entries'] if entry['name'] == 'epoch_id'][0]
    epoch_info = [
        entry for entry in j1['status_response']['EpochInfo'] if entry['epoch_id'] == epoch_id
    ][0]

    # Get list of block producers
    bps = [entry['account_id'] for entry in epoch_info['block_producers']]

    # Get stakes for all validators
    stakes = {
        entry['account_id']: entry['stake']
        for entry in epoch_info['validator_info']['current_validators']
    }

    # Collect data only for block producers (those with version info)
    vdr_version_stake = [
        {
            'account_id': bps[idx],
            'version': version,
            'stake': int(stakes[bps[idx]]) / 10**24  # Convert to NEAR
        }
        for (idx, version) in versions
    ]

    vdr_version_stake.sort(key=lambda x: x['stake'], reverse=True)

    # Calculate total stake of block producers
    total_stake = sum([v['stake'] for v in vdr_version_stake])

    # Group by versions
    stake_by_version = {}
    validators_by_version = {}
    for v in vdr_version_stake:
        ver = v['version']
        stake_by_version[ver] = stake_by_version.get(ver, 0) + v['stake']
        if ver not in validators_by_version:
            validators_by_version[ver] = []
        validators_by_version[ver].append(v)

    # Prepare data for saving
    output_data = {
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'total_validators': total_validators_count,
            'block_producers': len(vdr_version_stake),
            'total_stake': total_stake
        },
        'validators': vdr_version_stake,
        'by_version': []
    }

    # Add statistics by version
    for ver, stake in sorted(stake_by_version.items(), key=lambda x: x[1], reverse=True):
        percent = (stake / total_stake) * 100
        count = len(validators_by_version[ver])
        output_data['by_version'].append({
            'version': ver,
            'stake': stake,
            'percent': percent,
            'count': count,
            'validators': validators_by_version[ver]
        })

    # Save to JSON file in the same directory as the script
    output_file = os.path.join(SCRIPT_DIR, 'validators_data.json')
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)

    print(f'Data saved to {output_file}')
    print(json.dumps(vdr_version_stake, indent=2))

    print(f'\nBlock producers: {len(vdr_version_stake)}')
    print(f'Total stake: {total_stake:.3f} NEAR')

    print('\nStake by version:')
    for item in output_data['by_version']:
        print(f'  Version {item["version"]}: {item["percent"]:.2f}% ({item["stake"]:.3f} NEAR) - {item["count"]} validators')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f'usage: python {sys.argv[0]} <node_addr:port>')
        exit(1)
    main(sys.argv[1])