"use strict";
var Game;
(function (Game) {
    Game.POSITION_LABELS = {
        ATA: 'Atacante', PE: 'Ponta Esquerda', PD: 'Ponta Direita', MEI: 'Meia ofensivo', MC: 'Meio-campista',
        VOL: 'Volante', LE: 'Lateral Esquerdo', LD: 'Lateral Direito', ZAG: 'Zagueiro', GOL: 'Goleiro'
    };
    Game.ATTRIBUTE_LABELS = {
        shooting: 'Chute', passing: 'Passe', dribbling: 'Drible', tackling: 'Desarme', goalkeeping: 'Defesa'
    };
    Game.OVR_WEIGHTS = {
        ATA: { shooting: .40, passing: .15, dribbling: .35, tackling: .10 },
        PE: { shooting: .30, passing: .20, dribbling: .40, tackling: .10 },
        PD: { shooting: .30, passing: .20, dribbling: .40, tackling: .10 },
        MEI: { shooting: .20, passing: .35, dribbling: .35, tackling: .10 },
        MC: { shooting: .15, passing: .40, dribbling: .25, tackling: .20 },
        VOL: { shooting: .10, passing: .35, dribbling: .15, tackling: .40 },
        LE: { shooting: .10, passing: .30, dribbling: .25, tackling: .35 },
        LD: { shooting: .10, passing: .30, dribbling: .25, tackling: .35 },
        ZAG: { shooting: .05, passing: .20, dribbling: .10, tackling: .65 },
        GOL: { goalkeeping: .85, passing: .15 }
    };
    Game.BASE_ATTRIBUTES = {
        ATA: { shooting: 62, passing: 49, dribbling: 58, tackling: 34 },
        PE: { shooting: 55, passing: 52, dribbling: 62, tackling: 35 },
        PD: { shooting: 55, passing: 52, dribbling: 62, tackling: 35 },
        MEI: { shooting: 53, passing: 60, dribbling: 60, tackling: 38 },
        MC: { shooting: 48, passing: 60, dribbling: 55, tackling: 50 },
        VOL: { shooting: 45, passing: 55, dribbling: 45, tackling: 62 },
        LE: { shooting: 42, passing: 52, dribbling: 55, tackling: 60 },
        LD: { shooting: 42, passing: 52, dribbling: 55, tackling: 60 },
        ZAG: { shooting: 38, passing: 50, dribbling: 40, tackling: 61 },
        GOL: { shooting: 12, passing: 50, dribbling: 18, tackling: 22, goalkeeping: 62 }
    };
    Game.GROWTH_WEIGHTS = {
        ATA: { shooting: 4, passing: 1.5, dribbling: 3.5, tackling: .5 },
        PE: { shooting: 3, passing: 2, dribbling: 4, tackling: .5 },
        PD: { shooting: 3, passing: 2, dribbling: 4, tackling: .5 },
        MEI: { shooting: 2, passing: 4, dribbling: 4, tackling: .75 },
        MC: { shooting: 1.25, passing: 4, dribbling: 2.5, tackling: 2 },
        VOL: { shooting: .75, passing: 3.5, dribbling: 1.5, tackling: 4 },
        LE: { shooting: .75, passing: 3, dribbling: 2.5, tackling: 3.5 },
        LD: { shooting: .75, passing: 3, dribbling: 2.5, tackling: 3.5 },
        ZAG: { shooting: .5, passing: 2, dribbling: .75, tackling: 5 },
        GOL: { goalkeeping: 5, passing: 1.5 }
    };
    Game.CLUBS = [
        { id: 'guarani', name: 'Guarani', shortName: 'GUA', strength: 58, prestige: 49, rivalId: 'ponte-preta', country: 'Brasil', flag: '🇧🇷', league: 'Brasil · cenário simulado' },
        { id: 'ponte-preta', name: 'Ponte Preta', shortName: 'PON', strength: 60, prestige: 54, rivalId: 'guarani', country: 'Brasil', flag: '🇧🇷', league: 'Brasil · cenário simulado' },
        { id: 'botafogo-sp', name: 'Botafogo-SP', shortName: 'BOT', strength: 61, prestige: 52, rivalId: 'ituano', country: 'Brasil', flag: '🇧🇷', league: 'Brasil · cenário simulado' },
        { id: 'ituano', name: 'Ituano', shortName: 'ITU', strength: 60, prestige: 50, rivalId: 'botafogo-sp', country: 'Brasil', flag: '🇧🇷', league: 'Brasil · cenário simulado' },
        { id: 'santos', name: 'Santos', shortName: 'SAN', strength: 76, prestige: 86, rivalId: 'sao-paulo', country: 'Brasil', flag: '🇧🇷', league: 'Brasil · cenário simulado' },
        { id: 'sao-paulo', name: 'São Paulo', shortName: 'SAO', strength: 83, prestige: 92, rivalId: 'santos', country: 'Brasil', flag: '🇧🇷', league: 'Brasil · cenário simulado' },
        { id: 'corinthians', name: 'Corinthians', shortName: 'COR', strength: 82, prestige: 93, rivalId: 'palmeiras', country: 'Brasil', flag: '🇧🇷', league: 'Brasil · cenário simulado' },
        { id: 'palmeiras', name: 'Palmeiras', shortName: 'PAL', strength: 88, prestige: 95, rivalId: 'corinthians', country: 'Brasil', flag: '🇧🇷', league: 'Brasil · cenário simulado' },
        { id: 'flamengo', name: 'Flamengo', shortName: 'FLA', strength: 89, prestige: 97, rivalId: 'vasco', country: 'Brasil', flag: '🇧🇷', league: 'Brasil · cenário simulado' },
        { id: 'vasco', name: 'Vasco da Gama', shortName: 'VAS', strength: 79, prestige: 89, rivalId: 'flamengo', country: 'Brasil', flag: '🇧🇷', league: 'Brasil · cenário simulado' },
        { id: 'benfica', name: 'Benfica', shortName: 'BEN', strength: 86, prestige: 92, rivalId: 'sporting', country: 'Portugal', flag: '🇵🇹', league: 'Portugal · cenário simulado' },
        { id: 'porto', name: 'FC Porto', shortName: 'POR', strength: 85, prestige: 91, rivalId: 'benfica', country: 'Portugal', flag: '🇵🇹', league: 'Portugal · cenário simulado' },
        { id: 'sporting', name: 'Sporting CP', shortName: 'SCP', strength: 86, prestige: 91, rivalId: 'benfica', country: 'Portugal', flag: '🇵🇹', league: 'Portugal · cenário simulado' },
        { id: 'real-madrid', name: 'Real Madrid', shortName: 'RMA', strength: 94, prestige: 99, rivalId: 'barcelona', country: 'Espanha', flag: '🇪🇸', league: 'Espanha · cenário simulado' },
        { id: 'barcelona', name: 'Barcelona', shortName: 'BAR', strength: 92, prestige: 99, rivalId: 'real-madrid', country: 'Espanha', flag: '🇪🇸', league: 'Espanha · cenário simulado' },
        { id: 'atletico-madrid', name: 'Atlético de Madrid', shortName: 'ATM', strength: 88, prestige: 94, rivalId: 'real-madrid', country: 'Espanha', flag: '🇪🇸', league: 'Espanha · cenário simulado' }
    ];
    Game.STARTING_CLUB_IDS = ['guarani', 'ponte-preta', 'botafogo-sp', 'ituano'];
    Game.POSITION_GOAL_RATE = {
        ATA: .42, PE: .28, PD: .28, MEI: .18, MC: .09, VOL: .045, LE: .035, LD: .035, ZAG: .03, GOL: 0
    };
    Game.POSITION_ASSIST_RATE = {
        ATA: .13, PE: .21, PD: .21, MEI: .25, MC: .19, VOL: .10, LE: .13, LD: .13, ZAG: .045, GOL: .008
    };
    Game.POSITION_TACKLE_RATE = {
        ATA: .45, PE: .65, PD: .65, MEI: .80, MC: 1.30, VOL: 2.05, LE: 1.85, LD: 1.85, ZAG: 1.75, GOL: .05
    };
    Game.POSITION_ADJACENCY = {
        ATA: ['PE', 'PD'], PE: ['ATA', 'MEI'], PD: ['ATA', 'MEI'], MEI: ['PE', 'PD', 'MC'], MC: ['MEI', 'VOL'], VOL: ['MC', 'ZAG'],
        LE: ['PE', 'VOL'], LD: ['PD', 'VOL'], ZAG: ['VOL'], GOL: []
    };
    function clubById(id) {
        const club = Game.CLUBS.find(c => c.id === id);
        if (!club)
            throw new Error(`Clube não encontrado: ${id}`);
        return club;
    }
    Game.clubById = clubById;
    function salaryFor(player, club, role) {
        const base = 18000 * Math.pow(1.14, club.strength - 58);
        const roleMult = { 'Reserva': .65, 'Rotação': .82, 'Titular': 1.05, 'Importante': 1.38, 'Estrela': 1.85 }[role] || 1;
        const playerMult = Game.clamp(.78 + Math.max(0, player.overall - 58) * .020 + (player.reputation ?? 10) * .008, .72, 2.65);
        const annual = base * roleMult * playerMult;
        return Math.max(6000, Math.round(annual / 1000) * 1000);
    }
    Game.salaryFor = salaryFor;
})(Game || (Game = {}));
var Game;
(function (Game) {
    function hashSeed(text) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < text.length; i++) {
            h ^= text.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }
    Game.hashSeed = hashSeed;
    function nextRandom(career) {
        let x = career.rngState || 123456789;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        career.rngState = x >>> 0;
        return (career.rngState % 1000000) / 1000000;
    }
    Game.nextRandom = nextRandom;
    function rand(career, min, max) {
        return min + (max - min) * nextRandom(career);
    }
    Game.rand = rand;
    function randInt(career, min, max) {
        return Math.floor(rand(career, min, max + 1));
    }
    Game.randInt = randInt;
    function pick(career, items) {
        return items[Math.min(items.length - 1, Math.floor(nextRandom(career) * items.length))];
    }
    Game.pick = pick;
    function weightedPick(career, items, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let r = nextRandom(career) * total;
        for (let i = 0; i < items.length; i++) {
            r -= weights[i];
            if (r <= 0)
                return items[i];
        }
        return items[items.length - 1];
    }
    Game.weightedPick = weightedPick;
    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }
    Game.clamp = clamp;
    function round1(v) { return Math.round(v * 10) / 10; }
    Game.round1 = round1;
    function round2(v) { return Math.round(v * 100) / 100; }
    Game.round2 = round2;
})(Game || (Game = {}));
var Game;
(function (Game) {
    const FIELD_ATTRS = ['shooting', 'passing', 'dribbling', 'tackling'];
    function calculateOverall(position, a) {
        const weights = Game.OVR_WEIGHTS[position];
        let total = 0;
        Object.keys(weights).forEach(k => {
            const attr = k;
            const value = attr === 'goalkeeping' ? (a.goalkeeping ?? 1) : a[attr];
            total += value * (weights[attr] ?? 0);
        });
        return Math.round(total);
    }
    Game.calculateOverall = calculateOverall;
    function randomizeAttributes(careerLike, position) {
        const base = Game.BASE_ATTRIBUTES[position];
        const a = {
            shooting: Game.clamp(base.shooting + Game.randInt(careerLike, -3, 3), 1, 99),
            passing: Game.clamp(base.passing + Game.randInt(careerLike, -3, 3), 1, 99),
            dribbling: Game.clamp(base.dribbling + Game.randInt(careerLike, -3, 3), 1, 99),
            tackling: Game.clamp(base.tackling + Game.randInt(careerLike, -3, 3), 1, 99)
        };
        if (position === 'GOL')
            a.goalkeeping = Game.clamp((base.goalkeeping ?? 62) + Game.randInt(careerLike, -3, 3), 1, 99);
        return a;
    }
    function applySpecialty(a, attr, points) {
        if (attr === 'goalkeeping')
            a.goalkeeping = Game.clamp((a.goalkeeping ?? 1) + points, 1, 99);
        else
            a[attr] = Game.clamp(a[attr] + points, 1, 99);
    }
    function potentialHint(potential, jitter) {
        const perceived = potential + jitter;
        if (perceived >= 92)
            return 'Estrela mundial';
        if (perceived >= 88)
            return 'Grande talento';
        if (perceived >= 84)
            return 'Joia';
        if (perceived >= 80)
            return 'Tem futuro';
        return 'Sem indicação especial';
    }
    function createCareer(name, position, primary, secondary, clubId) {
        const seed = Game.hashSeed(`${name}-${Date.now()}-${Math.random()}`);
        const temp = { rngState: seed || 123456789 };
        const attributes = randomizeAttributes(temp, position);
        applySpecialty(attributes, primary, 5);
        applySpecialty(attributes, secondary, 3);
        const ovr = calculateOverall(position, attributes);
        const potentialRoll = Game.nextRandom(temp);
        let potential;
        if (potentialRoll < .15)
            potential = Game.randInt(temp, 78, 79);
        else if (potentialRoll < .40)
            potential = Game.randInt(temp, 80, 83);
        else if (potentialRoll < .68)
            potential = Game.randInt(temp, 84, 87);
        else if (potentialRoll < .90)
            potential = Game.randInt(temp, 88, 91);
        else
            potential = Game.randInt(temp, 92, 96);
        potential = Math.max(potential, ovr + 14);
        potential = Game.clamp(potential, 78, 96);
        const hint = potentialHint(potential, Game.randInt(temp, -2, 2));
        const rivalPosition = position;
        const validAttrs = position === 'GOL' ? ['goalkeeping', 'passing'] : FIELD_ATTRS;
        const rPrimary = Game.pick(temp, validAttrs);
        const rSecondary = Game.pick(temp, validAttrs.filter(x => x !== rPrimary));
        const rAttrs = randomizeAttributes(temp, rivalPosition);
        applySpecialty(rAttrs, rPrimary, 5);
        applySpecialty(rAttrs, rSecondary, 3);
        const startClubs = Game.STARTING_CLUB_IDS.filter(id => id !== clubId);
        const rival = {
            id: `rival-${seed}`,
            name: randomRivalName(temp), age: 16, position: rivalPosition,
            attributes: rAttrs, overall: calculateOverall(rivalPosition, rAttrs),
            potential: Game.clamp(potential + Game.randInt(temp, -4, 4), 78, 96),
            potentialHint: 'Oculto', primarySpecialty: rPrimary, secondarySpecialty: rSecondary,
            form: Game.randInt(temp, 47, 55), reputation: Game.randInt(temp, 8, 14), clubId: Game.pick(temp, startClubs), history: [],
            lastRating: 6.9, coachTrust: 50
        };
        return {
            id: `career-${seed}`, name: name.trim() || 'Jogador', age: 16, position, attributes,
            overall: ovr, potential, potentialHint: hint, primarySpecialty: primary, secondarySpecialty: secondary,
            form: 50, morale: 50, reputation: 10, clubId, seed, rngState: temp.rngState, seasonIndex: 0, history: [], rival,
            introStage: 'trial', trialResult: undefined, trialOffers: [], lastRating: 6.9, coachTrust: 50,
            rivalryRecord: { player: 0, rival: 0, draws: 0 }, salaryAnnualEUR: 0, careerEarningsEUR: 0,
            contractYearsLeft: 0, lastEventKeys: [], version: '0.2.1'
        };
    }
    Game.createCareer = createCareer;
    function randomRivalName(c) {
        const first = ['Mateo', 'Lucas', 'Gabriel', 'Thiago', 'Enzo', 'Nicolás', 'Bruno', 'Rafael', 'Tomás', 'Diego', 'Martín', 'João'];
        const last = ['Rodríguez', 'Ferreira', 'Silva', 'Mendes', 'Almeida', 'Costa', 'Santos', 'Pereira', 'García', 'Romero', 'Oliveira', 'Torres'];
        return `${Game.pick(c, first)} ${Game.pick(c, last)}`;
    }
    function trialChoices(career) {
        if (career.position === 'GOL') {
            return [
                { id: 'goalkeeping', label: 'Mostrar reflexo e segurança', attribute: 'goalkeeping', text: 'Assumir o protagonismo nas defesas e bolas difíceis.' },
                { id: 'passing', label: 'Impressionar com os pés', attribute: 'passing', text: 'Participar da construção e acelerar a saída de bola.' }
            ];
        }
        const preferred = {
            ATA: ['shooting', 'dribbling', 'passing'], PE: ['dribbling', 'shooting', 'passing'], PD: ['dribbling', 'shooting', 'passing'],
            MEI: ['passing', 'dribbling', 'shooting'], MC: ['passing', 'dribbling', 'tackling'], VOL: ['tackling', 'passing', 'dribbling'],
            LE: ['tackling', 'passing', 'dribbling'], LD: ['tackling', 'passing', 'dribbling'], ZAG: ['tackling', 'passing', 'shooting']
        }[career.position];
        const labels = {
            shooting: ['Buscar o gol', 'Arriscar mais finalizações e aparecer perto da área.'],
            passing: ['Comandar o jogo com passes', 'Valorizar a bola e procurar passes que quebrem linhas.'],
            dribbling: ['Partir para cima', 'Tentar desequilibrar no um contra um e chamar atenção pela técnica.'],
            tackling: ['Ser dominante sem a bola', 'Antecipar jogadas, recuperar bolas e mostrar segurança defensiva.']
        };
        return preferred.map(a => ({ id: a, label: labels[a][0], attribute: a, text: labels[a][1] }));
    }
    Game.trialChoices = trialChoices;
    function resolveTrial(career, attribute) {
        if (career.introStage !== 'trial') return;
        const value = getAttr(career.attributes, attribute);
        const chance = Game.clamp(.34 + value * .0072, .55, .90);
        const success = Game.nextRandom(career) < chance;
        if (success) {
            career.form = Game.clamp(career.form + 3, 0, 100);
            career.reputation = Game.clamp(career.reputation + 2, 0, 100);
            career.trialResult = `Você chama atenção dos observadores com uma atuação segura. ${Game.ATTRIBUTE_LABELS[attribute]} foi o destaque da sua peneira.`;
        } else {
            career.form = Game.clamp(career.form - 1, 0, 100);
            career.reputation = Game.clamp(career.reputation + 1, 0, 100);
            career.trialResult = `Nem tudo encaixa, mas os observadores enxergam margem para evolução. Sua carreira continua aberta.`;
        }
        const clubs = Game.STARTING_CLUB_IDS.map(Game.clubById).sort((a,b)=>a.strength-b.strength);
        let pool = success ? clubs.slice(1) : clubs.slice(0,3);
        if (pool.length < 3) pool = clubs;
        career.trialOffers = pool.slice().sort(() => Game.nextRandom(career) - .5).slice(0,3).map(c => ({ clubId: c.id, projectedRole: determineRole(career.overall, c, 6.9, 50) }));
        career.introStage = 'offers';
    }
    Game.resolveTrial = resolveTrial;
    function chooseStartingClub(career, clubId) {
        if (!career.trialOffers?.some(o => o.clubId === clubId)) return;
        career.clubId = clubId;
        if (career.rival.clubId === clubId) {
            career.rival.clubId = Game.pick(career, Game.STARTING_CLUB_IDS.filter(id => id !== clubId));
        }
        career.introStage = 'complete';
        const club = Game.clubById(clubId);
        const role = determineRole(career.overall, club, career.lastRating ?? 6.9, career.coachTrust ?? 50);
        career.salaryAnnualEUR = Game.salaryFor(career, club, role);
        career.contractYearsLeft = 3;
        career.careerLog = career.careerLog || [];
        career.careerLog.push({ type: 'start', year: 2026, text: `Primeiro contrato profissional com ${Game.clubById(clubId).name}.` });
    }
    Game.chooseStartingClub = chooseStartingClub;
    function startSeason(career) {
        if (career.pendingSeason)
            return;
        const club = Game.clubById(career.clubId);
        const year = 2026 + career.seasonIndex;
        const eventCount = club.prestige >= 85 ? 5 : club.prestige >= 70 ? 4 : 3;
        const roleAtStart = determineRole(career.overall, club, career.lastRating ?? 6.9, career.coachTrust ?? 50);
        if (!career.salaryAnnualEUR) career.salaryAnnualEUR = Game.salaryFor(career, club, roleAtStart);
        if (!career.contractYearsLeft) career.contractYearsLeft = 3;
        const events = buildSeasonEvents(career, eventCount);
        career.lastEventKeys = events.map(e => e.templateKey).filter(Boolean);
        career.pendingSeason = {
            yearLabel: `${year}/${String((year + 1) % 100).padStart(2, '0')}`,
            clubIdAtStart: career.clubId, overallStart: career.overall, reputationStart: career.reputation,
            events, currentEvent: 0, roleAtStart, objective: seasonObjective(roleAtStart),
            effects: { goals: 0, assists: 0, tackles: 0, ratingBonus: 0, reputationDelta: 0, formDelta: 0, moraleDelta: 0, coachTrustDelta: 0, gamesMissed: 0 },
            trainingGains: {}, salaryAtStart: career.salaryAnnualEUR
        };
        career.lastSummary = undefined;
        career.pendingOffer = undefined;
    }
    Game.startSeason = startSeason;
    function buildSeasonEvents(career, count) {
        const events = [];
        const used = new Set();
        const recent = new Set(career.lastEventKeys || []);
        const add = (factory, attempts = 6) => {
            for (let i = 0; i < attempts; i++) {
                const e = factory(career);
                if (!used.has(e.templateKey) && (!recent.has(e.templateKey) || i >= attempts - 2)) {
                    used.add(e.templateKey);
                    events.push(e);
                    return true;
                }
            }
            return false;
        };
        add(Game.nextRandom(career) < .48 ? preseasonEvent : offFieldEvent);
        if (events.length < count && Game.POSITION_ADJACENCY[career.position].length && Game.nextRandom(career) < .20)
            add(positionEvent);
        if (events.length < count && Game.nextRandom(career) < .22)
            add(injuryEvent);
        const club = Game.clubById(career.clubId);
        if (events.length < count && club.rivalId && Game.nextRandom(career) < (club.prestige >= 80 ? .72 : .58))
            add(derbyEvent);
        const pool = [
            { f: matchEventNormal, w: 30 },
            { f: offFieldEvent, w: 30 },
            { f: preseasonEvent, w: 15 },
            { f: injuryEvent, w: 12 },
            { f: careerEvent, w: 13 }
        ];
        while (events.length < count) {
            const f = Game.weightedPick(career, pool.map(x => x.f), pool.map(x => x.w));
            if (!add(f) && !add(matchEventNormal)) break;
        }
        return events.slice(0, count);
    }
    function availableAttrs(player) {
        return player.position === 'GOL' ? ['goalkeeping', 'passing'] : FIELD_ATTRS.slice();
    }
    function preseasonEvent(career) {
        const attrs = availableAttrs(career);
        const trainAttrs = attrs.slice().sort(() => Game.nextRandom(career) - .5).slice(0, Math.min(3, attrs.length));
        const variants = [
            { key: 'preseason-camp', title: 'Primeira semana de pré-temporada', text: 'A temporada começa com alguns dias livres entre as atividades do clube. Você decide onde investir sua energia.' },
            { key: 'preseason-break', title: 'Folga antes da estreia', text: 'O elenco recebe uma noite livre antes de a temporada engrenar. Há tempo para treinar, descansar ou se aproximar dos companheiros.' },
            { key: 'preseason-choice', title: 'Escolhas de pré-temporada', text: 'A comissão deixa parte da preparação por sua conta. O que você prioriza?' }
        ];
        const v = Game.pick(career, variants);
        const choices = trainAttrs.map(a => ({ id: `train-${a}-${career.rngState}`, label: `Treinar ${Game.ATTRIBUTE_LABELS[a]}`, attribute: a, effect: 'train', description: 'Ganho técnico pequeno e permanente.' }));
        choices.push({ id: `social-${career.rngState}`, label: 'Sair com os companheiros', effect: 'social', description: 'Melhora a moral e a integração, mas não traz ganho técnico.' });
        return { id: `${v.key}-${career.rngState}`, templateKey: v.key, kind: 'life', title: v.title, text: v.text, choices };
    }
    function offFieldEvent(career) {
        const variants = [
            { key: 'night-out', title: 'Convite do elenco', text: 'Alguns companheiros organizam uma festa numa noite livre. Você foi convidado.', choices: [
                { id: 'party', label: 'Ir à festa com o elenco', effect: 'social' },
                { id: 'stay-home', label: 'Ficar em casa e descansar', effect: 'discipline' }
            ]},
            { key: 'family-problem', title: 'Problema em casa', text: 'Uma situação familiar exige atenção justamente numa semana de jogos.', choices: [
                { id: 'family', label: 'Viajar para ficar com a família', effect: 'family' },
                { id: 'stay-team', label: 'Permanecer com o time', effect: 'professional' }
            ]},
            { key: 'media-interview', title: 'Entrevista depois do treino', text: 'Um repórter pergunta se você já se considera pronto para ser protagonista do time.', choices: [
                { id: 'bold-media', label: 'Dizer que quer ser protagonista', effect: 'bold-media' },
                { id: 'humble-media', label: 'Valorizar o grupo e o treinador', effect: 'humble-media' }
            ]},
            { key: 'community-event', title: 'Evento com a torcida', text: 'O clube organiza uma ação com torcedores e crianças da região no seu dia de folga.', choices: [
                { id: 'community', label: 'Participar do evento', effect: 'community' },
                { id: 'extra-session', label: 'Usar o tempo para treino extra', effect: 'train-primary' }
            ]},
            { key: 'locker-room', title: 'Tensão no vestiário', text: 'Um companheiro reclama publicamente de uma jogada sua na última partida.', choices: [
                { id: 'private-talk', label: 'Conversar com ele em particular', effect: 'private-talk' },
                { id: 'public-reply', label: 'Responder na frente do grupo', effect: 'public-reply' },
                { id: 'ignore', label: 'Ignorar e seguir trabalhando', effect: 'ignore-conflict' }
            ]}
        ];
        const v = Game.pick(career, variants);
        return { id: `${v.key}-${career.rngState}`, templateKey: v.key, kind: 'life', title: v.title, text: v.text, choices: v.choices };
    }
    function injuryEvent(career) {
        const variants = [
            { key: 'minor-muscle', title: 'Incômodo muscular', text: 'Você sente uma fisgada durante o treino. O departamento médico recomenda cautela.' },
            { key: 'training-collision', title: 'Choque no treino', text: 'Uma dividida forte termina com dor e inchaço. Não parece grave, mas há risco de piorar.' },
            { key: 'ankle-knock', title: 'Tornozelo dolorido', text: 'Você vira o tornozelo numa atividade e a semana seguinte fica em dúvida.' }
        ];
        const v = Game.pick(career, variants);
        return { id: `${v.key}-${career.rngState}`, templateKey: v.key, kind: 'injury', title: v.title, text: v.text, choices: [
            { id: 'rehab', label: 'Seguir o prazo do departamento médico', effect: 'rehab' },
            { id: 'rush-return', label: 'Tentar voltar antes do prazo', effect: 'rush-return' }
        ] };
    }
    function matchEventNormal(career) { return matchEvent(career, false); }
    function matchEvent(career, derby) {
        const isDefensive = career.position === 'GOL' || ['ZAG', 'VOL', 'LE', 'LD'].includes(career.position);
        const matchVariants = [
            { key: 'match-final-minutes', title: 'Minutos finais', text: 'O placar está apertado e uma jogada pode definir a partida.' },
            { key: 'match-counter', title: 'Contra-ataque decisivo', text: 'Seu time recupera a bola e encontra espaço num dos últimos ataques do jogo.' },
            { key: 'match-pressure', title: 'Pressão no fim do jogo', text: 'A partida entra na reta final com os dois times procurando o gol.' },
            { key: 'match-big-game', title: 'Jogo grande', text: 'O estádio está cheio e o jogo segue equilibrado. Surge uma chance importante.' }
        ];
        const mv = Game.pick(career, matchVariants);
        let opts;
        if (career.position === 'GOL') {
            opts = [
                { id: 'gk-defend', label: 'Esperar o chute e reagir', attribute: 'goalkeeping', effect: 'match' },
                { id: 'gk-build', label: 'Antecipar e iniciar contra-ataque', attribute: 'passing', effect: 'match' }
            ];
        } else if (['ZAG', 'VOL', 'LE', 'LD'].includes(career.position)) {
            opts = [
                { id: 'tackle', label: 'Antecipar e recuperar a bola', attribute: 'tackling', effect: 'match' },
                { id: 'pass', label: 'Acelerar a saída com um passe', attribute: 'passing', effect: 'match' },
                { id: 'shoot', label: 'Arriscar uma chegada ao ataque', attribute: 'shooting', effect: 'match' }
            ];
        } else if (career.position === 'MC') {
            opts = [
                { id: 'pass', label: 'Buscar o passe decisivo', attribute: 'passing', effect: 'match' },
                { id: 'dribble', label: 'Conduzir e quebrar a linha', attribute: 'dribbling', effect: 'match' },
                { id: 'tackle', label: 'Antecipar e recuperar a bola', attribute: 'tackling', effect: 'match' }
            ];
        } else if (career.position === 'MEI') {
            opts = [
                { id: 'pass', label: 'Buscar o passe decisivo', attribute: 'passing', effect: 'match' },
                { id: 'dribble', label: 'Partir para o drible', attribute: 'dribbling', effect: 'match' },
                { id: 'shoot', label: 'Finalizar', attribute: 'shooting', effect: 'match' }
            ];
        } else {
            opts = [
                { id: 'shoot', label: 'Finalizar', attribute: 'shooting', effect: 'match' },
                { id: 'dribble', label: 'Partir para o drible', attribute: 'dribbling', effect: 'match' },
                { id: 'pass', label: 'Buscar o passe decisivo', attribute: 'passing', effect: 'match' }
            ];
        }
        if (derby) {
            const club = Game.clubById(career.clubId);
            const rival = Game.clubById(club.rivalId);
            const mode = isDefensive ? 'defend-lead' : 'attack-tied';
            return {
                id: `derby-${career.rngState}`, templateKey: 'derby-decision', kind: 'derby', title: `${club.name} × ${rival.name}`,
                text: mode === 'defend-lead'
                    ? 'Aos 84 minutos, seu time vence o clássico por 1–0. O rival chega para uma última grande chance.'
                    : 'Aos 79 minutos, o clássico está 0–0. Uma jogada sua pode mudar a partida.',
                derbyMode: mode, rivalClubName: rival.name, choices: opts
            };
        }
        return { id: `${mv.key}-${career.rngState}`, templateKey: mv.key, kind: 'match', title: mv.title, text: mv.text, choices: opts };
    }
    function derbyEvent(career) { return matchEvent(career, true); }
    function positionEvent(career) {
        const target = Game.pick(career, Game.POSITION_ADJACENCY[career.position]);
        return { id: `pos-${career.rngState}`, templateKey: 'position-change', kind: 'career', title: 'Conversa com o treinador',
            text: `O treinador acredita que suas características também podem funcionar como ${Game.POSITION_LABELS[target]}.`,
            choices: [
                { id: 'keep-pos', label: `Continuar focado como ${Game.POSITION_LABELS[career.position]}`, effect: 'form' },
                { id: 'try-pos', label: `Aceitar testes como ${Game.POSITION_LABELS[target]}`, effect: 'position', positionTarget: target }
            ] };
    }
    function careerEvent(career) {
        if (Game.POSITION_ADJACENCY[career.position].length && Game.nextRandom(career) < .45) return positionEvent(career);
        return offFieldEvent(career);
    }
    function resolveEventChoice(career, choiceId) {
        const p = career.pendingSeason;
        if (!p) return 'Nenhuma temporada em andamento.';
        const event = p.events[p.currentEvent];
        if (!event || event.resolved) return event?.resultText ?? 'Evento já resolvido.';
        const choice = event.choices.find(c => c.id === choiceId);
        if (!choice) return 'Escolha inválida.';
        let text = '';
        if (choice.effect === 'train' && choice.attribute) {
            const current = p.trainingGains[choice.attribute] ?? 0;
            const bonus = Game.nextRandom(career) < .10 ? 2 : 1;
            p.trainingGains[choice.attribute] = current + bonus;
            applySpecialty(career.attributes, choice.attribute, bonus);
            career.overall = calculateOverall(career.position, career.attributes);
            p.effects.moraleDelta -= 1;
            text = `O trabalho extra rende evolução em ${Game.ATTRIBUTE_LABELS[choice.attribute]}. Você abre mão de parte do descanso, mas começa a temporada tecnicamente melhor.`;
        }
        else if (choice.effect === 'train-primary') {
            const attr = career.primarySpecialty;
            applySpecialty(career.attributes, attr, 1);
            career.overall = calculateOverall(career.position, career.attributes);
            p.trainingGains[attr] = (p.trainingGains[attr] ?? 0) + 1;
            p.effects.reputationDelta -= 1;
            text = `Você aproveita a folga para trabalhar ${Game.ATTRIBUTE_LABELS[attr]}. O treino rende, embora sua ausência no evento seja percebida por parte da torcida.`;
        }
        else if (choice.effect === 'position' && choice.positionTarget) {
            career.secondaryPosition = choice.positionTarget;
            p.effects.formDelta += 2;
            p.effects.moraleDelta += 1;
            text = `Os testes funcionam e ${Game.POSITION_LABELS[choice.positionTarget]} passa a ser uma opção secundária para você.`;
        }
        else if (choice.effect === 'form') {
            p.effects.formDelta += 1;
            p.effects.coachTrustDelta += 1;
            text = 'Você mantém o foco na função atual e reforça com o treinador onde se sente mais confortável.';
        }
        else if (choice.effect === 'social') {
            p.effects.moraleDelta += 6;
            p.effects.reputationDelta += 1;
            p.effects.formDelta -= 2;
            text = 'A noite aproxima você do elenco e melhora seu ânimo. No dia seguinte, porém, o descanso não é perfeito.';
        }
        else if (choice.effect === 'discipline') {
            p.effects.formDelta += 2;
            p.effects.coachTrustDelta += 2;
            p.effects.moraleDelta -= 1;
            text = 'Você descansa, chega inteiro ao treino seguinte e a comissão percebe sua postura profissional.';
        }
        else if (choice.effect === 'family') {
            const missed = Game.randInt(career, 1, 2);
            p.effects.gamesMissed += missed;
            p.effects.moraleDelta += 7;
            p.effects.coachTrustDelta -= 1;
            text = `Você prioriza sua família e volta mais tranquilo. A viagem, porém, faz você perder ${missed === 1 ? 'uma partida' : 'duas partidas'}.`;
        }
        else if (choice.effect === 'professional') {
            p.effects.coachTrustDelta += 2;
            p.effects.moraleDelta -= 5;
            p.effects.formDelta += 1;
            text = 'Você permanece com o time e ganha pontos com a comissão, mas o problema pessoal pesa no seu estado de espírito.';
        }
        else if (choice.effect === 'bold-media') {
            p.effects.reputationDelta += 3;
            p.effects.coachTrustDelta -= 1;
            p.effects.moraleDelta += 1;
            text = 'A declaração repercute. Parte da torcida gosta da ambição; dentro do clube, a cobrança sobre você aumenta.';
        }
        else if (choice.effect === 'humble-media') {
            p.effects.reputationDelta += 1;
            p.effects.coachTrustDelta += 2;
            text = 'A resposta é bem recebida pelo grupo e pelo treinador. Você evita manchetes, mas fortalece sua imagem interna.';
        }
        else if (choice.effect === 'community') {
            p.effects.reputationDelta += 3;
            p.effects.moraleDelta += 3;
            text = 'Sua presença no evento aproxima você da torcida e termina sendo um dia leve fora da rotina de jogos.';
        }
        else if (choice.effect === 'private-talk') {
            p.effects.moraleDelta += 3;
            p.effects.coachTrustDelta += 2;
            text = 'A conversa resolve a tensão sem criar novas manchetes. O ambiente no vestiário melhora.';
        }
        else if (choice.effect === 'public-reply') {
            if (Game.nextRandom(career) < .45) {
                p.effects.reputationDelta += 2;
                p.effects.moraleDelta += 1;
                p.effects.coachTrustDelta -= 2;
                text = 'Sua resposta firme agrada parte da torcida, mas a comissão não gosta de ver o conflito crescer em público.';
            } else {
                p.effects.reputationDelta -= 2;
                p.effects.moraleDelta -= 3;
                p.effects.coachTrustDelta -= 2;
                text = 'A discussão aumenta e vira assunto fora do clube. O ambiente fica mais pesado nos dias seguintes.';
            }
        }
        else if (choice.effect === 'ignore-conflict') {
            p.effects.formDelta += 1;
            p.effects.moraleDelta -= 1;
            text = 'Você não alimenta a discussão e segue trabalhando. A tensão diminui aos poucos, embora não desapareça por completo.';
        }
        else if (choice.effect === 'rehab') {
            const missed = Game.randInt(career, 2, 5);
            p.effects.gamesMissed += missed;
            p.effects.coachTrustDelta += 1;
            p.effects.moraleDelta -= 1;
            text = `Você respeita a recuperação e perde ${missed} jogos, mas volta sem sequelas e com o respaldo do departamento médico.`;
        }
        else if (choice.effect === 'rush-return') {
            p.effects.gamesMissed += 1;
            const setback = Game.nextRandom(career) < .36;
            if (setback) {
                const attrs = availableAttrs(career);
                const attr = Game.pick(career, attrs);
                applySpecialty(career.attributes, attr, -1);
                career.overall = calculateOverall(career.position, career.attributes);
                p.effects.formDelta -= 5;
                p.effects.moraleDelta -= 3;
                text = `Você volta cedo demais e sente novamente o problema. Além de perder ritmo, ${Game.ATTRIBUTE_LABELS[attr]} cai um pouco durante a recuperação.`;
            } else {
                p.effects.formDelta += 1;
                p.effects.moraleDelta += 2;
                text = 'A aposta funciona: você retorna rapidamente e consegue atravessar a sequência sem agravar o problema.';
            }
        }
        else if (choice.effect === 'match' && choice.attribute) {
            const value = getAttr(career.attributes, choice.attribute);
            const difficulty = event.kind === 'derby' ? 6 : 0;
            const moraleAdj = ((career.morale ?? 50) - 50) * .0012;
            const chance = Game.clamp(.16 + value * .0072 + (career.form - 50) * .002 + moraleAdj - difficulty * .004, .24, .88);
            const success = Game.nextRandom(career) < chance;
            if (success) {
                p.effects.ratingBonus += event.kind === 'derby' ? .055 : .035;
                p.effects.reputationDelta += event.kind === 'derby' ? 2 : 1;
                p.effects.formDelta += 2;
                if (choice.attribute === 'shooting') {
                    p.effects.goals += 1;
                    text = 'Você converte a chance e marca um gol importante.';
                } else if (choice.attribute === 'passing') {
                    p.effects.assists += 1;
                    text = career.position === 'GOL' ? 'A antecipação funciona e seu passe inicia a jogada do gol.' : 'O passe quebra a defesa e termina em gol.';
                } else if (choice.attribute === 'tackling') {
                    p.effects.tackles += 3;
                    text = 'A antecipação funciona e você corta uma jogada perigosa.';
                } else if (choice.attribute === 'goalkeeping') {
                    text = 'Você faz uma grande defesa no momento decisivo.';
                } else {
                    const scored = Game.nextRandom(career) < .48;
                    p.effects.goals += scored ? 1 : 0;
                    p.effects.assists += scored ? 0 : 1;
                    text = scored ? 'Você vence no drible e conclui a jogada em gol.' : 'Você elimina o marcador e cria o gol para um companheiro.';
                }
                if (event.kind === 'derby') {
                    if (event.derbyMode === 'attack-tied') {
                        text += ` O gol decide o clássico: ${Game.clubById(career.clubId).name} vence por 1–0.`;
                    } else {
                        text += ` O lance preserva a vantagem e seu time vence o clássico por 1–0.`;
                    }
                }
            } else {
                p.effects.ratingBonus -= event.kind === 'derby' ? .025 : .015;
                p.effects.formDelta -= 1;
                if (event.kind === 'derby') {
                    if (event.derbyMode === 'attack-tied') {
                        if (Game.nextRandom(career) < .55)
                            text = 'Você não consegue aproveitar a chance. O clássico termina 0–0.';
                        else
                            text = `Você perde a oportunidade e, mais tarde, ${event.rivalClubName} encontra um gol. Seu time perde o clássico por 1–0.`;
                    } else {
                        if (Game.nextRandom(career) < .55)
                            text = `A jogada escapa do seu controle e ${event.rivalClubName} empata. O clássico termina 1–1.`;
                        else
                            text = 'A tentativa falha, mas seus companheiros conseguem segurar a pressão. Seu time vence por 1–0.';
                    }
                } else {
                    const outcomes = [
                        'A tentativa não funciona e a partida termina sem participação decisiva sua.',
                        'A jogada se perde, mas o time consegue manter o resultado até o fim.',
                        'Você não aproveita a chance e o adversário cresce nos minutos finais.'
                    ];
                    text = Game.pick(career, outcomes);
                }
            }
        }
        event.resolved = true;
        event.resultText = text;
        return text;
    }
    Game.resolveEventChoice = resolveEventChoice;
    function advanceEvent(career) {
        const p = career.pendingSeason;
        if (!p)
            return;
        const e = p.events[p.currentEvent];
        if (!e?.resolved)
            return;
        p.currentEvent += 1;
    }
    Game.advanceEvent = advanceEvent;
    function getAttr(a, attr) {
        return attr === 'goalkeeping' ? (a.goalkeeping ?? 1) : a[attr];
    }
    function determineRole(overall, club, recentRating = 6.9, coachTrust = 50) {
        const reference = club.strength - 4;
        const performanceAdjustment = Game.clamp((recentRating - 6.9) * 4.5, -3.0, 4.0);
        const trustAdjustment = Game.clamp((coachTrust - 50) * .055, -2.0, 2.0);
        const d = overall + performanceAdjustment + trustAdjustment - reference;
        if (d >= 10) return 'Estrela';
        if (d >= 5) return 'Importante';
        if (d >= 0) return 'Titular';
        if (d >= -5) return 'Rotação';
        return 'Reserva';
    }
    Game.determineRole = determineRole;
    function seasonObjective(role) {
        return {
            'Estrela': 'Liderar o time e disputar prêmios individuais.',
            'Importante': 'Ser decisivo e consolidar seu protagonismo.',
            'Titular': 'Manter regularidade e terminar a temporada entre os destaques.',
            'Rotação': 'Ganhar minutos e brigar por uma vaga entre os titulares.',
            'Reserva': 'Aproveitar as oportunidades e conquistar espaço no elenco.'
        }[role] || 'Fazer uma boa temporada.';
    }
    Game.seasonObjective = seasonObjective;
    function minutesForRole(c, role) {
        const ranges = {
            'Estrela': [43, 49, .90], 'Importante': [40, 47, .82], 'Titular': [35, 44, .75], 'Rotação': [25, 38, .48], 'Reserva': [12, 26, .25]
        };
        const [lo, hi, share] = ranges[role];
        const games = Game.randInt(c, lo, hi);
        const minutes = Math.round(games * 90 * share * Game.rand(c, .94, 1.04));
        const starts = Math.min(games, Math.round(minutes / 90 * Game.rand(c, .82, 1.03)));
        return { games, starts, minutes };
    }
    function applyAvailability(gm, effects) {
        const missed = Math.max(0, effects?.gamesMissed ?? 0);
        if (!missed) return gm;
        const games = Math.max(0, gm.games - missed);
        const ratio = gm.games ? games / gm.games : 0;
        const minutes = Math.round(gm.minutes * ratio);
        const starts = Math.min(games, Math.round(gm.starts * ratio));
        return { games, starts, minutes };
    }
    function simulateFieldStats(c, player, club, effects) {
        const role = determineRole(player.overall, club, player.lastRating ?? 6.9, player.coachTrust ?? 50);
        const gm = applyAvailability(minutesForRole(c, role), effects);
        const per90 = gm.minutes / 90;
        const offense = Game.clamp(.82 + (club.strength - 58) * .0105, .78, 1.25);
        const defensiveLoad = Game.clamp(1.20 - (club.strength - 58) * .008, .72, 1.20);
        const formFactor = 1 + (player.form - 50) * .0012 + ((player.morale ?? 50) - 50) * .0008;
        const shootSkill = (player.attributes.shooting * .76 + player.attributes.dribbling * .24) / 70;
        const passSkill = (player.attributes.passing * .76 + player.attributes.dribbling * .24) / 70;
        const tackleSkill = player.attributes.tackling / 65;
        const goals = Math.max(0, Math.round(Game.POSITION_GOAL_RATE[player.position] * per90 * Math.pow(shootSkill, 1.15) * offense * formFactor * Game.rand(c, .91, 1.09))) + (effects?.goals ?? 0);
        const assists = Math.max(0, Math.round(Game.POSITION_ASSIST_RATE[player.position] * per90 * Math.pow(passSkill, 1.10) * offense * formFactor * Game.rand(c, .90, 1.10))) + (effects?.assists ?? 0);
        const tackles = Math.max(0, Math.round(Game.POSITION_TACKLE_RATE[player.position] * per90 * Math.pow(tackleSkill, 1.02) * defensiveLoad * Game.rand(c, .94, 1.06))) + (effects?.tackles ?? 0);
        const csRate = Game.clamp(.16 + (club.strength - 55) * .008 + (player.attributes.tackling - 55) * .0012, .12, .52);
        const cleanSheets = Math.min(gm.games, Math.round(gm.games * csRate * Game.rand(c, .90, 1.08)));
        const cardBase = { ATA: .7, PE: .8, PD: .8, MEI: 1.0, MC: 2.2, VOL: 4.1, LE: 3.0, LD: 3.0, ZAG: 3.5, GOL: .4 };
        const yellowCards = Math.max(0, Math.round(cardBase[player.position] * (gm.games / 38) * Game.rand(c, .72, 1.30) * (1 - (player.attributes.tackling - 55) * .003)));
        const redCards = Game.nextRandom(c) < Game.clamp(yellowCards * .015, 0, .12) ? 1 : 0;
        const qualityBase = 5.72 + player.overall * .020;
        const contextBonus = club.strength < 68 ? (68 - club.strength) * .004 : 0;
        const outputSignal = (goals * Math.max(.02, Game.POSITION_GOAL_RATE[player.position]) + assists * .08 + tackles * .003) / Math.max(1, per90);
        const rating = Game.round2(Game.clamp(qualityBase + contextBonus + (player.form - 50) * .004 + ((player.morale ?? 50) - 50) * .002 + Game.rand(c, -.15, .15) + (effects?.ratingBonus ?? 0) + outputSignal * .04, 5.8, 8.55));
        return { role, ...gm, goals, assists, tackles, cleanSheets, yellowCards, redCards, rating };
    }
    function simulateGoalkeeperStats(c, player, club, effects) {
        const role = determineRole(player.overall, club, player.lastRating ?? 6.9, player.coachTrust ?? 50);
        const gm = applyAvailability(minutesForRole(c, role), effects);
        const per90 = gm.minutes / 90;
        const shotsPer90 = Game.clamp(4.7 - (club.strength - 58) * .035, 3.1, 4.8);
        const shots = Math.round(shotsPer90 * per90);
        const savePct = Game.clamp(.62 + ((player.attributes.goalkeeping ?? 60) - 60) * .0038 + (player.form - 50) * .001 + Game.rand(c, -.018, .018), .57, .84);
        const saves = Math.round(shots * savePct);
        const goalsConceded = Math.max(0, shots - saves);
        const lambda = goalsConceded / Math.max(1, gm.games);
        const csRate = Game.clamp(Math.exp(-lambda) * .72, .10, .55);
        const cleanSheets = Math.min(gm.games, Math.round(gm.games * csRate * Game.rand(c, .90, 1.08)));
        const penaltiesSaved = Math.max(0, Math.round((player.attributes.goalkeeping ?? 60) / 100 * Game.rand(c, 0, 3)));
        const assists = Math.max(0, Math.round(Game.POSITION_ASSIST_RATE.GOL * per90 * (player.attributes.passing / 65) * Game.rand(c, .7, 1.3))) + (effects?.assists ?? 0);
        const rating = Game.round2(Game.clamp(5.72 + player.overall * .020 + (savePct - .68) * 2.1 + (player.form - 50) * .004 + ((player.morale ?? 50) - 50) * .002 + Game.rand(c, -.15, .15) + (effects?.ratingBonus ?? 0), 5.8, 8.55));
        return { role, ...gm, goals: 0, assists, tackles: 0, cleanSheets, yellowCards: Game.nextRandom(c) < .22 ? 1 : 0, redCards: Game.nextRandom(c) < .025 ? 1 : 0, saves, savePct: Game.round1(savePct * 100), goalsConceded, penaltiesSaved, rating };
    }
    function leaguePosition(c, club) {
        const expected = 11 - (club.strength - 60) / 3.1;
        return Game.clamp(Math.round(expected + Game.rand(c, -2.4, 2.4)), 1, 20);
    }
    function titlesFor(c, club, leaguePos, seasonIndex = 99) {
        const out = [];
        if (leaguePos === 1)
            out.push('Campeonato Nacional');
        let cupChance = .006 + Math.max(0, club.strength - 62) * .0045;
        if (leaguePos <= 6) cupChance += .018;
        if (leaguePos <= 3) cupChance += .020;
        if (club.strength < 65 && leaguePos > 5) cupChance *= .45;
        if (seasonIndex === 0 && club.strength < 70) cupChance *= .45;
        cupChance = Game.clamp(cupChance, .002, .20);
        if (Game.nextRandom(c) < cupChance)
            out.push('Copa Nacional');
        if (club.prestige >= 85 && leaguePos <= 6) {
            const cont = Game.clamp(.012 + Math.max(0, club.strength - 82) * .007 + (leaguePos <= 2 ? .025 : 0), .01, .18);
            if (Game.nextRandom(c) < cont)
                out.push('Torneio Continental');
        }
        return out;
    }
    function awardsFor(c, player, stats, club, titles) {
        const awards = [];
        const topGoals = Game.randInt(c, 20, 31);
        const topAssists = Game.randInt(c, 11, 18);
        if (stats.goals >= topGoals)
            awards.push('Artilheiro');
        if (stats.assists >= topAssists)
            awards.push('Líder de assistências');
        if (player.position === 'GOL' && stats.rating >= 7.45)
            awards.push('Goleiro do ano');
        if (stats.rating >= 7.42)
            awards.push('Time do campeonato');
        if (stats.rating >= 7.72)
            awards.push('Jogador do campeonato');
        if (stats.rating >= 7.92 && club.prestige >= 82 && (titles.length > 0 || player.reputation >= 82))
            awards.push('Bola de Ouro');
        return awards;
    }
    function applyDevelopment(c, player, rating, minutes) {
        const before = { ...player.attributes };
        const beforeOvr = player.overall;
        const gap = Math.max(0, player.potential - player.overall);
        const age = player.age;
        if (age <= 29 && gap > 0) {
            const rate = age <= 18 ? .12 : age <= 20 ? .10 : age <= 22 ? .08 : age <= 24 ? .06 : age <= 26 ? .04 : .022;
            const performance = Game.clamp(.72 + (rating - 6.6) * .24, .68, 1.18);
            const play = Game.clamp(minutes / 2600, .45, 1.06);
            const targetGain = Game.clamp(gap * rate * performance * play, .15, 4.0);
            const attrs = availableAttrs(player);
            const weights = attrs.map(a => {
                let w = Game.GROWTH_WEIGHTS[player.position][a] ?? .5;
                if (a === player.primarySpecialty)
                    w *= 1.15;
                if (a === player.secondarySpecialty)
                    w *= 1.08;
                return w;
            });
            let guard = 0;
            while (calculateOverall(player.position, player.attributes) < Math.min(player.potential, beforeOvr + targetGain) && guard < 80) {
                const chosen = Game.weightedPick(c, attrs, weights);
                if (getAttr(player.attributes, chosen) < 99)
                    applySpecialty(player.attributes, chosen, 1);
                guard++;
            }
        }
        else if (age >= 30) {
            const decline = age <= 31 ? .35 : age <= 33 ? .65 : age <= 35 ? 1.0 : 1.45;
            let points = Math.max(0, Math.round(decline + Game.rand(c, -.35, .55)));
            const attrs = availableAttrs(player);
            while (points-- > 0) {
                const a = Game.pick(c, attrs);
                if (getAttr(player.attributes, a) > 30)
                    applySpecialty(player.attributes, a, -1);
            }
        }
        player.overall = calculateOverall(player.position, player.attributes);
        const text = [];
        availableAttrs(player).forEach(a => { const d = getAttr(player.attributes, a) - getAttr(before, a); if (d !== 0)
            text.push(`${Game.ATTRIBUTE_LABELS[a]} ${d > 0 ? '+' : ''}${d}`); });
        if (!text.length)
            text.push('Sem alteração relevante de atributos');
        return text;
    }
    function reputationAfter(r, rating, titles, awards, effects) {
        let d = (rating - 6.8) * 2.0 + titles.length * 2.0 + awards.length * 1.8 + (effects?.reputationDelta ?? 0);
        if (rating < 6.5)
            d -= 1.5;
        return Game.clamp(Math.round(r + d), 0, 100);
    }
    function formAfter(form, rating, effects) {
        return Game.clamp(Math.round(form + (rating - 6.9) * 5 + (effects?.formDelta ?? 0) + Game.rand({ rngState: Math.max(1, Math.round(form * 999 + rating * 1000)) }, -1, 1)), 35, 75);
    }
    function possibleOffer(career, stats) {
        if (stats.rating < 7.05 && career.age < 23)
            return undefined;
        const current = Game.clubById(career.clubId);
        const ambition = (stats.rating - 6.8) * 11 + (career.overall - current.strength + 4) * .45 + (career.potential - career.overall) * .15 + career.reputation * .06;
        if (ambition < 4 || Game.nextRandom(career) > Game.clamp(.12 + ambition * .020, .14, .55))
            return undefined;
        const candidates = Game.CLUBS.filter(x => {
            if (x.id === current.id || x.strength < current.strength + 2)
                return false;
            if (x.strength > current.strength + Math.max(6, Math.round(ambition) + 3))
                return false;
            if (x.strength > career.overall + 12)
                return false;
            const prospectException = career.age <= 22 && career.potential >= x.strength - 3;
            return x.strength <= career.overall + 8 || prospectException;
        }).sort((a, b) => a.strength - b.strength);
        if (!candidates.length)
            return undefined;
        const club = Game.pick(career, candidates.slice(0, Math.min(4, candidates.length)));
        const projectedRole = determineRole(career.overall, club, stats.rating, 50);
        const salaryAnnualEUR = Game.salaryFor(career, club, projectedRole);
        return { clubId: club.id, clubName: club.name, strength: club.strength, prestige: club.prestige, projectedRole, salaryAnnualEUR, reason: `Sua temporada chamou atenção no mercado. O clube acredita que você pode dar o próximo passo na carreira.` };
    }
    function simulateNpcSeason(career, rival, yearLabel) {
        const club = Game.clubById(rival.clubId);
        const startOvr = rival.overall;
        const repStart = rival.reputation;
        const dummyEffects = { goals: 0, assists: 0, tackles: 0, ratingBonus: Game.rand(career, -.025, .025), reputationDelta: 0, formDelta: 0 };
        const raw = rival.position === 'GOL' ? simulateGoalkeeperStats(career, rival, club, dummyEffects) : simulateFieldStats(career, rival, club, dummyEffects);
        const lp = leaguePosition(career, club);
        const titles = titlesFor(career, club, lp, career.seasonIndex);
        const awards = awardsFor(career, rival, raw, club, titles);
        rival.reputation = reputationAfter(rival.reputation, raw.rating, titles, awards);
        rival.form = Game.clamp(Math.round(rival.form + (raw.rating - 6.9) * 4 + Game.rand(career, -2, 2)), 35, 75);
        rival.coachTrust = Game.clamp(Math.round((rival.coachTrust ?? 50) + (raw.rating - 6.9) * 8 + Game.rand(career, -2, 2)), 20, 85);
        rival.lastRating = raw.rating;
        applyDevelopment(career, rival, raw.rating, raw.minutes);
        rival.age += 1;
        if (raw.rating >= 7.25 && Game.nextRandom(career) < .35) {
            const better = Game.CLUBS.filter(x => x.strength > club.strength + 2 && x.strength <= rival.overall + 14);
            if (better.length)
                rival.clubId = Game.pick(career, better).id;
        }
        const result = { ...raw, yearLabel, age: rival.age - 1, clubId: club.id, clubName: club.name, overallStart: startOvr, overallEnd: rival.overall, reputationStart: repStart, reputationEnd: rival.reputation, leaguePosition: lp, titles, awards };
        rival.history.push(result);
        return result;
    }
    function coachTrustAfter(career, rating, titles) {
        return Game.clamp(Math.round((career.coachTrust ?? 50) + (rating - 6.9) * 10 + titles.length * 1.5 + Game.rand(career, -2, 2)), 15, 90);
    }
    function seasonVerdict(stats) {
        if (stats.rating >= 7.75) return { tone: 'elite', title: 'Temporada extraordinária', text: 'Você foi um dos grandes nomes da temporada e elevou seu patamar na carreira.' };
        if (stats.rating >= 7.35) return { tone: 'great', title: 'Excelente temporada', text: 'Regularidade e impacto colocaram seu nome entre os destaques do campeonato.' };
        if (stats.rating >= 7.00) return { tone: 'good', title: 'Boa temporada', text: 'Você cumpriu bem seu papel e saiu do ano valorizado.' };
        if (stats.rating >= 6.65) return { tone: 'neutral', title: 'Temporada regular', text: 'Houve bons momentos, mas ainda existe espaço claro para crescer.' };
        return { tone: 'bad', title: 'Temporada abaixo do esperado', text: 'Seu espaço no elenco fica sob pressão para a próxima temporada.' };
    }
    function clubDecision(career, stats, club) {
        const trust = career.coachTrust ?? 50;
        if (career.age >= 19 && stats.rating < 6.35 && ['Reserva','Rotação'].includes(stats.role) && trust < 34) {
            const options = Game.CLUBS.filter(c => c.id !== club.id && c.strength <= club.strength + 1 && c.strength >= Math.max(56, career.overall - 5))
                .sort((a,b)=>Math.abs(a.strength-career.overall)-Math.abs(b.strength-career.overall)).slice(0,3);
            if (options.length) return { type: 'release', title: 'Fim de ciclo', text: `${club.name} decidiu abrir espaço no elenco. Você precisará escolher um novo destino.`, options: options.map(c=>c.id) };
        }
        if (stats.rating < 6.55 && trust < 42) return { type: 'warning', title: 'Pressão por resultados', text: 'A comissão técnica quer uma resposta na próxima temporada. Seu espaço já não é garantido.' };
        if (stats.rating >= 7.45) return { type: 'praise', title: 'Moral em alta', text: 'A comissão técnica considera você peça importante para os planos da próxima temporada.' };
        return { type: 'stable', title: 'Situação estável', text: 'Você segue nos planos do clube, mas a disputa por espaço continua.' };
    }
    function rivalryResult(career, playerStats, rivalStats) {
        const pScore = playerStats.rating + playerStats.titles.length * .08 + playerStats.awards.length * .10;
        const rScore = rivalStats.rating + rivalStats.titles.length * .08 + rivalStats.awards.length * .10;
        career.rivalryRecord = career.rivalryRecord || { player: 0, rival: 0, draws: 0 };
        if (Math.abs(pScore-rScore) < .05) { career.rivalryRecord.draws++; return 'draw'; }
        if (pScore > rScore) { career.rivalryRecord.player++; return 'player'; }
        career.rivalryRecord.rival++; return 'rival';
    }
    function chooseReleaseDestination(career, clubId) {
        const d = career.lastSummary?.clubDecision;
        if (!d || d.type !== 'release' || !d.options.includes(clubId)) return;
        career.clubId = clubId;
        career.coachTrust = 50;
        const newClub = Game.clubById(clubId);
        const newRole = determineRole(career.overall, newClub, career.lastRating ?? 6.9, 50);
        career.salaryAnnualEUR = Game.salaryFor(career, newClub, newRole);
        career.contractYearsLeft = 3;
        career.lastSummary = undefined;
        career.pendingOffer = undefined;
        career.careerLog = career.careerLog || [];
        career.careerLog.push({ type: 'transfer', year: 2026 + career.seasonIndex, text: `Novo começo no ${Game.clubById(clubId).name}.` });
    }
    Game.chooseReleaseDestination = chooseReleaseDestination;
    function finalizeSeason(career) {
        const p = career.pendingSeason;
        if (!p) throw new Error('Nenhuma temporada em andamento.');
        if (p.currentEvent < p.events.length) throw new Error('Ainda existem eventos pendentes.');
        const club = Game.clubById(p.clubIdAtStart);
        const raw = career.position === 'GOL' ? simulateGoalkeeperStats(career, career, club, p.effects) : simulateFieldStats(career, career, club, p.effects);
        const lp = leaguePosition(career, club);
        const titles = titlesFor(career, club, lp, career.seasonIndex);
        const awards = awardsFor(career, career, raw, club, titles);
        career.reputation = reputationAfter(career.reputation, raw.rating, titles, awards, p.effects);
        career.form = Game.clamp(Math.round(career.form + (raw.rating - 6.9) * 5 + p.effects.formDelta + Game.rand(career, -2, 2)), 30, 80);
        career.morale = Game.clamp(Math.round((career.morale ?? 50) + p.effects.moraleDelta + (raw.rating - 6.9) * 2 + Game.rand(career, -2, 2)), 20, 85);
        career.coachTrust = Game.clamp(coachTrustAfter(career, raw.rating, titles) + (p.effects.coachTrustDelta ?? 0), 15, 90);
        career.lastRating = raw.rating;
        career.careerEarningsEUR = (career.careerEarningsEUR ?? 0) + (p.salaryAtStart ?? career.salaryAnnualEUR ?? 0);
        career.contractYearsLeft = Math.max(0, (career.contractYearsLeft ?? 1) - 1);
        const developmentText = applyDevelopment(career, career, raw.rating, raw.minutes);
        const nextRole = determineRole(career.overall, club, raw.rating, career.coachTrust);
        const stats = { ...raw, yearLabel: p.yearLabel, age: career.age, clubId: club.id, clubName: club.name, overallStart: p.overallStart, overallEnd: career.overall, reputationStart: p.reputationStart, reputationEnd: career.reputation, leaguePosition: lp, titles, awards, roleAtStart: p.roleAtStart, nextRole, salaryAnnualEUR: p.salaryAtStart ?? career.salaryAnnualEUR, gamesMissed: p.effects.gamesMissed ?? 0 };
        career.history.push(stats);
        const rivalStats = simulateNpcSeason(career, career.rival, p.yearLabel);
        const verdict = seasonVerdict(stats);
        const decision = clubDecision(career, stats, club);
        let contractRenewal;
        if (decision.type !== 'release' && career.contractYearsLeft <= 0) {
            career.contractYearsLeft = raw.rating >= 7.35 ? 4 : 3;
            const oldSalary = career.salaryAnnualEUR;
            career.salaryAnnualEUR = Game.salaryFor(career, club, nextRole);
            contractRenewal = { oldSalary, newSalary: career.salaryAnnualEUR, years: career.contractYearsLeft };
        }
        career.age += 1;
        career.seasonIndex += 1;
        const offer = decision.type === 'release' ? undefined : possibleOffer(career, stats);
        career.pendingOffer = offer;
        const summary = { player: stats, rival: rivalStats, transferOffer: offer, developmentText, verdict, clubDecision: decision, contractRenewal };
        career.lastSummary = summary;
        career.pendingSeason = undefined;
        return summary;
    }
    Game.finalizeSeason = finalizeSeason;
    function acceptOffer(career) { if (career.pendingOffer) {
        career.clubId = career.pendingOffer.clubId;
        career.salaryAnnualEUR = career.pendingOffer.salaryAnnualEUR || Game.salaryFor(career, Game.clubById(career.clubId), career.pendingOffer.projectedRole || 'Rotação');
        career.contractYearsLeft = career.age <= 22 ? 5 : 4;
        career.careerLog = career.careerLog || [];
        career.careerLog.push({ type: 'transfer', year: 2026 + career.seasonIndex, text: `Transferência para ${Game.clubById(career.clubId).name}.` });
        career.coachTrust = 50;
        career.reputation = Game.clamp(career.reputation + 2, 0, 100);
        career.morale = Game.clamp((career.morale ?? 50) + 4, 0, 100);
        career.pendingOffer = undefined;
    } }
    Game.acceptOffer = acceptOffer;
    function declineOffer(career) { career.pendingOffer = undefined; }
    Game.declineOffer = declineOffer;
    function runDiagnostics(position = 'ATA', seasons = 250) {
        let goals = 0, assists = 0, tackles = 0, rating = 0, min = 99, max = 0, gain = 0;
        for (let i = 0; i < seasons; i++) {
            const base = Game.BASE_ATTRIBUTES[position];
            const attrs = { ...base, goalkeeping: base.goalkeeping };
            const p = { name: 'Teste', age: 24, position, attributes: attrs, overall: calculateOverall(position, attrs), potential: 88, potentialHint: '', primarySpecialty: position === 'GOL' ? 'goalkeeping' : 'shooting', secondarySpecialty: 'passing', form: 50, reputation: 50, clubId: 'sao-paulo', morale: 50 };
            const c = { rngState: Game.hashSeed(`diag-${position}-${i}`) };
            const available = availableAttrs(p);
            let guard = 0;
            while (p.overall < 78 && guard < 120) {
                const weights = available.map(a => Game.GROWTH_WEIGHTS[position][a] ?? 1);
                applySpecialty(p.attributes, Game.weightedPick(c, available, weights), 1);
                p.overall = calculateOverall(position, p.attributes);
                guard++;
            }
            const raw = position === 'GOL' ? simulateGoalkeeperStats(c, p, Game.clubById('sao-paulo')) : simulateFieldStats(c, p, Game.clubById('sao-paulo'));
            const before = p.overall;
            applyDevelopment(c, p, raw.rating, raw.minutes);
            goals += raw.goals;
            assists += raw.assists;
            tackles += raw.tackles;
            rating += raw.rating;
            min = Math.min(min, raw.rating);
            max = Math.max(max, raw.rating);
            gain += p.overall - before;
        }
        return { seasons, avgGoals: Game.round1(goals / seasons), avgAssists: Game.round1(assists / seasons), avgTackles: Game.round1(tackles / seasons), avgRating: Game.round2(rating / seasons), minRating: Game.round2(min), maxRating: Game.round2(max), avgOverallGain: Game.round2(gain / seasons) };
    }
    Game.runDiagnostics = runDiagnostics;
})(Game || (Game = {}));
var Game;
(function (Game) {
    const STORAGE_KEY = 'bitlife-futebol-v01-career';
    function saveCareer(career) { localStorage.setItem(STORAGE_KEY, JSON.stringify(career)); }
    Game.saveCareer = saveCareer;
    function loadCareer() { try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : undefined;
    }
    catch {
        return undefined;
    } }
    Game.loadCareer = loadCareer;
    function clearCareer() { localStorage.removeItem(STORAGE_KEY); }
    Game.clearCareer = clearCareer;
})(Game || (Game = {}));
var Game;
(function (Game) {
    let career;
    const $ = (sel) => document.querySelector(sel);
    const app = () => $('#app');
    function escapeHtml(s) { return String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c] || c)); }
    function attrValue(a, k) { return k === 'goalkeeping' ? (a.goalkeeping ?? 0) : a[k]; }
    function moneyEUR(v) {
        const n = Number(v || 0);
        if (n >= 1000000) return `€ ${(n/1000000).toFixed(n>=10000000?1:2)} mi`;
        if (n >= 1000) return `€ ${Math.round(n/1000)} mil`;
        return `€ ${Math.round(n)}`;
    }
    function migrateCareer(c) {
        if (!c) return c;
        const previousVersion = c.version;
        const clubMap = {
            'campinas':'guarani', 'ponte-azul':'ponte-preta', 'litoral':'botafogo-sp', 'santos-do-sul':'ituano',
            'aurora':'santos', 'capital':'sao-paulo', 'academia':'palmeiras', 'imperial':'corinthians',
            'lisboa':'benfica', 'porto-real':'porto', 'madrid':'real-madrid', 'barcelona':'barcelona'
        };
        const mapClub = id => clubMap[id] || id;
        c.clubId = mapClub(c.clubId);
        if (Array.isArray(c.history)) c.history.forEach(h => { h.clubId = mapClub(h.clubId); try { h.clubName = Game.clubById(h.clubId).name; } catch {} });
        if (c.rival) {
            c.rival.clubId = mapClub(c.rival.clubId);
            if (Array.isArray(c.rival.history)) c.rival.history.forEach(h => { h.clubId = mapClub(h.clubId); try { h.clubName = Game.clubById(h.clubId).name; } catch {} });
        }
        if (c.pendingSeason?.clubIdAtStart) c.pendingSeason.clubIdAtStart = mapClub(c.pendingSeason.clubIdAtStart);
        if (c.pendingOffer?.clubId) c.pendingOffer.clubId = mapClub(c.pendingOffer.clubId);
        if (Array.isArray(c.trialOffers)) c.trialOffers.forEach(o => o.clubId = mapClub(o.clubId));
        c.version = '0.2.1';
        c.introStage = c.introStage || 'complete';
        c.lastRating = c.lastRating ?? c.history?.[c.history.length - 1]?.rating ?? 6.9;
        c.coachTrust = c.coachTrust ?? 50;
        c.morale = c.morale ?? 50;
        c.rivalryRecord = c.rivalryRecord || { player: 0, rival: 0, draws: 0 };
        c.careerLog = c.careerLog || [];
        c.careerEarningsEUR = c.careerEarningsEUR ?? 0;
        c.lastEventKeys = c.lastEventKeys || [];
        const club = Game.clubById(c.clubId);
        const role = Game.determineRole(c.overall, club, c.lastRating, c.coachTrust);
        c.salaryAnnualEUR = c.salaryAnnualEUR || Game.salaryFor(c, club, role);
        c.contractYearsLeft = c.contractYearsLeft || 3;
        if (previousVersion !== '0.2.1') c.lastSummary = undefined;
        else if (c.lastSummary && !c.lastSummary.verdict) c.lastSummary = undefined;
        if (c.pendingSeason) {
            c.pendingSeason.roleAtStart = c.pendingSeason.roleAtStart || Game.determineRole(c.overall, Game.clubById(c.pendingSeason.clubIdAtStart || c.clubId), c.lastRating, c.coachTrust);
            c.pendingSeason.objective = c.pendingSeason.objective || Game.seasonObjective(c.pendingSeason.roleAtStart);
            c.pendingSeason.effects = { goals:0, assists:0, tackles:0, ratingBonus:0, reputationDelta:0, formDelta:0, moraleDelta:0, coachTrustDelta:0, gamesMissed:0, ...(c.pendingSeason.effects||{}) };
            c.pendingSeason.salaryAtStart = c.pendingSeason.salaryAtStart || c.salaryAnnualEUR;
        }
        if (c.rival) {
            c.rival.lastRating = c.rival.lastRating ?? c.rival.history?.[c.rival.history.length - 1]?.rating ?? 6.9;
            c.rival.coachTrust = c.rival.coachTrust ?? 50;
            c.rival.morale = c.rival.morale ?? 50;
        }
        return c;
    }
    function initUI() {
        career = migrateCareer(Game.loadCareer());
        if (career) Game.saveCareer(career);
        render();
    }
    Game.initUI = initUI;
    function render() {
        if (!career) return renderCreate();
        if (career.introStage && career.introStage !== 'complete') return renderIntro();
        if (career.pendingSeason) return renderSeason();
        if (career.lastSummary) return renderSummary();
        renderDashboard();
    }
    function positionOptions() { return Object.keys(Game.POSITION_LABELS).map(p => `<option value="${p}">${p} — ${Game.POSITION_LABELS[p]}</option>`).join(''); }
    function specialtyOptions(pos) { const attrs = pos === 'GOL' ? ['goalkeeping', 'passing'] : ['shooting', 'passing', 'dribbling', 'tackling']; return attrs.map(a => `<option value="${a}">${Game.ATTRIBUTE_LABELS[a]}</option>`).join(''); }
    function renderCreate() {
        app().innerHTML = `<div class="shell narrow"><div class="brand">⚽ <strong>FutLife</strong><span>V0.2.1</span></div><section class="hero"><span class="eyebrow">SUA HISTÓRIA COMEÇA AQUI</span><h1>Crie seu jogador</h1><p>Escolha sua posição e as características que vão moldar sua evolução ao longo da carreira.</p></section>
        <section class="card form-card"><label>Nome do jogador<input id="name" maxlength="24" value="Vinicius Linhares"></label>
        <label>Posição<select id="position">${positionOptions()}</select></label>
        <div class="grid2"><label>Principal qualidade<select id="primary"></select></label><label>Segunda qualidade<select id="secondary"></select></label></div>
        <button id="create" class="primary wide">Ir para a peneira</button></section><p class="footnote">Sua carreira fica salva automaticamente neste navegador.</p></div>`;
        const pos = $('#position');
        const sync = () => { const p = pos.value; $('#primary').innerHTML = specialtyOptions(p); $('#secondary').innerHTML = specialtyOptions(p); const sec = $('#secondary'); if (sec.options.length > 1) sec.selectedIndex = 1; };
        sync(); pos.onchange = sync;
        $('#create').onclick = () => { const p = pos.value; let primary = $('#primary').value; let secondary = $('#secondary').value; if (primary === secondary) { const opts = p === 'GOL' ? ['goalkeeping','passing'] : ['shooting','passing','dribbling','tackling']; secondary = opts.find(x => x !== primary); }
            career = Game.createCareer($('#name').value, p, primary, secondary, Game.STARTING_CLUB_IDS[0]); Game.saveCareer(career); render(); };
    }
    function renderIntro() {
        if (career.introStage === 'trial') {
            const choices = Game.trialChoices(career);
            app().innerHTML = `<div class="shell narrow"><div class="brand">⚽ <strong>FutLife</strong><span>V0.2.1</span></div>${playerHeader(true)}<section class="story-card"><span class="story-kicker">16 ANOS · PRIMEIRA PENEIRA</span><h2>Uma chance para começar</h2><p>Observadores de vários clubes estão à beira do campo. Você sabe que alguns lances podem definir onde sua carreira profissional vai começar.</p><p class="muted">Como você quer chamar atenção?</p><div class="choices">${choices.map(c=>`<button class="choice trial-choice" data-attr="${c.attribute}"><strong>${c.label}</strong><small>${c.text}</small></button>`).join('')}</div></section></div>`;
            document.querySelectorAll('.trial-choice').forEach(b => b.onclick = () => { Game.resolveTrial(career, b.dataset.attr); Game.saveCareer(career); render(); });
            return;
        }
        const offers = career.trialOffers || [];
        app().innerHTML = `<div class="shell narrow"><div class="brand">⚽ <strong>FutLife</strong><span>V0.2.1</span></div><section class="hero compact"><span class="eyebrow">RESULTADO DA PENEIRA</span><h1>Chegaram propostas</h1><p>${escapeHtml(career.trialResult || 'Sua atuação despertou interesse.')}</p></section>
        <section class="card"><span class="eyebrow">ESCOLHA SEU PRIMEIRO CLUBE</span><div class="club-offers">${offers.map(o=>{const c=Game.clubById(o.clubId); const salary=Game.salaryFor(career,c,o.projectedRole); return `<button class="club-offer" data-club="${c.id}"><div><strong>${c.flag} ${c.name}</strong><span>${c.league}</span></div><div class="offer-meta"><small>${moneyEUR(salary)}/ano</small><b>${o.projectedRole}</b></div></button>`}).join('')}</div></section><p class="footnote">Valores salariais são estimativas de jogo para criar progressão financeira.</p></div>`;
        document.querySelectorAll('.club-offer').forEach(b => b.onclick = () => { Game.chooseStartingClub(career, b.dataset.club); Game.saveCareer(career); render(); });
    }
    function playerHeader(minimal=false) {
        if (!career) return '';
        const club = Game.clubById(career.clubId);
        const sec = career.secondaryPosition ? ` · também ${career.secondaryPosition}` : '';
        return `<header class="player-head ${minimal?'minimal':''}"><div><span class="eyebrow">${Game.POSITION_LABELS[career.position]}${sec} · ${career.age} anos</span><h1>${escapeHtml(career.name)}</h1>${minimal?'':`<p>${club.flag} ${club.name} · ${club.league}</p>`}</div><div class="ovr"><span>OVR</span><strong>${career.overall}</strong></div></header>`;
    }
    function availableDisplayAttrs(pos) { return pos === 'GOL' ? ['goalkeeping','passing'] : ['shooting','passing','dribbling','tackling']; }
    function attributeCards(p) { return `<div class="attributes">${availableDisplayAttrs(p.position).map(a=>`<div class="attr"><span>${Game.ATTRIBUTE_LABELS[a]}</span><strong>${attrValue(p.attributes,a)}</strong>${a===p.primarySpecialty?'<small>principal</small>':a===p.secondarySpecialty?'<small>secundária</small>':''}</div>`).join('')}</div>`; }
    function currentRole() { return Game.determineRole(career.overall, Game.clubById(career.clubId), career.lastRating ?? 6.9, career.coachTrust ?? 50); }
    function careerTotals(history) {
        return history.reduce((a,s)=>{a.games+=s.games||0;a.goals+=s.goals||0;a.assists+=s.assists||0;a.tackles+=s.tackles||0;a.titles+=(s.titles||[]).length;a.awards+=(s.awards||[]).length;return a;},{games:0,goals:0,assists:0,tackles:0,titles:0,awards:0});
    }
    function formLabel(v) { return v>=65?'Excelente':v>=56?'Boa':v>=45?'Regular':'Baixa'; }
    function moraleLabel(v) { return v>=70?'Muito alta':v>=56?'Alta':v>=42?'Estável':v>=30?'Baixa':'Muito baixa'; }
    function reputationLabel(v) { return v>=90?'Ícone mundial':v>=75?'Estrela':v>=55?'Muito conhecido':v>=35?'Em ascensão':v>=18?'Promessa':'Início de carreira'; }
    function renderDashboard() {
        const club=Game.clubById(career.clubId), rival=career.rival, rclub=Game.clubById(rival.clubId), role=currentRole(), totals=careerTotals(career.history);
        const season=`${2026+career.seasonIndex}/${String((2027+career.seasonIndex)%100).padStart(2,'0')}`;
        const lastRival=rival.history?.[rival.history.length-1];
        app().innerHTML=`<div class="shell"><div class="brand">⚽ <strong>FutLife</strong><span>V0.2.1</span></div>${playerHeader()}${attributeCards(career)}
        <div class="status-grid six"><div><span>Potencial</span><strong>${career.potentialHint}</strong></div><div><span>Status</span><strong>${role}</strong></div><div><span>Forma</span><strong>${formLabel(career.form)}</strong><small>${career.form}/100</small></div><div><span>Moral</span><strong>${moraleLabel(career.morale??50)}</strong><small>${career.morale??50}/100</small></div><div><span>Reputação</span><strong>${reputationLabel(career.reputation)}</strong><small>${career.reputation}/100</small></div><div><span>Salário anual</span><strong>${moneyEUR(career.salaryAnnualEUR)}</strong><small>${career.contractYearsLeft} ano(s) de contrato</small></div></div>
        <section class="card next-season"><div class="section-title"><div><span class="eyebrow">TEMPORADA ${season}</span><h2>${club.flag} ${club.name}</h2><p>${club.league} · força do elenco ${club.strength}</p></div><span class="role-badge">${role}</span></div><div class="objective"><span>Meta da temporada</span><strong>${Game.seasonObjective(role)}</strong></div><button id="start" class="primary wide">Começar temporada</button></section>
        <section class="card"><span class="eyebrow">SUA CARREIRA</span><div class="career-numbers">${metric('Temporadas',career.history.length)}${metric('Jogos',totals.games)}${metric('Gols',totals.goals)}${metric('Assistências',totals.assists)}${metric('Títulos',totals.titles)}${metric('Ganhos',moneyEUR(career.careerEarningsEUR))}</div></section>
        <section class="card rival"><div class="section-title"><div><span class="eyebrow">SEU RIVAL</span><h2>${escapeHtml(rival.name)}</h2><p>${rclub.flag} ${rclub.name} · ${Game.POSITION_LABELS[rival.position]} · OVR ${rival.overall}</p></div></div>${lastRival?`<div class="rival-snapshot">${metric('Última nota',lastRival.rating.toFixed(2))}${metric('Gols',lastRival.goals)}${metric('Assistências',lastRival.assists)}${metric('Clube',lastRival.clubName)}</div>`:'<p class="muted">A carreira dele evolui em paralelo à sua.</p>'}</section>
        ${career.history.length?historyHtml(career.history):''}<p class="footnote">Clubes reais são usados apenas como referência neste protótipo não oficial; não há afiliação com as equipes.</p><button id="reset" class="ghost danger">Apagar carreira e recomeçar</button></div>`;
        $('#start').onclick=()=>{Game.startSeason(career);Game.saveCareer(career);render();};
        $('#reset').onclick=()=>{if(confirm('Apagar esta carreira?')){Game.clearCareer();career=undefined;render();}};
    }
    function renderSeason() {
        const p=career.pendingSeason, event=p.events[p.currentEvent];
        if(!event){app().innerHTML=`<div class="shell narrow"><div class="brand">⚽ <strong>FutLife</strong><span>V0.2.1</span></div>${playerHeader()}<section class="story-card end-season"><span class="story-kicker">FIM DE TEMPORADA</span><h2>O ano chegou ao fim</h2><p>Os campeonatos terminaram. Agora é hora de ver seu desempenho, sua evolução e o que o mercado reserva.</p><button id="finish" class="primary wide">Ver resumo da temporada</button></section></div>`; $('#finish').onclick=()=>{Game.finalizeSeason(career);Game.saveCareer(career);render();}; return;}
        const n=p.currentEvent+1;
        const kindLabel=event.kind==='derby'?'CLÁSSICO':event.kind==='career'?'CARREIRA':event.kind==='life'?'FORA DE CAMPO':event.kind==='injury'?'DEPARTAMENTO MÉDICO':'JOGO IMPORTANTE';
        app().innerHTML=`<div class="shell narrow"><div class="brand">⚽ <strong>FutLife</strong><span>V0.2.1</span></div>${playerHeader()}<div class="season-context"><span>${p.yearLabel}</span><strong>${p.roleAtStart}</strong><small>${escapeHtml(p.objective)}</small></div><div class="progress"><span style="width:${n/p.events.length*100}%"></span></div><p class="progress-label">Momento ${n} de ${p.events.length}</p>
        <section class="card event-card"><span class="eyebrow">${kindLabel}</span><h2>${event.title}</h2><p class="event-text">${event.text}</p>${event.resolved?`<div class="result"><strong>Resultado</strong><p>${event.resultText}</p></div><button id="continue" class="primary wide">Continuar</button>`:`<div class="choices">${event.choices.map(c=>`<button class="choice" data-id="${c.id}"><strong>${c.label}</strong>${c.description?`<small>${c.description}</small>`:''}</button>`).join('')}</div>`}</section></div>`;
        document.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{Game.resolveEventChoice(career,b.dataset.id);Game.saveCareer(career);render();});
        if($('#continue')) $('#continue').onclick=()=>{Game.advanceEvent(career);Game.saveCareer(career);render();};
    }
    function metric(label,value){return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;}
    function renderSummary() {
        const s=career.lastSummary,p=s.player,r=s.rival,goalie=career.position==='GOL';
        const movement=p.roleAtStart===p.nextRole?`Você permanece como ${p.nextRole}.`:`Seu status mudou de ${p.roleAtStart} para ${p.nextRole}.`;
        const missed=p.gamesMissed?`<p class="muted">Você perdeu ${p.gamesMissed} jogo(s) por questões físicas ou pessoais nesta temporada.</p>`:'';
        const renewal=s.contractRenewal?`<div class="result"><strong>Renovação</strong><p>Novo contrato por ${s.contractRenewal.years} anos: ${moneyEUR(s.contractRenewal.oldSalary)} → ${moneyEUR(s.contractRenewal.newSalary)} por ano.</p></div>`:'';
        app().innerHTML=`<div class="shell"><div class="brand">⚽ <strong>FutLife</strong><span>V0.2.1</span></div>${playerHeader()}<section class="season-verdict ${s.verdict.tone}"><span class="eyebrow">TEMPORADA ${p.yearLabel}</span><h1>${s.verdict.title}</h1><div class="rating-big">${p.rating.toFixed(2)}</div><p>${s.verdict.text}</p><small>${p.clubName} · ${p.leaguePosition}º no campeonato</small></section>
        <div class="metrics">${metric('Jogos',p.games)}${metric('Titular',p.starts)}${goalie?metric('Defesas',p.saves??0):metric('Gols',p.goals)}${goalie?metric('% defesas',`${p.savePct}%`):metric('Assistências',p.assists)}${goalie?metric('Gols sofridos',p.goalsConceded):metric('Desarmes',p.tackles)}${metric('Clean sheets',p.cleanSheets)}${metric('Amarelos',p.yellowCards)}${metric('Vermelhos',p.redCards)}</div>${missed}
        <section class="card"><div class="section-title"><div><span class="eyebrow">EVOLUÇÃO</span><h2>OVR ${p.overallStart} → ${p.overallEnd}</h2></div><span class="pill">Reputação ${p.reputationStart} → ${p.reputationEnd}</span></div>${attributeCards(career)}<p class="muted">${s.developmentText.join(' · ')}</p></section>
        <section class="card club-review"><span class="eyebrow">AVALIAÇÃO DO CLUBE</span><h2>${s.clubDecision.title}</h2><p>${s.clubDecision.text}</p><div class="review-row"><span>${movement}</span><strong>Confiança ${career.coachTrust}/100</strong></div></section>
        <section class="card finance-card"><span class="eyebrow">CARREIRA FINANCEIRA</span><div class="career-numbers">${metric('Salário da temporada',moneyEUR(p.salaryAnnualEUR))}${metric('Ganhos acumulados',moneyEUR(career.careerEarningsEUR))}${metric('Contrato restante',`${career.contractYearsLeft} ano(s)`)}</div>${renewal}</section>
        <div class="grid2"><section class="card"><span class="eyebrow">TÍTULOS</span>${p.titles.length?`<ul class="award-list">${p.titles.map(x=>`<li>🏆 ${x}</li>`).join('')}</ul>`:'<p class="muted">Nenhum título nesta temporada.</p>'}</section><section class="card"><span class="eyebrow">PRÊMIOS</span>${p.awards.length?`<ul class="award-list">${p.awards.map(x=>`<li>⭐ ${x}</li>`).join('')}</ul>`:'<p class="muted">Nenhum prêmio individual.</p>'}</section></div>
        <section class="card"><div class="section-title"><div><span class="eyebrow">SEU RIVAL · ${p.yearLabel}</span><h2>${escapeHtml(career.rival.name)}</h2><p>${Game.clubById(r.clubId).flag} ${r.clubName}</p></div></div><div class="compare"><div><strong>${escapeHtml(career.name)}</strong><span>OVR ${p.overallEnd}</span><b>${p.rating.toFixed(2)}</b><small>${p.goals} G · ${p.assists} A</small></div><div class="versus">VS</div><div><strong>${escapeHtml(career.rival.name)}</strong><span>OVR ${r.overallEnd}</span><b>${r.rating.toFixed(2)}</b><small>${r.goals} G · ${r.assists} A</small></div></div></section>
        ${s.clubDecision.type==='release'?releaseHtml(s.clubDecision):''}
        ${s.transferOffer?`<section class="card offer"><span class="eyebrow">MERCADO DA BOLA</span><h2>${Game.clubById(s.transferOffer.clubId).flag} ${s.transferOffer.clubName}</h2><p>${Game.clubById(s.transferOffer.clubId).league} · força ${s.transferOffer.strength} · prestígio ${s.transferOffer.prestige}</p><div class="offer-money"><span>Proposta salarial</span><strong>${moneyEUR(s.transferOffer.salaryAnnualEUR)} / ano</strong><small>projeção: ${s.transferOffer.projectedRole}</small></div><p>${s.transferOffer.reason}</p><div class="actions"><button id="accept" class="primary">Aceitar proposta</button><button id="decline">Continuar no ${escapeHtml(p.clubName)}</button></div></section>`:''}
        ${s.clubDecision.type!=='release'?`<button id="next" class="primary wide" ${s.transferOffer?'disabled':''}>Seguir para a próxima temporada</button>`:''}</div>`;
        if($('#accept')) $('#accept').onclick=()=>{Game.acceptOffer(career);career.lastSummary=undefined;Game.saveCareer(career);render();};
        if($('#decline')) $('#decline').onclick=()=>{Game.declineOffer(career);career.lastSummary=undefined;Game.saveCareer(career);render();};
        if($('#next')) $('#next').onclick=()=>{career.lastSummary=undefined;Game.saveCareer(career);render();};
        document.querySelectorAll('.release-choice').forEach(b=>b.onclick=()=>{Game.chooseReleaseDestination(career,b.dataset.club);Game.saveCareer(career);render();});
    }
    function releaseHtml(decision){return `<section class="card release"><span class="eyebrow">NOVO DESTINO</span><h2>Escolha onde recomeçar</h2><p>Seu vínculo terminou. Estes clubes demonstraram interesse.</p><div class="club-offers">${decision.options.map(id=>{const c=Game.clubById(id);const role=Game.determineRole(career.overall,c,career.lastRating,50);const salary=Game.salaryFor(career,c,role);return `<button class="club-offer release-choice" data-club="${id}"><div><strong>${c.flag} ${c.name}</strong><span>${c.league}</span></div><div class="offer-meta"><small>${moneyEUR(salary)}/ano</small><b>${role}</b></div></button>`}).join('')}</div></section>`;}
    function historyHtml(history){const rows=history.slice().reverse().map(s=>`<tr><td>${s.yearLabel}</td><td>${s.clubName}</td><td>${s.overallEnd}</td><td>${s.role||'—'}</td><td>${s.goals}</td><td>${s.assists}</td><td>${s.rating.toFixed(2)}</td><td>${s.leaguePosition}º</td></tr>`).join('');return `<section class="card"><span class="eyebrow">HISTÓRICO DA CARREIRA</span><div class="table-wrap"><table><thead><tr><th>Temporada</th><th>Clube</th><th>OVR</th><th>Status</th><th>G</th><th>A</th><th>Nota</th><th>Liga</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;}
    document.addEventListener('DOMContentLoaded',initUI);
})(Game || (Game = {}));
