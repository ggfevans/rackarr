# Rackarr Data Schema Reference

**Schema Version:** 1.0.0
**Updated:** 2025-12-18
**Status:** Active

---

## Overview

This document is the authoritative reference for the Rackarr v1.0.0 data schema. The schema defines the structure of device types, placed devices, racks, and complete layouts stored in `.rackarr.zip` archives.

**Key Characteristics:**

- **Flat structure** - No nested namespaces (removed legacy `rackarr:` namespace)
- **NetBox-compatible** - Field naming follows NetBox conventions (snake_case)
- **Lenient parsing** - Unknown fields are preserved (`.passthrough()` in Zod)
- **Component arrays** - Support for interfaces, power ports, device bays, etc.

**File Format:** YAML inside `.rackarr.zip` archives. See [SPEC.md](./SPEC.md) Section 4 for archive structure.

---

## DeviceType

Template definition for devices in the library. Referenced by `PlacedDevice.device_type`.

### Field Reference

#### Core Identity

| Field          | Type     | Required | Description                                       |
| -------------- | -------- | -------- | ------------------------------------------------- |
| `slug`         | `string` | Yes      | Unique identifier, kebab-case (e.g., `dell-r650`) |
| `manufacturer` | `string` | No       | Manufacturer name (max 100 chars)                 |
| `model`        | `string` | No       | Model/display name (max 100 chars)                |
| `part_number`  | `string` | No       | Part number / SKU (max 100 chars)                 |

#### Physical Properties

| Field           | Type             | Required | Description                                     |
| --------------- | ---------------- | -------- | ----------------------------------------------- |
| `u_height`      | `number`         | Yes      | Height in rack units (0.5-50, multiples of 0.5) |
| `is_full_depth` | `boolean`        | No       | Full rack depth? (default: `true`)              |
| `is_powered`    | `boolean`        | No       | Device requires power? (default: `true`)        |
| `weight`        | `number`         | No       | Weight value (positive number)                  |
| `weight_unit`   | `"kg"` \| `"lb"` | No       | Weight unit (required if `weight` provided)     |
| `airflow`       | `Airflow`        | No       | Airflow direction pattern                       |

#### Image Flags

| Field         | Type      | Required | Description           |
| ------------- | --------- | -------- | --------------------- |
| `front_image` | `boolean` | No       | Front image available |
| `rear_image`  | `boolean` | No       | Rear image available  |

#### Rackarr Fields

| Field      | Type             | Required | Description                       |
| ---------- | ---------------- | -------- | --------------------------------- |
| `colour`   | `string`         | Yes      | Hex colour code (e.g., `#4A90D9`) |
| `category` | `DeviceCategory` | Yes      | Device category for UI filtering  |
| `tags`     | `string[]`       | No       | User organization tags            |

#### Extension Fields

| Field           | Type                      | Required | Description                     |
| --------------- | ------------------------- | -------- | ------------------------------- |
| `notes`         | `string`                  | No       | Notes/comments (max 1000 chars) |
| `serial_number` | `string`                  | No       | Serial number (max 100 chars)   |
| `asset_tag`     | `string`                  | No       | Asset tag (max 100 chars)       |
| `links`         | `DeviceLink[]`            | No       | External links/references       |
| `custom_fields` | `Record<string, unknown>` | No       | User-defined custom fields      |

#### Component Arrays

| Field             | Type              | Required | Description                     |
| ----------------- | ----------------- | -------- | ------------------------------- |
| `interfaces`      | `Interface[]`     | No       | Network interfaces              |
| `power_ports`     | `PowerPort[]`     | No       | Power input ports               |
| `power_outlets`   | `PowerOutlet[]`   | No       | Power output outlets (for PDUs) |
| `device_bays`     | `DeviceBay[]`     | No       | Device bays (for blade chassis) |
| `inventory_items` | `InventoryItem[]` | No       | Internal components             |

#### Subdevice Support

| Field            | Type            | Required | Description                       |
| ---------------- | --------------- | -------- | --------------------------------- |
| `subdevice_role` | `SubdeviceRole` | No       | Role in parent/child relationship |

#### Power Device Properties

| Field       | Type     | Required | Description                                |
| ----------- | -------- | -------- | ------------------------------------------ |
| `va_rating` | `number` | No       | VA capacity for UPS devices (positive int) |

### YAML Example

