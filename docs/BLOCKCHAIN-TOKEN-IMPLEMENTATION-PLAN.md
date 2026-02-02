# LUNA Bitcoin (NB) 区块链积分代币系统实施方案

## 项目概述

**公司名称：** LUNA INDUSTRY
**代币名称：** LUNA Bitcoin
**代币简称：** NB
**系统定位：** 基于区块链的设备护照积分代币系统
**核心价值：** 不可篡改的设备履历、专家资历认证、积分激励生态

---

## 一、代币经济模型

### 1.1 代币基本信息

```
代币名称：LUNA Bitcoin
代币符号：NB
代币类型：ERC-20 / BEP-20（可选）
总供应量：1,000,000,000 NB (10亿)
最小单位：0.0001 NB
区块链：以太坊 / BSC / Polygon（建议Polygon - 低gas费）
```

### 1.2 代币分配方案

| 分配类型 | 数量 (NB) | 百分比 | 用途 |
|---------|-----------|--------|------|
| 生态激励池 | 400,000,000 | 40% | 用户激励、专家奖励、设备认证 |
| 公司储备 | 200,000,000 | 20% | 运营、市场推广、战略合作 |
| 团队锁仓 | 150,000,000 | 15% | 团队激励（4年线性释放）|
| 早期投资者 | 100,000,000 | 10% | 种子轮/天使轮（2年锁仓）|
| 社区治理 | 100,000,000 | 10% | DAO治理、社区建设 |
| 流动性池 | 50,000,000 | 5% | DEX流动性提供 |

### 1.3 代币释放计划

```
Year 1: 25% 释放 (250,000,000 NB)
Year 2: 25% 释放 (250,000,000 NB)
Year 3: 25% 释放 (250,000,000 NB)
Year 4: 25% 释放 (250,000,000 NB)

生态激励池：按需释放，智能合约自动分发
团队锁仓：线性释放，4年vest期
```

---

## 二、积分获取规则

### 2.1 用户行为激励

#### 设备相关行为

| 行为 | 奖励 (NB) | 说明 |
|------|----------|------|
| 注册设备护照 | 100 | 首次注册设备 |
| 上传设备照片 | 10 | 每张照片（最多5张/设备）|
| 完整设备信息 | 50 | 填写完整设备参数 |
| 定期维护记录 | 20 | 每次维护记录上传 |
| 设备状态更新 | 5 | 每次状态变更 |
| 设备二维码扫描 | 2 | 每次扫描（限每日1次/设备）|
| 设备转让/交易 | 30 | 完成设备所有权转移 |

#### 服务相关行为

| 行为 | 奖励 (NB) | 说明 |
|------|----------|------|
| 发起服务请求 | 10 | 提交服务申请 |
| 完成服务订单 | 200-1000 | 根据订单金额0.5%返NB |
| 服务好评 | 20 | 给予服务好评 |
| 被评为优质服务 | 100 | 获得5星好评 |
| 及时响应服务 | 50 | 2小时内响应 |

#### 专家行为激励

| 行为 | 奖励 (NB) | 说明 |
|------|----------|------|
| 专家认证通过 | 500 | 首次通过专家认证 |
| 上传资质证书 | 50 | 每个有效证书 |
| 完成培训课程 | 100 | 完成官方培训 |
| 发布技术文章 | 80 | 每篇原创文章 |
| 在线答疑 | 10 | 每次有效答疑 |
| 月度优秀专家 | 1000 | 月度评选奖励 |

#### 社区贡献

| 行为 | 奖励 (NB) | 说明 |
|------|----------|------|
| 邀请新用户 | 150 | 每个有效邀请 |
| 被邀请用户完成首单 | 300 | 二级奖励 |
| 发现系统bug | 100-500 | 根据严重程度 |
| 提交改进建议 | 50-200 | 被采纳的建议 |
| 参与社区治理投票 | 5 | 每次投票 |

### 2.2 消耗机制（通缩设计）

| 消耗场景 | 成本 (NB) | 说明 |
|---------|----------|------|
| 高级认证申请 | 1000 | 专家高级认证 |
| 优先服务特权 | 200 | 优先匹配专家 |
| 数据导出服务 | 50 | 导出设备完整履历 |
| 置顶服务广告 | 500/天 | 服务大厅置顶 |
| 解锁高级功能 | 1000/月 | VIP会员特权 |
| 设备NFT铸造 | 2000 | 设备数字资产化 |
| 数据存储费 | 10/GB/年 | 大文件存储 |

