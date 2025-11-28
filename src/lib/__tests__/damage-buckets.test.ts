import { mapStatToBucket } from '@/lib/damage-buckets';

describe('damage bucket stat mapping', () => {
    it('detects scalar ATK stats', () => {
        const result = mapStatToBucket('ATK', '30%');
        expect(result?.bucketId).toBe('SCALAR_ATK');
    });

    it('detects elemental ATK stats', () => {
        const result = mapStatToBucket('Pyro ATK', '18%');
        expect(result?.bucketId).toBe('SCALAR_ATK');
        expect(result?.tag).toBe('elemental');
    });

    it('detects damage boost stats', () => {
        const result = mapStatToBucket('Damage Dealt', '12%');
        expect(result?.bucketId).toBe('DMG_BOOST');
    });

    it('classifies utility stats separately', () => {
        const result = mapStatToBucket('Max Sanity', '10%');
        expect(result?.bucketId).toBe('UTILITY');
    });
});

