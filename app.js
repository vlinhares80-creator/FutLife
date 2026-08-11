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
        { id: 'campinas', name: 'Campinas Atlético', shortName: 'CAC', strength: 58, prestige: 47, rivalId: 'ponte-azul' },
        { id: 'ponte-azul', name: 'Ponte Azul', shortName: 'PAZ', strength: 60, prestige: 51, rivalId: 'campinas' },
        { id: 'litoral', name: 'Litoral FC', shortName: 'LIT', strength: 62, prestige: 55, rivalId: 'santos-do-sul' },
        { id: 'santos-do-sul', name: 'Santos do Sul', shortName: 'SDS', strength: 64, prestige: 58, rivalId: 'litoral' },
        { id: 'aurora', name: 'Aurora Paulista', shortName: 'AUR', strength: 69, prestige: 67, rivalId: 'capital' },
        { id: 'capital', name: 'Capital Esporte Clube', shortName: 'CAP', strength: 73, prestige: 75, rivalId: 'aurora' },
        { id: 'academia', name: 'Academia Verde', shortName: 'ACV', strength: 80, prestige: 84, rivalId: 'imperial' },
        { id: 'imperial', name: 'Imperial Paulista', shortName: 'IMP', strength: 82, prestige: 88, rivalId: 'academia' },
        { id: 'lisboa', name: 'Lisboa Navegantes', shortName: 'LNV', strength: 84, prestige: 86, rivalId: 'porto-real' },
        { id: 'porto-real', name: 'Porto Real', shortName: 'PRT', strength: 83, prestige: 85, rivalId: 'lisboa' },
        { id: 'madrid', name: 'Madrid Blanco', shortName: 'MDB', strength: 91, prestige: 97, rivalId: 'barcelona' },
        { id: 'barcelona', name: 'Barcelona Blau', shortName: 'BLB', strength: 90, prestige: 97, rivalId: 'madrid' }
    ];
    Game.STARTING_CLUB_IDS = ['campinas', 'ponte-azul', 'litoral', 'santos-do-sul'];
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
            form: Game.randInt(temp, 47, 55), reputation: Game.randInt(temp, 8, 14), clubId: Game.pick(temp, startClubs), history: []
        };
        return {
            id: `career-${seed}`, name: name.trim() || 'Jogador', age: 16, position, attributes,
            overall: ovr, potential, potentialHint: hint, primarySpecialty: primary, secondarySpecialty: secondary,
            form: 50, reputation: 10, clubId, seed, rngState: temp.rngState, seasonIndex: 0, history: [], rival
        };
    }
    Game.createCareer = createCareer;
    function randomRivalName(c) {
        const first = ['Mateo', 'Lucas', 'Gabriel', 'Thiago', 'Enzo', 'Nicolás', 'Bruno', 'Rafael', 'Tomás', 'Diego', 'Martín', 'João'];
        const last = ['Rodríguez', 'Ferreira', 'Silva', 'Mendes', 'Almeida', 'Costa', 'Santos', 'Pereira', 'García', 'Romero', 'Oliveira', 'Torres'];
        return `${Game.pick(c, first)} ${Game.pick(c, last)}`;
    }
    function startSeason(career) {
        if (career.pendingSeason)
            return;
        const club = Game.clubById(career.clubId);
        const year = 2026 + career.seasonIndex;
        const eventCount = club.prestige >= 85 ? 5 : club.prestige >= 70 ? 4 : 3;
        const events = buildSeasonEvents(career, eventCount);
        career.pendingSeason = {
            yearLabel: `${year}/${String((year + 1) % 100).padStart(2, '0')}`,
            clubIdAtStart: career.clubId, overallStart: career.overall, reputationStart: career.reputation,
            events, currentEvent: 0,
            effects: { goals: 0, assists: 0, tackles: 0, ratingBonus: 0, reputationDelta: 0, formDelta: 0 },
            trainingGains: {}
        };
        career.lastSummary = undefined;
        career.pendingOffer = undefined;
    }
    Game.startSeason = startSeason;
    function buildSeasonEvents(career, count) {
        const events = [];
        events.push(trainingEvent(career));
        if (Game.POSITION_ADJACENCY[career.position].length && Game.nextRandom(career) < .30)
            events.push(positionEvent(career));
        else
            events.push(matchEvent(career, false));
        events.push(derbyEvent(career));
        while (events.length < count)
            events.push(Game.nextRandom(career) < .72 ? matchEvent(career, false) : trainingEvent(career));
        return events.slice(0, count);
    }
    function availableAttrs(player) {
        return player.position === 'GOL' ? ['goalkeeping', 'passing'] : FIELD_ATTRS.slice();
    }
    function trainingEvent(career) {
        const attrs = availableAttrs(career);
        const shuffled = attrs.slice().sort(() => Game.nextRandom(career) - .5).slice(0, Math.min(3, attrs.length));
        return {
            id: `train-${career.seasonIndex}-${career.rngState}`, kind: 'training', title: 'Treino individual',
            text: 'A comissão técnica liberou uma sessão específica. Onde você quer concentrar o trabalho?',
            choices: shuffled.map(a => ({ id: `train-${a}`, label: `Treinar ${Game.ATTRIBUTE_LABELS[a]}`, attribute: a, effect: 'train', description: '+1 no atributo escolhido' }))
        };
    }
    function matchEvent(career, derby) {
        if (career.position === 'GOL') {
            return { id: `gk-${career.rngState}`, kind: derby ? 'derby' : 'match', title: derby ? 'Clássico — lance decisivo' : 'Lance decisivo',
                text: 'Nos minutos finais, o adversário chega em situação clara de gol. Como você reage?',
                choices: [
                    { id: 'gk-defend', label: 'Esperar o chute e reagir', attribute: 'goalkeeping', effect: 'match' },
                    { id: 'gk-build', label: 'Antecipar e iniciar contra-ataque', attribute: 'passing', effect: 'match' }
                ] };
        }
        let opts;
        if (['ZAG', 'VOL', 'LE', 'LD'].includes(career.position)) {
            opts = [
                { id: 'tackle', label: 'Antecipar e recuperar a bola', attribute: 'tackling', effect: 'match' },
                { id: 'pass', label: 'Acelerar a saída com um passe', attribute: 'passing', effect: 'match' },
                { id: 'shoot', label: 'Arriscar uma chegada ao ataque', attribute: 'shooting', effect: 'match' }
            ];
        }
        else if (career.position === 'MC') {
            opts = [
                { id: 'pass', label: 'Buscar o passe decisivo', attribute: 'passing', effect: 'match' },
                { id: 'dribble', label: 'Conduzir e quebrar a linha', attribute: 'dribbling', effect: 'match' },
                { id: 'tackle', label: 'Antecipar e recuperar a bola', attribute: 'tackling', effect: 'match' }
            ];
        }
        else if (career.position === 'MEI') {
            opts = [
                { id: 'pass', label: 'Buscar o passe decisivo', attribute: 'passing', effect: 'match' },
                { id: 'dribble', label: 'Partir para o drible', attribute: 'dribbling', effect: 'match' },
                { id: 'shoot', label: 'Finalizar', attribute: 'shooting', effect: 'match' }
            ];
        }
        else {
            opts = [
                { id: 'shoot', label: 'Finalizar', attribute: 'shooting', effect: 'match' },
                { id: 'dribble', label: 'Partir para o drible', attribute: 'dribbling', effect: 'match' },
                { id: 'pass', label: 'Buscar o passe decisivo', attribute: 'passing', effect: 'match' }
            ];
        }
        return { id: `match-${career.rngState}`, kind: derby ? 'derby' : 'match', title: derby ? 'Clássico — momento decisivo' : 'Partida importante',
            text: derby ? 'O clássico está equilibrado e a torcida cobra protagonismo. Você tem uma chance de mudar o jogo.' : 'A partida chegou ao momento decisivo. Sua escolha pode pesar no resultado e na sua nota.', choices: opts };
    }
    function derbyEvent(career) {
        const e = matchEvent(career, true);
        e.id = `derby-${career.rngState}`;
        return e;
    }
    function positionEvent(career) {
        const target = Game.pick(career, Game.POSITION_ADJACENCY[career.position]);
        return { id: `pos-${career.rngState}`, kind: 'career', title: 'Conversa com o treinador',
            text: `O treinador acredita que suas características também podem funcionar como ${Game.POSITION_LABELS[target]}.`,
            choices: [
                { id: 'keep-pos', label: `Continuar focado como ${Game.POSITION_LABELS[career.position]}`, effect: 'form' },
                { id: 'try-pos', label: `Aceitar testes como ${Game.POSITION_LABELS[target]}`, effect: 'position', positionTarget: target }
            ] };
    }
    function resolveEventChoice(career, choiceId) {
        const p = career.pendingSeason;
        if (!p)
            return 'Nenhuma temporada em andamento.';
        const event = p.events[p.currentEvent];
        if (!event || event.resolved)
            return event?.resultText ?? 'Evento já resolvido.';
        const choice = event.choices.find(c => c.id === choiceId);
        if (!choice)
            return 'Escolha inválida.';
        let text = '';
        if (choice.effect === 'train' && choice.attribute) {
            const current = p.trainingGains[choice.attribute] ?? 0;
            const bonus = Game.nextRandom(career) < .10 ? 2 : 1;
            p.trainingGains[choice.attribute] = current + bonus;
            applySpecialty(career.attributes, choice.attribute, bonus);
            career.overall = calculateOverall(career.position, career.attributes);
            text = `${Game.ATTRIBUTE_LABELS[choice.attribute]} +${bonus}. O treino já altera seus atributos antes do fim da temporada.`;
        }
        else if (choice.effect === 'position' && choice.positionTarget) {
            career.secondaryPosition = choice.positionTarget;
            p.effects.formDelta += 2;
            text = `${Game.POSITION_LABELS[choice.positionTarget]} adicionada como posição secundária. O Overall nessa função é ${calculateOverall(choice.positionTarget, career.attributes)}.`;
        }
        else if (choice.effect === 'form') {
            p.effects.formDelta += 1;
            text = 'Você manteve o foco na função atual. Forma +1.';
        }
        else if (choice.effect === 'match' && choice.attribute) {
            const attrValue = getAttr(career.attributes, choice.attribute);
            const difficulty = event.kind === 'derby' ? 6 : 0;
            const chance = Game.clamp(.16 + attrValue * .0072 + (career.form - 50) * .002 - difficulty * .004, .24, .88);
            const success = Game.nextRandom(career) < chance;
            if (success) {
                p.effects.ratingBonus += event.kind === 'derby' ? .055 : .035;
                p.effects.reputationDelta += event.kind === 'derby' ? 2 : 1;
                p.effects.formDelta += 2;
                if (choice.attribute === 'shooting') {
                    p.effects.goals += 1;
                    text = 'Você converte a chance e marca um gol importante.';
                }
                else if (choice.attribute === 'passing') {
                    p.effects.assists += 1;
                    text = career.position === 'GOL' ? 'A antecipação funciona e seu passe inicia o lance do gol. Assistência.' : 'O passe quebra a defesa e termina em gol. Assistência.';
                }
                else if (choice.attribute === 'tackling') {
                    p.effects.tackles += 3;
                    text = 'A antecipação funciona e você domina o momento defensivo.';
                }
                else if (choice.attribute === 'goalkeeping') {
                    text = 'Grande defesa no momento decisivo. Sua nota recebe um bônus.';
                }
                else {
                    p.effects.goals += Game.nextRandom(career) < .48 ? 1 : 0;
                    p.effects.assists += p.effects.goals ? 0 : 1;
                    text = p.effects.goals ? 'Você vence no drible e conclui a jogada em gol.' : 'Você elimina o marcador e cria o gol para um companheiro.';
                }
            }
            else {
                p.effects.ratingBonus -= event.kind === 'derby' ? .025 : .015;
                p.effects.formDelta -= 1;
                text = `A jogada não funciona. Chance estimada de sucesso: ${Math.round(chance * 100)}%.`;
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
    function determineRole(overall, club) {
        const reference = club.strength - 4;
        const d = overall - reference;
        if (d >= 10)
            return 'Estrela';
        if (d >= 5)
            return 'Importante';
        if (d >= 0)
            return 'Titular';
        if (d >= -5)
            return 'Rotação';
        return 'Reserva';
    }
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
    function simulateFieldStats(c, player, club, effects) {
        const role = determineRole(player.overall, club);
        const gm = minutesForRole(c, role);
        const per90 = gm.minutes / 90;
        const offense = Game.clamp(.82 + (club.strength - 58) * .0105, .78, 1.25);
        const defensiveLoad = Game.clamp(1.20 - (club.strength - 58) * .008, .72, 1.20);
        const formFactor = 1 + (player.form - 50) * .0012;
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
        const rating = Game.round2(Game.clamp(qualityBase + contextBonus + (player.form - 50) * .004 + Game.rand(c, -.15, .15) + (effects?.ratingBonus ?? 0) + outputSignal * .04, 5.8, 8.55));
        return { role, ...gm, goals, assists, tackles, cleanSheets, yellowCards, redCards, rating };
    }
    function simulateGoalkeeperStats(c, player, club, effects) {
        const role = determineRole(player.overall, club);
        const gm = minutesForRole(c, role);
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
        const rating = Game.round2(Game.clamp(5.72 + player.overall * .020 + (savePct - .68) * 2.1 + (player.form - 50) * .004 + Game.rand(c, -.15, .15) + (effects?.ratingBonus ?? 0), 5.8, 8.55));
        return { role, ...gm, goals: 0, assists, tackles: 0, cleanSheets, yellowCards: Game.nextRandom(c) < .22 ? 1 : 0, redCards: Game.nextRandom(c) < .025 ? 1 : 0, saves, savePct: Game.round1(savePct * 100), goalsConceded, penaltiesSaved, rating };
    }
    function leaguePosition(c, club) {
        const expected = 11 - (club.strength - 60) / 3.1;
        return Game.clamp(Math.round(expected + Game.rand(c, -2.4, 2.4)), 1, 20);
    }
    function titlesFor(c, club, leaguePos) {
        const out = [];
        if (leaguePos === 1)
            out.push('Campeonato Nacional');
        const cupChance = Game.clamp(.05 + (club.strength - 60) * .007, .04, .30);
        if (Game.nextRandom(c) < cupChance)
            out.push('Copa Nacional');
        if (club.prestige >= 76) {
            const cont = Game.clamp(.025 + (club.strength - 75) * .009, .02, .22);
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
        return { clubId: club.id, clubName: club.name, strength: club.strength, prestige: club.prestige, reason: `Nota ${stats.rating.toFixed(2)} e OVR ${career.overall} chamaram atenção do mercado.` };
    }
    function simulateNpcSeason(career, rival, yearLabel) {
        const club = Game.clubById(rival.clubId);
        const startOvr = rival.overall;
        const repStart = rival.reputation;
        const dummyEffects = { goals: 0, assists: 0, tackles: 0, ratingBonus: Game.rand(career, -.025, .025), reputationDelta: 0, formDelta: 0 };
        const raw = rival.position === 'GOL' ? simulateGoalkeeperStats(career, rival, club, dummyEffects) : simulateFieldStats(career, rival, club, dummyEffects);
        const lp = leaguePosition(career, club);
        const titles = titlesFor(career, club, lp);
        const awards = awardsFor(career, rival, raw, club, titles);
        rival.reputation = reputationAfter(rival.reputation, raw.rating, titles, awards);
        rival.form = Game.clamp(Math.round(rival.form + (raw.rating - 6.9) * 4 + Game.rand(career, -2, 2)), 35, 75);
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
    function finalizeSeason(career) {
        const p = career.pendingSeason;
        if (!p)
            throw new Error('Nenhuma temporada em andamento.');
        if (p.currentEvent < p.events.length)
            throw new Error('Ainda existem eventos pendentes.');
        const club = Game.clubById(p.clubIdAtStart);
        const raw = career.position === 'GOL' ? simulateGoalkeeperStats(career, career, club, p.effects) : simulateFieldStats(career, career, club, p.effects);
        const lp = leaguePosition(career, club);
        const titles = titlesFor(career, club, lp);
        const awards = awardsFor(career, career, raw, club, titles);
        career.reputation = reputationAfter(career.reputation, raw.rating, titles, awards, p.effects);
        career.form = Game.clamp(Math.round(career.form + (raw.rating - 6.9) * 5 + p.effects.formDelta + Game.rand(career, -2, 2)), 35, 75);
        const developmentText = applyDevelopment(career, career, raw.rating, raw.minutes);
        const stats = { ...raw, yearLabel: p.yearLabel, age: career.age, clubId: club.id, clubName: club.name, overallStart: p.overallStart, overallEnd: career.overall, reputationStart: p.reputationStart, reputationEnd: career.reputation, leaguePosition: lp, titles, awards };
        career.history.push(stats);
        const rivalStats = simulateNpcSeason(career, career.rival, p.yearLabel);
        career.age += 1;
        career.seasonIndex += 1;
        const offer = possibleOffer(career, stats);
        career.pendingOffer = offer;
        const summary = { player: stats, rival: rivalStats, transferOffer: offer, developmentText };
        career.lastSummary = summary;
        career.pendingSeason = undefined;
        return summary;
    }
    Game.finalizeSeason = finalizeSeason;
    function acceptOffer(career) { if (career.pendingOffer) {
        career.clubId = career.pendingOffer.clubId;
        career.reputation = Game.clamp(career.reputation + 2, 0, 100);
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
            const p = { name: 'Teste', age: 24, position, attributes: attrs, overall: calculateOverall(position, attrs), potential: 88, potentialHint: '', primarySpecialty: position === 'GOL' ? 'goalkeeping' : 'shooting', secondarySpecialty: 'passing', form: 50, reputation: 50, clubId: 'capital' };
            const c = { rngState: Game.hashSeed(`diag-${position}-${i}`) };
            const available = availableAttrs(p);
            let guard = 0;
            while (p.overall < 78 && guard < 120) {
                const weights = available.map(a => Game.GROWTH_WEIGHTS[position][a] ?? 1);
                applySpecialty(p.attributes, Game.weightedPick(c, available, weights), 1);
                p.overall = calculateOverall(position, p.attributes);
                guard++;
            }
            const raw = position === 'GOL' ? simulateGoalkeeperStats(c, p, Game.clubById('capital')) : simulateFieldStats(c, p, Game.clubById('capital'));
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
    function escapeHtml(s) { return s.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c] || c)); }
    function attrValue(a, k) { return k === 'goalkeeping' ? (a.goalkeeping ?? 0) : a[k]; }
    function initUI() {
        career = Game.loadCareer();
        render();
    }
    Game.initUI = initUI;
    function render() {
        if (!career) {
            renderCreate();
            return;
        }
        if (career.pendingSeason) {
            renderSeason();
            return;
        }
        if (career.lastSummary) {
            renderSummary();
            return;
        }
        renderDashboard();
    }
    function positionOptions() { return Object.keys(Game.POSITION_LABELS).map(p => `<option value="${p}">${p} — ${Game.POSITION_LABELS[p]}</option>`).join(''); }
    function specialtyOptions(pos) { const attrs = pos === 'GOL' ? ['goalkeeping', 'passing'] : ['shooting', 'passing', 'dribbling', 'tackling']; return attrs.map(a => `<option value="${a}">${Game.ATTRIBUTE_LABELS[a]}</option>`).join(''); }
    function clubOptions() { return Game.STARTING_CLUB_IDS.map(id => { const c = Game.clubById(id); return `<option value="${id}">${c.name} · força ${c.strength}</option>`; }).join(''); }
    function renderCreate() {
        app().innerHTML = `<div class="shell narrow"><section class="hero"><span class="eyebrow">PROTÓTIPO V0.1</span><h1>BitLife de Futebol</h1><p>Crie um atleta e teste o primeiro motor de carreira. Os clubes são fictícios nesta versão.</p></section>
    <section class="card form-card"><label>Nome do jogador<input id="name" maxlength="24" value="Vinicius Linhares"></label>
    <label>Posição<select id="position">${positionOptions()}</select></label>
    <div class="grid2"><label>Especialidade principal<select id="primary"></select></label><label>Especialidade secundária<select id="secondary"></select></label></div>
    <label>Clube inicial<select id="club">${clubOptions()}</select></label>
    <button id="create" class="primary">Iniciar carreira</button></section>
    <p class="footnote">A carreira é salva automaticamente neste navegador.</p></div>`;
        const pos = $('#position');
        const sync = () => { const p = pos.value; $('#primary').innerHTML = specialtyOptions(p); $('#secondary').innerHTML = specialtyOptions(p); const s = $('#secondary'); if (s.options.length > 1)
            s.selectedIndex = 1; };
        sync();
        pos.onchange = sync;
        $('#create').onclick = () => { const p = pos.value; let primary = $('#primary').value; let secondary = $('#secondary').value; if (primary === secondary) {
            const opts = p === 'GOL' ? ['goalkeeping', 'passing'] : ['shooting', 'passing', 'dribbling', 'tackling'];
            secondary = opts.find(x => x !== primary);
        } career = Game.createCareer($('#name').value, p, primary, secondary, $('#club').value); Game.saveCareer(career); render(); };
    }
    function playerHeader() {
        if (!career)
            return '';
        const club = Game.clubById(career.clubId);
        return `<header class="player-head"><div><span class="eyebrow">${Game.POSITION_LABELS[career.position]} · ${career.age} anos</span><h1>${escapeHtml(career.name)}</h1><p>${club.name}</p></div><div class="ovr"><span>OVR</span><strong>${career.overall}</strong></div></header>`;
    }
    function attributeCards(p) { const attrs = availableDisplayAttrs(p.position); return `<div class="attributes">${attrs.map(a => `<div class="attr"><span>${Game.ATTRIBUTE_LABELS[a]}</span><strong>${attrValue(p.attributes, a)}</strong>${a === p.primarySpecialty ? '<small>principal</small>' : a === p.secondarySpecialty ? '<small>secundária</small>' : ''}</div>`).join('')}</div>`; }
    function availableDisplayAttrs(pos) { return pos === 'GOL' ? ['goalkeeping', 'passing'] : ['shooting', 'passing', 'dribbling', 'tackling']; }
    function renderDashboard() {
        if (!career)
            return;
        const rival = career.rival;
        const club = Game.clubById(career.clubId);
        const rclub = Game.clubById(rival.clubId);
        app().innerHTML = `<div class="shell">${playerHeader()}${attributeCards(career)}
    <div class="grid3 stats-strip"><div><span>Potencial</span><strong>${career.potentialHint}</strong></div><div><span>Forma</span><strong>${career.form}</strong></div><div><span>Reputação</span><strong>${career.reputation}</strong></div></div>
    <section class="card"><div class="section-title"><div><span class="eyebrow">PRÓXIMA TEMPORADA</span><h2>${2026 + career.seasonIndex}/${String((2027 + career.seasonIndex) % 100).padStart(2, '0')}</h2></div><span class="pill">${club.shortName} · força ${club.strength}</span></div><p>Serão ${club.prestige >= 85 ? 5 : club.prestige >= 70 ? 4 : 3} eventos relevantes antes do fechamento da temporada.</p><button id="start" class="primary">Começar temporada</button></section>
    <section class="card rival"><span class="eyebrow">SEU RIVAL</span><div class="rival-row"><div><h2>${escapeHtml(rival.name)}</h2><p>${Game.POSITION_LABELS[rival.position]} · ${rclub.name}</p></div><div class="mini-ovr">${rival.overall}</div></div>${attributeCards(rival)}</section>
    ${career.history.length ? historyHtml(career.history) : ''}
    <section class="card diagnostics"><details><summary>Diagnóstico do motor</summary><p>Executa 250 temporadas independentes com um atleta-base da sua posição. Serve para detectar números fora da curva.</p><button id="diag">Rodar diagnóstico</button><pre id="diagOut"></pre></details></section>
    <button id="reset" class="ghost danger">Apagar carreira e recomeçar</button></div>`;
        $('#start').onclick = () => { Game.startSeason(career); Game.saveCareer(career); render(); };
        $('#reset').onclick = () => { if (confirm('Apagar esta carreira?')) {
            Game.clearCareer();
            career = undefined;
            render();
        } };
        $('#diag').onclick = () => { const d = Game.runDiagnostics(career.position, 250); $('#diagOut').textContent = JSON.stringify(d, null, 2); };
    }
    function renderSeason() {
        if (!career?.pendingSeason)
            return;
        const p = career.pendingSeason;
        const event = p.events[p.currentEvent];
        if (!event) {
            app().innerHTML = `<div class="shell narrow">${playerHeader()}<section class="card event-card"><span class="eyebrow">EVENTOS CONCLUÍDOS</span><h2>Hora de fechar a temporada</h2><p>O motor agora calculará jogos, minutos, estatísticas, nota, evolução, rival e possíveis premiações.</p><button id="finish" class="primary">Encerrar temporada</button></section></div>`;
            $('#finish').onclick = () => { Game.finalizeSeason(career); Game.saveCareer(career); render(); };
            return;
        }
        const n = p.currentEvent + 1;
        app().innerHTML = `<div class="shell narrow">${playerHeader()}<div class="progress"><span style="width:${(n / p.events.length) * 100}%"></span></div><p class="progress-label">Evento ${n} de ${p.events.length}</p>
    <section class="card event-card"><span class="eyebrow">${event.kind === 'derby' ? 'CLÁSSICO' : event.kind === 'training' ? 'TREINAMENTO' : event.kind === 'career' ? 'CARREIRA' : 'PARTIDA'}</span><h2>${event.title}</h2><p class="event-text">${event.text}</p>
    ${event.resolved ? `<div class="result"><strong>Resultado</strong><p>${event.resultText}</p></div><button id="continue" class="primary">Continuar</button>` : `<div class="choices">${event.choices.map(c => `<button class="choice" data-id="${c.id}"><strong>${c.label}</strong>${c.attribute ? `<span>${Game.ATTRIBUTE_LABELS[c.attribute]} ${attrValue(career.attributes, c.attribute)}</span>` : ''}${c.description ? `<small>${c.description}</small>` : ''}</button>`).join('')}</div>`}</section></div>`;
        document.querySelectorAll('.choice').forEach(b => b.onclick = () => { Game.resolveEventChoice(career, b.dataset.id); Game.saveCareer(career); render(); });
        const cont = document.querySelector('#continue');
        if (cont)
            cont.onclick = () => { Game.advanceEvent(career); Game.saveCareer(career); render(); };
    }
    function metric(label, value) { return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`; }
    function renderSummary() {
        if (!career?.lastSummary)
            return;
        const s = career.lastSummary;
        const p = s.player;
        const r = s.rival;
        const goalie = career.position === 'GOL';
        app().innerHTML = `<div class="shell">${playerHeader()}<section class="hero season-hero"><span class="eyebrow">TEMPORADA ${p.yearLabel}</span><h1>Nota ${p.rating.toFixed(2)}</h1><p>${p.clubName} · ${p.leaguePosition}º no campeonato · ${p.role}</p></section>
    <div class="metrics">${metric('Jogos', p.games)}${metric('Minutos', p.minutes)}${goalie ? metric('Defesas', p.saves ?? 0) : metric('Gols', p.goals)}${goalie ? metric('% defesas', `${p.savePct}%`) : metric('Assistências', p.assists)}${goalie ? metric('Clean sheets', p.cleanSheets) : metric('Desarmes', p.tackles)}${metric('Clean sheets', p.cleanSheets)}${metric('Amarelos', p.yellowCards)}${metric('Vermelhos', p.redCards)}</div>
    <section class="card"><div class="section-title"><div><span class="eyebrow">EVOLUÇÃO</span><h2>OVR ${p.overallStart} → ${p.overallEnd}</h2></div><span class="pill">Rep. ${p.reputationStart} → ${p.reputationEnd}</span></div>${attributeCards(career)}<p class="muted">${s.developmentText.join(' · ')}</p></section>
    <div class="grid2"><section class="card"><span class="eyebrow">TÍTULOS</span>${p.titles.length ? `<ul class="award-list">${p.titles.map(x => `<li>🏆 ${x}</li>`).join('')}</ul>` : '<p class="muted">Nenhum título nesta temporada.</p>'}</section><section class="card"><span class="eyebrow">PRÊMIOS</span>${p.awards.length ? `<ul class="award-list">${p.awards.map(x => `<li>⭐ ${x}</li>`).join('')}</ul>` : '<p class="muted">Nenhum prêmio individual.</p>'}</section></div>
    <section class="card"><span class="eyebrow">RIVALIDADE · ${p.yearLabel}</span><div class="compare"><div><strong>${escapeHtml(career.name)}</strong><span>OVR ${p.overallEnd}</span><b>${p.rating.toFixed(2)}</b><small>${p.goals} G · ${p.assists} A</small></div><div class="versus">VS</div><div><strong>${escapeHtml(career.rival.name)}</strong><span>OVR ${r.overallEnd}</span><b>${r.rating.toFixed(2)}</b><small>${r.goals} G · ${r.assists} A</small></div></div></section>
    ${s.transferOffer ? `<section class="card offer"><span class="eyebrow">PROPOSTA</span><h2>${s.transferOffer.clubName}</h2><p>Força ${s.transferOffer.strength} · Prestígio ${s.transferOffer.prestige}</p><p class="muted">${s.transferOffer.reason}</p><div class="actions"><button id="accept" class="primary">Aceitar transferência</button><button id="decline">Ficar no clube</button></div></section>` : ''}
    <button id="next" class="primary wide" ${s.transferOffer ? 'disabled' : ''}>Seguir para a próxima temporada</button></div>`;
        const accept = document.querySelector('#accept');
        if (accept)
            accept.onclick = () => { Game.acceptOffer(career); career.lastSummary = undefined; Game.saveCareer(career); render(); };
        const decline = document.querySelector('#decline');
        if (decline)
            decline.onclick = () => { Game.declineOffer(career); career.lastSummary = undefined; Game.saveCareer(career); render(); };
        const next = $('#next');
        next.onclick = () => { career.lastSummary = undefined; Game.saveCareer(career); render(); };
    }
    function historyHtml(history) {
        const rows = history.slice().reverse().map(s => `<tr><td>${s.yearLabel}</td><td>${s.clubName}</td><td>${s.overallEnd}</td><td>${s.goals}</td><td>${s.assists}</td><td>${s.rating.toFixed(2)}</td></tr>`).join('');
        return `<section class="card"><span class="eyebrow">HISTÓRICO</span><div class="table-wrap"><table><thead><tr><th>Temporada</th><th>Clube</th><th>OVR</th><th>G</th><th>A</th><th>Nota</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
    }
    document.addEventListener('DOMContentLoaded', initUI);
})(Game || (Game = {}));