### 2.3 质押奖励

```
质押期限      年化收益率     最低质押
30天          3%            1,000 NB
90天          5%            5,000 NB
180天         8%            10,000 NB
365天         12%           50,000 NB

流动性挖矿    20%           无最低限制
```

---

## 三、区块链技术架构

### 3.1 技术选型

#### 主链选择：Polygon (Matic)

**理由：**
- ✅ 低Gas费（交易成本 < $0.01）
- ✅ 高TPS（7000+ TPS）
- ✅ EVM兼容（以太坊工具链可用）
- ✅ 成熟的生态系统
- ✅ 良好的开发者支持
- ✅ 企业级应用案例多

**备选方案：**
1. **以太坊L2（Arbitrum/Optimism）** - 更去中心化但成本稍高
2. **BSC** - 成本低但去中心化程度较低
3. **私链/联盟链（Hyperledger Fabric）** - 完全可控但缺乏代币流通性

### 3.2 智能合约架构

```
contracts/
├── token/
│   ├── NBToken.sol                 # ERC-20代币主合约
│   ├── NBTokenVesting.sol          # 代币释放合约
│   └── NBTokenStaking.sol          # 质押挖矿合约
├── passport/
│   ├── DevicePassport.sol          # 设备护照NFT
│   ├── DeviceRegistry.sol          # 设备注册表
│   └── DeviceHistory.sol           # 设备履历记录
├── expert/
│   ├── ExpertCredential.sol        # 专家资质NFT
│   ├── ExpertRegistry.sol          # 专家注册表
│   └── ExpertReputation.sol        # 信誉评分系统
├── reward/
│   ├── RewardDistributor.sol       # 奖励分发器
│   ├── ActivityTracker.sol         # 行为追踪
│   └── RewardCalculator.sol        # 奖励计算器
├── governance/
│   ├── NBGovernor.sol              # DAO治理合约
│   └── ProposalManager.sol         # 提案管理
└── utils/
    ├── AccessControl.sol           # 权限控制
    └── PriceOracle.sol             # 价格预言机
```

### 3.3 核心智能合约设计

#### 3.3.1 NBToken.sol (ERC-20)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract NBToken is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 10亿

    constructor() ERC20("LUNA Bitcoin", "NB") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
