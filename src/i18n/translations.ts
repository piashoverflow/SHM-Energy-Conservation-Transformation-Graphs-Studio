import { Language, ModuleId } from '../types/physics';

export interface TranslationDict {
  studioTitle: string;
  studioSubtitle: string;
  tabs: Record<ModuleId, { short: string; full: string; goal: string }>;
  controls: {
    playbackHeader: string;
    play: string;
    pause: string;
    step: string;
    resetPhase: string;
    resetAll: string;
    speed: string;
    paramsHeader: string;
    springConstant: string;
    mass: string;
    massNote: string;
    amplitude: string;
    amplitudeNote: string;
    positionScrubber: string;
    snapPresets: string;
    presets: {
      eq: string;
      half: string;
      equal: string;
      extreme: string;
    };
    phaseLabel: string;
    dampingHeader: string;
    dampingToggle: string;
    dampingCoeff: string;
    timeWindow: string;
    animateGraph: string;
    dragHintM1: string;
    dragHintM2: string;
    dragHintM3: string;
  };
  telemetry: {
    header: string;
    kineticEnergy: string;
    potentialEnergy: string;
    totalEnergy: string;
    mechEnergy: string;
    thermalLoss: string;
    energySplit: string;
    landmarkHeader: string;
    landmarks: {
      equilibriumTitle: string;
      equilibriumDesc: string;
      halfTitle: string;
      halfDesc: string;
      equalTitle: string;
      equalDesc: string;
      extremeTitle: string;
      extremeDesc: string;
      noneTitle: string;
      noneDesc: string;
    };
    formulasHeader: string;
    kinematicsHeader: string;
    displacement: string;
    velocity: string;
    angularFreq: string;
    period: string;
    energyPeriod: string;
    energyFreq: string;
    ratioEp: string;
    ratioEk: string;
    independentMassNote: string;
  };
  canvas: {
    running: string;
    paused: string;
    dragging: string;
    equilibrium: string;
    springWall: string;
    tankEk: string;
    tankEp: string;
    tankTotal: string;
    constantLine: string;
    intersectionLabel: string;
    energyAxis: string;
    dispAxis: string;
    timeAxis: string;
    dispPlotTitle: string;
    energyPlotTitle: string;
    periodBracket: string;
    energyCycle1: string;
    energyCycle2: string;
    doubleFreqCallout: string;
    dampedEnvelope: string;
    conservedLine: string;
    lossLabel: string;
  };
}

