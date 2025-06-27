// import React, { useEffect, useState } from 'react';
// import Web3 from 'web3';

// const INFURA_API_KEY = 'd1084dca4d904daab8bf45a34f5f7ba7';
// const TATUM_API_KEY = 't-685d0a7283bf415b084c7f2a-4f3be9dc9c92442d8f92309d';
// const ALCHEMY_API_KEY = 'z7lQmAD9FTun0WEB-3B_FL2GzjZJoP3R';

// const CHAINS = [
//   {
//     name: 'celo',
//     type: 'evm',
//     url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}`,
//   },
//   {
//     name: 'bsc',
//     type: 'evm',
//     url: 'https://bsc-dataseed1.binance.org/',
//   },
//   {
//     name: 'zksync',
//     type: 'evm',
//     url: 'https://mainnet.era.zksync.io',
//   },
//   {
//     name: 'ethereum',
//     type: 'evm',
//     url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
//   },
//   {
//     name: 'polygon',
//     type: 'evm',
//     url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
//   },
//   {
//     name: 'optimism',
//     type: 'evm',
//     url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
//   },
//   {
//     name: 'Base',
//     type: 'tatum',
//     url: `https://base-mainnet.gateway.tatum.io/${TATUM_API_KEY}`,
//   },
//   {
//     name: 'EOS',
//     type: 'tatum',
//     url: `https://eos-mainnet.gateway.tatum.io/${TATUM_API_KEY}`,
//   },
//   {
//     name: 'Solana',
//     type: 'tatum',
//     url: `https://solana-mainnet.gateway.tatum.io/${TATUM_API_KEY}`,
//   },
// ];

// const web3s = {};
// CHAINS.forEach(chain => {
// if (chain.type === 'evm') {
//     web3s[chain.name] = new Web3(chain.url);
//   }
// });

// function App() {
//   const [blockHashes, setBlockHashes] = useState(
//     CHAINS.reduce((acc, { name }) => {
//       acc[name] = { number: null, hash: '', updated: false };
//       return acc;
//     }, {})
//   );

//   const [mergedHash, setMergedHash] = useState('');
//   const [mergedHistory, setMergedHistory] = useState([]);

//   const mergeHashes = async (hashes) => {
//     const combined = hashes.join('');
//     const encoder = new TextEncoder();
//     const data = encoder.encode(combined);
//     const hashBuffer = await crypto.subtle.digest('SHA-256', data);
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
//   };

//   const fetchEVMBlock = async (chain) => {
//     try {
//       const block = await web3s[chain.name].eth.getBlock('latest');
//       if (!block) return;

//       setBlockHashes(prev => {
//         if (prev[chain.name].number === block.number) return prev;

//         return {
//           ...prev,
//           [chain.name]: {
//             number: block.number,
//             hash: block.hash,
//             updated: true,
//           },
//         };
//       });
//     } catch (err) {
//       console.error(`[${chain.name}] Error:`, err.message);
//     }
//   };

//   const fetchTatumBlock = async (chain) => {
//     try {
//       const res = await fetch(chain.url, {
//         headers: {
//           'x-api-key': TATUM_API_KEY,
//         },
//       });
//       const data = await res.json();

//       let number = null;
//       let hash = '';

//       switch (chain.name) {
//         case 'monero':
//         case 'litecoin':
//           number = data?.blockchainInfo?.blocks || data?.blocks;
//           hash = data?.blockchainInfo?.bestBlockHash || data?.bestBlockHash || 'unavailable';
//           break;
//         case 'binanceSmartChain':
//           number = data?.number;
//           hash = data?.hash;
//           break;
//         default:
//           number = 'N/A';
//           hash = 'unavailable';
//       }

//       setBlockHashes(prev => ({
//         ...prev,
//         [chain.name]: {
//           number,
//           hash,
//           updated: true,
//         },
//       }));
//     } catch (err) {
//       console.error(`[${chain.name}] Error:`, err.message);
//     }
//   };

//   useEffect(() => {
//     const intervals = [];

//     CHAINS.forEach(chain => {
//       if (chain.type === 'evm') {
//         intervals.push(setInterval(() => fetchEVMBlock(chain), 6000));
//       } else if (chain.type === 'tatum') {
//         intervals.push(setInterval(() => fetchTatumBlock(chain), 8000));
//       }
//     });

//     return () => intervals.forEach(clearInterval);
//   }, []);

//   useEffect(() => {
//     const group = ['celo', 'bsc', 'zksync'];
//     if (group.every(chain => blockHashes[chain]?.updated)) {
//       const hashes = group.map(chain => blockHashes[chain].hash);
//       mergeHashes(hashes).then(result => {
//         setMergedHash(result);
//         setMergedHistory(prev => [result, ...prev]);
//         setBlockHashes(prev => {
//           const updated = { ...prev };
//           group.forEach(chain => updated[chain].updated = false);
//           return updated;
//         });
//       });
//     }
//   }, [blockHashes]);

//   return (
//     <div style={{ padding: '20px', fontFamily: 'monospace' }}>
//       <h2>🌐 Live Block Hash Viewer (Infura, Tatum, Alchemy)</h2>

//       {CHAINS.map(({ name }) => (
//         <div key={name} style={{ marginBottom: '16px' }}>
//           <h3>{name.toUpperCase()}</h3>
//           <p><strong>Block:</strong> {blockHashes[name]?.number ?? 'Loading...'}</p>
//           <p><strong>Hash:</strong> {blockHashes[name]?.hash || 'Loading...'}</p>
//         </div>
//       ))}

//       {mergedHash && (
//         <div style={{ marginTop: '20px', padding: '12px', background: '#222', color: '#0f0' }}>
//           <h3>🔗 Merged Block Hash (Infura group)</h3>
//           <p>{mergedHash}</p>
//         </div>
//       )}

//       {mergedHistory.length > 0 && (
//         <div style={{ marginTop: '30px' }}>
//           <h3>📜 Merged Hash History</h3>
//           <ul>
//             {mergedHistory.map((hash, index) => (
//               <li key={index} style={{ marginBottom: '8px', wordBreak: 'break-word' }}>
//                 {index + 1}. {hash}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

// import React, { useEffect, useState, useRef } from 'react'
// import Web3 from 'web3';
// import CryptoJS from 'crypto-js';

