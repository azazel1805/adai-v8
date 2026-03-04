import type { AffixOfTheDay } from '../types';

export const AFFIXES_OF_THE_DAY: AffixOfTheDay[] = [
    {
        affix: '-less',
        type: 'Suffix',
        meaning: 'olmayan, -siz',
        examples: [
            { word: 'homeless', definition: 'Having no home or permanent place of residence.' },
            { word: 'careless', definition: 'Not giving or showing enough care and attention.' },
            { word: 'endless', definition: 'Having or seeming to have no end or limit.' }
        ]
    },
    {
        affix: 'un-',
        type: 'Prefix',
        meaning: 'değil, zıttı',
        examples: [
            { word: 'unhappy', definition: 'Not happy; sad.' },
            { word: 'unable', definition: 'Not having the skill, means, or opportunity to do something.' },
            { word: 'unusual', definition: 'Not habitually or commonly occurring or done.' }
        ]
    },
    {
        affix: '-able',
        type: 'Suffix',
        meaning: '-ebilir, -abilir (yapılabilir)',
        examples: [
            { word: 'readable', definition: 'Able to be read or worth reading.' },
            { word: 'breakable', definition: 'Capable of being broken.' },
            { word: 'enjoyable', definition: 'Giving delight or pleasure.' }
        ]
    },
    {
        affix: 're-',
        type: 'Prefix',
        meaning: 'tekrar, yeniden',
        examples: [
            { word: 'redo', definition: 'Do (something) again or differently.' },
            { word: 'rebuild', definition: 'Build (something) again after it has been damaged or destroyed.' },
            { word: 'review', definition: 'Examine or assess (something) formally with the possibility or intention of instituting change if necessary.' }
        ]
    },
    {
        affix: '-ful',
        type: 'Suffix',
        meaning: 'dolu, sahip olan',
        examples: [
            { word: 'beautiful', definition: 'Pleasing the senses or mind aesthetically.' },
            { word: 'powerful', definition: 'Having great power or strength.' },
            { word: 'careful', definition: 'Making sure of avoiding potential danger, mishap, or harm; cautious.' }
        ]
    },
    {
        affix: 'pre-',
        type: 'Prefix',
        meaning: 'önce, önceden',
        examples: [
            { word: 'prefix', definition: 'A word, letter, or number placed before another.' },
            { word: 'preview', definition: 'An inspection or viewing of something before it is bought or becomes generally known and available.' },
            { word: 'prepare', definition: 'Make (something) ready for use or consideration.' }
        ]
    }
];
