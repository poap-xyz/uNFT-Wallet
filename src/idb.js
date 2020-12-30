const DB_NAME = 'wallet1155db';
const DB_VERSION = 1;
let DB;

export default {
  async getDb() {
    return new Promise((resolve, reject) => {
      if (DB) {
        resolve(DB);
      } else {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = e => {
          reject('Error', e);
        };

        request.onsuccess = e => {
          DB = e.target.result;
          resolve(DB);
        };

        request.onupgradeneeded = e => {
          const db = e.target.result;
          const contractObjectStore = db.createObjectStore('contracts', {
            autoIncrement: true
          });
          contractObjectStore.createIndex(
            'chainAccount',
            ['chain', 'account'],
            {
              unique: false
            }
          );
          contractObjectStore.createIndex(
            'chainAccountAddress',
            ['chain', 'account', 'address'],
            {
              unique: true
            }
          );

          const tokenObjectStore = db.createObjectStore('tokens', {
            autoIncrement: true
          });
          tokenObjectStore.createIndex(
            'chainAccountAddress',
            ['chain', 'account', 'address'],
            {
              unique: false
            }
          );
          tokenObjectStore.createIndex(
            'chainAccountAddressId',
            ['chain', 'account', 'address', 'id'],
            {
              unique: true
            }
          );
        };
      }
    });
  },
  async deleteContract(chain, account, address) {
    const db = await this.getDb();

    return new Promise(resolve => {
      const trans = db.transaction(['contracts', 'tokens'], 'readwrite');
      trans.oncomplete = () => {
        resolve();
      };

      const contractsObjectStore = trans.objectStore('contracts');
      const tokensObjectStore = trans.objectStore('tokens');

      const contractsIndex = contractsObjectStore.index('chainAccountAddress');
      contractsIndex.getKey([chain, account, address]).onsuccess = e => {
        contractsObjectStore.delete(e.target.result);
      };

      const tokensIndex = tokensObjectStore.index('chainAccountAddress');
      tokensIndex.openCursor([chain, account, address]).onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          tokensObjectStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
    });
  },
  async updateContractScan(chain, account, address, lastScanBlock) {
    const db = await this.getDb();

    return new Promise(resolve => {
      const trans = db.transaction(['contracts'], 'readwrite');
      trans.oncomplete = () => {
        resolve();
      };

      const objectStore = trans.objectStore('contracts');

      const index = objectStore.index('chainAccountAddress');
      index.getKey([chain, account, address]).onsuccess = e => {
        const tokenIndex = e.target.result;
        objectStore.get(tokenIndex).onsuccess = eToken => {
          const contract = eToken.target.result;
          contract.lastScanBlock = lastScanBlock;
          objectStore.put(contract, tokenIndex);
        };
      };
    });
  },
  async getContracts(chain, account) {
    const db = await this.getDb();

    return new Promise(resolve => {
      const trans = db.transaction(['contracts'], 'readonly');
      const objectStore = trans.objectStore('contracts');
      const contracts = [];

      const index = objectStore.index('chainAccount');
      index.openCursor([chain, account]).onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          contracts.push(cursor.value);
          cursor.continue();
        }
      };
      trans.oncomplete = () => {
        resolve(contracts);
      };
    });
  },

  async addContract(contract) {
    const db = await this.getDb();

    return new Promise(resolve => {
      const trans = db.transaction(['contracts'], 'readwrite');
      trans.oncomplete = () => {
        resolve();
      };

      const objectStore = trans.objectStore('contracts');
      objectStore.put(contract);
    });
  },

  async putToken(chain, account, address, token) {
    const db = await this.getDb();

    return new Promise(resolve => {
      const trans = db.transaction(['tokens'], 'readwrite');
      trans.oncomplete = () => {
        resolve();
      };

      const objectStore = trans.objectStore('tokens');

      const completeToken = { ...token, chain, account, address };

      const index = objectStore.index('chainAccountAddressId');
      const search = index.getKey([chain, account, address, token.id]);
      search.onsuccess = e => {
        const tokenIndex = e.target.result;
        objectStore.put(completeToken, tokenIndex);
      };
      search.onerror = () => {
        objectStore.put(completeToken);
      };
    });
  },

  async getTokens(chain, account, address) {
    const db = await this.getDb();

    return new Promise(resolve => {
      const trans = db.transaction(['tokens'], 'readonly');
      const objectStore = trans.objectStore('tokens');
      const tokens = [];

      const index = objectStore.index('chainAccountAddress');
      index.openCursor([chain, account, address]).onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          tokens.push(cursor.value);
          cursor.continue();
        }
      };
      trans.oncomplete = () => {
        resolve(tokens);
      };
    });
  }
};