// const INFURA_API_KEY = 'd1084dca4d904daab8bf45a34f5f7ba7';
// const ALCHEMY_API_KEY = 'z7lQmAD9FTun0WEB-3B_FL2GzjZJoP3R';
// const TATUM_API_KEY = 't-685d0a7283bf415b084c7f2a-4f3be9dc9c92442d8f92309d';

// const CHAINS = [
//   { name: 'celo', type: 'evm', url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}` },
//   { name: 'bsc', type: 'evm', url: 'https://bsc-dataseed1.binance.org/' },
//   { name: 'zksync', type: 'evm', url: 'https://mainnet.era.zksync.io' },
//   { name: 'ethereum', type: 'evm', url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}` },
//   { name: 'polygon', type: 'evm', url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'optimism', type: 'evm', url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'base', type: 'tatum', url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'eos', type: 'tatum', url: `https://eos-mainnet.gateway.tatum.io/v3/block/current` },
//   { name: 'solana', type: 'tatum', url: `https://solana-mainnet.gateway.tatum.io/v3/block/current` },
//   { name: 'fantom', type: 'tatum', url: `https://fantom-mainnet.gateway.tatum.io/v3/block/current` },
// ];

// const web3s = {};
// CHAINS.forEach(chain => {
//   if (chain.type === 'evm') {
//     web3s[chain.name] = new Web3(new Web3.providers.HttpProvider(chain.url));
//   }
// });

// function App() {
//   const [blockHashes, setBlockHashes] = useState(
//     CHAINS.reduce((acc, { name }) => {
//       acc[name] = { number: null, hash: '', updated: false };
//       return acc;
//     }, {})
//   );

//   const [mergedHash, setMergedHash] = useState('');
//   const [mergedHistory, setMergedHistory] = useState([]);
//   const lastHashRef = useRef('');

//   const mergeHashes = async (hashes) => {
//     const combined = hashes.join('');
//     const sha = CryptoJS.SHA256(combined).toString();
//     return '0x' + sha;
//   };

//   const fetchEVMBlock = async (chain) => {
//     try {
//       const block = await web3s[chain.name].eth.getBlock('latest');
//       if (!block) return;

//       setBlockHashes(prev => {
//         if (prev[chain.name].number === block.number) return prev;

//         return {
//           ...prev,
//           [chain.name]: {
//             number: block.number,
//             hash: block.hash,
//             updated: true,
//           },
//         };
//       });
//     } catch (err) {
//       console.error(`[${chain.name}] EVM Error:`, err.message);
//     }
//   };

//   const fetchTatumBlock = async (chain) => {
//     try {
//       const response = await fetch(chain.url, {
//         method: 'GET',
//         headers: {
//           'x-api-key': TATUM_API_KEY,
//         },
//       });

//       const data = await response.json();
//       let blockNumber = null;
//       let blockHash = null;

//       if (data?.number || data?.blockNumber) {
//         blockNumber = data.number ?? data.blockNumber;
//         blockHash = data.hash ?? data.blockHash;
//       } else if (data?.result?.hash) {
//         blockHash = data.result.hash;
//         blockNumber = 'unknown';
//       } else if (data?.result) {
//         blockNumber = data.result.slot || 'n/a';
//         blockHash = data.result.blockhash || 'n/a';
//       }

//       setBlockHashes(prev => ({
//         ...prev,
//         [chain.name]: {
//           number: blockNumber,
//           hash: blockHash,
//           updated: true,
//         },
//       }));
//     } catch (err) {
//       console.error(`[${chain.name}] Tatum Error:`, err.message);
//     }
//   };

//   useEffect(() => {
//     const intervals = [];

//     CHAINS.forEach(chain => {
//       const intervalTime = chain.type === 'evm' ? 6000 : 8000;
//       const func = chain.type === 'evm' ? fetchEVMBlock : fetchTatumBlock;
//       intervals.push(setInterval(() => func(chain), intervalTime));
//     });

//     return () => intervals.forEach(clearInterval);
//   }, []);

//   useEffect(() => {
//     const group = ['celo', 'bsc', 'zksync'];
//     if (group.every(chain => blockHashes[chain]?.updated)) {
//       const hashes = group.map(chain => blockHashes[chain].hash);

//       mergeHashes(hashes).then(result => {
//         if (result !== lastHashRef.current) {
//           lastHashRef.current = result;
//           setMergedHash(result);
//           setMergedHistory(prev => [result, ...prev.slice(0, 9)]);
//           setBlockHashes(prev => {
//             const updated = { ...prev };
//             group.forEach(chain => updated[chain].updated = false);
//             return updated;
//           });
//         }
//       });
//     }
//   }, [blockHashes]);

//   return (
//     <div style={{ padding: '20px', fontFamily: 'monospace' }}>
//       <h2>🌐 Live Block Hash Viewer (Infura, Tatum, Alchemy)</h2>

//       {CHAINS.map(({ name }) => (
//         <div key={name} style={{ marginBottom: '16px' }}>
//           <h3>{name.toUpperCase()}</h3>
//           <p><strong>Block:</strong> {blockHashes[name]?.number ?? 'Loading...'}</p>
//           <p><strong>Hash:</strong> {blockHashes[name]?.hash || 'Loading...'}</p>
//         </div>
//       ))}

//       {mergedHash && (
//         <div style={{ marginTop: '20px', padding: '12px', background: '#222', color: '#0f0' }}>
//           <h3>🔗 Merged Block Hash (celo + bsc + zksync)</h3>
//           <p>{mergedHash}</p>
//         </div>
//       )}

//       {mergedHistory.length > 0 && (
//         <div style={{ marginTop: '30px' }}>
//           <h3>📜 Merged Hash History</h3>
//           <ul>
//             {mergedHistory.map((hash, index) => (
//               <li key={index} style={{ marginBottom: '8px', wordBreak: 'break-word' }}>
//                 {index + 1}. {hash}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;




// import React, { useEffect, useState, useRef } from 'react'
// import Web3 from 'web3';
// import CryptoJS from 'crypto-js';

// const INFURA_API_KEY = 'd1084dca4d904daab8bf45a34f5f7ba7';
// const ALCHEMY_API_KEY = 'z7lQmAD9FTun0WEB-3B_FL2GzjZJoP3R';
// const TATUM_API_KEY = 't-685d0a7283bf415b084c7f2a-4f3be9dc9c92442d8f92309d';

