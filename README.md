# NEAR Protocol Validators Dashboard

A web dashboard for monitoring NEAR Protocol validators, their protocol versions, and stake distribution.

🔗 **Live Demo**: [https://nearspace.info/blog/tools/validators_dashboard.html](https://nearspace.info/blog/tools/validators_dashboard.html)

🐙 **GitHub Repository**: [https://github.com/zavodil/near-validators-dashboard](https://github.com/zavodil/near-validators-dashboard)

**Based on the script by [@evgenykuzyakov](https://gist.github.com/evgenykuzyakov):**
https://gist.github.com/darioush/be8e30ade6bfa59dda5381aef176cae6?permalink_comment_id=5822117

## Features

- 📊 **Protocol Version Distribution** - Pie chart showing stake distribution across protocol versions
- 👥 **Block Producers List** - All 100 block producers with their stakes
- 📞 **Validator Contacts** - Twitter, website, email, Telegram, Discord, and location info
- 🔄 **Auto-refresh** - Can be scheduled via cron to update every 10 minutes
- 📈 **Statistics** - Total validators count, block producers count, and total stake

## Files

- `protocol_version.py` - Python script to fetch validator data from NEAR RPC
- `validators_dashboard.html` - Web dashboard interface
- `pool-details.js` - Module to fetch validator contact information from `pool-details.near` contract

## Installation

1. Install Python dependencies:
```bash
pip3 install requests
```

2. Run the script to generate data:
```bash
python3 protocol_version.py RPC_URL
```

3. Open `validators_dashboard.html` in your browser

## Data Sources

- **Protocol Versions**: Fetched from NEAR node debug API (`/debug/api/entity`)
- **Total Validators**: Fetched from NEAR RPC (`validators` method)
- **Validator Contacts**: Fetched from `pool-details.near` contract via RPC

## Dashboard Features

### Summary Cards
- **Block Producers**: Number of active block producers (100)
- **Total Validators**: All validators in the network (~347)
- **Total Stake**: Combined stake of all block producers

### Version Lists
Each protocol version section shows:
- Number of block producers running that version
- Percentage of total stake
- List of validators with:
  - Account ID
  - Stake amount (in NEAR)
  - Quick links to Twitter and website (if available)
  - Detailed contact info (click ℹ️ icon)

### Contact Information
When available, displays:
- Validator name
- Description
- Website
- Email
- Twitter
- Telegram
- Discord
- Location (country/city)

## Example Output

```
Data saved to /path/to/validators_data.json

Block producers: 100
Total stake: 517399672.442 NEAR

Stake by version:
  Version 81: 67.85% (351030881.680 NEAR) - 67 validators
  Version 80: 32.15% (166368790.762 NEAR) - 33 validators
```

## Contributing

Feel free to submit issues and enhancement requests!