```yaml
device_types:
  - slug: dell-r650
    manufacturer: Dell
    model: PowerEdge R650
    part_number: R650xs
    u_height: 1
    is_full_depth: true
    is_powered: true
    weight: 18.5
    weight_unit: kg
    airflow: front-to-rear
    front_image: true
    rear_image: true
    colour: '#8BE9FD'
    category: server
    tags:
      - production
      - compute
    notes: Primary web server
    serial_number: ABC123XYZ
    asset_tag: ASSET-001
    links:
      - label: Dell Support
        url: https://dell.com/support
    interfaces:
      - name: iDRAC
        type: 1000base-t
        mgmt_only: true
      - name: NIC1
        type: 10gbase-x-sfpp
    power_ports:
      - name: PSU1
        type: iec-60320-c14
        maximum_draw: 750
      - name: PSU2
        type: iec-60320-c14
        maximum_draw: 750
```

---

## PlacedDevice

Instance of a device type placed in a rack.

### Field Reference

| Field           | Type                      | Required | Description                                   |
| --------------- | ------------------------- | -------- | --------------------------------------------- |
| `id`            | `string`                  | Yes      | Unique identifier (UUID)                      |
| `device_type`   | `string`                  | Yes      | Reference to `DeviceType.slug`                |
| `position`      | `number`                  | Yes      | Bottom U position (1-indexed, integer, min 1) |
| `face`          | `DeviceFace`              | Yes      | Which face(s) device occupies                 |
| `name`          | `string`                  | No       | Custom display name (max 100 chars)           |
| `parent_device` | `string`                  | No       | Parent placement ID (for child devices)       |
| `device_bay`    | `string`                  | No       | Bay name in parent device                     |
| `notes`         | `string`                  | No       | Notes for this placement (max 1000 chars)     |
| `custom_fields` | `Record<string, unknown>` | No       | User-defined custom fields                    |

### YAML Example

```yaml
devices:
  - id: 550e8400-e29b-41d4-a716-446655440000
    device_type: dell-r650
    position: 40
    face: front
    name: Web Server 1
    notes: Primary production server

  - id: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
    device_type: 1u-blank
    position: 39
    face: front

  - id: 7c9e6679-7425-40de-944b-e07fc1f90ae7
    device_type: usw-pro-48-poe
    position: 38
    face: front
    name: Core Switch
```

---

## Rack

Container for placed devices.

### Field Reference

| Field           | Type             | Required | Description                                |
| --------------- | ---------------- | -------- | ------------------------------------------ |
| `id`            | `string`         | No       | Unique identifier (for multi-rack support) |
| `name`          | `string`         | Yes      | Display name (1-100 chars)                 |
| `height`        | `number`         | Yes      | Height in rack units (1-100, integer)      |
| `width`         | `10 \| 19 \| 23` | Yes      | Width in inches                            |
| `desc_units`    | `boolean`        | Yes      | U1 at top if true (default: `false`)       |
| `form_factor`   | `FormFactor`     | Yes      | Rack form factor                           |
| `starting_unit` | `number`         | Yes      | Starting unit number (default: `1`)        |
| `position`      | `number`         | Yes      | Order position (for future multi-rack)     |
| `devices`       | `PlacedDevice[]` | Yes      | Devices placed in this rack                |
| `notes`         | `string`         | No       | Notes for this rack (max 1000 chars)       |

**Note:** The `view` field (`"front"` | `"rear"`) is runtime-only and not persisted.

### YAML Example

```yaml
rack:
  id: rack-primary
  name: Primary Rack
  height: 42
  width: 19
  desc_units: false
  form_factor: 4-post-cabinet
  starting_unit: 1
  position: 0
  notes: Main homelab rack in garage
  devices:
    - id: 550e8400-e29b-41d4-a716-446655440000
      device_type: dell-r650
      position: 40
      face: front
      name: Web Server 1
```

---

## Layout

Complete layout structure saved in `.rackarr.zip` archives.

### Field Reference

| Field          | Type             | Required | Description                               |
| -------------- | ---------------- | -------- | ----------------------------------------- |
| `version`      | `string`         | Yes      | Schema version (e.g., `"1.0.0"`)          |
| `name`         | `string`         | Yes      | Layout name (1-100 chars)                 |
| `rack`         | `Rack`           | Yes      | Single rack (Rackarr is single-rack mode) |
| `device_types` | `DeviceType[]`   | Yes      | Device type library                       |
| `settings`     | `LayoutSettings` | Yes      | Layout settings                           |

### LayoutSettings

| Field                   | Type          | Required | Description                    |
| ----------------------- | ------------- | -------- | ------------------------------ |
| `display_mode`          | `DisplayMode` | Yes      | Device display mode            |
| `show_labels_on_images` | `boolean`     | Yes      | Show labels overlaid on images |

### Complete YAML Example

