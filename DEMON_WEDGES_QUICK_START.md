# Demon Wedges Data Sync - Quick Reference

## 🚀 Quick Start

### Run the sync script to update all Demon Wedges data:
```bash
node scripts/sync-demon-wedges-from-json.js
```

---

## 📁 Files Modified/Created

| File | Purpose | Size |
| :--- | :--- | :--- |
| `scripts/sync-demon-wedges-from-json.js` | Sync script | 10.59 KB |
| `src/lib/demon-wedges-data.ts` | Generated data file | 420.32 KB |
| `docs/demon-wedges-sync.md` | Technical documentation | 4.25 KB |
| `DEMON_WEDGES_SYNC_REPORT.md` | Detailed report | 4.73 KB |
| `DEMON_WEDGES_UPDATE_SUMMARY.md` | Summary | 6.13 KB |

---

## 📊 Data Summary

**Total Demon Wedges**: 493

| Type | Count |
| :--- | :--- |
| Characters | 249 |
| Melee Weapons | 89 |
| Ranged Weapons | 85 |
| Melee Consonance | 35 |
| Ranged Consonance | 35 |

---

## 📝 Data Coverage

- **Main Images**: 493/493 ✅
- **Element Icons**: 161/493 ✅
- **Polarity Icons**: 413/493 ✅
- **Tolerance Values**: 493/493 ✅
- **Stats**: All mapped ✅
- **Descriptions**: All included ✅

---

## 🔄 Update Workflow

1. **Edit JSON files** in `Info Demon Wedge/` folder
2. **Run sync script**: `node scripts/sync-demon-wedges-from-json.js`
3. **Build & Test**: `npm run build`
4. **Deploy**: `npm start`

---

## ⚠️ Important

🚫 **DO NOT** manually edit `src/lib/demon-wedges-data.ts`
✅ **DO** edit JSON files and run sync script

---

## 📚 Documentation

- `docs/demon-wedges-sync.md` - Full technical documentation
- `DEMON_WEDGES_SYNC_REPORT.md` - Detailed sync report
- `DEMON_WEDGES_UPDATE_SUMMARY.md` - Executive summary

---

**Last Updated**: December 2, 2025
**Status**: ✅ Complete