// const CHAINS = [
//   { name: 'celo', type: 'evm', url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}` },
//   { name: 'bsc', type: 'evm', url: 'https://bsc-dataseed1.binance.org/' },
//   { name: 'zksync', type: 'evm', url: 'https://mainnet.era.zksync.io' },
//   { name: 'ethereum', type: 'evm', url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}` },
//   { name: 'polygon', type: 'evm', url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'optimism', type: 'evm', url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'arbitrum', type: 'evm', url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'eos', type: 'tatum', url: `https://eos-mainnet.gateway.tatum.io/v3/block/current` },
//   { name: 'avalanche', type: 'evm', url: `https://api.avax.network/ext/bc/C/rpc` },
//   { name: 'moonbeam', type: 'evm', url: `https://rpc.api.moonbeam.network` },
// ];

// const web3s = {};
// CHAINS.forEach(chain => {
//   if (chain.type === 'evm') {
//     web3s[chain.name] = new Web3(new Web3.providers.HttpProvider(chain.url));
//   }
// });

// function App() {
//   const [blockHashes, setBlockHashes] = useState(
//     CHAINS.reduce((acc, { name }) => {
//       acc[name] = { number: null, hash: '', updated: false };
//       return acc;
//     }, {})
//   );

//   const [mergedHash, setMergedHash] = useState('');
//   const [mergedHistory, setMergedHistory] = useState([]);
//   const lastHashRef = useRef('');

//   const mergeHashes = async (hashes) => {
//     const combined = hashes.join('');
//     const sha = CryptoJS.SHA256(combined).toString();
//     return '0x' + sha;
//   };

//   const fetchEVMBlock = async (chain) => {
//     try {
//       const block = await web3s[chain.name].eth.getBlock('latest');
//       if (!block) return;

//       setBlockHashes(prev => {
//         if (prev[chain.name].number === block.number) return prev;

//         return {
//           ...prev,
//           [chain.name]: {
//             number: block.number,
//             hash: block.hash,
//             updated: true,
//           },
//         };
//       });
//     } catch (err) {
//       console.error(`[${chain.name}] EVM Error:`, err.message);
//     }
//   };

//   const fetchTatumBlock = async (chain) => {
//     try {
//       const response = await fetch(chain.url, {
//         method: 'GET',
//         headers: {
//           'x-api-key': TATUM_API_KEY,
//         },
//       });

//       const data = await response.json();
//       let blockNumber = null;
//       let blockHash = null;

//       if (data?.number || data?.blockNumber) {
//         blockNumber = data.number ?? data.blockNumber;
//         blockHash = data.hash ?? data.blockHash;
//       } else if (data?.result?.hash) {
//         blockHash = data.result.hash;
//         blockNumber = 'unknown';
//       } else if (data?.result) {
//         blockNumber = data.result.slot || 'n/a';
//         blockHash = data.result.blockhash || 'n/a';
//       }

//       setBlockHashes(prev => ({
//         ...prev,
//         [chain.name]: {
//           number: blockNumber,
//           hash: blockHash,
//           updated: true,
//         },
//       }));
//     } catch (err) {
//       console.error(`[${chain.name}] Tatum Error:`, err.message);
//     }
//   };

//   useEffect(() => {
//     const intervals = [];

//     CHAINS.forEach(chain => {
//       const intervalTime = chain.type === 'evm' ? 6000 : 8000;
//       const func = chain.type === 'evm' ? fetchEVMBlock : fetchTatumBlock;
//       intervals.push(setInterval(() => func(chain), intervalTime));
//     });

//     return () => intervals.forEach(clearInterval);
//   }, []);

//   useEffect(() => {
//     const group = ['celo', 'bsc', 'zksync'];
//     if (group.every(chain => blockHashes[chain]?.updated)) {
//       const hashes = group.map(chain => blockHashes[chain].hash);

//       mergeHashes(hashes).then(result => {
//         if (result !== lastHashRef.current) {
//           lastHashRef.current = result;
//           setMergedHash(result);
//           setMergedHistory(prev => [result, ...prev.slice(0, 9)]);
//           setBlockHashes(prev => {
//             const updated = { ...prev };
//             group.forEach(chain => updated[chain].updated = false);
//             return updated;
//           });
//         }
//       });
//     }
//   }, [blockHashes]);

//   return (
//     <div style={{ padding: '20px', fontFamily: 'monospace' }}>
//       <h2>🌐 Live Block Hash Viewer (Infura, Tatum, Alchemy)</h2>

//       {CHAINS.map(({ name }) => (
//         <div key={name} style={{ marginBottom: '16px' }}>
//           <h3>{name.toUpperCase()}</h3>
//           <p><strong>Block:</strong> {blockHashes[name]?.number ?? 'Loading...'}</p>
//           <p><strong>Hash:</strong> {blockHashes[name]?.hash || 'Loading...'}</p>
//         </div>
//       ))}

//       {mergedHash && (
//         <div style={{ marginTop: '20px', padding: '12px', background: '#222', color: '#0f0' }}>
//           <h3>🔗 Merged Block Hash (celo + bsc + zksync)</h3>
//           <p>{mergedHash}</p>
//         </div>
//       )}

//       {mergedHistory.length > 0 && (
//         <div style={{ marginTop: '30px' }}>
//           <h3>📜 Merged Hash History</h3>
//           <ul>
//             {mergedHistory.map((hash, index) => (
//               <li key={index} style={{ marginBottom: '8px', wordBreak: 'break-word' }}>
//                 {index + 1}. {hash}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


// import React, { useEffect, useState, useRef } from 'react'
// import Web3 from 'web3';
// import CryptoJS from 'crypto-js';

// const INFURA_API_KEY = 'd1084dca4d904daab8bf45a34f5f7ba7';
// const ALCHEMY_API_KEY = 'z7lQmAD9FTun0WEB-3B_FL2GzjZJoP3R';
// const TATUM_API_KEY = 't-685d0a7283bf415b084c7f2a-4f3be9dc9c92442d8f92309d';