```

#### 3.3.2 DevicePassport.sol (ERC-721)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DevicePassport is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    struct DeviceInfo {
        string passportCode;      // DP-XXX-XXXX-XX-XX-XXXXXX-XX
        string deviceName;
        string manufacturer;
        uint256 manufactureDate;
        address currentOwner;
        uint256 registrationDate;
        bytes32 dataHash;         // IPFS hash的Keccak256
    }

    mapping(uint256 => DeviceInfo) public devices;
    mapping(string => uint256) public passportCodeToTokenId;
    mapping(uint256 => bytes32[]) public deviceHistory; // 履历记录hash

    event DeviceRegistered(uint256 indexed tokenId, string passportCode, address owner);
    event DeviceTransferred(uint256 indexed tokenId, address from, address to);
    event HistoryAdded(uint256 indexed tokenId, bytes32 historyHash);

    constructor() ERC721("Device Passport NFT", "DPNFT") {}

    function registerDevice(
        string memory passportCode,
        string memory deviceName,
        string memory manufacturer,
        uint256 manufactureDate,
        string memory metadataURI,
        bytes32 dataHash
    ) public returns (uint256) {
        require(passportCodeToTokenId[passportCode] == 0, "Device already registered");

        uint256 tokenId = ++_tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        devices[tokenId] = DeviceInfo({
            passportCode: passportCode,
            deviceName: deviceName,
            manufacturer: manufacturer,
            manufactureDate: manufactureDate,
            currentOwner: msg.sender,
            registrationDate: block.timestamp,
            dataHash: dataHash
        });

        passportCodeToTokenId[passportCode] = tokenId;

        emit DeviceRegistered(tokenId, passportCode, msg.sender);
        return tokenId;
    }

    function addHistory(uint256 tokenId, bytes32 historyHash) public {
        require(_exists(tokenId), "Device does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not device owner");

        deviceHistory[tokenId].push(historyHash);
        emit HistoryAdded(tokenId, historyHash);
    }

    function getDeviceHistory(uint256 tokenId) public view returns (bytes32[] memory) {
        return deviceHistory[tokenId];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        if (from != address(0) && to != address(0)) {
            devices[tokenId].currentOwner = to;
            emit DeviceTransferred(tokenId, from, to);
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

#### 3.3.3 ExpertCredential.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ExpertCredential is ERC721, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    uint256 private _tokenIdCounter;

    struct Credential {
        string expertId;
        string expertName;
        string[] certifications;
        string[] specialties;
        uint256 issueDate;
        uint256 expiryDate;
        uint256 reputationScore;
        bytes32 dataHash;
        bool isValid;
    }

    mapping(uint256 => Credential) public credentials;
    mapping(string => uint256) public expertIdToTokenId;

    event CredentialIssued(uint256 indexed tokenId, string expertId, address expert);
    event CredentialRevoked(uint256 indexed tokenId, string reason);
    event ReputationUpdated(uint256 indexed tokenId, uint256 newScore);

    constructor() ERC721("Expert Credential NFT", "ECNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    function issueCredential(
        address expert,
        string memory expertId,
        string memory expertName,
        string[] memory certifications,
        string[] memory specialties,
        uint256 validityPeriod,
        bytes32 dataHash
    ) public onlyRole(ISSUER_ROLE) returns (uint256) {
        require(expertIdToTokenId[expertId] == 0, "Credential already exists");

        uint256 tokenId = ++_tokenIdCounter;
        _safeMint(expert, tokenId);

        credentials[tokenId] = Credential({
            expertId: expertId,
            expertName: expertName,
            certifications: certifications,
            specialties: specialties,
            issueDate: block.timestamp,
            expiryDate: block.timestamp + validityPeriod,
            reputationScore: 1000, // 初始信誉分
            dataHash: dataHash,
            isValid: true
        });

        expertIdToTokenId[expertId] = tokenId;

        emit CredentialIssued(tokenId, expertId, expert);
        return tokenId;
    }

    function updateReputation(uint256 tokenId, uint256 newScore)
        public
        onlyRole(ISSUER_ROLE)
    {
        require(_exists(tokenId), "Credential does not exist");
        credentials[tokenId].reputationScore = newScore;
        emit ReputationUpdated(tokenId, newScore);
    }

    function revokeCredential(uint256 tokenId, string memory reason)
        public
        onlyRole(ISSUER_ROLE)
    {
        require(_exists(tokenId), "Credential does not exist");
        credentials[tokenId].isValid = false;
        emit CredentialRevoked(tokenId, reason);
    }

    function isCredentialValid(uint256 tokenId) public view returns (bool) {
        if (!_exists(tokenId)) return false;
        Credential memory cred = credentials[tokenId];
        return cred.isValid && block.timestamp < cred.expiryDate;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

---

## 四、数据上链方案

### 4.1 上链数据类型

#### 核心数据（直接上链）

1. **设备护照核心信息**
   - 护照编码（passportCode）
   - 设备唯一标识
   - 当前所有者地址
   - 注册时间戳
   - 数据指纹（Hash）

2. **专家资质核心信息**
   - 专家ID
   - 认证级别
   - 证书编号
   - 有效期
   - 信誉评分

3. **关键事件记录**
   - 所有权转移
   - 状态变更
   - 维护记录
   - 认证更新

#### 详细数据（IPFS + Hash上链）

1. **设备详细信息**
   - 完整设备规格参数
   - 照片、文档
   - 维护手册
   - 测试报告

2. **专家详细资料**
   - 完整简历
   - 证书扫描件
   - 工作案例
   - 培训记录

### 4.2 混合存储架构

```
应用层数据流:
1. 用户提交数据 → PostgreSQL (实时查询)
2. 关键数据 → IPFS (分布式存储)
3. IPFS Hash → Blockchain (不可篡改证明)
4. 事件触发 → Smart Contract (自动执行)
```

#### 存储层设计

```
┌─────────────────┐
│   PostgreSQL    │ ← 实时数据、查询、业务逻辑
│  (主数据库)      │
└────────┬────────┘
         │
         ├→ 关键数据变更
         │
    ┌────▼─────┐
    │   IPFS   │ ← 完整数据文件、照片、文档
    │ (去中心化) │
    └────┬─────┘
         │
         └→ 返回 IPFS Hash (Qm...)
         │
    ┌────▼─────────┐
    │  Blockchain  │ ← Hash指纹、关键事件、NFT
    │  (不可篡改)   │
    └──────────────┘
