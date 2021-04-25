import { AgentMove, EntityType, GameStateClient, IGameState } from "@coderone/game-library";
import { MapDecomposer } from "./MapDecomposer";
import { Coordinates } from "./types";

const gameConnectionString =
    process.env["GAME_CONNECTION_STRING"] ||
    "ws://127.0.0.1:3000/?role=agent&agentId=agentIdA&name=RandomAgent";

enum Action {
    Up = "up",
    Down = "down",
    Left = "left",
    Right = "right",
    Bomb = "bomb",
    Detonate = "detonate",
}

const actionMoveMap = new Map<Action, AgentMove>([
    [Action.Up, AgentMove.Up],
    [Action.Down, AgentMove.Down],
    [Action.Left, AgentMove.Left],
    [Action.Right, AgentMove.Right],
]);

const actionList = Object.values(Action);

class Agent {
    private readonly client = new GameStateClient(gameConnectionString);

    private mapDecomposer: MapDecomposer;

    public constructor() {
        // @ts-ignore
        this.client.SetGameTickCallback(this.onGameTick);
        this.mapDecomposer = new MapDecomposer();
    }

    private onGameTick = async (gameState: IGameState | undefined) => {
        if (gameState) {
            // update map state and update dangerMap
            this.mapDecomposer.updateState(gameState);
            // this.mapDecomposer.getDangerMap();
            // Show dangerMap
            // console.log(this.mapDecomposer.toString());
            //this.mapDecomposer.addPowerUpLocations();

            //distances WIP
            // if (this.agentId != null) {
            //     console.log(this.mapDecomposer.getDistanceMap([gameState.agent_state[this.agentId.toString()]][0].coordinates))
            // }

            //console.log(this.findClosestPowerUp(gameState, this.mapDecomposer.powerUpLocations));
            const action = await this.generateAction();
            if (action) {
                const mappedMove = actionMoveMap.get(action);
                if (mappedMove !== undefined) {
                    this.client.SendMove(mappedMove);
                } else if (action === Action.Bomb) {
                    this.client.SendPlaceBomb();
                } else if (action === Action.Detonate) {
                    const bombCoordinates = this.getBombToDetonate(gameState);
                    if (bombCoordinates !== undefined) {
                        this.client.SendDetonateBomb(bombCoordinates);
                    }
                }
            }
        }
    };

    private generateAction = (): Action | undefined => {
        const allActions = actionList.length;
        const rand = Math.round(Math.random() * allActions);
        if (rand !== allActions) {
            return actionList[rand];
        }
    };

    private getBombToDetonate = (
        gameState: Omit<IGameState, "connection">
    ): [number, number] | undefined => {
        const currentAgent = this.client.Connection?.agent_number;
        const bomb = gameState.entities.find((entity) => {
            const isBomb = entity.type === EntityType.Bomb;
            const isOwner = currentAgent !== undefined ? entity.owner === currentAgent : false;
            return isBomb && isOwner;
        });

        if (bomb?.x !== undefined && bomb.y !== undefined) {
            return [bomb.x, bomb.y];
        }
    };
}

new Agent();
