class Visualization extends PIXI.Container {
    constructor(width, height, popSize) {
        super();

        this._width = width;
        this._height = height;
        this._popSize = popSize;

        this._background = new PIXI.Graphics();
        this.addChild(this._background);
        this._drawBackground();

        const style = {
            align: 'center',
            fontSize: 72,
            fontVariant: 'small-caps'
        };
        const initialText = `topFitness: 0\naverageFitness: 0\nnumGenerations: 0`;
        this._report = new PIXI.Text(initialText, style);
        this._report.alpha = 0.25;
        this._report.x = width / 2 - this._report.width / 2;
        this._report.y = height / 2 - this._report.height / 2;
        this.addChild(this._report);
    }

    printReport({ avgFitness, numGenerations, topFitness }) {
        this._report.text = `topFitness: ${topFitness}\naverageFitness: ${avgFitness}\nnumGenerations: ${numGenerations}`;
        this._report.x = width / 2 - this._report.width / 2;
        this._report.y = height / 2 - this._report.height / 2;
    }

    _drawBackground() {
        this._background.beginFill('0xffffff');
        this._background.lineStyle(3, '0x000000');
        this._background.drawRect(1, 0, this._width - 1, this._height - 1);
    }
}
