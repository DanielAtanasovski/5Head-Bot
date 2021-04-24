import { EntityType, IEntity, IGameState } from "@coderone/game-library";

export class MapDecomposer {
    private width = 9;
    private dangerMap: Array<Array<number>> = [];
    private gameState: Omit<IGameState, "connection"> | undefined = undefined;
    constructor() {}

    /**
     * updateState
     * Updates local state to new state (entities, agents)
     */
    public updateState(gameState: Omit<IGameState, "connection">) {
        this.gameState = gameState;
    }

    /**
     * getDangerMap
     * Provdes an Array matrix of cells assigned a value of '0' for safe and '1' for danger
     */
    public getDangerMap(): Array<Array<number>> {
        this.dangerMap = [];

        // Assign default values to map
        for (let row = 0; row < this.width; row++) {
            var dangerMapRow: Array<number> = [];
            for (let col = 0; col < this.width; col++) {
                dangerMapRow.push(0);
            }
            this.dangerMap.push(dangerMapRow);
        }

        // Grab bombs from state can update danger positions
        var bombs = this.gameState?.entities.filter((entity, index, array) => {
            if (entity.type === EntityType.Bomb) {
                return entity;
            }
        });
        if (bombs != undefined)
            bombs.forEach((bomb) => {
                var thisID: number = bomb.owner!;
                var blastDiameter: number = this.gameState?.agent_state[thisID].blast_diameter!;
                this.addBombToDangerMap(this.dangerMap, bomb, blastDiameter);
            });

        return this.dangerMap;
    }

    private addBombToDangerMap(dangerMap: Array<Array<number>>, bomb: IEntity, blastDiameter: number) {
        dangerMap[bomb.y][bomb.x] = 1;
        for (let dir = 0; dir < Math.ceil(blastDiameter / 2); dir++) {
            if (bomb.y + dir > dangerMap.length || bomb.y - dir < 0) continue;
            if (bomb.x + dir > dangerMap[0].length || bomb.x - dir < 0) continue;

            dangerMap[bomb.y + dir][bomb.x] = 1;
            dangerMap[bomb.y - dir][bomb.x] = 1;
            dangerMap[bomb.y][bomb.x + dir] = 1;
            dangerMap[bomb.y][bomb.x - dir] = 1;
        }
    }

    /**
     * toString
     */
    public toString() {
        var str: String = "";
        for (let row = 0; row < this.width; row++) {
            for (let col = 0; col < this.width; col++) {
                str += this.dangerMap[row][col].toString();
            }
            str += "\n";
        }
        return str;
    }
}
