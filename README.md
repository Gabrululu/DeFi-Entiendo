# DeFi Entiendo 🎓💰

**Learn DeFi. Earn Yield. Fund Public Goods.**

Plataforma gamificada para aprender DeFi mientras generas rendimiento y financias proyectos de bien común.

---

## Índice

- [Características](#características)
- [Demo / Estado](#demo--estado)
- [Requisitos](#requisitos)
- [Instalación rápida](#instalación-rápida)
- [Variables de entorno](#variables-de-entorno)
- [Uso local](#uso-local)
- [Arquitectura y contratos](#arquitectura-y-contratos)
- [Direcciones en Sepolia](#direcciones-en-sepolia)
- [Tests](#tests)
- [Seguridad](#seguridad)
- [Roadmap](#roadmap)
- [Contribuir](#contribuir)
- [Contacto](#contacto)

---

## Características

### 🏦 Vault (ERC-4626)
- Depósitos de USDC protegidos por smart contracts.
- Rendimiento automático mediante múltiples estrategias.
- Una fracción del yield se destina a proyectos de bien público.

### 📚 Sistema educativo
- Lecciones progresivas (Beginner → Expert).
- NFTs soulbound como certificados de aprendizaje.
- Seguimiento de progreso y quizzes interactivos.

### 📊 Dashboard
- Vista de portfolio en tiempo real.
- Estadísticas de yield e impacto.
- Distribución de estrategias (Aave, Compound, Uniswap).

### 🏛️ Gobernanza on-chain (próximamente)
- Propuestas para ajustar allocations y añadir proyectos.

---

## Demo / Estado

Proyecto en desarrollo. La UI frontend y los contratos están en esta misma repo. Se usa Sepolia para despliegues de prueba.

---

## Requisitos

- Node.js 18+
- Git
- Wallet EVM (por ejemplo MetaMask)

---

## Instalación rápida

Clona el repositorio, instala dependencias y crea el archivo de entorno:

```bash
git clone https://github.com/Gabrululu/DeFi-Entiendo.git
cd DeFi-Entiendo
npm install
cp .env.example .env
```

Configura las variables de entorno (ver sección abajo) y luego arranca el servidor de desarrollo:

```bash
npm run dev
```

Para pruebas locales (mint de USDC mock):

```bash
npm run mint-usdc
```

---

## Variables de entorno

Edita `./.env` con las siguientes claves (NO compartas valores sensibles públicamente):

- `VITE_WALLETCONNECT_PROJECT_ID` — WalletConnect project id.
- `VITE_CHAIN_ID` — Chain id (por defecto 11155111 para Sepolia/Testnet).
- `VITE_SUPABASE_URL` — URL pública de tu proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY` — Anon public key de Supabase.
- Direcciones de contratos ya incluidas por defecto: `VITE_USDC_ADDRESS`, `VITE_VAULT_ADDRESS`, `VITE_NFT_ADDRESS`, `VITE_PROGRESS_TRACKER_ADDRESS`, `VITE_STRATEGY_MANAGER_ADDRESS`.

Nota: Vite sólo expone variables que comienzan con `VITE_` al código del cliente.

---

## Uso local

1. Asegúrate de tener las variables en `.env` y reinicia el dev server si las cambias (Vite no recoge cambios en `.env` sin reinicio).
2. Conecta tu wallet desde la UI con el botón "Connect Wallet".
3. Deposita USDC mock, completa lecciones y prueba minting de NFTs en el flujo educativo.

---

## Arquitectura y contratos

Los contratos están en la carpeta `contracts/` usando Foundry. Componentes principales:

- `DefiEntiendoVault` (ERC-4626): gestión de depósitos/withdrawals y coordinación de yield.
- `StrategyManager`: administración de estrategias y rebalances.
- `EntiendeNFT`: NFTs soulbound que actúan como certificados.
- `ProgressTracker`: tracking de progreso y milestones.

Para desarrollar y testear contratos:

```bash
cd contracts
forge test -vv
```

---

## Direcciones en Sepolia

- **USDC Mock**: `0x5C159EC2e979F7e2ddff8b5BDd23e7846133CcA3`
- **Vault**: `0x20Ec045bdc3C1a371b0a5B94d136c1d58C0160DF`
- **StrategyManager**: `0x126409a7DD1CF34004E1A1BFd416eb666Cd0351F`
- **ProgressTracker**: `0x7a05b876378064f8E2235692605Fb206A3350cb6`
- **EntiendeNFT**: `0xAEF227E192B2EFbb85D8CAD5C6E5dd3c38513F72`

[Ver Vault en Etherscan](https://sepolia.etherscan.io/address/0x20Ec045bdc3C1a371b0a5B94d136c1d58C0160DF)

---

## Tests

Tests de contratos con Foundry:

```bash
cd contracts
forge test -vv
```

Coverage & reportes de gas:

```bash
forge coverage
forge test --gas-report
```

---

## Seguridad

- Revisiones y buenas prácticas con OpenZeppelin.
- Row Level Security configurado en Supabase.
- No incluir claves privadas en el repo; usa `.env` y añade al `.gitignore`.

---

## Roadmap

- Integraciones reales con Aave / Compound
- Mejoras de optimización de yield
- Futuro despliegue a mainnet

---

## Contribuir

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Añade tests y documentación
4. Abre un Pull Request describiendo tu cambio

Gracias por contribuir ✨

---

## Contacto

- X: https://x.com/Gabrululu
- Email: gaby25231@gmail.com

---

Built with ❤️ for Web3 Education
