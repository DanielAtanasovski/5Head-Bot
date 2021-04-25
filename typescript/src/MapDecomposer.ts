import { EntityType, IEntity, IGameState } from "@coderone/game-library";
import { Utils } from "./utils";

export class MapDecomposer {
    private readonly powerUpIndicator = 1;
    private readonly emptySpace = 0;
    private readonly width: number = 9;
    private readonly height: number = 9;
    private dangerMap: Array<Array<number>> = [];
    private powerUpMap: Array<Array<number>> = [];
    private distanceMap: Array<Array<number>> = [];
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
            this.dangerMap[Math.min(bomb.y + dir, this.height - 1)][bomb.x] = 1;
            this.dangerMap[Math.max(bomb.y - dir, 0)][bomb.x] = 1;
            this.dangerMap[bomb.y][Math.min(bomb.x + dir, this.width - 1)] = 1;
            this.dangerMap[bomb.y][Math.max(bomb.x - dir, 0)] = 1;
        }
    }

    public getPowerUpMap(): Array<Array<number>> {
        //we will treat all powerups as the same for now

        this.powerUpMap = Array(this.height)
            .fill(this.emptySpace)
            .map(() => Array(this.width).fill(0));

        //similar to danger map, retrieve powerups from map
        this.gameState?.entities
            .filter(
                (entity) =>
                    entity.type === EntityType.Ammo || entity.type === EntityType.BlastPowerup
            )
            .forEach((powerUp) => {
                this.powerUpMap[powerUp.y][powerUp.x] = this.powerUpIndicator;
            });

        return this.powerUpMap;
    }

    //WIP
    // public getDistanceMap(agentCoordinates: [number, number]): Array<Array<number>> {
    //     this.distanceMap = Array(this.height)
    //         .fill(this.emptySpace)
    //         .map(() => Array(this.width).fill(0));
    //
    //     this.distanceMap.forEach((row, rowIndex) =>
    //         row.forEach(
    //             (value, colIndex) =>
    //                 (this.distanceMap[rowindex][
    //                     colIndex
    //                 ] = Utils.manhattanDistance(agentCoordinates, [rowindex, colNum]))
    //         )
    //     ); //.foreach((value, colNum) => this.manhattanDistance(agentCoordinates, [rowindex, colNum])))
    //     return this.distanceMap;
    // }

    /**
     * toString
     */
    public toString() {
        this.displayAnyMap(this.dangerMap);
    }

    public displayAnyMap(myMap: Array<Array<number>>): String {
        let str: String = "";
        for (let row = 0; row < this.width; row++) {
            for (let col = 0; col < this.width; col++) {
                str += myMap[row][col].toString();
            }
            str += "\n";
        }
        return str;
    }
}
