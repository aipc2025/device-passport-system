# 专家护照编码规范 (Expert Passport Code Specification)

**版本**: v1.0
**创建日期**: 2026-02-01
**状态**: 已确认

---

## 1. 概述

专家护照编码（Expert Passport Code）是为平台注册专家分配的唯一标识符，用于追踪专家身份、专业领域和服务记录。与设备护照（Device Passport, DP-）区分，专家护照使用 `EP-` 前缀。

---

## 2. 编码格式

### 2.1 完整格式

```
EP-{类型}{行业}{技能}-{出生年月}-{国籍}-{序列号}-{校验码}
```

### 2.2 字段说明

| 字段 | 位置 | 长度 | 说明 | 示例 |
|------|------|------|------|------|
| 前缀 | 1-2 | 2位 | 固定为 "EP" (Expert Passport) | EP |
| 类型代码 | 4 | 1位 | T=技术/B=商务/A=综合 | T |
| 行业代码 | 5 | 1位 | 所属行业 | P |
| 技能代码 | 6-7 | 2位 | 专业技能 | RB |
| 出生年月 | 9-12 | 4位 | YYMM格式 | 8506 |
| 国籍代码 | 14-15 | 2位 | ISO 3166-1 Alpha-2 | CN |
| 序列号 | 17-22 | 6位 | 递增序号 | 000001 |
| 校验码 | 24-25 | 2位 | 校验位 | A7 |

### 2.3 编码示例

```
EP-TPRB-8506-CN-000001-A7
│   ││││  │     │    │     └── 校验码
│   ││││  │     │    └──────── 序列号 (第1号)
│   ││││  │     └───────────── 国籍 (中国)
│   ││││  └─────────────────── 出生年月 (1985年6月)
│   │││└────────────────────── 技能 (RB=机器人)
│   ││└─────────────────────── 行业 (P=包装)
│   │└──────────────────────── 类型 (T=技术专家)
│   └───────────────────────── 行业技能组合码
└───────────────────────────── 前缀 (Expert Passport)

含义: 技术型专家，包装行业机器人工程师，1985年6月生，中国籍，第1号
```

---

## 3. 类型代码 (第1位)

| 代码 | 类型 | 说明 |
|------|------|------|
| **T** | Technical | 仅选择"技术专家"类型 |
| **B** | Business | 仅选择"商务专家"类型 |
| **A** | All | 同时选择"技术专家"和"商务专家" |

---

## 4. 行业代码 (第2位) - 共20个

| 代码 | 行业 (中文) | Industry (English) |
|------|-------------|-------------------|
| A | 汽车制造 | Automotive |
| B | 建筑楼宇 | Building & HVAC |
| C | 化工 | Chemical |
| D | 制药医疗 | Drug/Pharmaceutical |
| E | 电子半导体 | Electronics & Semiconductor |
| F | 食品饮料 | Food & Beverage |
| G | 通用/综合 | General / Multi-industry |
| H | 家电制造 | Home Appliances |
| L | 物流仓储 | Logistics & Warehouse |
| M | 冶金钢铁 | Metallurgy & Steel |
| N | 新能源 | New Energy (Solar/Wind/Battery) |
| O | 石油天然气 | Oil & Gas |
| P | 包装印刷 | Packaging & Printing |
| R | 橡塑制品 | Rubber & Plastics |
| S | 造船海工 | Shipbuilding & Marine |
| T | 纺织服装 | Textile & Apparel |
| U | 公用事业 | Utilities (Power/Water) |
| W | 木工家具 | Woodworking & Furniture |
| X | 矿业采掘 | Mining & Extraction |
| Z | 其他行业 | Other Industries |

---

## 5. 技能代码 (第3-4位) - 共20个

### 5.1 自动化控制类 (6个)

| 代码 | 技能 (中文) | 包含范围 |
|------|-------------|----------|
| PL | PLC编程 | PLC程序开发、调试 |
| HM | 人机交互组态 | HMI、DCS、SCADA组态画面 |
| RB | 机器人 | 工业机器人编程、集成 |
| MC | 运动控制 | 伺服、变频、数控、运动控制系统 |
| VS | 机器视觉 | 视觉检测、图像处理 |
| IO | 工业物联网 | IoT、边缘计算、数据采集 |

### 5.2 机电工程类 (6个)

