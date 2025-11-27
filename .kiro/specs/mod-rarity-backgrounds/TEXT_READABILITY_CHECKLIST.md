# Text Readability Verification Checklist

Use this checklist while testing text readability in the application.

---

## Test Setup

- [ ] Development server running at http://localhost:3001
- [ ] Browser open to build creator page
- [ ] Ready to add mods

---

## 2-Star Mods (Green Gradient)

**Test Mod:** Crusher (Trammel)

### Visual Checks
- [ ] ⭐⭐ Stars visible and clear
- [ ] Mod name readable (if visible)
- [ ] Symbol badge (⊙) clear and readable
- [ ] Tolerance cost number (9) readable
- [ ] Text readable on light green bottom area
- [ ] Overall appearance looks good

### Notes:
```
[Write any observations here]
```

---

## 3-Star Mods (Blue Gradient)

**Test Mod:** Celerity

### Visual Checks
- [ ] ⭐⭐⭐ Stars visible and clear
- [ ] Mod name readable (if visible)
- [ ] Symbol badge (⊙) clear and readable
- [ ] Tolerance cost number (12) readable
- [ ] Text readable on light blue bottom area
- [ ] Overall appearance looks good

### Notes:
```
[Write any observations here]
```

---

## 4-Star Mods (Purple-Pink Gradient) ⭐ PRIORITY

**Test Mod:** Illusionary Sacrifice (4-star)

### Visual Checks
- [ ] ⭐⭐⭐⭐ Stars visible and clear
- [ ] Mod name readable (if visible)
- [ ] Symbol badge (⊙) clear and readable
- [ ] Tolerance cost number (24) readable
- [ ] Text readable on pink bottom area
- [ ] Gradient looks smooth and attractive
- [ ] Purple-to-pink transition visible
- [ ] Overall appearance looks good

### Notes:
```
[Write any observations here]
```

---

## 5-Star Mods (Gold Gradient) ⚠️ CRITICAL TEST

**Test Mod:** Illusionary Sacrifice (5-star)

### Visual Checks
- [ ] ⭐⭐⭐⭐⭐ Stars visible and clear **[CRITICAL]**
- [ ] Yellow stars distinguishable from amber background **[CRITICAL]**
- [ ] Mod name readable (if visible)
- [ ] Symbol badge (⊙) clear and readable
- [ ] Tolerance cost number (27) readable
- [ ] Text readable on light amber bottom area
- [ ] Overall appearance looks good

### Notes:
```
[Write any observations here]
```

### If Stars Not Visible:
This is a critical issue. Note:
- Can you see the stars at all?
- Are they very faint?
- What would help (white stars, outline, background)?

---

## Mod Selector Dialog Test

**Steps:** Click "Add Mod" button

### Visual Checks
- [ ] Mod cards display gradients correctly
- [ ] Mod names readable on cards
- [ ] Main attributes readable
- [ ] Stars visible on all cards
- [ ] Symbol badges clear
- [ ] Can distinguish between rarities easily

### Test Each Tab:
- [ ] Regular tab - gradients look good
- [ ] Center Only tab - gradients look good
- [ ] Prime tab - gradients look good

### Notes:
```
[Write any observations here]
```

---

## Small Text Test

### Elements to Check:
- [ ] Tolerance cost badges (11px) - readable on all gradients
- [ ] Symbol badges (12px) - readable on all gradients
- [ ] Track info in tooltips - readable

### Notes:
```
[Write any observations here]
```

---

## Special States Test

### Symbol Match (Green Glow)
**Steps:** Add a prime mod with symbol, then add support mod with matching symbol

- [ ] Green glow visible with gradient
- [ ] Symbol badge shows green background
- [ ] Tolerance cost shows strikethrough
- [ ] All text still readable

### Adjusted Mod (Emerald Glow)
**Steps:** Enable adjust mode, click on a support mod

- [ ] Emerald glow visible with gradient
- [ ] Emerald badge visible and readable
- [ ] Tolerance cost shows strikethrough
- [ ] All text still readable

### Notes:
```
[Write any observations here]
```

---

## Different Conditions Test

### Screen Brightness
- [ ] Tested at 100% brightness
- [ ] Tested at 50% brightness
- [ ] Tested at 25% brightness (if possible)

### Browser Zoom
- [ ] Tested at 100% zoom
- [ ] Tested at 125% zoom
- [ ] Tested at 150% zoom

### Notes:
```
[Write any observations here]
```

---

## Overall Assessment

### Readability Score

Rate each gradient (1-5, where 5 is excellent):

- 2-Star (Green): ___/5
- 3-Star (Blue): ___/5
- 4-Star (Purple-Pink): ___/5
- 5-Star (Gold): ___/5

### Issues Found

List any issues:
```
1. 
2. 
3. 
```

### Recommendations

Any suggestions for improvement:
```
1. 
2. 
3. 
```

---

## Final Decision

### ✅ All Tests Pass
- [ ] All text is readable on all gradients
- [ ] Stars are visible on all rarities
- [ ] Badges are clear and readable
- [ ] No issues found
- [ ] Ready to mark task as complete

### ⚠️ Issues Found
- [ ] Issues documented above
- [ ] Fixes needed before completion
- [ ] Will re-test after fixes

### 📝 Notes for Developer
```
[Any additional notes or context]
```

---

## Completion

**Tested By:** _______________  
**Date:** _______________  
**Time Spent:** _______________ minutes  
**Result:** ✅ Pass / ⚠️ Issues Found  

---

## Next Steps

### If All Tests Pass:
1. Update VISUAL_TEST_REPORT.md
2. Mark "Text readability on all gradients" as complete
3. Proceed to next task: "Icon visibility on all gradients"

### If Issues Found:
1. Share this checklist with developer
2. Discuss fixes
3. Re-test after fixes applied
4. Update documentation

---

**Checklist Version:** 1.0  
**Last Updated:** 2025-11-23