```

### 4.3 上链触发时机

| 业务事件 | 上链时机 | 上链内容 |
|---------|---------|---------|
| 设备注册 | 立即 | 铸造NFT + 基本信息hash |
| 设备转让 | 交易确认后 | 转移NFT所有权 |
| 状态变更 | 重要状态变更时 | 添加历史记录hash |
| 维护记录 | 维护完成后 | 添加维护记录hash |
| 专家认证 | 审核通过后 | 铸造认证NFT |
| 证书更新 | 证书上传后 | 更新凭证hash |
| 积分发放 | 批量处理（每小时）| 累计奖励一次性发放 |
| 质押操作 | 立即 | 锁定代币 |

---

## 五、API接口设计

### 5.1 区块链交互层接口

#### 后端服务架构

```typescript
apps/api/src/
├── blockchain/
│   ├── services/
│   │   ├── web3.service.ts           # Web3连接管理
│   │   ├── contract.service.ts       # 智能合约交互
│   │   ├── ipfs.service.ts           # IPFS文件管理
│   │   └── wallet.service.ts         # 钱包管理
│   ├── contracts/
│   │   ├── nb-token.ts               # NBToken合约接口
│   │   ├── device-passport.ts        # 设备护照合约
│   │   └── expert-credential.ts      # 专家认证合约
│   ├── dto/
│   │   ├── mint-nft.dto.ts
│   │   ├── transfer-token.dto.ts
│   │   └── upload-ipfs.dto.ts
│   └── blockchain.module.ts
```

#### 核心接口定义

```typescript
// apps/api/src/blockchain/services/device-passport-blockchain.service.ts

@Injectable()
export class DevicePassportBlockchainService {

  /**
   * 将设备注册到区块链
   */
  async registerDeviceOnChain(
    passportData: {
      passportCode: string;
      deviceName: string;
      manufacturer: string;
      manufactureDate: Date;
      metadata: any;
    },
    ownerAddress: string
  ): Promise<{
    tokenId: number;
    txHash: string;
    ipfsHash: string;
  }> {
    // 1. 上传完整数据到IPFS
    const ipfsHash = await this.ipfsService.uploadJSON({
      ...passportData,
      timestamp: new Date().toISOString(),
    });

    // 2. 计算数据指纹
    const dataHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(passportData))
    );

    // 3. 调用智能合约
    const contract = this.getDevicePassportContract();
    const tx = await contract.registerDevice(
      passportData.passportCode,
      passportData.deviceName,
      passportData.manufacturer,
      Math.floor(passportData.manufactureDate.getTime() / 1000),
      `ipfs://${ipfsHash}`,
      dataHash
    );

    // 4. 等待交易确认
    const receipt = await tx.wait();
    const tokenId = receipt.events[0].args.tokenId.toNumber();

    return {
      tokenId,
      txHash: receipt.transactionHash,
      ipfsHash,
    };
  }

  /**
   * 添加设备历史记录到区块链
   */
  async addDeviceHistory(
    tokenId: number,
    historyData: {
      eventType: string;
      description: string;
      timestamp: Date;
      operator: string;
      attachments?: string[];
    }
  ): Promise<string> {
    // 1. 上传历史数据到IPFS
    const ipfsHash = await this.ipfsService.uploadJSON(historyData);

    // 2. 计算hash
    const historyHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(ipfsHash)
    );

    // 3. 添加到合约
    const contract = this.getDevicePassportContract();
    const tx = await contract.addHistory(tokenId, historyHash);
    await tx.wait();

    return tx.hash;
  }

  /**
   * 验证设备数据完整性
   */
  async verifyDeviceData(
    tokenId: number,
    localData: any
  ): Promise<boolean> {
    // 1. 从区块链获取数据hash
    const contract = this.getDevicePassportContract();
    const deviceInfo = await contract.devices(tokenId);

    // 2. 计算本地数据hash
    const localHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(localData))
    );

    // 3. 对比
    return deviceInfo.dataHash === localHash;
  }
}
```

### 5.2 REST API端点

```typescript
// 设备护照区块链操作
POST   /api/v1/blockchain/devices/register
POST   /api/v1/blockchain/devices/:id/history
GET    /api/v1/blockchain/devices/:id/verify
GET    /api/v1/blockchain/devices/:id/nft
POST   /api/v1/blockchain/devices/:id/transfer

