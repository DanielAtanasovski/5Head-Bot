import { EntityType, IEntity, IGameState, IAgentStateHashMap } from "@coderone/game-library";
import { Utils } from "./utils";
import { Coordinates, MapType } from "./types";

const PF = require("pathfinding");

export class MapDecomposer {
    private readonly invalid = 1;
    private readonly valid = 0;
    private readonly width: number = 9;
    private readonly height: number = 9;
    private agentId: number | null = null;

    private dangerMap: MapType = [];
    private powerUpMap: MapType = [];
    private obstructionsMap: MapType = [];

    private readonly finder = new PF.AStarFinder();
    private gameState: IGameState | undefined = undefined;

    /**
     * updateState
     * Updates local state to new state (entities, agents)
     */
    public updateState(gameState: IGameState): void {
        if (gameState.tick === 0) this.initMap(gameState);
        this.gameState = gameState;
    }

    private initMap(gameState: IGameState) {
        this.agentId = gameState.connection.agent_number;
    }

    private emptyMap(): MapType {
        // Assign default values to map
        return Array(this.height)
            .fill(this.valid)
            .map(() => Array(this.width).fill(this.valid));
    }

    private mergeMaps(...maps: MapType[]) {
        const mergedMap = this.emptyMap();

        maps.forEach((map) => {
            map.forEach((row, rowIdx) => {
                row.forEach((val, colIdx) => {
                    mergedMap[rowIdx][colIdx] = val || mergedMap[rowIdx][colIdx];
                });
            });
        });

        return mergedMap;
    }

    public getPathTo(dest: Coordinates) {
        const matrix = this.mergeMaps(this.getDangerMap(), this.getObstructionsMap());

        const grid = new PF.Grid(matrix);
        return this.finder.findPath(
            ...this.gameState?.agent_state[this.agentId as keyof IAgentStateHashMap].coordinates!,
            dest.x,
            dest.y,
            grid
        );
    }

    /**
     * getDangerMap
     * Returns an Array matrix of cells assigned a value of '0' for safe and '1' for danger
     */
    public getDangerMap(): MapType {
        this.dangerMap = this.emptyMap();

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

    private addBombToDangerMap(bomb: IEntity, blastDiameter: number): void {
        this.dangerMap[bomb.y][bomb.x] = this.invalid;
        for (let dir = 1; dir < Math.ceil(blastDiameter / 2); dir++) {
            this.dangerMap[Math.min(bomb.y + dir, this.height - 1)][bomb.x] = this.invalid;
            this.dangerMap[Math.max(bomb.y - dir, 0)][bomb.x] = this.invalid;
            this.dangerMap[bomb.y][Math.min(bomb.x + dir, this.width - 1)] = this.invalid;
            this.dangerMap[bomb.y][Math.max(bomb.x - dir, 0)] = this.invalid;
        }
    }

    public getPowerUpMap(): MapType {
        //we will treat all powerups as the same for now
        this.powerUpMap = this.emptyMap();

        //similar to danger map, retrieve powerups from map
        this.gameState?.entities
            .filter(
                (entity) =>
                    entity.type === EntityType.Ammo || entity.type === EntityType.BlastPowerup
            )
            .forEach((powerUp) => {
                this.powerUpMap[powerUp.y][powerUp.x] = this.invalid;
            });

        return this.powerUpMap;
    }

    /**
     * getObstructionsMap
     * Returns an Array matrix of cells assigned a value of '0' for clear tiles and '1' for obstructed tiles
     */
    public getObstructionsMap(): MapType {
        this.obstructionsMap = this.emptyMap();

        this.gameState?.entities
            .filter(
                (entity) =>
                    entity.type === EntityType.Bomb ||
                    entity.type === EntityType.WoodBlock ||
                    entity.type === EntityType.MetalBlock ||
                    entity.type === EntityType.OreBlock
            )
            .forEach((tile) => {
                this.obstructionsMap[tile.y][tile.x] = this.invalid;
            });

        return this.obstructionsMap;
    }

    /**
     * toString
     */
    public toString() {
        this.displayAnyMap(this.dangerMap);
    }

    public displayAnyMap(myMap: MapType): String {
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
