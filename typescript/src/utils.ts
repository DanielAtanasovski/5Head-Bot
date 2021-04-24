import { IEntity } from "@coderone/game-library";

export default class Utils {
    static manhattanDistance(start: IEntity, end: IEntity) {
        return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    }
}
