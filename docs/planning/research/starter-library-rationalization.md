# Starter Library Rationalization

**Created:** 2025-12-11
**Status:** Research Complete

---

## A) Findings on Common Homelab Gear

Research from r/homelab, ServeTheHome forums, and homelab blogs (2024-2025) reveals consistent patterns in what homelabbers use.

### Servers

**Most Common Form Factors:**

- **1U servers** - Dell PowerEdge R620/R630/R640, HPE ProLiant DL360 Gen9/10
- **2U servers** - Dell PowerEdge R720/R730/R740, HPE ProLiant DL380 Gen9/10
- **4U servers** - Less common, typically for high-density storage

**Key Observations:**

- Dell PowerEdge dominates the used market (especially R620, R630, R720, R730)
- HPE ProLiant is the second choice
- Supermicro popular for DIY builds
- Mini PCs (non-rackmount) are trending but outside our scope

### Network Equipment

**Switches:**

- **Ubiquiti UniFi** - Most popular for ease of use (USW-Pro-24, USW-Pro-48)
- **MikroTik** - Popular for advanced users wanting value (CRS326-24G-2S+)
- **TP-Link** - Budget option
- Common sizes: 8-port, 24-port, 48-port
- PoE versions very popular for cameras/APs

**Routers/Firewalls:**

- Ubiquiti UDM-Pro, pfSense/OPNsense appliances
- MikroTik routers (CCR series)
- Typically 1U form factor

### Storage/NAS

**Rackmount NAS:**

- **Synology RS series** - RS1221+ (2U), RS819 (1U) most common
- **QNAP** - TS-832PXU (2U), TS-432PXU (1U)
- TrueNAS on custom hardware

**Form Factors:**

- 1U: 4-bay units
- 2U: 8-12 bay units
- 4U: 24+ bay (enterprise, less common in homelab)

### Power Equipment

**UPS:**

- **APC Smart-UPS** - Industry standard (SMT1500RM2U, SMT2200RM2U)
- **CyberPower** - Budget alternative
- Typically 2U for rackmount models

**PDUs:**

- Basic power strips (0U vertical or 1U horizontal)
- Switched/metered PDUs (APC AP7900 series)

### Accessories

**Universal across homelabs:**

- Blank panels (0.5U, 1U, 2U) - for airflow management
- Shelves (1U, 2U) - for non-rackmount equipment
- Patch panels (1U, 2U) - for cable management
- Brush panels - for cable pass-through
- Cable management (1U)

---

## B) Generic Device Type Categories and Sizes

Based on research, here's how common homelab gear maps to generic categories:

### Servers

| Generic Type | Typical Size | Representative Gear          | Notes                            |
| ------------ | ------------ | ---------------------------- | -------------------------------- |
| 1U Server    | 1U           | Dell R630, HPE DL360         | Most common entry point          |
| 2U Server    | 2U           | Dell R730, HPE DL380         | More expandable, storage-focused |
| 4U Server    | 4U           | High-density storage servers | Less common                      |

### Network

| Generic Type       | Typical Size | Representative Gear         | Notes                  |
| ------------------ | ------------ | --------------------------- | ---------------------- |
| 8-Port Switch      | 0.5U-1U      | Small managed switches      | Entry-level            |
| 24-Port Switch     | 1U           | USW-Pro-24, MikroTik CRS326 | Standard homelab size  |
| 48-Port Switch     | 1U           | USW-Pro-48                  | Larger deployments     |
| 24-Port PoE Switch | 1U           | USW-Pro-24-PoE              | For cameras/APs        |
| 48-Port PoE Switch | 1U           | USW-Pro-48-PoE              | Larger PoE deployments |
| 10GbE Switch       | 1U           | Aggregation switches        | For storage networks   |
| Router/Firewall    | 1U           | UDM-Pro, pfSense            | Gateway devices        |

### Patch Panels

| Generic Type        | Typical Size | Notes        |
| ------------------- | ------------ | ------------ |
| 24-Port Patch Panel | 1U           | Standard     |
| 48-Port Patch Panel | 2U           | High-density |

### Storage

| Generic Type     | Typical Size | Representative Gear  | Notes                |
| ---------------- | ------------ | -------------------- | -------------------- |
| 1U NAS (4-bay)   | 1U           | Synology RS819       | Compact storage      |
| 2U NAS (8-bay)   | 2U           | Synology RS1221+     | Standard homelab NAS |
| 4U NAS (12+ bay) | 4U           | Large storage arrays | Less common          |

### Power

| Generic Type | Typical Size | Representative Gear  | Notes                     |
| ------------ | ------------ | -------------------- | ------------------------- |
| 1U PDU       | 1U           | Basic horizontal PDU | Simple power distribution |
| 2U UPS       | 2U           | APC SMT1500RM2U      | Standard rackmount UPS    |
| 4U UPS       | 4U           | Larger capacity UPS  | Extended runtime          |

### Accessories

| Generic Type        | Typical Size | Notes                    |
| ------------------- | ------------ | ------------------------ |
| 0.5U Blank Panel    | 0.5U         | Half-height blanking     |
| 1U Blank Panel      | 1U           | Standard blanking        |
| 2U Blank Panel      | 2U           | Larger gap filling       |
| 1U Shelf            | 1U           | For non-rackmount gear   |
| 2U Shelf            | 2U           | Deeper/heavier items     |
| 1U Brush Panel      | 1U           | Cable pass-through       |
| 1U Cable Management | 1U           | Horizontal cable routing |

### Specialty

| Generic Type      | Typical Size | Notes                     |
| ----------------- | ------------ | ------------------------- |
| 1U KVM            | 1U           | Console switch            |
| 1U Console Drawer | 1U           | Pull-out keyboard/monitor |

