class Population {
    get rockets() {
        return this._rockets;
    }

    constructor(popSize, DNALength, childMR, individualMR) {
        this._popSize = popSize;
        this._DNALength = DNALength;
        this._childMR = childMR;
        this._individualMR = individualMR;

        this._rockets = Array(this._popSize);
    }

    getReport() {
        return {
            counts: this._getDirectionsPercentage(),
            avgFitness: this._getAverageFitness(),
            avgTarget: this._getAverageTarget(),
            topFitness: Number(this._rockets[0].dna.fitness.toFixed(3))
        };
    }

    initialize() {
        for (let iRocket = 0; iRocket < this._popSize; iRocket++) {
            const rocket = new Rocket(this._DNALength, this._individualMR);
            this._rockets[iRocket] = rocket;

            rocket.x = 100 + iRocket * 30;
            rocket.y = 100;
        }
    }

    update() {
        this._rockets.forEach((rocket) => {
            const nextMove = rocket.getNextGene();
            const { speed } = rocket;
            if (rocket.shouldMove) {
                rocket.x += nextMove.x * speed;
                rocket.y += nextMove.y * speed;
            }

            if (rocket.isOffBounds()) {
                rocket.x = Math.min(rocket.x, width);
                rocket.x = Math.max(rocket.x, 0);

                rocket.y = Math.min(rocket.y, height);
                rocket.y = Math.max(rocket.y, 0);

                rocket.shouldMove = false;
            }
        });
    }

    evaluate(fitnessFunction) {
        this._rockets.forEach((rocket) => {
            rocket.dna.fitness = fitnessFunction(rocket);
        });

        this._rockets.sort((a, b) => b.dna.fitness - a.dna.fitness);
        const topFitness = this._rockets[0].fitness;
        this._rockets.forEach((rocket) => {
            rocket.fitness /= topFitness;
        });
    }

    select() {
        this._rockets.forEach((rocket, idx) => {
            // TendenceToDie gets bigger as we get to the end of the array
            // This way, the ones in the beggining of it should not die
            // as often as the ones at the end.
            const tendenceToDie = idx / this._rockets.length;
            const shouldDie = probability(tendenceToDie, probabilityFunction);

            if (shouldDie) {
                // Remove rocket from population
                const [dead] = this._rockets.splice(idx, 1);

                // Destroy rocket (remove from PIXI tree, to avoid memory leak)
                dead.destroy(true);
            }
        });
    }

    repopulate() {
        const newChildren = [];

        for (let iChild = 0; iChild <= this._popSize; iChild++) {
            const child = this._getNewChild();
            newChildren.push(child);

            if (probability(this._childMR)) {
                child.dna.mutate();
            }
        }

        // Destroy all remaining rockets
        this._rockets.forEach((rocket) => {
            rocket.destroy(true);
        });

        // Empty array to make room for new children
        this._rockets = [];

        newChildren.forEach((rocket) => {
            this._rockets.push(rocket);
        });
    }

    _getNewChild() {
        let parent1, parent2;
        parent1 = randomInArray(this._rockets);
        parent2 = randomInArray(this._rockets);

        while (parent1 === parent2) {
            parent2 = randomInArray(this._rockets);
        }

        const childDNA = DNA.reproduce(
            parent1.dna,
            parent2.dna,
            this._DNALength,
            this._individualMR
        );

        return new Rocket(this._DNALength, this._individualMR, childDNA);
    }

    _getAverageFitness() {
        let sum = 0;
        this._rockets.forEach((rocket) => {
            sum += rocket.dna.fitness;
        });

        return Number((sum / this._popSize).toFixed(3));
    }

    _getAverageTarget() {
        let sumTargets = { x: 0, y: 0 };
        this._rockets.forEach((rocket) => {
            const { x, y } = rocket.getFinalPosition();
            sumTargets.x += x;
            sumTargets.y += y;
        });

        return {
            x: Number((sumTargets.x / this._popSize).toFixed(2)),
            y: Number((sumTargets.y / this._popSize).toFixed(2))
        };
    }

    _getDirectionsPercentage() {
        // Initialize empty counts
        const counts = {
            speed: 0,
            UP: 0,
            DOWN: 0,
            LEFT: 0,
            RIGHT: 0
        };

        // Count for every gene
        this._rockets.forEach((rocket) => {
            const { genes } = rocket.dna;
            genes.forEach((gene, idx) => {
                if (idx) {
                    let key = '';
                    const { x, y } = gene;
                    if (x === +1) key = 'RIGHT';
                    if (x === -1) key = 'LEFT';
                    if (y === +1) key = 'DOWN';
                    if (y === -1) key = 'UP';

                    counts[key]++;
                }
            });
            counts['speed'] += genes[0];
        });

        // Normalize counts
        const dirs = Object.keys(counts);
        dirs.forEach((dir) => {
            if (dir !== 'speed') {
                counts[dir] /= this._DNALength * this._popSize;
                counts[dir] = Number(counts[dir].toFixed(2));
            }
        });
        counts['speed'] /= this._popSize;
        counts['speed'] = Number(counts['speed'].toFixed(2));

        return counts;
    }
}
