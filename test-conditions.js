// Quick test script to check all demon wedge conditions
import { demonWedgesData } from './src/lib/demon-wedges-data';
import { getConditionalEffects } from './src/lib/demon-wedge-conditions';

console.log('Checking all Demon Wedges for conditional effects...\n');

const problematicWedges = [];

for (const wedge of demonWedgesData) {
    const effects = getConditionalEffects(wedge);

    if (effects.length > 0) {
        console.log(`\n${wedge.fullName} (${wedge.id}):`);
        effects.forEach(effect => {
            const valuePercent = (effect.value * 100).toFixed(1);
            const sign = effect.value >= 0 ? '+' : '';
            console.log(`  ${sign}${valuePercent}% - ${effect.label.substring(0, 80)}`);

            // Check for potentially problematic negative values
            if (effect.value < 0 && !effect.label.toLowerCase().includes('decrease') &&
                !effect.label.toLowerCase().includes('reduce') &&
                !effect.label.toLowerCase().includes('lower')) {
                problematicWedges.push({
                    wedge: wedge.fullName,
                    value: valuePercent,
                    label: effect.label
                });
            }
        });
    }
}

if (problematicWedges.length > 0) {
    console.log('\n\n⚠️  POTENTIALLY PROBLEMATIC NEGATIVE VALUES FOUND:');
    problematicWedges.forEach(item => {
        console.log(`\n${item.wedge}: ${item.value}%`);
        console.log(`  "${item.label}"`);
    });
} else {
    console.log('\n\n✅ All conditional effects look good!');
}