| 代码 | 技能 (中文) | 包含范围 |
|------|-------------|----------|
| ED | 电气设计 | 电气原理图、配电设计、控制柜设计 |
| EI | 电气安装 | 电气布线、配电柜安装、接线 |
| MD | 机械设计 | 机械结构设计、CAD制图 |
| MI | 机械安装 | 机械装配、设备安装、调整 |
| HD | 液压气动 | 液压系统、气动系统 |
| WD | 焊接技术 | 焊接工艺、焊接机器人 |

### 5.3 仪表通信类 (3个)

| 代码 | 技能 (中文) | 包含范围 |
|------|-------------|----------|
| IS | 仪表仪器 | 传感器、流量/压力/温度/液位仪表、校准 |
| NT | 工业网络 | PROFINET、以太网、Modbus、OPC UA |
| SC | 安全系统 | 功能安全、SIL、网络安全、防爆 |

### 5.4 软件数字化类 (2个)

| 代码 | 技能 (中文) | 包含范围 |
|------|-------------|----------|
| SW | 工业软件 | MES、ERP、数字孪生、仿真 |
| AI | 人工智能 | AI、机器学习、数据分析 |

### 5.5 服务管理类 (3个)

| 代码 | 技能 (中文) | 包含范围 |
|------|-------------|----------|
| MN | 维护维修 | 设备维护、故障诊断、维修 |
| CM | 安装调试 | 整机安装、系统调试、验收 |
| PM | 项目管理 | 项目管理、技术销售、咨询 |

---

## 6. 国籍代码 (ISO 3166-1 Alpha-2)

### 6.1 常用国籍代码

| 代码 | 国家/地区 | Country/Region |
|------|----------|----------------|
| CN | 中国 | China |
| DE | 德国 | Germany |
| US | 美国 | United States |
| JP | 日本 | Japan |
| KR | 韩国 | South Korea |
| TW | 中国台湾 | Taiwan |
| HK | 中国香港 | Hong Kong |
| SG | 新加坡 | Singapore |
| MY | 马来西亚 | Malaysia |
| TH | 泰国 | Thailand |
| VN | 越南 | Vietnam |
| IN | 印度 | India |
| GB | 英国 | United Kingdom |
| FR | 法国 | France |
| IT | 意大利 | Italy |
| CH | 瑞士 | Switzerland |
| AT | 奥地利 | Austria |
| SE | 瑞典 | Sweden |
| DK | 丹麦 | Denmark |
| NL | 荷兰 | Netherlands |
| AU | 澳大利亚 | Australia |
| XX | 其他 | Other |

### 6.2 完整代码参考

完整国籍代码请参考 ISO 3166-1 Alpha-2 标准：
https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2

---

## 7. 序列号规则

### 7.1 序列号格式
- 6位数字，范围: 000001 - 999999
- 不足6位时左侧补零

### 7.2 序列号分配策略

序列号按以下组合独立递增：

```
序列号键 = {行业代码} + {技能代码} + {国籍代码}
```

**示例**:
- `PRB-CN` 组合的第1个专家 → 序列号 000001
- `PRB-CN` 组合的第2个专家 → 序列号 000002
- `PRB-DE` 组合的第1个专家 → 序列号 000001 (独立计数)
- `APL-CN` 组合的第1个专家 → 序列号 000001 (独立计数)

### 7.3 序列号计数器表结构

```sql
CREATE TABLE expert_passport_sequence (
  id UUID PRIMARY KEY,
  industry_code CHAR(1) NOT NULL,      -- 行业代码
  skill_code CHAR(2) NOT NULL,         -- 技能代码
  nationality_code CHAR(2) NOT NULL,   -- 国籍代码
  current_sequence INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(industry_code, skill_code, nationality_code)
);
```

---

## 8. 校验码算法

### 8.1 算法概述

使用 **改进型Luhn算法 (Base-36)** 计算校验码，与设备护照使用相同算法，确保编码一致性和防错能力。

### 8.2 算法步骤

#### 步骤1: 准备数据
1. 取编码中除校验码外的所有字符
2. 移除所有连字符 `-`
3. 转换为大写

```
输入: EP-TPRB-8506-CN-000001
处理: EPTPRB8506CN000001
```

#### 步骤2: 字符映射 (Base-36)
将每个字符映射到 0-35 的数值：

| 字符 | 0-9 | A | B | C | D | E | F | ... | Z |
|------|-----|---|---|---|---|---|---|-----|---|
| 数值 | 0-9 | 10 | 11 | 12 | 13 | 14 | 15 | ... | 35 |

#### 步骤3: Luhn算法计算
从右向左遍历，奇数位置的值乘以2：