---

## C) Rationalization Against Current Library

### Current Library (26 items)

```
Server: 1U Server, 2U Server, 4U Server
Network: 1U Switch, 1U Router, 1U Firewall
Patch Panel: 1U Patch Panel, 2U Patch Panel
Power: 1U PDU, 2U UPS, 4U UPS
Storage: 2U Storage, 4U Storage
KVM: 1U KVM, 1U Console Drawer
AV/Media: 1U Receiver, 2U Amplifier
Cooling: 0.5U Blanking Fan, 1U Fan Panel
Blank: 0.5U Blank, 1U Blank, 2U Blank
Shelf: 1U Shelf, 2U Shelf, 4U Shelf
Other: 1U Generic, 2U Generic
```

### Analysis

**What's Good:**

- Server sizes (1U, 2U, 4U) ✅
- Blank panels (0.5U, 1U, 2U) ✅
- Shelves (multiple sizes) ✅
- Basic power (PDU, UPS) ✅

**What's Missing:**

- ❌ Network variety (only "1U Switch" - no port count differentiation)
- ❌ PoE switches (very common in homelabs)
- ❌ 10GbE/Aggregation switches
- ❌ 1U NAS option (only 2U and 4U storage)
- ❌ Patch panel port counts

**What's Unnecessary:**

- ⚠️ AV/Media devices (1U Receiver, 2U Amplifier) - niche use case
- ⚠️ 4U Shelf - rarely used
- ⚠️ Separate Router vs Firewall - typically combined
- ⚠️ "Generic" category - redundant

**What Needs Renaming:**

- "Storage" → "NAS" (clearer terminology)
- Add port counts to network devices

### Approved Changes (2025-12-11)

#### Add (6 new items):

1. **8-Port Switch** (1U) - Small networks, works for 10" and 19" racks
2. **24-Port Switch** (1U) - Standard size
3. **48-Port Switch** (1U) - Larger networks
4. **1U Storage** - 4-bay compact storage
5. **1U Brush Panel** - Cable pass-through
6. **1U Cable Management** - Horizontal cable routing

#### Remove (5 items):

1. ~~4U Shelf~~ - Rarely used, can use shelf + empty slots
2. ~~1U Generic~~ - Redundant
3. ~~2U Generic~~ - Redundant
4. ~~0.5U Blanking Fan~~ - Rare, 1U Fan Panel covers use case
5. ~~1U Router~~, ~~1U Firewall~~ - Merged into Router/Firewall

#### Rename (3 items):

1. "1U Switch" → "1U Router/Firewall" (consolidates router + firewall)
2. "1U Patch Panel" → "24-Port Patch Panel"
3. "2U Patch Panel" → "48-Port Patch Panel"

#### Retain (against initial recommendation):

- **AV/Media category** (1U Receiver, 2U Amplifier) - Valid use case
- **Storage naming** - Keep "Storage" not "NAS" (covers both NAS and DAS), use NAS images

### Approved Final Library (26 items)

| Category        | Items                                                             |
| --------------- | ----------------------------------------------------------------- |
| **Server**      | 1U Server, 2U Server, 4U Server                                   |
| **Network**     | 8-Port Switch, 24-Port Switch, 48-Port Switch, 1U Router/Firewall |
| **Patch Panel** | 24-Port Patch Panel, 48-Port Patch Panel                          |
| **Storage**     | 1U Storage, 2U Storage, 4U Storage                                |
| **Power**       | 1U PDU, 2U UPS, 4U UPS                                            |
| **KVM**         | 1U KVM, 1U Console Drawer                                         |
| **AV/Media**    | 1U Receiver, 2U Amplifier                                         |
| **Cooling**     | 1U Fan Panel                                                      |
| **Blank**       | 0.5U Blank, 1U Blank, 2U Blank                                    |
| **Shelf**       | 1U Shelf, 2U Shelf                                                |
| **Cable Mgmt**  | 1U Brush Panel, 1U Cable Management                               |

**Total: 27 items**

---

## Representative Images for Each Type

For each generic type, here's a recommended NetBox image to use as visual representation:

| Generic Type       | Representative Image                    | Why                           |
| ------------------ | --------------------------------------- | ----------------------------- |
| 1U Server          | `dell-poweredge-r630`                   | Clean, iconic 1U server look  |
| 2U Server          | `dell-poweredge-r730xd`                 | Standard 2U server appearance |
| 4U Server          | `supermicro-ssg-6049p-e1cr36h`          | Good 4U representation        |
| 24-Port Switch     | `ubiquiti-unifi-switch-24-pro`          | Clean switch face             |
| 48-Port Switch     | `ubiquiti-unifi-switch-48-pro`          | Dense port layout             |
| 24-Port PoE Switch | `ubiquiti-unifi-switch-24-pro-poe-gen2` | Shows PoE indicators          |
| 1U NAS             | `synology-rs819`                        | Recognizable NAS face         |
| 2U NAS             | `synology-rs1221-plus`                  | Standard NAS layout           |
| 2U UPS             | `apc-smt1500rmi2uc`                     | Typical UPS face              |
| 1U PDU             | `apc-ap7950b`                           | Standard PDU appearance       |

_Note: Generic items (blanks, shelves, patch panels) can remain as colored rectangles - no image needed._

---

## Next Steps

1. [ ] Review and approve proposed library changes
2. [ ] Download representative images from NetBox
3. [ ] Process images (400px max width, WebP)
4. [ ] Store in `assets-source/` (originals) and `src/lib/assets/device-images/` (optimized)
5. [ ] Update `starterLibrary.ts` with new device list
6. [ ] Wire up images to device types