// const CHAINS = [
//   { name: 'celo', type: 'evm', url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}` },
//   { name: 'bsc', type: 'evm', url: 'https://bsc-dataseed1.binance.org/' },
//   { name: 'zksync', type: 'evm', url: 'https://mainnet.era.zksync.io' },
//   { name: 'ethereum', type: 'evm', url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}` },
//   { name: 'polygon', type: 'evm', url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'optimism', type: 'evm', url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'arbitrum', type: 'evm', url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'eos', type: 'tatum', url: `https://eos-mainnet.gateway.tatum.io/v3/block/current` },
//   { name: 'avalanche', type: 'evm', url: `https://api.avax.network/ext/bc/C/rpc` },
//   { name: 'moonbeam', type: 'evm', url: `https://rpc.api.moonbeam.network` },
// ];

// const web3s = {};
// CHAINS.forEach(chain => {
//   if (chain.type === 'evm') {
//     web3s[chain.name] = new Web3(new Web3.providers.HttpProvider(chain.url));
//   }
// });

// function App() {
//   const [blockHashes, setBlockHashes] = useState(
//     CHAINS.reduce((acc, { name }) => {
//       acc[name] = { number: null, hash: '', updated: false };
//       return acc;
//     }, {})
//   );

//   const [mergedHash, setMergedHash] = useState('');
//   const [mergedHistory, setMergedHistory] = useState([]);
//   const lastHashRef = useRef('');

//   const mergeHashes = async (hashes) => {
//     const combined = hashes.join('');
//     const sha = CryptoJS.SHA256(combined).toString();
//     return '0x' + sha;
//   };

//   const fetchEVMBlock = async (chain) => {
//     try {
//       const block = await web3s[chain.name].eth.getBlock('latest');
//       if (!block) return;

//       setBlockHashes(prev => {
//         if (prev[chain.name].number === block.number) return prev;

//         return {
//           ...prev,
//           [chain.name]: {
//             number: block.number,
//             hash: block.hash,
//             updated: true,
//           },
//         };
//       });
//     } catch (err) {
//       console.error(`[${chain.name}] EVM Error:`, err.message);
//     }
//   };

//   const fetchTatumBlock = async (chain) => {
//     try {
//       const isEOS = chain.name === 'eos';

//       const response = await fetch(chain.url, {
//         method: isEOS ? 'POST' : 'GET',
//         headers: {
//           'x-api-key': TATUM_API_KEY,
//           ...(isEOS && { 'Content-Type': 'application/json' })
//         },
//         body: isEOS ? JSON.stringify({ jsonrpc: '2.0', method: 'getBlock', id: 1 }) : undefined
//       });

//       const data = await response.json();
//       let blockNumber, blockHash;

//       if (isEOS) {
//         const eosBlock = data;
//         blockNumber = eosBlock.blockNumber || eosBlock.number || 'n/a';
//         blockHash = eosBlock.blockHash || eosBlock.hash || 'n/a';
//       } else if (data?.number || data?.blockNumber) {
//         blockNumber = data.number ?? data.blockNumber;
//         blockHash = data.hash ?? data.blockHash;
//       } else if (data?.result?.hash) {
//         blockHash = data.result.hash;
//         blockNumber = 'unknown';
//       } else if (data?.result) {
//         blockNumber = data.result.slot || 'n/a';
//         blockHash = data.result.blockhash || 'n/a';
//       }

//       setBlockHashes(prev => ({
//         ...prev,
//         [chain.name]: {
//           number: blockNumber,
//           hash: blockHash,
//           updated: true,
//         },
//       }));
//     } catch (err) {
//       console.error(`[${chain.name}] Tatum Error:`, err.message);
//     }
//   };

//   useEffect(() => {
//     const intervals = [];

//     CHAINS.forEach(chain => {
//       const intervalTime = chain.type === 'evm' ? 6000 : 8000;
//       const func = chain.type === 'evm' ? fetchEVMBlock : fetchTatumBlock;
//       intervals.push(setInterval(() => func(chain), intervalTime));
//     });

//     return () => intervals.forEach(clearInterval);
//   }, []);

//   useEffect(() => {
//     const group = ['celo', 'bsc', 'zksync'];
//     if (group.every(chain => blockHashes[chain]?.updated)) {
//       const hashes = group.map(chain => blockHashes[chain].hash);

//       mergeHashes(hashes).then(result => {
//         if (result !== lastHashRef.current) {
//           lastHashRef.current = result;
//           setMergedHash(result);
//           setMergedHistory(prev => [result, ...prev.slice(0, 9)]);
//           setBlockHashes(prev => {
//             const updated = { ...prev };
//             group.forEach(chain => updated[chain].updated = false);
//             return updated;
//           });
//         }
//       });
//     }
//   }, [blockHashes]);

//   return (
//     <div style={{ padding: '20px', fontFamily: 'monospace' }}>
//       <h2>🌐 Live Block Hash Viewer (Infura, Tatum, Alchemy)</h2>

//       {CHAINS.map(({ name }) => (
//         <div key={name} style={{ marginBottom: '16px' }}>
//           <h3>{name.toUpperCase()}</h3>
//           <p><strong>Block:</strong> {blockHashes[name]?.number ?? 'Loading...'}</p>
//           <p><strong>Hash:</strong> {blockHashes[name]?.hash || 'Loading...'}</p>
//         </div>
//       ))}

//       {mergedHash && (
//         <div style={{ marginTop: '20px', padding: '12px', background: '#222', color: '#0f0' }}>
//           <h3>🔗 Merged Block Hash (celo + bsc + zksync)</h3>
//           <p>{mergedHash}</p>
//         </div>
//       )}

//       {mergedHistory.length > 0 && (
//         <div style={{ marginTop: '30px' }}>
//           <h3>📜 Merged Hash History</h3>
//           <ul>
//             {mergedHistory.map((hash, index) => (
//               <li key={index} style={{ marginBottom: '8px', wordBreak: 'break-word' }}>
//                 {index + 1}. {hash}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


// import React, { useEffect, useState, useRef } from 'react'
// import Web3 from 'web3';
// import CryptoJS from 'crypto-js';

// const INFURA_API_KEY = 'd1084dca4d904daab8bf45a34f5f7ba7';
// const ALCHEMY_API_KEY = 'z7lQmAD9FTun0WEB-3B_FL2GzjZJoP3R';