// 专家认证区块链操作
POST   /api/v1/blockchain/experts/credential/issue
POST   /api/v1/blockchain/experts/credential/:id/update
GET    /api/v1/blockchain/experts/credential/:id/verify
POST   /api/v1/blockchain/experts/credential/:id/revoke

// NB代币操作
GET    /api/v1/blockchain/token/balance/:address
POST   /api/v1/blockchain/token/transfer
POST   /api/v1/blockchain/token/stake
POST   /api/v1/blockchain/token/unstake
GET    /api/v1/blockchain/token/rewards/:address

// IPFS操作
POST   /api/v1/blockchain/ipfs/upload
GET    /api/v1/blockchain/ipfs/:hash

// 区块链查询
GET    /api/v1/blockchain/transaction/:txHash
GET    /api/v1/blockchain/gas-price
GET    /api/v1/blockchain/network-status
```

### 5.3 事件监听器

```typescript
// apps/api/src/blockchain/listeners/contract-event.listener.ts

@Injectable()
export class ContractEventListener implements OnModuleInit {

  async onModuleInit() {
    this.listenToDeviceEvents();
    this.listenToCredentialEvents();
    this.listenToTokenEvents();
  }

  private listenToDeviceEvents() {
    const contract = this.devicePassportContract;

    // 监听设备注册事件
    contract.on('DeviceRegistered', async (tokenId, passportCode, owner, event) => {
      await this.syncDeviceToDatabase({
        tokenId: tokenId.toNumber(),
        passportCode,
        owner,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
      });
    });

    // 监听设备转移事件
    contract.on('DeviceTransferred', async (tokenId, from, to, event) => {
      await this.updateDeviceOwnership({
        tokenId: tokenId.toNumber(),
        from,
        to,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
      });
    });
  }

  private async syncDeviceToDatabase(data: any) {
    // 同步区块链数据到PostgreSQL
    await this.devicePassportService.updateBlockchainInfo(data);
  }
}
```

---

## 六、数据模型扩展

### 6.1 数据库Schema扩展

```sql
-- 区块链信息表
CREATE TABLE blockchain_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,        -- 'device', 'expert', 'transaction'
  entity_id UUID NOT NULL,                 -- 关联的业务实体ID
  chain_id INT NOT NULL DEFAULT 137,       -- 链ID (137=Polygon)
  token_id BIGINT,                         -- NFT Token ID
  contract_address VARCHAR(42) NOT NULL,   -- 合约地址
  tx_hash VARCHAR(66) NOT NULL,            -- 交易hash
  block_number BIGINT NOT NULL,            -- 区块号
  ipfs_hash VARCHAR(100),                  -- IPFS hash
  data_hash VARCHAR(66),                   -- 数据指纹
  status VARCHAR(20) DEFAULT 'confirmed',  -- pending, confirmed, failed
  gas_used BIGINT,                         -- Gas消耗
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blockchain_entity ON blockchain_records(entity_type, entity_id);
CREATE INDEX idx_blockchain_tx ON blockchain_records(tx_hash);
CREATE INDEX idx_blockchain_token ON blockchain_records(token_id);

-- NB代币账户表
CREATE TABLE nb_token_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  balance DECIMAL(20, 4) DEFAULT 0,           -- 数据库余额（缓存）
  staked_balance DECIMAL(20, 4) DEFAULT 0,    -- 质押金额
  locked_balance DECIMAL(20, 4) DEFAULT 0,    -- 锁定金额
  total_earned DECIMAL(20, 4) DEFAULT 0,      -- 累计获得
  total_spent DECIMAL(20, 4) DEFAULT 0,       -- 累计消费
  last_sync_block BIGINT,                     -- 最后同步的区块
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- NB交易记录表
CREATE TABLE nb_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  from_address VARCHAR(42),
  to_address VARCHAR(42) NOT NULL,
  amount DECIMAL(20, 4) NOT NULL,
  tx_type VARCHAR(50) NOT NULL,              -- reward, transfer, stake, purchase
  reason VARCHAR(200),                       -- 交易原因
  tx_hash VARCHAR(66),                       -- 链上交易hash
  status VARCHAR(20) DEFAULT 'pending',      -- pending, confirmed, failed
  metadata JSONB,                            -- 额外信息
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nb_tx_user ON nb_transactions(from_user_id, to_user_id);
CREATE INDEX idx_nb_tx_hash ON nb_transactions(tx_hash);
CREATE INDEX idx_nb_tx_type ON nb_transactions(tx_type);

