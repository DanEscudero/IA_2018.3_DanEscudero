function run({ width, height }, app) {
    /**
     * General genetic algorithm structure
     *
     * Initialize
     *   Population
     *   DNA
     *
     * Select
     *   Fitness
     *
     * Reproduce
     *   Pick Parents
     *   Crossover
     *   Mutate
     *
     * Evaluate
     */

    /**
     * Evolution Parameters:
     * TARGET_WORD: word to be evolved into
     * TARGET_LENGTH: length of target word (set automatically)
     * POPULATION_SIZE: number of dna's evolvind on every generation
     * MAX_GENERATIONS: Sets a limit to the number of generations.
     * MUTATED_CHILDREN: percentage of children that should be mutated on every new 	generation
     * MUTATION_RATE: percentage of chance to mutate a every child's individual 		character
     */
    const DNA_LENGTH = 250;
    const MAX_CYCLES = DNA_LENGTH;
    const POPULATION_SIZE = 100;
    const MAX_GENERATIONS = 500;
    const MUTATED_CHILDREN = 0.01;
    const MUTATION_RATE = 0.1;
    const INITIAL_POSITION = { x: width / 2, y: 200 };
    const TARGET_POSITION = { x: 700, y: 700 };
    let shouldRun = true;
    let cyclesCount = 0;
    let numGenerations = 0;

    // Initialize visualization
    const view = new Visualization(width, height, POPULATION_SIZE);
    app.stage.addChild(view);

    const target = new Target();
    target.x = TARGET_POSITION.x;
    target.y = TARGET_POSITION.y;

    view.addChild(target);

    // Initialization
    let population = new Population(
        POPULATION_SIZE,
        DNA_LENGTH,
        MUTATED_CHILDREN,
        MUTATION_RATE
    );
    population.initialize();
    addChildren(population.rockets);
    repositionRockets();
    animate();

    function animate() {
        renderer.render(app.stage);
        window.requestAnimationFrame(animate);
        if (shouldRun) {
            population.update();
            cyclesCount++;

            if (cyclesCount > MAX_CYCLES) {
                shouldRun = false;
                proceedToNextGen();
            }
        }
    }

    function proceedToNextGen() {
        population.evaluate(fitnessFunction);

        numGenerations++;
        const report = population.getReport();
        view.printReport(Object.assign(report, { numGenerations }));

        population.select();
        population.repopulate();

        addChildren(population.rockets);
        repositionRockets();

        if (numGenerations <= MAX_GENERATIONS) {
            cyclesCount = 0;
            setTimeout(() => {
                shouldRun = true;
            }, 1000);
        }
    }

    function addChildren(children) {
        children.forEach((child) => {
            view.addChild(child);
        });
    }

    function fitnessFunction(rocket) {
        const dist = euclidianDistance(TARGET_POSITION, rocket);
        const fitness = rocket.isOffBounds() ? 0 : 1 / (dist + 1);
        return fitness;
    }

    function repositionRockets() {
        population.rockets.forEach((rocket) => {
            rocket.x = INITIAL_POSITION.x;
            rocket.y = INITIAL_POSITION.y;
        });
    }
}
