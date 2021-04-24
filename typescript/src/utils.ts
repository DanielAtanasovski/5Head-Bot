import { EntityType, IEntity } from "@coderone/game-library";
import { Coordinates } from "./types";

export default class Utils {
    private static readonly SAFE_ENTITIES = new Set([EntityType.Ammo, EntityType.BlastPowerup]);

    static manhattanDistance(start: IEntity, end: IEntity) {
        return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    }

    static getSafeTiles(width: number, height: number, entities: Array<IEntity>): Array<Coordinates> {
        const unsafeTiles = entities.filter((e) => !this.SAFE_ENTITIES.has(e.type));

        //TODO
        return [];
    }

    private getBombs(entities: Array<IEntity>): Array<IEntity> {
        return entities.filter((e) => e.type === EntityType.Bomb);
    }
}