```yaml
version: '1.0.0'
name: My Homelab Rack

rack:
  id: rack-0
  name: Primary Rack
  height: 42
  width: 19
  desc_units: false
  form_factor: 4-post-cabinet
  starting_unit: 1
  position: 0
  devices:
    - id: 550e8400-e29b-41d4-a716-446655440000
      device_type: dell-r650
      position: 40
      face: front
      name: Web Server 1

    - id: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
      device_type: usw-pro-48-poe
      position: 38
      face: front
      name: Core Switch

    - id: 7c9e6679-7425-40de-944b-e07fc1f90ae7
      device_type: 2u-ups
      position: 1
      face: front
      name: Main UPS

device_types:
  - slug: dell-r650
    manufacturer: Dell
    model: PowerEdge R650
    u_height: 1
    is_full_depth: true
    airflow: front-to-rear
    colour: '#8BE9FD'
    category: server
    front_image: true
    rear_image: true

  - slug: usw-pro-48-poe
    manufacturer: Ubiquiti
    model: USW-Pro-48-PoE
    u_height: 1
    is_full_depth: true
    airflow: side-to-rear
    colour: '#BD93F9'
    category: network

  - slug: 2u-ups
    manufacturer: APC
    model: Smart-UPS 3000
    u_height: 2
    is_full_depth: true
    colour: '#FF5555'
    category: power
    va_rating: 3000
    power_ports:
      - name: Input
        type: nema-l5-30p
        maximum_draw: 2700

settings:
  display_mode: label
  show_labels_on_images: false
```

---

## Component Types

Reference for component array types used in `DeviceType`.

### Interface

Network interface definition.

| Field       | Type      | Required | Description                              |
| ----------- | --------- | -------- | ---------------------------------------- |
| `name`      | `string`  | Yes      | Interface name (e.g., `eth0`, `Gi1/0/1`) |
| `type`      | `string`  | Yes      | Interface type (e.g., `1000base-t`)      |
| `mgmt_only` | `boolean` | No       | Management interface only                |

### PowerPort

Power input port definition.

| Field            | Type     | Required | Description                   |
| ---------------- | -------- | -------- | ----------------------------- |
| `name`           | `string` | Yes      | Port name (e.g., `PSU1`)      |
| `type`           | `string` | No       | Port type                     |
| `maximum_draw`   | `number` | No       | Maximum power draw in watts   |
| `allocated_draw` | `number` | No       | Allocated power draw in watts |

### PowerOutlet

Power output outlet definition (for PDUs).

| Field        | Type                    | Required | Description                    |
| ------------ | ----------------------- | -------- | ------------------------------ |
| `name`       | `string`                | Yes      | Outlet name (e.g., `Outlet 1`) |
| `type`       | `string`                | No       | Outlet type                    |
| `power_port` | `string`                | No       | Reference to `PowerPort.name`  |
| `feed_leg`   | `"A"` \| `"B"` \| `"C"` | No       | Feed leg for three-phase power |

### DeviceBay

Device bay definition (for blade chassis, modular switches).

| Field      | Type     | Required | Description                    |
| ---------- | -------- | -------- | ------------------------------ |
| `name`     | `string` | Yes      | Bay name (e.g., `Blade Bay 1`) |
| `position` | `string` | No       | Bay position identifier        |

### InventoryItem

Internal component definition.

| Field          | Type     | Required | Description             |
| -------------- | -------- | -------- | ----------------------- |
| `name`         | `string` | Yes      | Item name (e.g., `CPU`) |
| `manufacturer` | `string` | No       | Item manufacturer       |
| `part_id`      | `string` | No       | Part ID / SKU           |
| `serial`       | `string` | No       | Serial number           |
| `asset_tag`    | `string` | No       | Asset tag               |

### DeviceLink

External link/reference definition.

| Field   | Type     | Required | Description                        |
| ------- | -------- | -------- | ---------------------------------- |
| `label` | `string` | Yes      | Link label (e.g., `Vendor Manual`) |
| `url`   | `string` | Yes      | URL (must be valid URL format)     |

---

## Enums

### DeviceCategory (12 values)

Categories for organizing devices in the library.

| Value              | Description                    |
| ------------------ | ------------------------------ |
| `server`           | Compute servers                |
| `network`          | Switches, routers, firewalls   |
| `patch-panel`      | Patch panels                   |
| `power`            | PDUs, UPS units                |
| `storage`          | NAS, SAN, disk arrays          |
| `kvm`              | KVM switches, console drawers  |
| `av-media`         | Audio/video equipment          |
| `cooling`          | Fan panels, cooling units      |
| `shelf`            | Rack shelves                   |
| `blank`            | Blank panels                   |
| `cable-management` | Brush panels, cable organizers |
| `other`            | Miscellaneous equipment        |

### DeviceFace (3 values)

Which face(s) of the rack the device occupies.

| Value   | Description                              |
| ------- | ---------------------------------------- |
| `front` | Front face only                          |
| `rear`  | Rear face only                           |
| `both`  | Both front and rear (full depth visible) |