// const CHAINS = [
//   { name: 'celo', type: 'evm', url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}` },
//   { name: 'bsc', type: 'evm', url: 'https://bsc-dataseed1.binance.org/' },
//   { name: 'zksync', type: 'evm', url: 'https://mainnet.era.zksync.io' },
//   { name: 'ethereum', type: 'evm', url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}` },
//   { name: 'polygon', type: 'evm', url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'optimism', type: 'evm', url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'cronos', type: 'evm', url: 'https://evm.cronos.org' }, // ✅ EOS replaced with Cronos
//   { name: 'avalanche', type: 'evm', url: `https://api.avax.network/ext/bc/C/rpc` },
//   { name: 'moonbeam', type: 'evm', url: `https://rpc.api.moonbeam.network` },
// ];

// const web3s = {};
// CHAINS.forEach(chain => {
//   if (chain.type === 'evm') {
//     web3s[chain.name] = new Web3(new Web3.providers.HttpProvider(chain.url));
//   }
// });

// function App() {
//   const [blockHashes, setBlockHashes] = useState(
//     CHAINS.reduce((acc, { name }) => {
//       acc[name] = { number: null, hash: '', updated: false };
//       return acc;
//     }, {})
//   );

//   const [mergedHash, setMergedHash] = useState('');
//   const [mergedHistory, setMergedHistory] = useState([]);
//   const lastHashRef = useRef('');

//   const mergeHashes = async (hashes) => {
//     const combined = hashes.join('');
//     const sha = CryptoJS.SHA256(combined).toString();
//     return '0x' + sha;
//   };

//   const fetchEVMBlock = async (chain) => {
//     try {
//       const block = await web3s[chain.name].eth.getBlock('latest');
//       if (!block) return;

//       setBlockHashes(prev => {
//         if (prev[chain.name].number === block.number) return prev;

//         return {
//           ...prev,
//           [chain.name]: {
//             number: block.number,
//             hash: block.hash,
//             updated: true,
//           },
//         };
//       });
//     } catch (err) {
//       console.error(`[${chain.name}] EVM Error:`, err.message);
//     }
//   };

//   useEffect(() => {
//     const intervals = [];

//     CHAINS.forEach(chain => {
//       const intervalTime = 6000;
//       intervals.push(setInterval(() => fetchEVMBlock(chain), intervalTime));
//     });

//     return () => intervals.forEach(clearInterval);
//   }, []);

//   useEffect(() => {
//     const group = ['celo', 'bsc', 'zksync'];
//     if (group.every(chain => blockHashes[chain]?.updated)) {
//       const hashes = group.map(chain => blockHashes[chain].hash);

//       mergeHashes(hashes).then(result => {
//         if (result !== lastHashRef.current) {
//           lastHashRef.current = result;
//           setMergedHash(result);
//           setMergedHistory(prev => [result, ...prev.slice(0, 9)]);
//           setBlockHashes(prev => {
//             const updated = { ...prev };
//             group.forEach(chain => updated[chain].updated = false);
//             return updated;
//           });
//         }
//       });
//     }
//   }, [blockHashes]);

//   return (
//     <div style={{ padding: '20px', fontFamily: 'monospace' }}>
//       <h2>🌐 Live Block Hash Viewer (Infura, Alchemy)</h2>

//       {CHAINS.map(({ name }) => (
//         <div key={name} style={{ marginBottom: '16px' }}>
//           <h3>{name.toUpperCase()}</h3>
//           <p><strong>Block:</strong> {blockHashes[name]?.number ?? 'Loading...'}</p>
//           <p><strong>Hash:</strong> {blockHashes[name]?.hash || 'Loading...'}</p>
//         </div>
//       ))}

//       {mergedHash && (
//         <div style={{ marginTop: '20px', padding: '12px', background: '#222', color: '#0f0' }}>
//           <h3>🔗 Merged Block Hash (celo + bsc + zksync+)</h3>
//           <p>{mergedHash}</p>
//         </div>
//       )}

//       {mergedHistory.length > 0 && (
//         <div style={{ marginTop: '30px' }}>
//           <h3>📜 Merged Hash History</h3>
//           <ul>
//             {mergedHistory.map((hash, index) => (
//               <li key={index} style={{ marginBottom: '8px', wordBreak: 'break-word' }}>
//                 {index + 1}. {hash}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;





// import React, { useEffect, useState, useRef } from 'react';
// import Web3 from 'web3';
// import CryptoJS from 'crypto-js';

// import {
//   Container,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Paper,
//   List,
//   ListItem,
//   Box,
// } from '@mui/material';

// const INFURA_API_KEY = 'd1084dca4d904daab8bf45a34f5f7ba7';
// const ALCHEMY_API_KEY = 'z7lQmAD9FTun0WEB-3B_FL2GzjZJoP3R';

// const CHAINS = [
//   { name: 'celo', type: 'evm', url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}` },
//   { name: 'bsc', type: 'evm', url: 'https://bsc-dataseed1.binance.org/' },
//   { name: 'zksync', type: 'evm', url: 'https://mainnet.era.zksync.io' },
//   { name: 'ethereum', type: 'evm', url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}` },
//   { name: 'polygon', type: 'evm', url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'optimism', type: 'evm', url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'cronos', type: 'evm', url: 'https://evm.cronos.org' },
//   { name: 'avalanche', type: 'evm', url: `https://api.avax.network/ext/bc/C/rpc` },
//   { name: 'moonbeam', type: 'evm', url: `https://rpc.api.moonbeam.network` },
// ];

// const web3s = {};
// CHAINS.forEach(chain => {
//   if (chain.type === 'evm') {
//     web3s[chain.name] = new Web3(new Web3.providers.HttpProvider(chain.url));
//   }
// });

// function App() {
//   const [blockHashes, setBlockHashes] = useState(
//     CHAINS.reduce((acc, { name }) => {
//       acc[name] = { number: null, hash: '', updated: false };
//       return acc;
//     }, {})
//   );

//   const [mergedHash, setMergedHash] = useState('');
//   const [mergedHistory, setMergedHistory] = useState([]);
//   const lastHashRef = useRef('');

//   const mergeHashes = async (hashes) => {
//     const combined = hashes.join('');
//     const sha = CryptoJS.SHA256(combined).toString();
//     return '0x' + sha;
//   };

//   const fetchEVMBlock = async (chain) => {
//     try {
//       const block = await web3s[chain.name].eth.getBlock('latest');
//       if (!block) return;

//       setBlockHashes(prev => {
//         if (prev[chain.name].number === block.number) return prev;

