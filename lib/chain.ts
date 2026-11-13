/**
 * THE CHAIN FILE. Everything the pages, cards and "?" texts need to know about the chain lives here: its name, its native
 * coin, how addresses look, where things are seen, the launch's fee and gas numbers, and which extras exist. Client-safe
 * (no node imports). The pages (app/*), the components and lib/help.tsx read this file and never say "SOL" or "pump.fun"
 * themselves, so another chain (the pons starter on Robinhood Chain, any EVM chain) is mostly a new copy of this file.
 * See PORTING.md for the rest (the API client, the launch executor, the signer).
 */
import type { Launchpad } from "./launchpad"

export type ChainConfig = {
  /** the chain, as people say it ("Solana", "Robinhood Chain") */
  name: string
  /** the native coin ("SOL", "ETH") */
  symbol: string
  /** the launchpad people know the coins from ("pump.fun", "pons") */
  launchpad: string
  /** the app's name in the header and the tab title ("pump.fun launcher") */
  appName: string
  /** which product of the TrenchyTools suite this is (an id in lib/suite.ts): the suite bar marks it "you are here" */
  suiteId: string
  /** logos, as paths under public/ (public/logos/ holds Solana, Robinhood, Ethereum, BNB, Base, pump.fun, pons, …) */
  logo: string
  launchpadLogo: string
  /** the block explorer the address and transaction links open */
  explorer: { name: string; logo: string }
  /** the query / body field a coin travels in on this app's routes */
  coinParam: "mint" | "token"
  coinNoun: string
  keyNoun: string
  isAddress: (s: string) => boolean
  isCoin: (s: string) => boolean
  short: (s: string) => string
  /** a native amount for a table cell */
  fmt: (n: number | null | undefined) => string
  /** how many decimals a native amount shows in the cost panel (SOL 4, ETH 5: its amounts are ten times smaller) */
  decimals: number
  explorerAddress: (address: string) => string
  explorerTx: (sig: string) => string
  /** where a coin can be seen: the launchpad, terminals, the explorer; `icon` is the site's logo (public/logos/) */
  coinLinks: (coin: string) => Array<{ label: string; href: string; icon: string }>
  /** GMGN's embeddable candle chart (gmgn.cc is their widget host; gmgn.ai refuses to be framed), or null when the chain has none */
  chartUrl: (coin: string, theme: "dark" | "light") => string | null
  /** the launch-log stream of this app, and one entry of it read into a common shape (the pump.fun and pons routes differ) */
  launchLog: { path: (id: string) => string; read: (e: Record<string, unknown>) => { stage: string; message: string; done: boolean; error: boolean } }
  /** the "Set every amount to" pills, in the native coin */
  pills: string[]
  /** the default of the "Amount each" input (funding) and of a buy */
  defaultEach: string
  defaultBuy: string
  /** Launch page: the dev-buy chips, the buyer-amount chips and the volume maker's default budget, in the native coin */
  devBuyChips: string[]
  buyChips: string[]
  defaultDevBuy: string
  defaultVolumeBudget: string
  /**
   * What every buyer wallet gets on top of its buy. lib/core/launch.ts funds wallets with exactly these, and the cost
   * panel shows them, so they never disagree: the API fee on each buy (0.005 = 0.5 %) and a gas buffer per wallet.
   */
  apiFeeRate: number
  gasBuffer: number
  /**
   * What creating the coin costs the dev wallet on top of its buy: the rent of the coin's new accounts (mint, metadata,
   * curve, token accounts) and the network fees. Counted in the plan, the funding and the cost panel, so a fresh dev
   * wallet keeps its gas buffer for selling later.
   */
  createCost: number
  /** what createCost pays for, in a few words (the cost panel's note) */
  createCostNote: string
  /** The least a wallet must hold to send any trade (the network fee + the priority fee + what the chain keeps in an account). */
  minGas: number
  /** the most bundle buyers one launch can carry */
  maxBundle: number
  /** the tip that carries a same-block bundle ("Jito tip"), or null when the chain has none */
  tipName: string | null
  /** one line on how the first buyers land, for the "?" of First buyers */
  bundleHelp: string
  /** a vanity address suffix the launchpad uses ("pump"), or null */
  vanitySuffix: string | null
  /**
   * EVM chains only (absent on Solana): where the API serves the chain and what its launchpad needs. The EVM core
   * (lib/trenchy.ts, lib/core/*) reads this, so another EVM chain is mostly a new copy of this file.
   */
  evm?: {
    /** the API prefix: "/api/rh", "/api/bnb", "/api/elysium", "/api/base" */
    api: string
    chainId: number
    /** the API streams this chain's trades on a websocket (wss://…<api>/data); otherwise the app polls GET <api>/trades */
    ws: boolean
    /** the launchpad a create goes to (the API's `venue`) */
    createVenue?: string
    /** the launchpad lets the creator name wallets that skip its launch-window tax (pons, up to 31) */
    exemptList: boolean
    /** the smallest buy the launchpad takes, in the native coin */
    minBuy: number
    /** the coin's supply, for the market cap (price × supply) when the API does not say */
    totalSupply: number
    /** the chain's name on POST /api/transfer (exchange-routed funding) */
    transferChain: string
    /** seconds after the create before any other buy (a launchpad that taxes its first seconds, e.g. Clanker's 20 s anti-snipe) */
    launchQuietS?: number
  }
  /** the launchpads a launch can go to (lib/launchpad.ts); the first is the default */
  launchpads: Launchpad[]
  features: {
    /** Solana: empty token accounts hold rent that "Close empty token accounts" recovers */
    tokenAccounts: boolean
    /** the launchpad pays the creator a share of the trading fees */
    creatorFees: boolean
    /** pump.fun Mayhem coins: a buy past the remaining supply needs `partial fill` */
    mayhem: boolean
    /** bundle buyers can land in the same block as the create ("When: Same block / Right after") */
    sameBlock: boolean
    /** coins can be paired with something other than the native coin (USDC, stocks, …) */
    pairs: boolean
    /** the creator fee can go to the holders instead */
    holderRewards: boolean
  }
}

