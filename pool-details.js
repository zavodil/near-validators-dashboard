// Pool Details Module - fetches validator contact information from pool-details.near contract

const POOL_DETAILS_CONTRACT = 'pool-details.near';
const NEAR_RPC_URL = 'https://rpc.mainnet.fastnear.com';

class PoolDetailsService {
    constructor() {
        this.poolDetails = {};
        this.loaded = false;
    }

    /**
     * Loads all pool details from pool-details.near contract
     */
    async loadPoolDetails() {
        if (this.loaded) {
            return this.poolDetails;
        }

        console.log('Loading pool details from contract...');

        try {
            // Call get_all_fields method on the contract
            const result = await this.callViewMethod(
                POOL_DETAILS_CONTRACT,
                'get_all_fields',
                { from_index: 0, limit: 300 }
            );

            this.poolDetails = result || {};
            this.loaded = true;

            console.log(`Loaded details for ${Object.keys(this.poolDetails).length} pools`);
            return this.poolDetails;
        } catch (error) {
            console.error('Error loading pool details:', error);
            return {};
        }
    }

    /**
     * Calls a view method on a NEAR contract
     */
    async callViewMethod(contractId, methodName, args) {
        const response = await fetch(NEAR_RPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'dontcare',
                method: 'query',
                params: {
                    request_type: 'call_function',
                    finality: 'final',
                    account_id: contractId,
                    method_name: methodName,
                    args_base64: btoa(JSON.stringify(args))
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'RPC call failed');
        }

        // Decode result
        const resultString = String.fromCharCode.apply(null, data.result.result);
        return JSON.parse(resultString);
    }

    /**
     * Gets pool details by account_id
     */
    getPoolInfo(poolAccountId) {
        // Remove .near or .poolv1.near suffix to get base ID
        const poolId = poolAccountId.replace(/\.(poolv1\.near|near)$/, '');

        // Try to find by full ID
        if (this.poolDetails[poolAccountId]) {
            return this.poolDetails[poolAccountId];
        }

        // Try to find by base ID
        if (this.poolDetails[poolId]) {
            return this.poolDetails[poolId];
        }

        return null;
    }

    /**
     * Formats pool information for display
     */
    formatPoolInfo(poolAccountId) {
        const info = this.getPoolInfo(poolAccountId);

        if (!info) {
            return null;
        }

        const formatted = {
            name: info.name || null,
            description: info.description || null,
            url: info.url || null,
            email: info.email || null,
            twitter: info.twitter || null,
            telegram: info.telegram || null,
            discord: info.discord || null,
            country: info.country || null,
            country_code: info.country_code || null,
            city: info.city || null
        };

        return formatted;
    }

    /**
     * Creates HTML for displaying validator contacts
     * @param {string} poolAccountId - Pool ID
     * @param {boolean} skipQuickLinks - If true, skip Twitter and URL (already shown in quick links)
     */
    createContactsHTML(poolAccountId, skipQuickLinks = false) {
        const info = this.formatPoolInfo(poolAccountId);

        if (!info) {
            return '';
        }

        let html = '<div class="pool-contacts">';

        // Name
        if (info.name) {
            html += `<div class="contact-item"><strong>${info.name}</strong></div>`;
        }

        // Description
        if (info.description) {
            html += `<div class="contact-item description">${info.description}</div>`;
        }

        // Location
        if (info.country || info.city) {
            let location = [];
            if (info.city) location.push(info.city);
            if (info.country) location.push(info.country);
            if (info.country_code) {
                html += `<div class="contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="flag-icon flag-icon-${info.country_code.toLowerCase()}"></span>
                    ${location.join(', ')}
                </div>`;
            } else {
                html += `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${location.join(', ')}</div>`;
            }
        }

        // Website (skip if skipQuickLinks)
        if (info.url && !skipQuickLinks) {
            let url = info.url;
            if (!/^https?:\/\//i.test(url)) {
                url = 'http://' + url;
            }
            html += `<div class="contact-item">
                <i class="fas fa-globe"></i>
                <a href="${url}" target="_blank">${info.url}</a>
            </div>`;
        }

        // Email
        if (info.email) {
            html += `<div class="contact-item">
                <i class="fas fa-envelope"></i>
                <a href="mailto:${info.email}">${info.email}</a>
            </div>`;
        }

        // Twitter (skip if skipQuickLinks)
        if (info.twitter && !skipQuickLinks) {
            const twitterHandle = info.twitter.replace('@', '');
            html += `<div class="contact-item">
                <i class="fab fa-twitter"></i>
                <a href="https://twitter.com/${twitterHandle}" target="_blank">@${twitterHandle}</a>
            </div>`;
        }

        // Telegram
        if (info.telegram) {
            const telegramHandle = info.telegram.replace('@', '');
            html += `<div class="contact-item">
                <i class="fab fa-telegram"></i>
                <a href="https://t.me/${telegramHandle}" target="_blank">@${telegramHandle}</a>
            </div>`;
        }

        // Discord
        if (info.discord) {
            html += `<div class="contact-item">
                <i class="fab fa-discord"></i>
                ${info.discord}
            </div>`;
        }

        html += '</div>';

        return html;
    }

    /**
     * Creates short tooltip text
     */
    createTooltipText(poolAccountId) {
        const info = this.formatPoolInfo(poolAccountId);

        if (!info) {
            return null;
        }

        let parts = [];

        if (info.name) parts.push(info.name);
        if (info.country) parts.push(info.country);
        if (info.description) {
            const shortDesc = info.description.length > 100
                ? info.description.substring(0, 100) + '...'
                : info.description;
            parts.push(shortDesc);
        }

        return parts.join(' | ');
    }
}

// Create global service instance
window.poolDetailsService = new PoolDetailsService();
