import { Coordinates } from "./types";

export class Utils {
    static manhattanDistance(start: Coordinates, end: Coordinates) {
        return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    }
}