-- 设备护照添加区块链字段
ALTER TABLE device_passports ADD COLUMN IF NOT EXISTS
  nft_token_id BIGINT,
  nft_contract_address VARCHAR(42),
  ipfs_hash VARCHAR(100),
  blockchain_verified BOOLEAN DEFAULT FALSE,
  last_chain_sync TIMESTAMP;

-- 专家添加区块链字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  credential_nft_token_id BIGINT,
  credential_contract_address VARCHAR(42),
  credential_ipfs_hash VARCHAR(100),
  wallet_address VARCHAR(42) UNIQUE;
```

### 6.2 事件追踪表

```sql
-- 链上事件日志
CREATE TABLE blockchain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name VARCHAR(100) NOT NULL,
  contract_address VARCHAR(42) NOT NULL,
  block_number BIGINT NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  log_index INT NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blockchain_events_block ON blockchain_events(block_number);
CREATE INDEX idx_blockchain_events_processed ON blockchain_events(processed);
```

---

## 七、前端集成方案

### 7.1 Web3钱包集成

```typescript
// apps/web/src/services/web3.service.ts

import { ethers } from 'ethers';
import { create } from 'zustand';

interface Web3Store {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  balance: string;
  nbBalance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

export const useWeb3Store = create<Web3Store>((set, get) => ({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  balance: '0',
  nbBalance: '0',

  connect: async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask!');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);

    const signer = provider.getSigner();
    const account = await signer.getAddress();
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(account);

    // 获取NB代币余额
    const nbTokenContract = new ethers.Contract(
      NB_TOKEN_ADDRESS,
      NB_TOKEN_ABI,
      provider
    );
    const nbBalance = await nbTokenContract.balanceOf(account);

    set({
      provider,
      signer,
      account,
      chainId: network.chainId,
      balance: ethers.utils.formatEther(balance),
      nbBalance: ethers.utils.formatEther(nbBalance),
    });

    // 监听账户和网络变化
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        get().disconnect();
      } else {
        set({ account: accounts[0] });
      }
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  },

  disconnect: () => {
    set({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      balance: '0',
      nbBalance: '0',
    });
  },

  switchChain: async (chainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CHAIN_CONFIGS[chainId]],
        });
      }
    }
  },
}));

