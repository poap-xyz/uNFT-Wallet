const DB_NAME = 'wallet1155db';
const DB_VERSION = 1;
let DB;

export default {
  async getDb() {
    return new Promise((resolve, reject) => {
      if (DB) {
        return resolve(DB);
      }
      console.log('OPENING DB', DB);
      let request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = e => {
        console.log('Error opening db', e);
        reject('Error');
      };

      request.onsuccess = e => {
        DB = e.target.result;
        resolve(DB);
      };

      request.onupgradeneeded = e => {
        console.log('onupgradeneeded');
        const db = e.target.result;
        const contractObjectStore = db.createObjectStore('contracts', {
          autoIncrement: true
        });
        contractObjectStore.createIndex('chainAccount', ['chain', 'account'], {
          unique: false
        });
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
    });
  },
  async deleteContract(chain, account, address) {
    let db = await this.getDb();

    return new Promise(resolve => {
      let trans = db.transaction(['contracts'], 'readwrite');
      trans.oncomplete = () => {
        resolve();
      };

      let objectStore = trans.objectStore('contracts');

      var index = objectStore.index('chainAccountAddress');
      index.getKey([chain, account, address]).onsuccess = e => {
        objectStore.delete(e.target.result);
      };
    });
  },
  async updateContractScan(chain, account, address, lastScanBlock) {
    let db = await this.getDb();

    return new Promise(resolve => {
      let trans = db.transaction(['contracts'], 'readwrite');
      trans.oncomplete = () => {
        resolve();
      };

      const objectStore = trans.objectStore('contracts');

      var index = objectStore.index('chainAccountAddress');
      index.getKey([chain, account, address]).onsuccess = e => {
        const index = e.target.result;
        objectStore.get(index).onsuccess = e => {
          let contract = e.target.result;
          contract.lastScanBlock = lastScanBlock;
          objectStore.put(contract, index);
        };
      };
    });
  },
  async getContracts(chain, account) {
    let db = await this.getDb();

    return new Promise(resolve => {
      let trans = db.transaction(['contracts'], 'readonly');
      trans.oncomplete = () => {
        resolve(contracts);
      };

      let objectStore = trans.objectStore('contracts');
      let contracts = [];

      var index = objectStore.index('chainAccount');
      index.openCursor([chain, account]).onsuccess = e => {
        let cursor = e.target.result;
        if (cursor) {
          contracts.push(cursor.value);
          cursor.continue();
        }
      };
    });
  },

  async addContract(contract) {
    let db = await this.getDb();

    return new Promise(resolve => {
      let trans = db.transaction(['contracts'], 'readwrite');
      trans.oncomplete = () => {
        resolve();
      };

      let objectStore = trans.objectStore('contracts');
      objectStore.put(contract);
    });
  },

  async putToken(chain, account, address, token) {
    let db = await this.getDb();

    return new Promise(resolve => {
      let trans = db.transaction(['tokens'], 'readwrite');
      trans.oncomplete = () => {
        resolve();
      };

      let objectStore = trans.objectStore('tokens');

      let completeToken = { ...token, chain, account, address };

      var index = objectStore.index('chainAccountAddressId');
      var search = index.getKey([chain, account, address, token.id]);
      search.onsuccess = e => {
        const index = e.target.result;
        objectStore.put(completeToken, index);
      };
      search.onerror = () => {
        objectStore.put(completeToken);
      };
    });
  },

  async getTokens(chain, account, address) {
    let db = await this.getDb();

    return new Promise(resolve => {
      let trans = db.transaction(['tokens'], 'readonly');
      trans.oncomplete = () => {
        resolve(tokens);
      };

      let objectStore = trans.objectStore('tokens');
      let tokens = [];

      var index = objectStore.index('chainAccountAddress');
      index.openCursor([chain, account, address]).onsuccess = e => {
        let cursor = e.target.result;
        if (cursor) {
          tokens.push(cursor.value);
          cursor.continue();
        }
      };
    });
  }
};
