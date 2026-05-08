/**
 * @typedef {{ heading?: string, bodyParagraphs?: string[], listItems?: string[] }} CardSection
 * @typedef {{ ordinal: number, ordinalTotal: number, title: string, subtitle?: string, sections: CardSection[] }} SlotCard
 */

/** @type {Record<string, SlotCard[]>} */
export const CARDS_BY_DIGIT = {
  '1': [
    {
      ordinal: 1,
      ordinalTotal: 4,
      title: 'UNDERSTANDING GUILT & SHAME',
      subtitle: 'Restoring Integrity',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Atonement • Integrity • Conscience Self-respect • Behavioral change',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: [
            'Whose ethics and values have been disrespected?',
            'What must be made right?',
          ],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            "Crippling, repetitive guilty feelings that do not instruct you or heal your relationships. Or shamelessness, where you and others are endangered by your delayed remorse or inappropriate behaviors.",
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            "Shame and guilt arise to make sure that you don't hurt, embarrass, or dehumanize yourself or others. Channel this emotion into your boundary and create a sacred space in which you can identify and atone for your wrongdoing, explore and amend your behaviors, throw off inauthentic shaming messages (see the Burning Contracts card), and heal yourself and your relationships.",
          ],
        },
      ],
    },
    {
      ordinal: 2,
      ordinalTotal: 4,
      title: 'ATTENDING TO WORRY & ANXIETY',
      subtitle: 'Focus and Completion',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Foresight • Focus • Conscience',
            'Task-completion • Procrastination alert system',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: [
            'What brought this feeling forward?',
            'What truly needs to be done?',
          ],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'An inability to complete your tasks, meet your deadlines, or focus and organize your life.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            "Anxiety (or worry) is focused on the future - it brings you the energy you need to prepare for the future, organize yourself, complete your tasks, and meet your deadlines. This energetic emotion may need your help, so make lists, check your deadlines, gather your tools, and prepare yourself. Note: If you feel a sense of dread or danger, panic is likely present; see the panic cards for healing ideas, and see chapter 6 in Embracing Anxiety.",
          ],
        },
      ],
    },
    {
      ordinal: 3,
      ordinalTotal: 4,
      title: 'UNDERSTANDING IMMEDIATE PANIC AND TERROR',
      subtitle: 'The Powerful Protector',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: ['Sudden energy • Fixed attention', 'Absolute stillness • Survival instincts'],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: [
            'What is currently a threat? Please help me fight, flee, freeze, or flock to safety.',
          ],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Inability to identify danger and low self-protection skills. Or reckless behavior that threatens your health and safety.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            "Immediate panic arises when you face threats to your survival, and it gives you 4 main choices: fight, flee, freeze, or flock to safety.",
            "Trust your body to choose the perfect life-saving actions. Immediate panic contains your survival genius, and you can rely on panic to keep you safe and whole. When you're safe, take some time to discharge your intense energy (tremble, move, jump, run around, cry, talk about what happened, etc.), soothe yourself, and connect with healing people and/or animals.",
          ],
        },
      ],
    },
    {
      ordinal: 4,
      ordinalTotal: 4,
      title: 'HONORING FROZEN PANIC AND TERROR',
      subtitle: 'The Healing Witness',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Healing from past traumas',
            'Freedom from cycling patterns',
            'Completion of unfinished initiations',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: [
            'What has been frozen in time?',
            'What healing action must be taken?',
          ],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Cycling attacks of panic and terror that immobilize, dissociate, or torment you. Or taking actions that are not healing and thereby increasing your distress.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            "Frozen panic arises to help you address unhealed traumas, and it brings you the energy you need to create healing and resolution. The key is to take healing actions with the energy panic brings to you (you could take hundreds of actions, but would they be healing?).",
            "Remember: You've already survived; frozen panic can help you renegotiate your traumas and move from basic survival into resilience and wholeness. For help with panic and the healing of trauma, see chapter 19 in The Language of Emotions and see chapter 6 in Embracing Anxiety.",
          ],
        },
      ],
    },
  ],
  '2': [
    {
      ordinal: 1,
      ordinalTotal: 1,
      title: 'WELCOMING SADNESS',
      subtitle: 'The Water Bearer',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: ['Release • Fluidity • Grounding', 'Relaxation • Rejuvenation'],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: ['What must be released?', 'What must be rejuvenated?'],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'An inability or unwillingness to relax and let go. Or unmoving despair that does not bring resolution or relaxation.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            'Sadness helps you release that which no longer serves you, which can restore your flow and your tears, and bring healing flexibility to your body and your behavior.',
            "When you can truly let go, rejuvenation and relaxation will surely follow. Then, you'll have the space and time you need to find something that truly does serve you.",
            'See the Getting Grounded card for a specific sadness practice.',
          ],
        },
      ],
    },
  ],
  '3': [
    {
      ordinal: 1,
      ordinalTotal: 1,
      title: 'HONORING JOY',
      subtitle: 'Affinity & Communion',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: ['Expansion • Communion • Inspiration', 'Splendor • Radiance • Bliss'],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: [
            'What brings me deep connection and infinite expansion?',
            'How do I integrate this radiant experience?',
          ],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Inability to feel connected to humanity or the world, or to feel deep pleasure. Or mania, ungrounded and boundary-less bliss, or unwillingness to listen to your other emotions.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            'Joy arises to help you feel a blissful sense of open-hearted connection to others, to ideas, or to experiences. Celebrate your joyfulness and let it flow naturally. Joy (and all emotions) should move in its own time and in its own way.',
            'Be aware: Extreme joy (exhilaration) should be approached with care, especially if it cycles with depression or sadness. Repetitive exhilaration or mania may be a sign of emotional distress; please reach out for support.',
          ],
        },
      ],
    },
  ],
  '4': [
    {
      ordinal: 1,
      ordinalTotal: 1,
      title: 'EMBRACING GRIEF',
      subtitle: 'The Deep River of the Soul',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Mourning • Deep release • Lamentation',
            'Complete immersion in the river of all souls.',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: ['What must be mourned?', 'How do I honor what was lost?'],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Unwillingness or inability to accept or honor loss, death, or profound transitions. Or self-injuring, death-seeking behaviors that help you pretend that death cannot touch you.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            'Grief arises when a death has occurred - either a real death, or the death of an idea, a relationship, or something deeply important to you. When grief appears, stop, drop everything, and ask your internal questions.',
            'When the river of the soul takes your weight unto itself, you can release that which has died into the next world - so that you may live more fully in this one.',
          ],
        },
      ],
    },
  ],
  '5': [
    {
      ordinal: 1,
      ordinalTotal: 1,
      title: 'ACKNOWLEDGING FEAR',
      subtitle: 'Intuition & Action',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Intuition • Instincts • Focus • Clarity • Attentiveness • Readiness • Vigor',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTION',
          listItems: ['What am I sensing?', 'What action should be taken?'],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Insufficient awareness or instincts about your surroundings or the people in your life. Or constant activation and apprehension that decrease your focus and clarity.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            'Fear arises to help you focus on the present moment, access your instincts and intuition, and tune into changes in your environment. Focus your attention on your fear and orient yourself to your surroundings. Prepare yourself, act and move consciously, and revitalize yourself with the dynamic, intuitive focus fear brings you.',
          ],
        },
      ],
    },
  ],
  '6': [
    {
      ordinal: 1,
      ordinalTotal: 1,
      title: 'HONORING SITUATIONAL DEPRESSION',
      subtitle: 'Ingenious Stagnation',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Inward focus • Stillness • Purposeful inactivity',
            'Reality check • The ingenious stop sign of the soul',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: ['Where has my energy gone?', 'Why was it sent away?'],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Inability or unwillingness to stop and re-assess unworkable situations. Or cycling emotions or repetitive manias that destabilize you or halt your forward progress.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            "Situational depression slows you down when things are not working well in your life, so listen closely. There's always a good reason for energy and flow to vacate your psyche - whether it's related to health, neurochemistry, injustice, relationships, career, or unhealed traumas. You should not attempt to move forward until you understand - and address - the conditions that evoked your situational depression.",
            'Please see the different forms of depression in chapter 22 of The Language of Emotions; many may require counseling or medical intervention.',
          ],
        },
      ],
    },
  ],
  '7': [
    {
      ordinal: 1,
      ordinalTotal: 1,
      title: 'UNDERSTANDING HAPPINESS',
      subtitle: 'Anticipation & Possibility',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Merriment • Gaiety • Amusement • Hope • Delight • Wonder • Playfulness • Invigoration',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: ['What delights me?', 'What makes me feel hopeful?'],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Lack of belief in possibilities or the future; the unwillingness to play. Or ungrounded positive outlook and excitement, and unwillingness to listen to your other emotions.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            'Happiness arises to help you look around yourself and toward the future with hope and delight. Happiness arises when things feel fun and hopeful, so celebrate your happiness and let it go! So many of us have been taught to overuse and entrap happiness, but happiness can only work properly when we respect it for what it does and allow it and all of our emotions to flow.',
          ],
        },
      ],
    },
  ],
  '8': [
    {
      ordinal: 1,
      ordinalTotal: 4,
      title: 'SAVORING CONTENTMENT',
      subtitle: 'Pleasure & Appreciation',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Enjoyment • Satisfaction • Self-esteem',
            'Renewal • Confidence • Fulfillment',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTION',
          listItems: ['How have I embodied my authentic values?'],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Inability to feel satisfied with or proud of yourself, or the unwillingness to challenge yourself and risk failure. Or inflated self-esteem that places your needs above everyone and everything else.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            "Contentment arises when you've behaved in ways that you approve of, and when you've accomplished something important to you.",
            'Contentment helps you look toward yourself with pride and satisfaction. Celebrate your excellent behavior and skills, congratulate yourself, and then move on to your next challenge (instead of trying to feel contented at all possible times). True contentment follows true accomplishments.',
          ],
        },
      ],
    },
    {
      ordinal: 2,
      ordinalTotal: 4,
      title: 'WELCOMING ANGER',
      subtitle: 'The Honorable Sentry',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Honor • Conviction • Healthy self esteem • Proper boundaries • Healthy detachment',
            'Protection of yourself and others',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: ['What do I value?', 'What must be protected and restored?'],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Enmeshment, self-abandonment, cycling apathy or depression, and/or boundary loss. Or cycling rages that create harsh boundaries, interpersonal violence, or isolation.',
            'Be aware: repetitive rages may be a sign of untreated depression.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            'Anger arises when your self-image, behaviors, or boundaries are challenged - or when you see them challenged in someone else. Connect first to your values, ground yourself, and set your boundaries; anger can bring you the strength you need to be vulnerable and honest. Instead of repressing your anger or exploding with it, speak your truth or make your correcting actions with clarity and vulnerability. Your anger can help you reset your boundaries in healthy ways, which will protect you and your relationships.',
          ],
        },
      ],
    },
    {
      ordinal: 3,
      ordinalTotal: 4,
      title: 'UNDERSTANDING HATRED',
      subtitle: 'The Profound Mirror',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Intense awareness • Piercing vision',
            'Sudden evolution • Shadow work',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: ['What has fallen into my shadow?', 'What must be reintegrated?'],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Fierce, laser-focused attacks on others without any concurrent self-awareness or integration.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            'Hatred arises in the presence of your shadow, or things you cannot accept in yourself (and despise or adore in others). Shadow work can help you explore these things so that you can detoxify and reintegrate them. You can retrieve your shadow material from your hate partner by describing in detail the troubles you perceive. Say hello to your lost self, burn your contracts with these troubles, and restore your own self to wholeness.',
          ],
        },
      ],
    },
    {
      ordinal: 4,
      ordinalTotal: 4,
      title: 'UNDERSTANDING THE SUICIDAL URGE',
      subtitle: 'The Darkness before Dawn',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: ['Certainty • Resolve • Liberty', 'Transformation • Rebirth'],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: [
            'What behavior or situation must end now?',
            'What can no longer be tolerated in my soul?',
          ],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Bleak, agonizing feelings that threaten your physical life instead of offering transformation and reawakening.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            'For specific help with suicidal urges, see chapter 23 in The Language of Emotions.',
            "Suicidal urges arise when something in your life needs to end - but it's not your actual, physical life!",
            'Burn your contracts and create a sacred ceremonial death for that which torments you. When you can honor and attend to your suicidal urges in a grounded, empathic way, they can stand up for your lost dreams and clear away everything inside you that threatens those dreams. Channeling your suicidal urges can, in essence, give you a new life - it can give you your own life back.',
            "If you're in crisis, please reach out to a counselor, doctor, friend, family member, or your local crisis hotline: In the U.S., call the National Lifeline at 1-800-273-8255.",
          ],
        },
      ],
    },
  ],
  '9': [
    {
      ordinal: 1,
      ordinalTotal: 4,
      title: 'DECIPHERING CONFUSION',
      subtitle: 'The Healing Mask for Fear and Anxiety',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Diffused awareness • Innocence',
            'Obliviousness • Malleability',
            'Taking a time-out',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: [
            'How can I welcome not-knowing and not-doing?',
            'What is my intention?',
          ],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Taking unwise or impulsive actions without deliberation. Or being unable to decide, act, or believe in yourself or your decisions.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            "Confusion is a healing mask for fear and anxiety, and it arises when you have too much to process all at once, or you don't have enough information (it gives you a much-needed time out). Take some time to simply be instead of looking outside yourself for answers. When you're rested and ready, ask your internal questions - they'll help you find your own authentic ideas, intentions, and answers again.",
          ],
        },
      ],
    },
    {
      ordinal: 2,
      ordinalTotal: 4,
      title: 'HONORING JEALOUSY',
      subtitle: 'Relational Radar',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Love • Commitment • Fairness • Security',
            'Intimacy • Connection • Loyalty',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: [
            'What kinds of intimacy do I desire and want to offer?',
            'What betrayals must be recognized and healed?',
          ],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            "Inability to identify or choose available, stable, and loyal mates. Or cycling suspicions that don't bring useful awareness to you or stability to your relationships.",
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            "Jealousy arises when your connection to love, loyalty, or security in your relationships is challenged. Discern whether you're responding to disloyalty from others, or to your own lack of self-regard and self-worth. Do you and your partner(s) have the love and security you need? If not, restore your boundaries first; then listen to your intuitions about the relationship. You can make healthy decisions about any internal or external issues in response to your jealousy.",
          ],
        },
      ],
    },
    {
      ordinal: 3,
      ordinalTotal: 4,
      title: 'HONORING ENVY',
      subtitle: 'Interactional Radar',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: [
            'Fairness • Security • Equity',
            'Access to resources and recognition • Generosity',
          ],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: [
            'What resources and security do I desire for myself and others?',
            'What inequalities must be made right?',
          ],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            "An inability to ask for or accept what you dream of and desire. Or feverish greed that places your needs above all other things, including ethics and empathy.",
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            "Envy arises when your connection to security, resources, or recognition is challenged. Discern whether you're responding to fairness in social exchanges, and check in with your self-regard and self-worth. Do you have healthy and appropriate access to resources and recognition?",
            'Does everyone else in the situation? If not, restore your boundaries first; then listen to your intuition so that you can make practical and respectful decisions and actions in response to your envy.',
          ],
        },
      ],
    },
    {
      ordinal: 4,
      ordinalTotal: 4,
      title: 'UNDERSTANDING APATHY & BOREDOM',
      subtitle: 'The Protective Mask for Anger',
      sections: [
        {
          heading: 'GIFTS',
          bodyParagraphs: ['Detachment • Boundary-setting', 'Separation • Taking a pause'],
        },
        {
          heading: 'THE INTERNAL QUESTIONS',
          listItems: ['What is being avoided?', 'What can be made conscious?'],
        },
        {
          heading: 'SIGNS OF OBSTRUCTION',
          bodyParagraphs: [
            'Monotonous indifference, impassivity, or distractibility that halts creative action.',
          ],
        },
        {
          heading: 'PRACTICE',
          bodyParagraphs: [
            "Apathy (or boredom) is a protective mask for anger that arises in situations where you and your needs are unimportant, and you cannot or will not use your anger openly. Inside yourself, you can honor your need to be separate and detached without taking yourself out of commission, and you can use the anger beneath apathy to reset your boundaries in healthy ways.",
            'Be aware: persistent apathy may be a sign of a sleep issue or possible depression.',
          ],
        },
      ],
    },
  ],
};