```javascript
function calculateChecksum(codeWithoutChecksum) {
  const BASE36_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const cleanCode = codeWithoutChecksum.replace(/-/g, '').toUpperCase();

  let sum = 0;
  let isDouble = false;

  // 从右向左处理
  for (let i = cleanCode.length - 1; i >= 0; i--) {
    let value = BASE36_CHARS.indexOf(cleanCode[i]);
    if (value === -1) continue;

    if (isDouble) {
      value *= 2;
      if (value >= 36) {
        value = Math.floor(value / 36) + (value % 36);
      }
    }

    sum += value;
    isDouble = !isDouble;
  }

  // 计算校验值使总和能被36整除
  const checkValue = (36 - (sum % 36)) % 36;

  // 转换为两位字符
  const firstDigit = Math.floor(checkValue / 6) % 6;
  const secondDigit = checkValue % 6;

  return BASE36_CHARS[firstDigit] + BASE36_CHARS[secondDigit + 10];
}
```

#### 步骤4: 生成校验码
校验码为2位字符：
- 第1位: 数字 0-5
- 第2位: 字母 A-F

### 8.3 校验码示例

```
编码: EP-TPRB-8506-CN-000001
清理: EPTPRB8506CN000001

计算过程:
字符: E  P  T  P  R  B  8  5  0  6  C  N  0  0  0  0  0  1
数值: 14 25 29 25 27 11 8  5  0  6  12 23 0  0  0  0  0  1
位置: 18 17 16 15 14 13 12 11 10 9  8  7  6  5  4  3  2  1
倍数: x1 x2 x1 x2 x1 x2 x1 x2 x1 x2 x1 x2 x1 x2 x1 x2 x1 x2

处理: 14+14+29+14+27+22+8+10+0+12+12+10+0+0+0+0+0+2 = 174
校验值: (36 - 174 % 36) % 36 = (36 - 30) % 36 = 6
第1位: 6 / 6 % 6 = 1 → "1"
第2位: 6 % 6 + 10 = 10 → "A"

校验码: 1A
完整编码: EP-TPRB-8506-CN-000001-1A
```

---

## 9. 自动编码生成流程

### 9.1 流程图

```
┌─────────────────────────────────────────────────────────────┐
│                     专家注册申请                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. 获取专家类型选择                                          │
│     - 技术专家 (TECHNICAL) → T                               │
│     - 商务专家 (BUSINESS) → B                                │
│     - 两者都选 → A                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 获取行业选择 → 行业代码 (1位)                             │
│     例: 包装印刷 → P                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 获取技能选择 → 技能代码 (2位)                             │
│     例: 机器人 → RB                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 获取出生日期 → 出生年月 (YYMM)                            │
│     例: 1985-06-15 → 8506                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 获取国籍 → 国籍代码 (2位)                                 │
│     例: 中国 → CN                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. 查询序列号计数器                                          │
│     键: {行业代码}{技能代码}-{国籍代码}                        │
│     例: PRB-CN                                               │
│     获取下一序列号: current_sequence + 1                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  7. 组装编码 (不含校验码)                                     │
│     EP-{类型}{行业}{技能}-{出生年月}-{国籍}-{序列号}           │
│     例: EP-TPRB-8506-CN-000001                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  8. 计算校验码                                                │
│     calculateChecksum("EP-TPRB-8506-CN-000001") → "1A"      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  9. 生成完整编码                                              │
│     EP-TPRB-8506-CN-000001-1A                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  10. 更新序列号计数器                                         │
│      PRB-CN: current_sequence = 1                           │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 TypeScript 实现

```typescript
// packages/shared/src/utils/expert-passport-code.ts

const EXPERT_PREFIX = 'EP';
const BASE36_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// 专家类型映射
export enum ExpertTypeCode {
  TECHNICAL = 'T',
  BUSINESS = 'B',
  ALL = 'A',
}

// 行业代码枚举
export enum IndustryCode {
  AUTOMOTIVE = 'A',
  BUILDING = 'B',
  CHEMICAL = 'C',
  PHARMACEUTICAL = 'D',
  ELECTRONICS = 'E',
  FOOD = 'F',
  GENERAL = 'G',
  HOME_APPLIANCES = 'H',
  LOGISTICS = 'L',
  METALLURGY = 'M',
  NEW_ENERGY = 'N',
  OIL_GAS = 'O',
  PACKAGING = 'P',
  RUBBER_PLASTICS = 'R',
  SHIPBUILDING = 'S',
  TEXTILE = 'T',
  UTILITIES = 'U',
  WOODWORKING = 'W',
  MINING = 'X',
  OTHER = 'Z',
}