//         return {
//           ...prev,
//           [chain.name]: {
//             number: block.number,
//             hash: block.hash,
//             updated: true,
//           },
//         };
//       });
//     } catch (err) {
//       console.error(`[${chain.name}] EVM Error:`, err.message);
//     }
//   };

//   useEffect(() => {
//     const intervals = [];

//     CHAINS.forEach(chain => {
//       const intervalTime = 6000;
//       intervals.push(setInterval(() => fetchEVMBlock(chain), intervalTime));
//     });

//     return () => intervals.forEach(clearInterval);
//   }, []);

//   useEffect(() => {
//     const group = ['celo', 'bsc', 'zksync'];
//     if (group.every(chain => blockHashes[chain]?.updated)) {
//       const hashes = group.map(chain => blockHashes[chain].hash);

//       mergeHashes(hashes).then(result => {
//         if (result !== lastHashRef.current) {
//           lastHashRef.current = result;
//           setMergedHash(result);
//           setMergedHistory(prev => [result, ...prev.slice(0, 9)]);
//           setBlockHashes(prev => {
//             const updated = { ...prev };
//             group.forEach(chain => updated[chain].updated = false);
//             return updated;
//           });
//         }
//       });
//     }
//   }, [blockHashes]);

//   return (
//     <Container sx={{ paddingY: 4 }}>
//       <Typography variant="h4" gutterBottom>🌐 Live Block Hash Viewer</Typography>

//       <Grid container spacing={2}>
//         {CHAINS.map(({ name }) => (
//           <Grid item xs={12} sm={6} md={4} key={name}>
//             <Card elevation={2}>
//               <CardContent>
//                 <Typography variant="h6">{name.toUpperCase()}</Typography>
//                 <Typography variant="body2"><strong>Block:</strong> {blockHashes[name]?.number ?? 'Loading...'}</Typography>
//                 <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
//                   <strong>Hash:</strong> {blockHashes[name]?.hash || 'Loading...'}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {mergedHash && (
//         <Box sx={{ marginTop: 4 }}>
//           <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#222', color: '#0f0' }}>
//             <Typography variant="h6">🔗 Merged Block Hash (celo + bsc + zksync)</Typography>
//             <Typography sx={{ wordBreak: 'break-word' }}>{mergedHash}</Typography>
//           </Paper>
//         </Box>
//       )}

//       {mergedHistory.length > 0 && (
//         <Box sx={{ marginTop: 4 }}>
//           <Typography variant="h6" gutterBottom>📜 Merged Hash History</Typography>
//           <List>
//             {mergedHistory.map((hash, index) => (
//               <ListItem key={index} sx={{ wordBreak: 'break-word' }}>
//                 {index + 1}. {hash}
//               </ListItem>
//             ))}
//           </List>
//         </Box>
//       )}
//     </Container>
//   );
// }

// export default App;



// import React, { useEffect, useState, useRef } from 'react';
// import Web3 from 'web3';
// import CryptoJS from 'crypto-js';

// import {
//   Container,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Paper,
//   List,
//   ListItem,
//   Box,
// } from '@mui/material';

// const INFURA_API_KEY = 'd1084dca4d904daab8bf45a34f5f7ba7';
// const ALCHEMY_API_KEY = 'z7lQmAD9FTun0WEB-3B_FL2GzjZJoP3R';

// const CHAINS = [
//   { name: 'celo', type: 'evm', url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}` },
//   { name: 'bsc', type: 'evm', url: 'https://bsc-dataseed1.binance.org/' },
//   { name: 'zksync', type: 'evm', url: 'https://mainnet.era.zksync.io' },
//   { name: 'ethereum', type: 'evm', url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}` },
//   { name: 'polygon', type: 'evm', url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'optimism', type: 'evm', url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'cronos', type: 'evm', url: 'https://evm.cronos.org' },
//   { name: 'avalanche', type: 'evm', url: `https://api.avax.network/ext/bc/C/rpc` },
//   { name: 'moonbeam', type: 'evm', url: `https://rpc.api.moonbeam.network` },
// ];

// const web3s = {};
// CHAINS.forEach(chain => {
//   if (chain.type === 'evm') {
//     web3s[chain.name] = new Web3(new Web3.providers.HttpProvider(chain.url));
//   }
// });

// function App() {
//   const [blockHashes, setBlockHashes] = useState(
//     CHAINS.reduce((acc, { name }) => {
//       acc[name] = { number: null, hash: '', updated: false };
//       return acc;
//     }, {})
//   );

//   const [mergedHash, setMergedHash] = useState('');
//   const [mergedHistory, setMergedHistory] = useState([]);
//   const lastHashRef = useRef('');
//   const [cursorHash, setCursorHash] = useState('');

//   const mergeHashes = async (hashes) => {
//     const combined = hashes.join('');
//     const sha = CryptoJS.SHA256(combined).toString();
//     return '0x' + sha;
//   };

//   const fetchEVMBlock = async (chain) => {
//     try {
//       const block = await web3s[chain.name].eth.getBlock('latest');
//       if (!block) return;

//       setBlockHashes(prev => {
//         if (prev[chain.name].number === block.number) return prev;

//         return {
//           ...prev,
//           [chain.name]: {
//             number: block.number,
//             hash: block.hash,
//             updated: true,
//           },
//         };
//       });
//     } catch (err) {
//       console.error(`[${chain.name}] EVM Error:`, err.message);
//     }
//   };

//   useEffect(() => {
//     const intervals = [];

//     CHAINS.forEach(chain => {
//       const intervalTime = 6000;
//       intervals.push(setInterval(() => fetchEVMBlock(chain), intervalTime));
//     });

//     return () => intervals.forEach(clearInterval);
//   }, []);

//   useEffect(() => {
//     const group = ['celo', 'bsc', 'zksync'];
//     if (group.every(chain => blockHashes[chain]?.updated)) {
//       const hashes = group.map(chain => blockHashes[chain].hash);

//       mergeHashes(hashes).then(result => {
//         if (result !== lastHashRef.current) {
//           lastHashRef.current = result;
//           setMergedHash(result);
//           setMergedHistory(prev => [result, ...prev.slice(0, 9)]);
//           setBlockHashes(prev => {
//             const updated = { ...prev };
//             group.forEach(chain => updated[chain].updated = false);
//             return updated;
//           });
//         }
//       });
//     }
//   }, [blockHashes]);

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       const coord = `${e.clientX},${e.clientY}`;
//       const hash = CryptoJS.SHA256(coord).toString();
//       setCursorHash('0x' + hash);
//     };

