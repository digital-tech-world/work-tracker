const crypto = require('crypto');

class TokenStore {
  constructor() {
    // In a production app, we would use a database or Redis
    this.tokens = new Map(); // key: serviceName, value: { access_token, refresh_token, expiry_date, profile }
    this.encryptionKey = process.env.TOKEN_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    // Ensure the key is 32 bytes for AES-256
    if (this.encryptionKey.length < 64) {
      // Pad or hash to 32 bytes
      const hash = crypto.createHash('sha256').update(this.encryptionKey).digest('hex');
      this.encryptionKey = hash;
    } else if (this.encryptionKey.length > 64) {
      this.encryptionKey = this.encryptionKey.slice(0, 64);
    }
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  decrypt(encryptedText) {
    const data = Buffer.from(encryptedText, 'base64');
    const iv = data.slice(0, 16);
    const tag = data.slice(16, 32);
    const encrypted = data.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  storeTokens(serviceName, tokens, profile = null) {
    // Encrypt the tokens before storing
    const tokensJSON = JSON.stringify(tokens);
    const encrypted = this.encrypt(tokensJSON);
    this.tokens.set(serviceName, {
      ...tokens,
      _encrypted: encrypted, // We store the encrypted version for cookie setting, but also keep the decrypted for quick access
      profile: profile || null // Store profile info (email, name, picture)
    });
  }

  getTokens(serviceName) {
    const tokenData = this.tokens.get(serviceName);
    if (!tokenData) {
      return null;
    }
    // If we have the decrypted tokens, return them; otherwise, decrypt from stored encrypted
    if (tokenData.access_token && tokenData.refresh_token) {
      return tokenData;
    }
    if (tokenData._encrypted) {
      const decrypted = this.decrypt(tokenData._encrypted);
      const tokens = JSON.parse(decrypted);
      // Update the store with decrypted tokens for faster access next time
      this.tokens.set(serviceName, { ...tokens, _encrypted: tokenData._encrypted, profile: tokenData.profile });
      return tokenData;
    }
    return null;
  }

  getProfile(serviceName) {
    const tokenData = this.tokens.get(serviceName);
    return tokenData ? tokenData.profile : null;
  }

  removeTokens(serviceName) {
    this.tokens.delete(serviceName);
  }
}

module.exports = new TokenStore();