// 技能代码枚举
export enum SkillCode {
  // 自动化控制类
  PLC = 'PL',
  HMI = 'HM',
  ROBOTICS = 'RB',
  MOTION_CONTROL = 'MC',
  VISION = 'VS',
  IOT = 'IO',
  // 机电工程类
  ELECTRICAL_DESIGN = 'ED',
  ELECTRICAL_INSTALL = 'EI',
  MECHANICAL_DESIGN = 'MD',
  MECHANICAL_INSTALL = 'MI',
  HYDRAULICS = 'HD',
  WELDING = 'WD',
  // 仪表通信类
  INSTRUMENTATION = 'IS',
  NETWORKS = 'NT',
  SAFETY = 'SC',
  // 软件数字化类
  SOFTWARE = 'SW',
  AI = 'AI',
  // 服务管理类
  MAINTENANCE = 'MN',
  COMMISSIONING = 'CM',
  PROJECT_MGMT = 'PM',
}

/**
 * 格式化出生年月为YYMM
 */
export function formatBirthYearMonth(dateOfBirth: Date): string {
  const year = dateOfBirth.getFullYear() % 100;
  const month = dateOfBirth.getMonth() + 1;
  return `${year.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}`;
}

/**
 * 计算校验码 (改进型Luhn算法, Base-36)
 */
export function calculateExpertChecksum(codeWithoutChecksum: string): string {
  const cleanCode = codeWithoutChecksum.replace(/-/g, '').toUpperCase();

  let sum = 0;
  let isDouble = false;

  for (let i = cleanCode.length - 1; i >= 0; i--) {
    let value = BASE36_CHARS.indexOf(cleanCode[i]);
    if (value === -1) continue;

    if (isDouble) {
      value *= 2;
      if (value >= 36) {
        value = Math.floor(value / 36) + (value % 36);
      }
    }

    sum += value;
    isDouble = !isDouble;
  }

  const checkValue = (36 - (sum % 36)) % 36;
  const firstDigit = Math.floor(checkValue / 6) % 6;
  const secondDigit = checkValue % 6;

  return BASE36_CHARS[firstDigit] + BASE36_CHARS[secondDigit + 10];
}

/**
 * 生成专家护照编码
 */
export function generateExpertPassportCode(
  expertType: ExpertTypeCode,
  industry: IndustryCode,
  skill: SkillCode,
  dateOfBirth: Date,
  nationality: string,
  sequence: number
): string {
  // 验证输入
  if (nationality.length !== 2) {
    throw new Error('Nationality code must be exactly 2 characters');
  }
  if (sequence < 1 || sequence > 999999) {
    throw new Error('Sequence must be between 1 and 999999');
  }

  // 格式化各部分
  const typeIndustrySkill = `${expertType}${industry}${skill}`;
  const birthYM = formatBirthYearMonth(dateOfBirth);
  const nationalityCode = nationality.toUpperCase();
  const sequenceStr = sequence.toString().padStart(6, '0');

  // 组装编码(不含校验码)
  const codeWithoutChecksum = `${EXPERT_PREFIX}-${typeIndustrySkill}-${birthYM}-${nationalityCode}-${sequenceStr}`;

  // 计算校验码
  const checksum = calculateExpertChecksum(codeWithoutChecksum);

  return `${codeWithoutChecksum}-${checksum}`;
}

/**
 * 解析专家护照编码
 */
export interface ExpertPassportParts {
  prefix: 'EP';
  expertType: ExpertTypeCode;
  industry: IndustryCode;
  skill: SkillCode;
  birthYearMonth: string;
  nationality: string;
  sequence: number;
  checksum: string;
}

export function parseExpertPassportCode(code: string): ExpertPassportParts | null {
  const regex = /^(EP)-([TBA])([A-Z])([A-Z]{2})-(\d{4})-([A-Z]{2})-(\d{6})-([A-Z0-9]{2})$/;
  const match = code.toUpperCase().match(regex);

  if (!match) {
    return null;
  }

  const [, prefix, expertType, industry, skill, birthYM, nationality, sequenceStr, checksum] = match;

  return {
    prefix: prefix as 'EP',
    expertType: expertType as ExpertTypeCode,
    industry: industry as IndustryCode,
    skill: skill as SkillCode,
    birthYearMonth: birthYM,
    nationality,
    sequence: parseInt(sequenceStr, 10),
    checksum,
  };
}

/**
 * 验证专家护照编码
 */