export const translations: Record<Language, TranslationDict> = {
  bn: {
    studioTitle: 'সরল ছন্দিত স্পন্দনে শক্তির নিত্যতা ও লেখচিত্র ল্যাব',
    studioSubtitle: 'ইন্টারেক্টিভ ফিজিক্স সিমুলেশন স্টুডিও',
    tabs: {
      tanks: {
        short: '১. শক্তি ও লাইভ ট্যাংক',
        full: 'মডিউল ১: শক্তি রূপান্তর ও লাইভ এনার্জি ট্যাংক',
        goal: 'গতিশক্তি (Ek) এবং বিভব শক্তির (Ep) অবিরাম রূপান্তর ও মোট যান্ত্রিক শক্তির নিত্যতা পর্যবেক্ষণ',
      },
      'ex-graph': {
        short: '২. E - x প্যারাবোলিক লেখচিত্র',
        full: 'মডিউল ২: সরণ-ভিত্তিক শক্তি লেখচিত্র (E - x)',
        goal: 'সরণ x এর বিপরীতে Ek ও Ep এর পরাবৃত্তাকার লেখচিত্র, ছেদবিন্দু (±A/√2) এবং ভগ্নাংশ বিশ্লেষণ',
      },
      'et-graph': {
        short: '৩. E - t ও অবমন্দন',
        full: 'মডিউল ৩: সময়-ভিত্তিক শক্তি লেখচিত্র (E - t) ও অবমন্দন',
        goal: 'শক্তির দ্বিগুণ কম্পাঙ্ক (2f), অর্ধেক পর্যায়কাল (T/2) ও অবমন্দনে তাপশক্তি অপচয় বিশ্লেষণ',
      },
    },
    controls: {
      playbackHeader: 'সিমুলেশন নিয়ন্ত্রণ',
      play: 'চালু করুন',
      pause: 'বিরতি',
      step: 'ধাপ (+Δt)',
      resetPhase: 't = 0',
      resetAll: 'রিসেট',
      speed: 'গতি',
      paramsHeader: 'ভৌত রাশি ও পরামিতি',
      springConstant: 'স্প্রিং ধ্রুবক (k)',
      mass: 'ব্লকের ভর (m)',
      massNote: 'মোট শক্তি E = ½kA² ভরের (m) ওপর নির্ভরশীল নয়',
      amplitude: 'বিস্তার (A)',
      amplitudeNote: 'মোট শক্তি বিস্তারের বর্গের সমানুপাতিক (E ∝ A²)',
      positionScrubber: 'সরণ স্ক্রাবার (x)',
      snapPresets: 'বিশেষ অবস্থান প্রিসেট',
      presets: {
        eq: 'সাম্যাবস্থা (x = 0)',
        equal: 'সমান শক্তি (x = A/√2)',
        half: 'অর্ধ বিস্তার (x = A/2)',
        extreme: 'চরম অবস্থান (x = A)',
      },
      phaseLabel: 'আদি দশা (δ)',
      dampingHeader: 'অবমন্দন ও বাতাসের বাধা',
      dampingToggle: 'অবমন্দন সক্রিয় করুন',
      dampingCoeff: 'অবমন্দন গুণাঙ্ক (b)',
      timeWindow: 'সময় পরিসীমা',
      animateGraph: 'স্বয়ংক্রিয় চলন',
      dragHintM1: 'ব্লকটি মাউস বা টাচ দিয়ে টেনে যেকোনো অবস্থানে (-A থেকে +A) নিয়ে ছাড়ুন',
      dragHintM2: 'লেখচিত্রের যেকোনো স্থানে টেনে সরণ x পরিবর্তন করুন',
      dragHintM3: 'গ্রাফে টেনে যেকোনো মুহূর্তের (t) শক্তি যাচাই করুন',
    },
    telemetry: {
      header: 'তাৎক্ষণিক শক্তি ও পরিমাপ',
      kineticEnergy: 'গতিশক্তি (Ek)',
      potentialEnergy: 'বিভব শক্তি (Ep)',
      totalEnergy: 'মোট শক্তি (E)',
      mechEnergy: 'যান্ত্রিক শক্তি (Ek + Ep)',
      thermalLoss: 'তাপশক্তি অপচয় (Eloss)',
      energySplit: 'শক্তি বণ্টন অনুপাত',
      landmarkHeader: 'বিশেষ অবস্থান শনাক্তকারী',
      landmarks: {
        equilibriumTitle: 'সাম্যাবস্থা (x = 0)',
        equilibriumDesc: 'বেগ সর্বোচ্চ (v = ωA) · ১০০% গতিশক্তি, ০% বিভব শক্তি',
        halfTitle: 'অর্ধ-বিস্তার (x = ±A/2)',
        halfDesc: 'Ep = ¼E (২৫%) এবং Ek = ¾E (৭৫%)',
        equalTitle: 'সম-শক্তি ছেদবিন্দু (x = ±A/√2)',
        equalDesc: 'Ep = Ek = ½E (৫০% - ৫০%) · গ্রাফের ছেদবিন্দু!',
        extremeTitle: 'চরম বিস্তার (x = ±A)',
        extremeDesc: 'তাৎক্ষণিক বেগ শূন্য (v = 0) · ১০০% বিভব শক্তি',
        noneTitle: 'অন্তর্বর্তী স্পন্দন অবস্থা',
        noneDesc: 'সাম্যাবস্থা ও চরম বিন্দুর মধ্যবর্তী স্থানে শক্তি রূপান্তর চলছে',
      },
      formulasHeader: 'লাইভ সমীকরণ প্রতিস্থাপন',
      kinematicsHeader: 'গতিবিদ্যা ও কম্পাঙ্ক',
      displacement: 'সরণ (x)',
      velocity: 'বেগ (v)',
      angularFreq: 'কৌণিক কম্পাঙ্ক (ω)',
      period: 'দোলনকাল (T)',
      energyPeriod: 'শক্তির পর্যায়কাল (T/2)',
      energyFreq: 'শক্তির কম্পাঙ্ক (2f)',
      ratioEp: 'বিভব শক্তির ভগ্নাংশ (Ep/E)',
      ratioEk: 'গতিশক্তির ভগ্নাংশ (Ek/E)',
      independentMassNote: 'দ্রষ্টব্য: ভর m পরিবর্তন করলে ω ও T বদলায়, কিন্তু মোট শক্তি E অপরিবর্তিত থাকে।',
    },
    canvas: {
      running: 'চলমান',
      paused: 'বিরতি',
      dragging: 'টেনে ধরা হয়েছে',
      equilibrium: 'সাম্যাবস্থা (x=0)',
      springWall: 'দৃঢ় অবলম্বন',
      tankEk: 'গতিশক্তি (Ek)',
      tankEp: 'বিভব শক্তি (Ep)',
      tankTotal: 'মোট শক্তি (Ek+Ep)',
      constantLine: 'ধ্রুব মোট শক্তি E = ½kA²',
      intersectionLabel: 'Ek = Ep = ½E',
      energyAxis: 'শক্তি E (J)',
      dispAxis: 'সরণ x (m)',
      timeAxis: 'সময় t (s)',
      dispPlotTitle: 'সরণ বনাম সময় লেখচিত্র: x(t) = A sin(ωt + δ)',
      energyPlotTitle: 'শক্তি বনাম সময় লেখচিত্র: Ek(t), Ep(t) ও মোট শক্তি',
      periodBracket: '১টি পূর্ণ সরণ পর্যায়কাল (T)',
      energyCycle1: 'শক্তি চক্র ১',
      energyCycle2: 'শক্তি চক্র ২',
      doubleFreqCallout: '১টি সরণ চক্রে ২টি শক্তি চক্র (T_শক্তি = T/2, f_শক্তি = 2f)',
      dampedEnvelope: 'বিস্তার হ্রাস খাম (±Ae⁻ᵇᵗ/²ᵐ)',
      conservedLine: 'সংরক্ষিত মোট শক্তি E₀ = Ek + Ep + Eloss',
      lossLabel: 'তাপ অপচয় (Eloss)',
    },
  },
  en: {
    studioTitle: 'SHM Energy Conservation, Transformation & Graphs Studio',
    studioSubtitle: 'Interactive Physics Simulation Studio',
    tabs: {
      tanks: {
        short: '1. Energy & Live Tanks',
        full: 'Module 1: Energy Transformation & Live Tanks',
        goal: 'Observe continuous conversion between Kinetic (Ek) and Potential Energy (Ep) while total mechanical energy remains conserved',
      },
      'ex-graph': {
        short: '2. E - x Parabolic Curves',
        full: 'Module 2: Energy vs Displacement Curves (E - x)',
        goal: 'Analyze upright and inverted parabolas of Ep(x) and Ek(x), intersection points (±A/√2), and fractional energy ratios',
      },
      'et-graph': {
        short: '3. E - t & Damping',
        full: 'Module 3: Energy vs Time (E - t) & Damped Oscillation',
        goal: 'Prove visually why energy oscillates at 2f (period T/2) and explore exponential dissipation under damping',
      },
    },
    controls: {
      playbackHeader: 'Simulation Playback',
      play: 'Play',
      pause: 'Pause',
      step: 'Step (+Δt)',
      resetPhase: 't = 0',
      resetAll: 'Reset',
      speed: 'Speed',
      paramsHeader: 'Physical Parameters',
      springConstant: 'Spring Constant (k)',
      mass: 'Block Mass (m)',
      massNote: 'Total energy E = ½kA² is independent of mass m',
      amplitude: 'Amplitude (A)',
      amplitudeNote: 'Total energy scales quadratically (E ∝ A²)',
      positionScrubber: 'Position Scrubber (x)',
      snapPresets: 'Instant Snap Presets',
      presets: {
        eq: 'Equilibrium (x = 0)',
        equal: 'Equal Energy (x = A/√2)',
        half: 'Half Amplitude (x = A/2)',
        extreme: 'Extreme (x = A)',
      },
      phaseLabel: 'Initial Phase (δ)',
      dampingHeader: 'Damping & Air Resistance',
      dampingToggle: 'Enable Damping',
      dampingCoeff: 'Damping Coeff (b)',
      timeWindow: 'Time Span',
      animateGraph: 'Animate Motion',
      dragHintM1: 'Drag the mass block directly to any position in [-A, +A] and release',
      dragHintM2: 'Drag horizontally across the graph to scrub displacement x',
      dragHintM3: 'Drag across the time plots to inspect any instant t',
    },
    telemetry: {
      header: 'Real-Time Energy Telemetry',
      kineticEnergy: 'Kinetic Energy (Ek)',
      potentialEnergy: 'Potential Energy (Ep)',
      totalEnergy: 'Total Energy (E)',
      mechEnergy: 'Mechanical Energy',
      thermalLoss: 'Thermal Dissipated (Eloss)',
      energySplit: 'Energy Percentage Split',
      landmarkHeader: 'Landmark Detector',
      landmarks: {
        equilibriumTitle: 'Equilibrium (x = 0)',
        equilibriumDesc: 'Peak speed (v = ωA) · 100% Kinetic, 0% Potential',
        halfTitle: 'Half Amplitude (x = ±A/2)',
        halfDesc: 'Ep = ¼E (25%) and Ek = ¾E (75%)',
        equalTitle: 'Equal Energy Point (x = ±A/√2)',
        equalDesc: 'Ep = Ek = ½E (50% - 50%) · Curve Intersection!',
        extremeTitle: 'Turning Point (x = ±A)',
        extremeDesc: 'Instantaneous velocity v = 0 · 100% Potential',
        noneTitle: 'Intermediate Oscillation',
        noneDesc: 'Continuous energy exchange between kinetic and elastic forms',
      },
      formulasHeader: 'Live Formula Substitution',
      kinematicsHeader: 'Kinematics & Frequency',
      displacement: 'Displacement (x)',
      velocity: 'Velocity (v)',
      angularFreq: 'Angular Freq (ω)',
      period: 'Period (T)',
      energyPeriod: 'Energy Period (T/2)',
      energyFreq: 'Energy Freq (2f)',
      ratioEp: 'Potential Ratio (Ep/E)',
      ratioEk: 'Kinetic Ratio (Ek/E)',
      independentMassNote: 'Note: Changing mass m alters ω and T, while total mechanical energy E remains unchanged.',
    },
    canvas: {
      running: 'Running',
      paused: 'Paused',
      dragging: 'Dragging',
      equilibrium: 'Equilibrium (x=0)',
      springWall: 'Rigid Anchor',
      tankEk: 'Kinetic (Ek)',
      tankEp: 'Potential (Ep)',
      tankTotal: 'Total (Ek+Ep)',
      constantLine: 'Constant Total Energy E = ½kA²',
      intersectionLabel: 'Ek = Ep = ½E',
      energyAxis: 'Energy E (J)',
      dispAxis: 'Displacement x (m)',
      timeAxis: 'Time t (s)',
      dispPlotTitle: 'Displacement vs Time: x(t) = A sin(ωt + δ)',
      energyPlotTitle: 'Energies vs Time: Ek(t), Ep(t) & Total Energy',
      periodBracket: '1 Complete Displacement Period (T)',
      energyCycle1: 'Energy Cycle 1',
      energyCycle2: 'Energy Cycle 2',
      doubleFreqCallout: '2 full energy cycles per 1 displacement period (T_energy = T/2, f_energy = 2f)',
      dampedEnvelope: 'Decay Envelope (±Ae⁻ᵇᵗ/²ᵐ)',
      conservedLine: 'Conserved Total E₀ = Ek + Ep + Eloss',
      lossLabel: 'Dissipated (Eloss)',
    },
  },
};
