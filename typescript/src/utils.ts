export class Utils {
    static manhattanDistance(start: [number, number], end: [number, number]) {
        return Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1]);
    }
}