//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   return (
//     <Container sx={{ paddingY: 4 }}>
//       <Typography variant="h4" gutterBottom>🌐 Live Block Hash Viewer</Typography>

//       {/* Cursor Hash Viewer */}
//       <Box sx={{ mb: 3 }}>
//         <Paper elevation={2} sx={{ padding: 2 }}>
//           <Typography variant="h6">🖱️ Cursor Hash</Typography>
//           <Typography sx={{ wordBreak: 'break-word' }}>{cursorHash}</Typography>
//         </Paper>
//       </Box>

//       <Grid container spacing={2}>
//         {CHAINS.map(({ name }) => (
//           <Grid item xs={12} sm={6} md={4} key={name}>
//             <Card elevation={2}>
//               <CardContent>
//                 <Typography variant="h6">{name.toUpperCase()}</Typography>
//                 <Typography variant="body2"><strong>Block:</strong> {blockHashes[name]?.number ?? 'Loading...'}</Typography>
//                 <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
//                   <strong>Hash:</strong> {blockHashes[name]?.hash || 'Loading...'}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {mergedHash && (
//         <Box sx={{ marginTop: 4 }}>
//           <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#222', color: '#0f0' }}>
//             <Typography variant="h6">🔗 Merged Block Hash (celo + bsc + zksync)</Typography>
//             <Typography sx={{ wordBreak: 'break-word' }}>{mergedHash}</Typography>
//           </Paper>
//         </Box>
//       )}

//       {mergedHistory.length > 0 && (
//         <Box sx={{ marginTop: 4 }}>
//           <Typography variant="h6" gutterBottom>📜 Merged Hash History</Typography>
//           <List>
//             {mergedHistory.map((hash, index) => (
//               <ListItem key={index} sx={{ wordBreak: 'break-word' }}>
//                 {index + 1}. {hash}
//               </ListItem>
//             ))}
//           </List>
//         </Box>
//       )}
//     </Container>
//   );
// }

// export default App;




// import React, { useEffect, useState, useRef } from 'react';
// import Web3 from 'web3';
// import CryptoJS from 'crypto-js';

// import {
//   Container,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Paper,
//   Box,
//   Divider,
// } from '@mui/material';

// const INFURA_API_KEY = 'd1084dca4d904daab8bf45a34f5f7ba7';
// const ALCHEMY_API_KEY = 'z7lQmAD9FTun0WEB-3B_FL2GzjZJoP3R';

// const CHAINS = [
//   { name: 'celo', type: 'evm', url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}` },
//   { name: 'bsc', type: 'evm', url: 'https://bsc-dataseed1.binance.org/' },
//   { name: 'zksync', type: 'evm', url: 'https://mainnet.era.zksync.io' },
//   { name: 'ethereum', type: 'evm', url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}` },
//   { name: 'polygon', type: 'evm', url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'optimism', type: 'evm', url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
//   { name: 'cronos', type: 'evm', url: 'https://evm.cronos.org' },
//   { name: 'avalanche', type: 'evm', url: `https://api.avax.network/ext/bc/C/rpc` },
//   { name: 'moonbeam', type: 'evm', url: `https://rpc.api.moonbeam.network` },
// ];

// const web3s = {};
// CHAINS.forEach(chain => {
//   if (chain.type === 'evm') {
//     web3s[chain.name] = new Web3(new Web3.providers.HttpProvider(chain.url));
//   }
// });

// function App() {
//   const [blockHashes, setBlockHashes] = useState(
//     CHAINS.reduce((acc, { name }) => {
//       acc[name] = { number: null, hash: '', updated: false };
//       return acc;
//     }, {})
//   );

//   const [mergedHash, setMergedHash] = useState('');
//   const [cursorHash, setCursorHash] = useState('');
//   const lastHashRef = useRef('');

//   const mergeHashes = async (hashes) => {
//     const combined = hashes.join('');
//     const sha = CryptoJS.SHA256(combined).toString();
//     return '0x' + sha;
//   };

//   const fetchEVMBlock = async (chain) => {
//     try {
//       const block = await web3s[chain.name].eth.getBlock('latest');
//       if (!block) return;

//       setBlockHashes(prev => {
//         if (prev[chain.name].number === block.number) return prev;

//         return {
//           ...prev,
//           [chain.name]: {
//             number: block.number,
//             hash: block.hash,
//             updated: true,
//           },
//         };
//       });
//     } catch (err) {
//       console.error(`[${chain.name}] EVM Error:`, err.message);
//     }
//   };

//   useEffect(() => {
//     const intervals = [];

//     CHAINS.forEach(chain => {
//       const intervalTime = 6000;
//       intervals.push(setInterval(() => fetchEVMBlock(chain), intervalTime));
//     });

//     return () => intervals.forEach(clearInterval);
//   }, []);

//   useEffect(() => {
//     const group = ['celo', 'bsc', 'zksync'];
//     if (group.every(chain => blockHashes[chain]?.updated)) {
//       const hashes = group.map(chain => blockHashes[chain].hash);

//       mergeHashes(hashes).then(result => {
//         if (result !== lastHashRef.current) {
//           lastHashRef.current = result;
//           setMergedHash(result);
//           setBlockHashes(prev => {
//             const updated = { ...prev };
//             group.forEach(chain => updated[chain].updated = false);
//             return updated;
//           });
//         }
//       });
//     }
//   }, [blockHashes]);

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       const coord = `${e.clientX},${e.clientY}`;
//       const hash = CryptoJS.SHA256(coord).toString();
//       setCursorHash('0x' + hash);
//     };

//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   return (
//     <Container sx={{ paddingY: 4 }}>
//       <Typography variant="h4" gutterBottom>🌐 Live Block Hash Viewer</Typography>

//       {/* Cursor Hash Viewer */}
//       <Box sx={{ mb: 3 }}>
//         <Paper elevation={2} sx={{ padding: 2 }}>
//           <Typography variant="h6">🖱️ Cursor Hash</Typography>
//           <Typography sx={{ wordBreak: 'break-word' }}>{cursorHash}</Typography>
//         </Paper>
//       </Box>