### FormFactor (5 values)

Rack form factor types (NetBox-compatible).

| Value            | Description                |
| ---------------- | -------------------------- |
| `2-post`         | Two-post open rack         |
| `4-post`         | Four-post open rack        |
| `4-post-cabinet` | Four-post enclosed cabinet |
| `wall-mount`     | Wall-mounted rack          |
| `open-frame`     | Open frame rack            |

### Airflow (7 values)

Airflow direction types (NetBox-compatible).

| Value           | Description                 |
| --------------- | --------------------------- |
| `passive`       | No active cooling           |
| `front-to-rear` | Standard server airflow     |
| `rear-to-front` | Reverse airflow             |
| `left-to-right` | Side-to-side (left intake)  |
| `right-to-left` | Side-to-side (right intake) |
| `side-to-rear`  | Side intake, rear exhaust   |
| `mixed`         | Multiple airflow patterns   |

### WeightUnit (2 values)

| Value | Description |
| ----- | ----------- |
| `kg`  | Kilograms   |
| `lb`  | Pounds      |

### DisplayMode (3 values)

Device display mode in rack visualization.

| Value         | Description                  |
| ------------- | ---------------------------- |
| `label`       | Show device name as text     |
| `image`       | Show device image only       |
| `image-label` | Show image with name overlay |

### SubdeviceRole (2 values)

Role in parent/child device relationships.

| Value    | Description                         |
| -------- | ----------------------------------- |
| `parent` | Parent device (e.g., blade chassis) |
| `child`  | Child device (e.g., blade server)   |

---

## Validation

### Key Constraints

#### Slug Pattern

Slugs must be lowercase alphanumeric with hyphens:

- Pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- No leading, trailing, or consecutive hyphens
- Maximum 100 characters

**Valid:** `dell-r650`, `1u-server`, `usw-pro-48-poe`
**Invalid:** `-server`, `server-`, `dell--r650`, `Dell-R650`

#### u_height

- Minimum: `0.5`
- Maximum: `50`
- Must be a multiple of `0.5`

**Valid:** `0.5`, `1`, `1.5`, `2`, `42`
**Invalid:** `0`, `0.3`, `51`, `1.25`

#### Colour

- Pattern: `^#[0-9a-fA-F]{6}$`
- 6-character hex with `#` prefix

**Valid:** `#4A90D9`, `#ffffff`, `#000000`
**Invalid:** `#FFF`, `4A90D9`, `rgb(255,0,0)`

#### Rack Dimensions

| Property        | Constraint         |
| --------------- | ------------------ |
| `height`        | 1-100 (integer)    |
| `width`         | 10, 19, or 23 only |
| `starting_unit` | 1+ (integer)       |
| `position`      | 0+ (integer)       |

#### PlacedDevice.position

- Minimum: `1`
- Must be an integer
- Must fit within rack height (position + u_height - 1 <= rack.height)

### Unknown Fields

The schema uses lenient parsing (`.passthrough()` in Zod). Unknown fields are:

- **Preserved** during parsing
- **Retained** when saving
- **Not validated** (any value accepted)

This allows forward compatibility with future schema extensions.

### Slug Uniqueness

All `DeviceType.slug` values within a layout must be unique. The schema validation checks for duplicates and reports an error listing all duplicate slugs.

---

## Version History

### v1.0.0 (Current)

- **Flat structure** - Removed nested `rackarr:` namespace from DeviceType
- **Field consolidation** - `colour` and `category` are top-level fields
- **Component arrays** - Added `interfaces`, `power_ports`, `power_outlets`, `device_bays`, `inventory_items`
- **Subdevice support** - Added `subdevice_role`, `parent_device`, `device_bay` fields
- **Extension fields** - Added `links`, `custom_fields`, `notes`, `serial_number`, `asset_tag`
- **Power properties** - Added `va_rating` for UPS devices
- **Lenient parsing** - Unknown fields preserved via `.passthrough()`

### Pre-1.0 (Legacy)

Earlier versions used a nested `rackarr:` namespace:

```yaml
# OLD FORMAT (pre-1.0)
device_types:
  - slug: dell-r650
    u_height: 1
    rackarr:
      colour: '#8BE9FD'
      category: server

# NEW FORMAT (v1.0.0)
device_types:
  - slug: dell-r650
    u_height: 1
    colour: '#8BE9FD'
    category: server
```

---

## Related Documentation

- [SPEC.md](./SPEC.md) - Complete technical specification
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Codebase overview
- [Type definitions](../../src/lib/types/index.ts) - TypeScript interfaces
- [Zod schemas](../../src/lib/schemas/index.ts) - Runtime validation schemas
