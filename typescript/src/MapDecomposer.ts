import { EntityType, IEntity, IGameState } from "@coderone/game-library";

export class MapDecomposer {
    private readonly width: number = 9;
    private readonly height: number = 9;
    private dangerMap: Array<Array<number>> = [];
    private gameState: IGameState | undefined = undefined;

    /**
     * updateState
     * Updates local state to new state (entities, agents)
     */
    public updateState(gameState: IGameState) {
        this.gameState = gameState;
    }

    /**
     * getDangerMap
     * Provides an Array matrix of cells assigned a value of '0' for safe and '1' for danger
     */
    public getDangerMap(): Array<Array<number>> {
        // Assign default values to map
        this.dangerMap = Array(this.height)
            .fill(0)
            .map(() => Array(this.width).fill(0));

        // Grab bombs from state
        this.gameState?.entities
            .filter((entity) => entity.type === EntityType.Bomb)
            .forEach((bomb) => {
                const thisID: number = bomb.owner!;
                const blastDiameter: number = this.gameState?.agent_state[thisID].blast_diameter!;
                this.addBombToDangerMap(bomb, blastDiameter);
            });

        return this.dangerMap;
    }

    private addBombToDangerMap(bomb: IEntity, blastDiameter: number) {
        this.dangerMap[bomb.y][bomb.x] = 1;
        for (let dir = 1; dir < Math.ceil(blastDiameter / 2); dir++) {
            this.dangerMap[Math.max(bomb.y + dir, this.height - 1)][bomb.x] = 1;
            this.dangerMap[Math.min(bomb.y - dir, 0)][bomb.x] = 1;
            this.dangerMap[bomb.y][Math.max(bomb.x + dir, this.width - 1)] = 1;
            this.dangerMap[bomb.y][Math.min(bomb.x - dir, 0)] = 1;
        }
    }

    /**
     * toString
     */
    public toString() {
        let str: String = "";
        for (let row = 0; row < this.width; row++) {
            for (let col = 0; col < this.width; col++) {
                str += this.dangerMap[row][col].toString();
            }
            str += "\n";
        }
        return str;
    }
}