export function validateExpertPassportCode(code: string): {
  valid: boolean;
  error?: string;
  parts?: ExpertPassportParts;
} {
  const parts = parseExpertPassportCode(code);

  if (!parts) {
    return { valid: false, error: 'Invalid expert passport code format' };
  }

  // 重建编码并验证校验码
  const sequenceStr = parts.sequence.toString().padStart(6, '0');
  const codeWithoutChecksum = `EP-${parts.expertType}${parts.industry}${parts.skill}-${parts.birthYearMonth}-${parts.nationality}-${sequenceStr}`;
  const expectedChecksum = calculateExpertChecksum(codeWithoutChecksum);

  if (parts.checksum !== expectedChecksum) {
    return { valid: false, error: 'Invalid checksum' };
  }

  return { valid: true, parts };
}
```

---

## 10. 编码示例汇总

| 完整编码 | 类型 | 行业 | 技能 | 出生年月 | 国籍 | 描述 |
|----------|------|------|------|----------|------|------|
| EP-TPRB-8506-CN-000001-1A | T | P-包装 | RB-机器人 | 1985年6月 | 中国 | 技术型，包装行业机器人工程师 |
| EP-TAPL-9001-DE-000015-2B | T | A-汽车 | PL-PLC | 1990年1月 | 德国 | 技术型，汽车行业PLC工程师 |
| EP-TFVS-8812-JP-000008-3C | T | F-食品 | VS-视觉 | 1988年12月 | 日本 | 技术型，食品行业机器视觉工程师 |
| EP-BGPM-7804-CN-000002-4D | B | G-通用 | PM-项目 | 1978年4月 | 中国 | 商务型，综合项目管理专家 |
| EP-AEED-8203-US-000011-5E | A | E-电子 | ED-电气设计 | 1982年3月 | 美国 | 综合型，电子行业电气设计工程师 |
| EP-TPEI-9506-VN-000003-0A | T | P-包装 | EI-电气安装 | 1995年6月 | 越南 | 技术型，包装行业电气安装技师 |
| EP-TFMI-8709-TH-000007-1B | T | F-食品 | MI-机械安装 | 1987年9月 | 泰国 | 技术型，食品行业机械安装技师 |
| EP-TOIS-7511-SA-000021-2C | T | O-石油 | IS-仪表 | 1975年11月 | 沙特 | 技术型，石油行业仪表工程师 |

---

## 11. 业务规则

### 11.1 编码生成时机
- 专家注册申请通过审核后自动生成
- 一个专家只能拥有一个有效的护照编码

### 11.2 编码不可变性
- 专家护照编码一经生成，永久不可修改
- 如需变更行业/技能，需申请新护照，旧护照标记为"已作废"

### 11.3 编码唯一性
- 每个编码在系统中全局唯一
- 即使专家注销，编码也不会被重新分配

### 11.4 历史记录
- 保留所有护照编码的历史记录
- 作废的护照编码可追溯查询

---

## 12. 正则表达式

### 12.1 编码格式验证
```regex
^EP-[TBA][A-Z][A-Z]{2}-\d{4}-[A-Z]{2}-\d{6}-[A-Z0-9]{2}$
```

### 12.2 分组捕获
```regex
^(EP)-([TBA])([A-Z])([A-Z]{2})-(\d{4})-([A-Z]{2})-(\d{6})-([A-Z0-9]{2})$
```

| 组 | 内容 | 示例 |
|----|------|------|
| 1 | 前缀 | EP |
| 2 | 类型代码 | T |
| 3 | 行业代码 | P |
| 4 | 技能代码 | RB |
| 5 | 出生年月 | 8506 |
| 6 | 国籍代码 | CN |
| 7 | 序列号 | 000001 |
| 8 | 校验码 | 1A |

---

## 附录A: 行业代码速查表

```
A-汽车  B-建筑  C-化工  D-制药  E-电子
F-食品  G-通用  H-家电  L-物流  M-冶金
N-新能源 O-石油  P-包装  R-橡塑  S-造船
T-纺织  U-公用  W-木工  X-矿业  Z-其他
```

## 附录B: 技能代码速查表

```
自动化: PL-PLC  HM-HMI  RB-机器人  MC-运控  VS-视觉  IO-物联网
机电类: ED-电气设计  EI-电气安装  MD-机械设计  MI-机械安装  HD-液压气动  WD-焊接
仪表类: IS-仪表  NT-网络  SC-安全
软件类: SW-软件  AI-人工智能
服务类: MN-维护  CM-调试  PM-项目管理
```

---

*文档版本: v1.0*
*最后更新: 2026-02-01*