//       <Grid container spacing={2}>
//         {CHAINS.map(({ name }) => (
//           <Grid item xs={12} sm={6} md={4} key={name}>
//             <Card elevation={2}>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>{name.toUpperCase()}</Typography>

//                 {/* Block number */}
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//                   <Typography variant="body2"><strong>Block:</strong></Typography>
//                   <Typography variant="body2">{blockHashes[name]?.number ?? 'Loading...'}</Typography>
//                 </Box>

//                 <Divider sx={{ my: 1 }} />

//                 {/* Hash */}
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
//                   <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Hash:</strong></Typography>
//                   <Typography variant="body2" sx={{ wordBreak: 'break-word', color: '#555' }}>
//                     {blockHashes[name]?.hash || 'Loading...'}
//                   </Typography>
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {mergedHash && (
//         <Box sx={{ marginTop: 4 }}>
//           <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#222', color: '#0f0' }}>
//             <Typography variant="h6">🔗 Merged Block Hash (celo + bsc + zksync)</Typography>
//             <Typography sx={{ wordBreak: 'break-word' }}>{mergedHash}</Typography>
//           </Paper>
//         </Box>
//       )}
//     </Container>
//   );
// }

// export default App;


import React, { useEffect, useState, useRef } from 'react';
import Web3 from 'web3';
import CryptoJS from 'crypto-js';

import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Box,
  Divider,
  List,
  ListItem,
} from '@mui/material';

const INFURA_API_KEY = 'd1084dca4d904daab8bf45a34f5f7ba7';
const ALCHEMY_API_KEY = 'z7lQmAD9FTun0WEB-3B_FL2GzjZJoP3R';

const CHAINS = [
  { name: 'celo', type: 'evm', url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}` },
  { name: 'bsc', type: 'evm', url: 'https://bsc-dataseed1.binance.org/' },
  { name: 'zksync', type: 'evm', url: 'https://mainnet.era.zksync.io' },
  { name: 'ethereum', type: 'evm', url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}` },
  { name: 'polygon', type: 'evm', url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
  { name: 'optimism', type: 'evm', url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
  { name: 'cronos', type: 'evm', url: 'https://evm.cronos.org' },
  { name: 'avalanche', type: 'evm', url: `https://api.avax.network/ext/bc/C/rpc` },
  { name: 'moonbeam', type: 'evm', url: `https://rpc.api.moonbeam.network` },
];

const web3s = {};
CHAINS.forEach(chain => {
  if (chain.type === 'evm') {
    web3s[chain.name] = new Web3(new Web3.providers.HttpProvider(chain.url));
  }
});

function App() {
  const [blockHashes, setBlockHashes] = useState(
    CHAINS.reduce((acc, { name }) => {
      acc[name] = { number: null, hash: '', updated: false };
      return acc;
    }, {})
  );

  const [mergedHash, setMergedHash] = useState('');
  const [cursorHash, setCursorHash] = useState('');
  const [combinedHashHistory, setCombinedHashHistory] = useState([]);
  const lastMergedRef = useRef('');

  const mergeHashes = (hashes) => {
    const combined = hashes.join('');
    const sha = CryptoJS.SHA256(combined).toString();
    return '0x' + sha;
  };

  const fetchEVMBlock = async (chain) => {
    try {
      const block = await web3s[chain.name].eth.getBlock('latest');
      if (!block) return;

      setBlockHashes(prev => {
        if (prev[chain.name].number === block.number) return prev;

        return {
          ...prev,
          [chain.name]: {
            number: block.number,
            hash: block.hash,
            updated: true,
          },
        };
      });
    } catch (err) {
      console.error(`[${chain.name}] EVM Error:`, err.message);
    }
  };

  useEffect(() => {
    const intervals = [];

    CHAINS.forEach(chain => {
      const intervalTime = 6000;
      intervals.push(setInterval(() => fetchEVMBlock(chain), intervalTime));
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  useEffect(() => {
    const group = ['celo', 'bsc', 'zksync'];
    if (group.every(chain => blockHashes[chain]?.updated)) {
      const hashes = group.map(chain => blockHashes[chain].hash);
      const merged = mergeHashes(hashes);
      if (merged !== lastMergedRef.current) {
        lastMergedRef.current = merged;
        setMergedHash(merged);

        setBlockHashes(prev => {
          const updated = { ...prev };
          group.forEach(chain => updated[chain].updated = false);
          return updated;
        });

        // Also generate combined hash with cursor
        if (cursorHash) {
          const combined = mergeHashes([merged, cursorHash]);
          setCombinedHashHistory(prev => [combined, ...prev.slice(0, 9)]);
        }
      }
    }
  }, [blockHashes, cursorHash]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const coord = `${e.clientX},${e.clientY}`;
      const hash = CryptoJS.SHA256(coord).toString();
      setCursorHash('0x' + hash);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Container sx={{ paddingY: 4 }}>
      <Typography variant="h4" gutterBottom>🌐 Live Block Hash Viewer</Typography>

      {/* Cursor Hash Viewer */}
      <Box sx={{ mb: 3 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <Typography variant="h6">🖱️ Cursor Hash</Typography>
          <Typography sx={{ wordBreak: 'break-word' }}>{cursorHash}</Typography>
        </Paper>
      </Box>

      {/* All Chain Blocks */}
      <Grid container spacing={2}>
        {CHAINS.map(({ name }) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{name.toUpperCase()}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2"><strong>Block:</strong></Typography>
                  <Typography variant="body2">{blockHashes[name]?.number ?? 'Loading...'}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Hash:</strong></Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', color: '#555' }}>
                    {blockHashes[name]?.hash || 'Loading...'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Merged Hash */}
      {mergedHash && (
        <Box sx={{ marginTop: 4 }}>
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#222', color: '#0f0' }}>
            <Typography variant="h6">🔗 Merged Block Hash (celo + bsc + zksync)</Typography>
            <Typography sx={{ wordBreak: 'break-word' }}>{mergedHash}</Typography>
          </Paper>
        </Box>
      )}

      {/* Combined Hash History */}
      {combinedHashHistory.length > 0 && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6" gutterBottom>🧩 Combined Cursor + Block Hash History</Typography>
          <List>
            {combinedHashHistory.map((hash, index) => (
              <ListItem key={index} sx={{ wordBreak: 'break-word' }}>
                {index + 1}. {hash}
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
}

export default App;