const CHAIN_CONFIGS: Record<number, any> = {
  137: { // Polygon Mainnet
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  80001: { // Mumbai Testnet
    chainId: '0x13881',
    chainName: 'Mumbai Testnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
};
```

### 7.2 UI组件

```typescript
// apps/web/src/components/blockchain/WalletConnect.tsx

export function WalletConnect() {
  const { account, connect, disconnect } = useWeb3Store();

  return (
    <div className="wallet-connect">
      {!account ? (
        <button onClick={connect} className="btn-primary">
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-info">
          <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
          <button onClick={disconnect} className="btn-secondary">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

// apps/web/src/components/blockchain/NBTokenBalance.tsx

export function NBTokenBalance() {
  const { nbBalance } = useWeb3Store();

  return (
    <div className="nb-balance">
      <img src="/nb-token-icon.png" alt="NB" />
      <span>{parseFloat(nbBalance).toLocaleString()} NB</span>
    </div>
  );
}

// apps/web/src/components/blockchain/DeviceNFTCard.tsx

export function DeviceNFTCard({ device }: { device: Device }) {
  const [nftData, setNftData] = useState(null);

  useEffect(() => {
    if (device.nftTokenId) {
      loadNFTData();
    }
  }, [device.nftTokenId]);

  const loadNFTData = async () => {
    // 从IPFS加载NFT元数据
    const data = await fetchFromIPFS(device.ipfsHash);
    setNftData(data);
  };

  return (
    <div className="device-nft-card">
      <div className="nft-badge">🔗 On-Chain</div>
      <h3>{device.deviceName}</h3>
      <p>Token ID: #{device.nftTokenId}</p>
      <a href={`https://opensea.io/assets/matic/${CONTRACT_ADDRESS}/${device.nftTokenId}`}
         target="_blank"
         className="btn-secondary">
        View on OpenSea
      </a>
    </div>
  );
}
```

---

## 八、实施路线图

### Phase 1: 基础设施搭建 (2个月)

**Week 1-2: 智能合约开发**
- ✅ NBToken ERC-20合约
- ✅ DevicePassport NFT合约
- ✅ ExpertCredential NFT合约
- ✅ 本地测试网测试

**Week 3-4: 后端集成**
- ✅ Web3.js/Ethers.js集成
- ✅ IPFS节点搭建
- ✅ 数据库Schema扩展
- ✅ API接口开发

**Week 5-6: 前端集成**
- ✅ MetaMask钱包连接
- ✅ 代币余额显示
- ✅ NFT铸造UI
- ✅ 区块链浏览器链接

**Week 7-8: 测试网部署**
- ✅ Mumbai测试网部署
- ✅ 测试代币分发
- ✅ 端到端测试
- ✅ 安全审计准备

### Phase 2: 核心功能上线 (2个月)

**Week 9-10: 主网部署**
- ✅ 合约审计
- ✅ Polygon主网部署
- ✅ 流动性池创建
- ✅ 多签钱包设置

**Week 11-12: 设备护照上链**
- ✅ 自动上链流程
- ✅ IPFS存储优化
- ✅ 批量处理
- ✅ Gas费优化

**Week 13-14: 专家认证上链**
- ✅ NFT认证发放
- ✅ 信誉系统上链
- ✅ 认证验证接口
- ✅ 移动端适配

**Week 15-16: 积分系统上线**
- ✅ 奖励自动发放
- ✅ 质押挖矿功能
- ✅ 兑换商城
- ✅ 用户教育

### Phase 3: 生态拓展 (持续)

**Month 5-6: 高级功能**
- DAO治理系统
- 流动性挖矿
- NFT交易市场
- 跨链桥接

**Month 7-12: 生态建设**
- 第三方集成
- API开放平台
- 开发者工具包
- 社区激励计划

---

## 九、安全性考虑

### 9.1 智能合约安全

```
✅ 使用OpenZeppelin标准库
✅ 访问控制（AccessControl）
✅ 重入攻击防护（ReentrancyGuard）
✅ 暂停机制（Pausable）
✅ 升级机制（Proxy Pattern）
✅ 多签钱包（Gnosis Safe）
✅ 第三方安全审计（CertiK/SlowMist）
✅ Bug Bounty计划
```

### 9.2 私钥管理

```
后端服务:
- 使用AWS KMS / Google Cloud KMS
- 热钱包（运营）+ 冷钱包（储备）
- 多签钱包控制关键操作
- 自动化脚本最小权限

用户端:
- 鼓励使用硬件钱包
- 提供助记词备份指南
- 交易签名前二次确认
- 异常交易预警
```

### 9.3 数据完整性

```
三层验证机制:
1. 数据库层：业务逻辑验证
2. IPFS层：Content ID自验证
3. 区块链层：Hash对比验证

定期审计:
- 每月数据完整性检查
- 区块链与数据库对账
- IPFS数据可用性检查
```

---

## 十、合规性考虑

### 10.1 法律合规

```
✅ 代币性质：功能型代币（Utility Token），非证券
✅ 用途说明：仅用于平台内激励和服务，不承诺回报
✅ 合规审查：咨询区块链法律顾问
✅ KYC/AML：大额交易需要身份验证
✅ 地域限制：根据各国法规调整服务
```

### 10.2 数据隐私

```
✅ GDPR合规：可删除个人数据（链下）
✅ 数据最小化：链上仅存Hash
✅ 访问控制：细粒度权限管理
✅ 加密存储：敏感数据加密
✅ 用户同意：明确告知数据用途
```

---

## 十一、成本估算

### 11.1 开发成本

| 项目 | 人力 | 时间 | 成本估算 |
|------|------|------|---------|
| 智能合约开发 | 1个Solidity工程师 | 2个月 | $20,000 |
| 后端集成 | 2个后端工程师 | 3个月 | $45,000 |
| 前端集成 | 1个前端工程师 | 2个月 | $15,000 |
| 安全审计 | 外部审计公司 | 1个月 | $30,000 |
| 测试 | 1个QA工程师 | 2个月 | $10,000 |
| **总计** | | **6个月** | **$120,000** |

### 11.2 运营成本（年）

| 项目 | 数量 | 单价 | 年成本 |
|------|------|------|--------|
| IPFS存储（Pinata/Web3.Storage）| 1TB | $100/月 | $1,200 |
| RPC节点（Infura/Alchemy）| 无限请求 | $500/月 | $6,000 |
| Gas费储备 | - | - | $10,000 |
| 服务器（区块链节点）| 2台 | $200/月 | $4,800 |
| 监控和告警 | - | $100/月 | $1,200 |
| 安全保险 | - | - | $5,000 |
| **总计** | | | **$28,200** |

### 11.3 代币经济成本

```
初期流动性：$100,000 (NB-MATIC LP)
营销空投：50,000,000 NB (5%)
运营储备：每月释放 ≈ $5,000 等值NB
```

---

## 十二、风险与挑战

### 12.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 智能合约漏洞 | 高 | 多次审计、Bug Bounty、保险 |
| Gas费波动 | 中 | 选择低费用链（Polygon）|
| IPFS数据丢失 | 中 | 多节点备份、冗余存储 |
| RPC节点不稳定 | 中 | 多RPC提供商、自建节点 |
| 区块链拥堵 | 低 | Layer 2方案、交易队列 |

### 12.2 业务风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 代币价格波动 | 高 | 功能价值锚定、稳定机制 |
| 用户接受度低 | 高 | 教育、激励、简化流程 |
| 监管政策变化 | 高 | 法律咨询、合规优先 |
| 竞争对手 | 中 | 技术壁垒、生态优势 |

---

## 十三、成功指标

### 13.1 技术指标

```
✅ 智能合约 Gas优化：< 100,000 gas/交易
✅ 交易确认时间：< 30秒
✅ IPFS数据可用性：> 99.9%
✅ API响应时间：< 200ms
✅ 系统可用性：> 99.5%
```

### 13.2 业务指标

```
Year 1:
- 链上设备：10,000+
- 链上专家认证：500+
- NB持有地址：5,000+
- 日均交易：100+

Year 3:
- 链上设备：100,000+
- 链上专家认证：5,000+
- NB持有地址：50,000+
- 日均交易：1,000+
```

---

## 十四、总结

本方案设计了一个完整的区块链积分代币系统（LUNA Bitcoin - NB），具备以下核心特点：

### ✅ 技术可行性
- 采用成熟的Polygon链（低费用、高性能）
- ERC-20代币 + ERC-721 NFT组合
- IPFS + 区块链混合存储
- OpenZeppelin标准合约库

### ✅ 业务价值
- 不可篡改的设备履历
- 可验证的专家资质
- 完整的积分激励体系
- 代币经济闭环

### ✅ 可落地性
- 分阶段实施路线图
- 明确的成本预算
- 风险缓解措施
- 合规性考虑

### ✅ 扩展性
- 支持DAO治理
- 跨链桥接准备
- API开放平台
- 第三方集成

---

## 附录

### A. 智能合约地址（待部署）

```
Polygon Mainnet:
- NBToken: 0x...
- DevicePassport: 0x...
- ExpertCredential: 0x...
- RewardDistributor: 0x...

Mumbai Testnet:
- NBToken: 0x...
- DevicePassport: 0x...
```

### B. 相关资源

- Polygon官网: https://polygon.technology/
- OpenZeppelin: https://openzeppelin.com/
- IPFS: https://ipfs.io/
- Ethers.js: https://docs.ethers.io/

### C. 联系方式

- 技术支持: tech@lunaindustry.com
- 商务合作: business@lunaindustry.com
- 社区Discord: https://discord.gg/lunaindustry

---

**文档版本：** 1.0
**最后更新：** 2026-02-03
**状态：** 待审核
**下一步：** 管理层评审 → 技术团队评估 → 试点实施