const ADDR = /^0x[0-9a-fA-F]{40}$/
const ETHERSCAN = "https://etherscan.io"

export const chain: ChainConfig = {
  name: "Ethereum",
  symbol: "ETH",
  launchpad: "Sender",
  appName: "Ethereum launcher",
  suiteId: "eth",
  logo: "/logos/chains/ethereum.svg",
  launchpadLogo: "/logos/chains/ethereum.svg",
  explorer: { name: "Etherscan", logo: "/logos/terminals/explorer.svg" },
  coinParam: "token",
  coinNoun: "token address",
  keyNoun: "0x private key",
  isAddress: (s) => ADDR.test(s.trim()),
  isCoin: (s) => ADDR.test(s.trim()),
  short: (s) => (s.length > 13 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s),
  fmt: (n) => (n === null || n === undefined ? "–" : n.toFixed(4)),
  decimals: 4,
  explorerAddress: (a) => `${ETHERSCAN}/address/${a}`,
  explorerTx: (hash) => `${ETHERSCAN}/tx/${hash}`,
  coinLinks: (token) => [
    { label: "GMGN", href: `https://gmgn.ai/eth/token/${token}`, icon: "/logos/terminals/gmgn.png" },
    { label: "DEX Screener", href: `https://dexscreener.com/ethereum/${token}`, icon: "/logos/terminals/dexscreener.png" },
    { label: "Etherscan", href: `${ETHERSCAN}/token/${token}`, icon: "/logos/terminals/explorer.svg" },
  ],
  chartUrl: (token, theme) => `https://www.gmgn.cc/kline/eth/${token}?theme=${theme}&interval=1S`,
  launchLog: {
    path: (id) => `/api/launch/${id}/events`,
    read: (e) => ({ stage: String(e.stage ?? ""), message: String(e.message ?? ""), done: e.stage === "done" || e.stage === "error", error: e.stage === "error" }),
  },
  pills: ["0.005", "0.01", "0.05", "0.1", "0.25"],
  defaultEach: "0.01",
  defaultBuy: "0.01",
  devBuyChips: ["0.01", "0.05", "0.1", "0.25", "0.5"],
  buyChips: ["0.005", "0.01", "0.05", "0.1", "0.25"],
  defaultDevBuy: "0.05",
  defaultVolumeBudget: "0.1",
  apiFeeRate: 0.005,
  // mainnet gas: a swap ~150k gas, an approve + sell + fee ~250k; the buffer covers that at a few gwei
  gasBuffer: 0.003,
  createCost: 0.006,
  createCostNote: "launch fee + gas",
  minGas: 0.0015,
  maxBundle: 16,
  tipName: null,
  bundleHelp: "Ethereum has public mempools and 12 s blocks: the first buys all go out the moment the create confirms and usually land in the next block.",
  vanitySuffix: null,
  evm: { api: "/api/eth", chainId: 1, ws: false, createVenue: "sender", exemptList: false, minBuy: 0.001, totalSupply: 1_000_000_000, transferChain: "eth" },
  launchpads: [
    { id: "sender", name: "Sender", logo: "/logos/launchpads/sender.png", site: "https://sender.family", note: "a Uniswap v4 pool against ETH (1 % fee, LaunchGuard hook); the dev buy lands inside the launch, before anyone else", body: { venue: "sender" }, createCost: 0.006, createCostNote: "Sender's 0.002 ETH launch fee + gas" },
    { id: "stockereum", name: "Stockereum", logo: "/logos/launchpads/stockereum.svg", site: "https://stockereum.com", note: "a Uniswap v4 pool paired with WETH, USDC or a tokenized stock, traded in plain ETH; the hook's fee is yours", body: { venue: "stockereum" },
      settings: [
        { field: "quote", label: "Paired with", kind: "select", default: "WETH", options: ["WETH", "USDC", "STOCKER", "NVDAon", "TSLAon", "AAPLon", "SPYon", "QQQon", "AMZNon", "GOOGLon", "METAon", "MSFTon", "MSTRon", "COINon"].map((v) => ({ value: v, label: v })), help: "what the pool trades against; you still buy and sell with ETH" },
        { field: "feePpm", label: "Fee", kind: "select", default: "10000", options: [{ value: "10000", label: "1 %" }, { value: "20000", label: "2 %" }, { value: "30000", label: "3 %" }], help: "charged by the hook on every trade" },
      ] },
  ],
  features: { tokenAccounts: false, creatorFees: true, mayhem: false, sameBlock: false, pairs: false, holderRewards: false },
}
